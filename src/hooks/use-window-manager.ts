"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WindowId, WindowState, AppId, Position, Size, AppState } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { BASE_OFFSET, CASCADE_STEP } from "@/lib/desktop-config";

const TOP_BAR_HEIGHT = 28;

function generateId(): WindowId {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `win-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useWindowManager() {
  const [windowMap, setWindowMap] = useState<Map<WindowId, WindowState>>(
    () => new Map()
  );
  const nextZIndexRef = useRef(1);
  const cascadeCountRef = useRef(0);

  const windows = Array.from(windowMap.values());

  // Handle window viewport resizing & orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

      setWindowMap((prev) => {
        let changed = false;
        const next = new Map(prev);

        for (const [wid, win] of next) {
          if (win.isMaximized) {
            next.set(wid, {
              ...win,
              position: { x: 0, y: 0 },
              size: { width: screenW, height: availableH },
            });
            changed = true;
          } else {
            // Clamp position so window stays on screen
            const maxX = Math.max(0, screenW - 100);
            const maxY = Math.max(0, availableH - 60);
            const clampedX = Math.min(Math.max(0, win.position.x), maxX);
            const clampedY = Math.min(Math.max(0, win.position.y), maxY);

            if (clampedX !== win.position.x || clampedY !== win.position.y) {
              next.set(wid, {
                ...win,
                position: { x: clampedX, y: clampedY },
              });
              changed = true;
            }
          }
        }

        return changed ? next : prev;
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const openWindow = useCallback((appId: AppId, appState?: AppState, workspace: number = 1) => {
    const appDef = APP_REGISTRY[appId];
    if (!appDef) return;

    const id = generateId();
    const zIndex = nextZIndexRef.current++;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
    const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

    const offset = BASE_OFFSET + (cascadeCountRef.current % 8) * CASCADE_STEP;
    cascadeCountRef.current++;

    const newWindow: WindowState = {
      id,
      title: appDef.name,
      appId,
      position: isMobile ? { x: 0, y: 0 } : { x: offset, y: offset },
      size: isMobile
        ? { width: screenW, height: availableH }
        : {
            width: Math.min(appDef.defaultSize.width, screenW - 40),
            height: Math.min(appDef.defaultSize.height, availableH - 20),
          },
      minSize: { ...appDef.minSize },
      zIndex,
      isMinimized: false,
      isMaximized: isMobile,
      isFocused: true,
      workspace,
      appState,
    };

    setWindowMap((prev) => {
      const next = new Map(prev);
      // Unfocus all existing windows
      for (const [wid, ws] of next) {
        if (ws.isFocused) {
          next.set(wid, { ...ws, isFocused: false });
        }
      }
      next.set(id, newWindow);
      return next;
    });
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setWindowMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const focusWindow = useCallback((id: WindowId) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const zIndex = nextZIndexRef.current++;
      const next = new Map(prev);
      for (const [wid, ws] of next) {
        if (ws.isFocused && wid !== id) {
          next.set(wid, { ...ws, isFocused: false });
        }
      }
      next.set(id, {
        ...win,
        zIndex,
        isFocused: true,
        isMinimized: false,
      });
      return next;
    });
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const next = new Map(prev);
      next.set(id, { ...win, isMinimized: true, isFocused: false });
      return next;
    });
  }, []);

  const maximizeWindow = useCallback((id: WindowId) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const next = new Map(prev);
      if (win.isMaximized) {
        // Restore to previous size/position
        const appDef = APP_REGISTRY[win.appId];
        const defaultW = appDef?.defaultSize.width ?? 640;
        const defaultH = appDef?.defaultSize.height ?? 420;
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

        next.set(id, {
          ...win,
          isMaximized: false,
          position: { x: BASE_OFFSET, y: BASE_OFFSET },
          size: {
            width: Math.min(defaultW, screenW - 60),
            height: Math.min(defaultH, screenH - TOP_BAR_HEIGHT - 60),
          },
        });
      } else {
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
        const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

        next.set(id, {
          ...win,
          isMaximized: true,
          position: { x: 0, y: 0 },
          size: {
            width: screenW,
            height: availableH,
          },
        });
      }
      return next;
    });
  }, []);

  const moveWindow = useCallback((id: WindowId, position: Position) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
      const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

      // Clamp position so window header is always accessible
      const clampedPosition: Position = {
        x: Math.min(Math.max(-win.size.width + 100, position.x), screenW - 100),
        y: Math.min(Math.max(0, position.y), availableH - 30),
      };

      const next = new Map(prev);
      next.set(id, { ...win, position: clampedPosition, isMaximized: false });
      return next;
    });
  }, []);

  const resizeWindow = useCallback((id: WindowId, size: Size) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
      const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

      const clampedSize: Size = {
        width: Math.min(Math.max(size.width, win.minSize.width), screenW),
        height: Math.min(Math.max(size.height, win.minSize.height), availableH),
      };

      const next = new Map(prev);
      next.set(id, { ...win, size: clampedSize, isMaximized: false });
      return next;
    });
  }, []);

  const getWindow = useCallback(
    (id: WindowId): WindowState | undefined => {
      return windowMap.get(id);
    },
    [windowMap]
  );

  return {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
    getWindow,
  };
}

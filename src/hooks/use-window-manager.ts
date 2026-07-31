"use client";

import { useState, useCallback, useRef } from "react";
import type { WindowId, WindowState, AppId, Position, Size } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";

const BASE_OFFSET = 60;
const CASCADE_STEP = 30;
const PANEL_HEIGHT = 48;

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

  const openWindow = useCallback((appId: AppId) => {
    const appDef = APP_REGISTRY[appId];
    if (!appDef) return;

    const id = generateId();
    const zIndex = nextZIndexRef.current++;
    const offset = BASE_OFFSET + (cascadeCountRef.current % 8) * CASCADE_STEP;
    cascadeCountRef.current++;

    const newWindow: WindowState = {
      id,
      title: appDef.name,
      appId,
      position: { x: offset, y: offset },
      size: { ...appDef.defaultSize },
      minSize: { ...appDef.minSize },
      zIndex,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
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
        next.set(id, { ...win, isMaximized: false });
      } else {
        next.set(id, {
          ...win,
          isMaximized: true,
          position: { x: 0, y: 0 },
          size: {
            width: typeof window !== "undefined" ? window.innerWidth : 1280,
            height:
              (typeof window !== "undefined" ? window.innerHeight : 800) -
              PANEL_HEIGHT,
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

      const next = new Map(prev);
      next.set(id, { ...win, position, isMaximized: false });
      return next;
    });
  }, []);

  const resizeWindow = useCallback((id: WindowId, size: Size) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const clampedSize: Size = {
        width: Math.max(size.width, win.minSize.width),
        height: Math.max(size.height, win.minSize.height),
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

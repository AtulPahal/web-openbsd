"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WindowId, WindowState, AppId, Position, Size, AppState } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { BASE_OFFSET, CASCADE_STEP } from "@/lib/desktop-config";

const TOP_BAR_HEIGHT = 28;
const DOCK_WIDTH = 56;
const GAP = 8;

export type DriftLayoutMode = "floating" | "tiling" | "split" | "monocle";

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
  const [layoutMode, setLayoutMode] = useState<DriftLayoutMode>("floating");
  const nextZIndexRef = useRef(1);
  const cascadeCountRef = useRef(0);

  const windows = Array.from(windowMap.values());

  // Compute driftwm automatic tile geometry for windows in workspace
  const applyTileLayout = useCallback(
    (
      currentMap: Map<WindowId, WindowState>,
      mode: DriftLayoutMode,
      targetWorkspace: number
    ): Map<WindowId, WindowState> => {
      if (mode === "floating") return currentMap;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
      const isMobile = screenW < 768;

      const availX = GAP;
      const availY = GAP;
      const availW = Math.max(300, screenW - (isMobile ? GAP * 2 : DOCK_WIDTH + GAP * 2));
      const availH = Math.max(200, screenH - TOP_BAR_HEIGHT - GAP * 2);

      const wsWindows = Array.from(currentMap.values()).filter(
        (w) => (w.workspace ?? 1) === targetWorkspace && !w.isMinimized
      );

      if (wsWindows.length === 0) return currentMap;

      const next = new Map(currentMap);

      if (mode === "monocle" || isMobile) {
        // Monocle / Fullscreen stage
        wsWindows.forEach((win) => {
          next.set(win.id, {
            ...win,
            position: { x: availX, y: availY },
            size: { width: availW, height: availH },
            isMaximized: false,
          });
        });
      } else if (mode === "tiling") {
        // Master-Stack Layout (driftwm style)
        if (wsWindows.length === 1) {
          const win = wsWindows[0];
          next.set(win.id, {
            ...win,
            position: { x: availX, y: availY },
            size: { width: availW, height: availH },
            isMaximized: false,
          });
        } else {
          // Master window on left (55%), stack on right (45%)
          const masterW = Math.floor((availW - GAP) * 0.55);
          const stackW = availW - GAP - masterW;
          const stackCount = wsWindows.length - 1;
          const stackH = Math.floor((availH - GAP * (stackCount - 1)) / stackCount);

          wsWindows.forEach((win, idx) => {
            if (idx === 0) {
              // Master
              next.set(win.id, {
                ...win,
                position: { x: availX, y: availY },
                size: { width: masterW, height: availH },
                isMaximized: false,
              });
            } else {
              // Stack item
              const stackIdx = idx - 1;
              const posY = availY + stackIdx * (stackH + GAP);
              next.set(win.id, {
                ...win,
                position: { x: availX + masterW + GAP, y: posY },
                size: { width: stackW, height: stackH },
                isMaximized: false,
              });
            }
          });
        }
      } else if (mode === "split") {
        // Binary / Grid Split (driftwm dwindle)
        const count = wsWindows.length;
        if (count === 1) {
          const win = wsWindows[0];
          next.set(win.id, {
            ...win,
            position: { x: availX, y: availY },
            size: { width: availW, height: availH },
            isMaximized: false,
          });
        } else if (count === 2) {
          const colW = Math.floor((availW - GAP) / 2);
          wsWindows.forEach((win, idx) => {
            next.set(win.id, {
              ...win,
              position: { x: availX + idx * (colW + GAP), y: availY },
              size: { width: colW, height: availH },
              isMaximized: false,
            });
          });
        } else {
          // 2 columns with rows
          const cols = 2;
          const colW = Math.floor((availW - GAP) / cols);
          const rowsPerCol = Math.ceil(count / cols);
          const rowH = Math.floor((availH - GAP * (rowsPerCol - 1)) / rowsPerCol);

          wsWindows.forEach((win, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            next.set(win.id, {
              ...win,
              position: { x: availX + col * (colW + GAP), y: availY + row * (rowH + GAP) },
              size: { width: colW, height: rowH },
              isMaximized: false,
            });
          });
        }
      }

      return next;
    },
    []
  );

  // Re-layout on window viewport resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowMap((prev) => {
        if (layoutMode !== "floating") {
          return applyTileLayout(prev, layoutMode, 1);
        }

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT);

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
  }, [layoutMode, applyTileLayout]);

  const toggleLayoutMode = useCallback(() => {
    const modes: DriftLayoutMode[] = ["floating", "tiling", "split", "monocle"];
    setLayoutMode((current) => {
      const nextIdx = (modes.indexOf(current) + 1) % modes.length;
      const nextMode = modes[nextIdx];
      setWindowMap((prev) => applyTileLayout(prev, nextMode, 1));
      return nextMode;
    });
  }, [applyTileLayout]);

  const setDriftLayout = useCallback(
    (mode: DriftLayoutMode) => {
      setLayoutMode(mode);
      setWindowMap((prev) => applyTileLayout(prev, mode, 1));
    },
    [applyTileLayout]
  );

  const openWindow = useCallback(
    (appId: AppId, appState?: AppState, workspace: number = 1) => {
      const appDef = APP_REGISTRY[appId];
      if (!appDef) return;

      const id = generateId();
      const zIndex = nextZIndexRef.current++;

      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
      const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT - GAP * 2);
      const availableW = isMobile ? screenW - GAP * 2 : screenW - DOCK_WIDTH - GAP * 2;

      const offset = BASE_OFFSET + (cascadeCountRef.current % 8) * CASCADE_STEP;
      cascadeCountRef.current++;

      const newWindow: WindowState = {
        id,
        title: appDef.name,
        appId,
        position: isMobile
          ? { x: GAP, y: GAP }
          : { x: Math.min(offset, availableW - appDef.defaultSize.width), y: Math.min(offset, availableH - appDef.defaultSize.height) },
        size: isMobile
          ? { width: availableW, height: availableH }
          : {
              width: Math.min(appDef.defaultSize.width, availableW),
              height: Math.min(appDef.defaultSize.height, availableH),
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
        for (const [wid, ws] of next) {
          if (ws.isFocused) {
            next.set(wid, { ...ws, isFocused: false });
          }
        }
        next.set(id, newWindow);
        return layoutMode !== "floating" ? applyTileLayout(next, layoutMode, workspace) : next;
      });
    },
    [layoutMode, applyTileLayout]
  );

  const closeWindow = useCallback(
    (id: WindowId) => {
      setWindowMap((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return layoutMode !== "floating" ? applyTileLayout(next, layoutMode, 1) : next;
      });
    },
    [layoutMode, applyTileLayout]
  );

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

  const minimizeWindow = useCallback(
    (id: WindowId) => {
      setWindowMap((prev) => {
        const win = prev.get(id);
        if (!win) return prev;

        const next = new Map(prev);
        next.set(id, { ...win, isMinimized: true, isFocused: false });
        return layoutMode !== "floating" ? applyTileLayout(next, layoutMode, win.workspace ?? 1) : next;
      });
    },
    [layoutMode, applyTileLayout]
  );

  const maximizeWindow = useCallback((id: WindowId) => {
    setWindowMap((prev) => {
      const win = prev.get(id);
      if (!win) return prev;

      const next = new Map(prev);
      if (win.isMaximized) {
        const appDef = APP_REGISTRY[win.appId];
        const defaultW = appDef?.defaultSize.width ?? 680;
        const defaultH = appDef?.defaultSize.height ?? 460;
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

        next.set(id, {
          ...win,
          isMaximized: false,
          position: { x: BASE_OFFSET, y: BASE_OFFSET },
          size: {
            width: Math.min(defaultW, screenW - 80),
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
    layoutMode,
    toggleLayoutMode,
    setDriftLayout,
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

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WindowId, WindowState, AppId, Position, Size, AppState } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";

const TOP_BAR_HEIGHT = 28;
const DOCK_WIDTH = 56;
const SNAP_THRESHOLD = 16;

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

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
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1.0 });

  const nextZIndexRef = useRef(1);
  const cascadeCountRef = useRef(0);

  const windows = Array.from(windowMap.values());

  // Camera Controls
  const panCamera = useCallback((dx: number, dy: number) => {
    setCamera((prev) => ({
      ...prev,
      x: Math.round(prev.x + dx),
      y: Math.round(prev.y + dy),
    }));
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.min(2.0, Math.max(0.3, +newZoom.toFixed(2))),
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.min(2.0, +(prev.zoom + 0.15).toFixed(2)),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.3, +(prev.zoom - 0.15).toFixed(2)),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: 1.0,
    }));
  }, []);

  const goHome = useCallback(() => {
    setCamera({ x: 0, y: 0, zoom: 1.0 });
  }, []);

  // Center camera on a specific window (Mod+C in driftwm)
  const centerWindow = useCallback(
    (id: WindowId) => {
      const win = windowMap.get(id);
      if (!win) return;

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

      const targetX = Math.round(screenW / 2 - (win.position.x + win.size.width / 2) * camera.zoom);
      const targetY = Math.round((screenH - TOP_BAR_HEIGHT) / 2 - (win.position.y + win.size.height / 2) * camera.zoom);

      setCamera((prev) => ({
        ...prev,
        x: targetX,
        y: targetY,
      }));
    },
    [windowMap, camera.zoom]
  );

  // Zoom to fit all open windows on canvas (Mod+W overview in driftwm)
  const zoomToFit = useCallback(() => {
    const visibleWins = Array.from(windowMap.values()).filter((w) => !w.isMinimized);
    if (visibleWins.length === 0) {
      goHome();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    visibleWins.forEach((w) => {
      minX = Math.min(minX, w.position.x);
      minY = Math.min(minY, w.position.y);
      maxX = Math.max(maxX, w.position.x + w.size.width);
      maxY = Math.max(maxY, w.position.y + w.size.height);
    });

    const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const screenH = typeof window !== "undefined" ? window.innerHeight - TOP_BAR_HEIGHT : 800;

    const boundingW = maxX - minX + 80;
    const boundingH = maxY - minY + 80;

    const scaleX = screenW / boundingW;
    const scaleY = screenH / boundingH;
    const targetZoom = Math.min(1.0, Math.max(0.35, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setCamera({
      zoom: +targetZoom.toFixed(2),
      x: Math.round(screenW / 2 - centerX * targetZoom),
      y: Math.round(screenH / 2 - centerY * targetZoom),
    });
  }, [windowMap, goHome]);

  // Magnetic edge snapping (driftwm clustering)
  const calculateSnappedPosition = useCallback(
    (movingWinId: WindowId, targetPos: Position, winSize: Size): Position => {
      let snappedX = targetPos.x;
      let snappedY = targetPos.y;

      const otherWindows = Array.from(windowMap.values()).filter(
        (w) => w.id !== movingWinId && !w.isMinimized
      );

      for (const other of otherWindows) {
        // Snap left edge to other right edge
        if (Math.abs(targetPos.x - (other.position.x + other.size.width + 12)) < SNAP_THRESHOLD) {
          snappedX = other.position.x + other.size.width + 12;
        }
        // Snap right edge to other left edge
        if (Math.abs(targetPos.x + winSize.width - (other.position.x - 12)) < SNAP_THRESHOLD) {
          snappedX = other.position.x - winSize.width - 12;
        }
        // Snap top edge to other top edge
        if (Math.abs(targetPos.y - other.position.y) < SNAP_THRESHOLD) {
          snappedY = other.position.y;
        }
        // Snap bottom edge to other bottom edge
        if (Math.abs(targetPos.y + winSize.height - (other.position.y + other.size.height)) < SNAP_THRESHOLD) {
          snappedY = other.position.y + other.size.height - winSize.height;
        }
      }

      return { x: snappedX, y: snappedY };
    },
    [windowMap]
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
      const availableH = Math.max(200, screenH - TOP_BAR_HEIGHT - 32);
      const availableW = isMobile ? screenW - 24 : screenW - DOCK_WIDTH - 32;

      // In driftwm, place new window near camera center or in canvas space
      const spawnX = Math.round((-camera.x + screenW / 2 - appDef.defaultSize.width / 2) / camera.zoom);
      const spawnY = Math.round((-camera.y + screenH / 2 - appDef.defaultSize.height / 2) / camera.zoom);

      const offset = (cascadeCountRef.current % 6) * 30;
      cascadeCountRef.current++;

      const newWindow: WindowState = {
        id,
        title: appDef.name,
        appId,
        position: isMobile
          ? { x: 12, y: 12 }
          : { x: spawnX + offset, y: Math.max(12, spawnY + offset) },
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
        return next;
      });
    },
    [camera]
  );

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
        const appDef = APP_REGISTRY[win.appId];
        next.set(id, {
          ...win,
          isMaximized: false,
          size: {
            width: appDef?.defaultSize.width ?? 680,
            height: appDef?.defaultSize.height ?? 460,
          },
        });
      } else {
        const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
        const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
        next.set(id, {
          ...win,
          isMaximized: true,
          position: { x: 12, y: 12 },
          size: {
            width: screenW - DOCK_WIDTH - 24,
            height: screenH - TOP_BAR_HEIGHT - 24,
          },
        });
      }
      return next;
    });
  }, []);

  const moveWindow = useCallback(
    (id: WindowId, position: Position) => {
      setWindowMap((prev) => {
        const win = prev.get(id);
        if (!win) return prev;

        const snapped = calculateSnappedPosition(id, position, win.size);

        const next = new Map(prev);
        next.set(id, { ...win, position: snapped, isMaximized: false });
        return next;
      });
    },
    [calculateSnappedPosition]
  );

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

  return {
    windows,
    camera,
    panCamera,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    centerWindow,
    goHome,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  };
}

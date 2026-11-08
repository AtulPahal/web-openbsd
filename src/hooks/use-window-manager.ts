"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { WindowId, WindowState, AppId, Position, Size, AppState } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { BASE_OFFSET, CASCADE_STEP } from "@/lib/desktop-config";

function fitBounds(position: Position, size: Size, area: Size) {
  const fitted = { width: Math.min(size.width, area.width), height: Math.min(size.height, area.height) };
  return { size: fitted, position: { x: Math.min(Math.max(0, position.x), area.width - fitted.width), y: Math.min(Math.max(0, position.y), area.height - fitted.height) } };
}

export function useWindowManager(canvasRef: RefObject<HTMLElement | null>) {
  const [windowMap, setWindowMap] = useState<Map<WindowId, WindowState>>(() => new Map());
  const nextZIndexRef = useRef(1);
  const cascadeCountRef = useRef(0);
  const areaRef = useRef<Size>({ width: 1, height: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => {
      const area = { width: Math.max(1, canvas.clientWidth), height: Math.max(1, canvas.clientHeight) };
      areaRef.current = area;
      setWindowMap((previous) => {
        const next = new Map(previous);
        for (const [id, win] of next) {
          const bounds = win.isMaximized ? { position: { x: 0, y: 0 }, size: area } : fitBounds(win.position, win.size, area);
          next.set(id, { ...win, ...bounds, prevBounds: win.prevBounds ? fitBounds(win.prevBounds.position, win.prevBounds.size, area) : undefined });
        }
        return next;
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef]);

  const openWindow = useCallback((appId: AppId, appState?: AppState, workspace = 1) => {
    const app = APP_REGISTRY[appId];
    if (!app) return;
    const area = areaRef.current;
    const offset = BASE_OFFSET + (cascadeCountRef.current++ % 8) * CASCADE_STEP;
    const bounds = fitBounds({ x: offset, y: offset / 2 }, app.defaultSize, area);
    const mobile = area.width < 640;
    const id = crypto.randomUUID();
    const win: WindowState = { id, title: app.name, appId, ...bounds, minSize: app.minSize, zIndex: nextZIndexRef.current++, isMinimized: false, isMaximized: mobile, isFocused: true, workspace, appState, prevBounds: bounds };
    if (mobile) { win.position = { x: 0, y: 0 }; win.size = area; }
    setWindowMap((previous) => {
      const next = new Map(previous);
      for (const [key, state] of next) if (state.isFocused) next.set(key, { ...state, isFocused: false });
      next.set(id, win);
      return next;
    });
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setWindowMap((previous) => {
      const removed = previous.get(id);
      const next = new Map(previous);
      next.delete(id);
      if (removed?.isFocused) {
        const candidate = [...next.values()].filter((win) => !win.isMinimized && win.workspace === removed.workspace).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (candidate) next.set(candidate.id, { ...candidate, isFocused: true });
      }
      return next;
    });
  }, []);

  const focusWindow = useCallback((id: WindowId) => {
    setWindowMap((previous) => {
      const win = previous.get(id);
      if (!win) return previous;
      if (win.isFocused && !win.isMinimized) return previous;
      const next = new Map(previous);
      for (const [key, state] of next) if (state.isFocused) next.set(key, { ...state, isFocused: false });
      next.set(id, { ...win, isFocused: true, isMinimized: false, zIndex: nextZIndexRef.current++ });
      return next;
    });
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindowMap((previous) => {
      const win = previous.get(id);
      if (!win) return previous;
      const next = new Map(previous);
      next.set(id, { ...win, isMinimized: true, isFocused: false });
      if (win.isFocused) {
        const candidate = [...next.values()].filter((other) => !other.isMinimized && other.workspace === win.workspace).sort((a, b) => b.zIndex - a.zIndex)[0];
        if (candidate) next.set(candidate.id, { ...candidate, isFocused: true });
      }
      return next;
    });
  }, []);

  const maximizeWindow = useCallback((id: WindowId) => {
    setWindowMap((previous) => {
      const win = previous.get(id);
      if (!win) return previous;
      const area = areaRef.current;
      const bounds = win.isMaximized ? fitBounds(win.prevBounds?.position ?? { x: 0, y: 0 }, win.prevBounds?.size ?? APP_REGISTRY[win.appId].defaultSize, area) : { position: { x: 0, y: 0 }, size: area };
      const next = new Map(previous);
      next.set(id, { ...win, ...bounds, isMaximized: !win.isMaximized, prevBounds: win.isMaximized ? win.prevBounds : { position: win.position, size: win.size } });
      return next;
    });
  }, []);

  const moveWindow = useCallback((id: WindowId, position: Position) => {
    setWindowMap((previous) => {
      const win = previous.get(id);
      if (!win) return previous;
      const next = new Map(previous);
      next.set(id, { ...win, ...fitBounds(position, win.size, areaRef.current), isMaximized: false });
      return next;
    });
  }, []);

  const resizeWindow = useCallback((id: WindowId, size: Size) => {
    setWindowMap((previous) => {
      const win = previous.get(id);
      if (!win) return previous;
      const area = areaRef.current;
      const fittedSize = { width: Math.min(area.width, Math.max(size.width, win.minSize.width)), height: Math.min(area.height, Math.max(size.height, win.minSize.height)) };
      const next = new Map(previous);
      next.set(id, { ...win, ...fitBounds(win.position, fittedSize, area), isMaximized: false });
      return next;
    });
  }, []);

  const getWindow = useCallback((id: WindowId) => windowMap.get(id), [windowMap]);
  return { windows: Array.from(windowMap.values()), openWindow, closeWindow, focusWindow, minimizeWindow, maximizeWindow, moveWindow, resizeWindow, getWindow };
}

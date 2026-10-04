"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { DockSquircleIcon } from "./dock-squircle-icon";
import { Trash2, Folder } from "lucide-react";

interface DockProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onMinimizeWindow?: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
  dockMagnification?: boolean;
}

export function Dock({
  windows,
  onFocusWindow,
  onMinimizeWindow,
  onOpenApp,
  dockMagnification = true,
}: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Apps that have at least one open window
  const openAppIds: Record<string, true> = {};
  for (const w of windows) {
    openAppIds[w.appId] = true;
  }

  // Active window's app id (currently focused and visible)
  const activeAppId =
    windows.find((w) => w.isFocused && !w.isMinimized)?.appId ?? null;

  const appList = Object.values(APP_REGISTRY);

  const getScale = (index: number) => {
    if (!dockMagnification || hoveredIndex === null) return 1.0;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 1.32;
    if (dist === 1) return 1.16;
    if (dist === 2) return 1.07;
    return 1.0;
  };

  return (
    <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none select-none max-w-[96vw]">
      {/* Liquid Glass Bottom Capsule Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex flex-row items-center gap-1.5 sm:gap-2.5 p-2 sm:p-2.5 rounded-full dock-liquid-glass transition-all duration-300 overflow-x-auto sm:overflow-visible scrollbar-none shadow-2xl"
      >
        {/* Main Application Squircles */}
        {appList.map((app, index) => {
          const isRunning = openAppIds[app.id] === true;
          const isActive = activeAppId === app.id;
          const scale = getScale(index);

          const appWindows = windows
            .filter((w) => w.appId === app.id)
            .sort((a, b) => b.zIndex - a.zIndex);
          const winCount = appWindows.length;
          const targetWin = appWindows[0];

          return (
            <button
              key={app.id}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => {
                if (targetWin) {
                  if (targetWin.isFocused && !targetWin.isMinimized && onMinimizeWindow) {
                    onMinimizeWindow(targetWin.id);
                  } else {
                    onFocusWindow(targetWin.id);
                  }
                } else {
                  onOpenApp(app.id);
                }
              }}
              aria-label={app.name}
              title={app.name}
              style={{
                transform: `scale(${scale})`,
              }}
              className="group relative flex items-center justify-center shrink-0 w-11 h-11 sm:w-12 sm:h-12 cursor-pointer transition-all duration-150 ease-out origin-bottom active:scale-90"
            >
              {/* Rich macOS Squircle Icon */}
              <DockSquircleIcon appId={app.id} />

              {/* Running indicator dot (matching Image #1: subtle white dot centered underneath) */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                    isActive
                      ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                      : "bg-white/70"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7px] sm:text-[8px] font-bold text-white bg-primary rounded-full shadow-md">
                  {winCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Vertical Divider Line (matching Image #1) */}
        <div className="w-[1px] h-8 bg-white/20 mx-0.5 sm:mx-1 shrink-0" />

        {/* Minimized Documents Stack / Folder */}
        <button
          type="button"
          onClick={() => onOpenApp("file-manager")}
          title="Documents & Downloads"
          className="group relative flex items-center justify-center shrink-0 w-11 h-11 sm:w-12 sm:h-12 cursor-pointer transition-all duration-150 ease-out origin-bottom hover:scale-110 active:scale-90"
        >
          <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-sky-600 to-blue-800 p-1 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
            <Folder className="w-6 h-6 text-white fill-white/30 drop-shadow" />
          </div>
        </button>

        {/* Trash Can (matching Image #1: wastebasket with crumpled colorful paper) */}
        <button
          type="button"
          onClick={() => onOpenApp("file-manager")}
          title="Trash"
          className="group relative flex items-center justify-center shrink-0 w-11 h-11 sm:w-12 sm:h-12 cursor-pointer transition-all duration-150 ease-out origin-bottom hover:scale-110 active:scale-90"
        >
          <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-slate-200/90 via-slate-300/80 to-slate-400/90 p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-md border border-white/30">
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/15 pointer-events-none" />
            {/* Colorful crumpled papers */}
            <div className="flex gap-0.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            {/* Mesh basket icon */}
            <Trash2 className="w-5 h-5 text-slate-700" />
          </div>
        </button>
      </div>
    </div>
  );
}

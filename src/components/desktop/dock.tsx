"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";

interface DockProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onMinimizeWindow?: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
  dockMagnification?: boolean;
}

/**
 * Liquid Glass Bottom Dock:
 * - Floating horizontally at bottom center with sleek rounded-xl styling.
 * - Upward proximity magnification (origin-bottom).
 * - Running indicator dots placed neatly below icons.
 */
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
    if (dist === 0) return 1.35;
    if (dist === 1) return 1.18;
    if (dist === 2) return 1.08;
    return 1.0;
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none select-none max-w-[96vw]">
      {/* Liquid Glass Bottom Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex flex-row items-center gap-1.5 sm:gap-2.5 p-2 sm:p-2.5 rounded-full liquid-glass transition-all duration-300 overflow-x-auto sm:overflow-visible scrollbar-none shadow-2xl"
      >
        {appList.map((app, index) => {
          const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
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
                boxShadow: isActive ? "0 0 15px var(--accent-glow, rgba(245, 158, 11, 0.4))" : undefined,
              }}
              className={clsx(
                "group relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 cursor-pointer",
                "rounded-full transition-all duration-150 ease-out origin-bottom active:scale-95",
                isActive && "bg-primary/25 border border-primary/60 shadow-lg",
                isRunning && !isActive && "bg-primary/10 hover:bg-primary/20",
                !isRunning && "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <IconComponent
                className={clsx(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-150",
                  "text-muted-foreground group-hover:text-primary",
                  isActive && "text-primary",
                  isRunning && !isActive && "text-primary/90"
                )}
              />

              {/* Running indicator dot (underneath icon) */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-background",
                    isActive
                      ? "bg-primary shadow-primary/50 shadow animate-pulse"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7px] sm:text-[8px] font-bold text-primary-foreground bg-primary rounded-full shadow-sm">
                  {winCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

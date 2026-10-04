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
 * Liquid Glass Right-Side OpenBSD Dock:
 * - Ultra-smooth frosted acrylic pill with soft UI reflections.
 * - Dynamic glowing active halo.
 * - Proximity magnification and zero scrollbars.
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
    <div className="fixed right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Liquid Glass Pill Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 rounded-3xl liquid-glass transition-all duration-300 overflow-hidden"
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
                "group relative flex items-center justify-center shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 cursor-pointer",
                "rounded-2xl transition-all duration-150 ease-out origin-center active:scale-95",
                isActive && "bg-primary/25 border border-primary/60 shadow-lg",
                isRunning && !isActive && "bg-primary/10 hover:bg-primary/20",
                !isRunning && "hover:bg-white/10 dark:hover:bg-white/5"
              )}
            >
              <IconComponent
                className={clsx(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors duration-150",
                  "text-muted-foreground group-hover:text-primary",
                  isActive && "text-primary",
                  isRunning && !isActive && "text-primary/90"
                )}
              />

              {/* Running indicator dot */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-background",
                    isActive
                      ? "bg-primary shadow-primary/50 shadow animate-pulse"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3 h-3 sm:w-3.5 sm:h-3.5 text-[6px] sm:text-[7px] font-bold text-primary-foreground bg-primary rounded-full shadow-sm">
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

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
 * Unified Right-Side OpenBSD Dock:
 * - Positioned strictly on the right side across all devices (mobile, tablet, desktop).
 * - Responsive icon scaling (w-7 on mobile to w-10 on desktop).
 * - Smooth proximity magnification and zero scrollbars.
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
  const openAppIds = new Set(windows.map((w) => w.appId));

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
      {/* Registered Apps Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-1 sm:p-1.5 md:p-2 bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden"
      >
        {appList.map((app, index) => {
          const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          const isRunning = openAppIds.has(app.id);
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
              className={clsx(
                "group relative flex items-center justify-center shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 cursor-pointer",
                "rounded-xl transition-all duration-150 ease-out origin-center",
                isActive && "bg-primary/25 border border-primary/50 shadow-md shadow-primary/10",
                isRunning && !isActive && "bg-primary/10 hover:bg-primary/20"
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
                      ? "bg-primary shadow-primary/50 shadow"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3 h-3 sm:w-3.5 sm:h-3.5 text-[6px] sm:text-[7px] font-bold text-primary-foreground bg-primary rounded-full">
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

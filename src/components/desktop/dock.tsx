"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";

interface DockProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
  dockMagnification?: boolean;
}

/**
 * Responsive Dock:
 * - Desktop (md:): Vertical right-side dock with proximity fisheye magnification.
 * - Mobile (<md): Horizontal bottom dock with scrollable app icons.
 * - Layering (z-30): Positioned below top bar popovers, menus, and notification center (z-50 to z-70).
 */
export function Dock({ windows, onFocusWindow, onOpenApp, dockMagnification = true }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Apps that have at least one open window
  const openAppIds = new Set(
    windows.filter((w) => !w.isMinimized).map((w) => w.appId)
  );

  // Active window's app id
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
    <div className="fixed md:right-3 md:top-1/2 md:-translate-y-1/2 bottom-2 inset-x-2 md:inset-x-auto z-30 flex md:flex-col flex-row items-center justify-center pointer-events-none">
      {/* Favorites / Registered Apps Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex flex-row md:flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 md:p-2 bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl transition-all duration-200 max-w-full max-h-[calc(100vh-64px)] overflow-x-auto md:overflow-y-auto md:overflow-x-visible scrollbar-none"
      >
        {appList.map((app, index) => {
          const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          const isRunning = openAppIds.has(app.id);
          const isActive = activeAppId === app.id;
          const scale = getScale(index);

          // Count how many windows of this app are open
          const winCount = windows.filter(
            (w) => w.appId === app.id && !w.isMinimized
          ).length;

          // Find the most-recently-focused window for this app
          const appWindows = windows
            .filter((w) => w.appId === app.id && !w.isMinimized)
            .sort((a, b) => b.zIndex - a.zIndex);
          const mostRecentWin = appWindows[0];

          return (
            <button
              key={app.id}
              type="button"
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => {
                if (mostRecentWin) {
                  onFocusWindow(mostRecentWin.id);
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
                "group relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 cursor-pointer",
                "rounded-xl transition-all duration-150 ease-out origin-center",
                isActive && "bg-amber-500/25 border border-amber-500/50 shadow-md shadow-amber-500/10",
                isRunning && !isActive && "bg-amber-500/10 hover:bg-amber-500/20"
              )}
            >
              <IconComponent
                className={clsx(
                  "w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-colors duration-150",
                  "text-muted-foreground group-hover:text-amber-400",
                  isActive && "text-amber-400",
                  isRunning && !isActive && "text-amber-400/90"
                )}
              />

              {/* Running indicator dot */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-background",
                    isActive
                      ? "bg-amber-400 shadow-amber-400/50 shadow"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7px] sm:text-[8px] font-bold text-white bg-amber-500 rounded-full">
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

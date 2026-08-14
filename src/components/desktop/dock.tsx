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
 * macOS-style Dock (vertical, right-side) with fisheye proximity magnification.
 */
export function Dock({ windows, onFocusWindow, onOpenApp, dockMagnification = true }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Apps that have at least one open window — used to show running indicators
  const openAppIds = new Set(
    windows.filter((w) => !w.isMinimized).map((w) => w.appId)
  );

  // Active window's app id — highlighted in the dock
  const activeAppId =
    windows.find((w) => w.isFocused && !w.isMinimized)?.appId ?? null;

  const appList = Object.values(APP_REGISTRY);

  const getScale = (index: number) => {
    if (!dockMagnification || hoveredIndex === null) return 1.0;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 1.45;
    if (dist === 1) return 1.25;
    if (dist === 2) return 1.1;
    return 1.0;
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
      {/* Favorites / Registered Apps Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="flex flex-col items-center gap-2.5 p-2 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl transition-all duration-200"
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
                "group relative flex items-center justify-center w-11 h-11 cursor-pointer",
                "rounded-xl transition-all duration-150 ease-out origin-center",
                isActive && "bg-amber-500/25 border border-amber-500/50 shadow-md shadow-amber-500/10",
                isRunning && !isActive && "bg-amber-500/10 hover:bg-amber-500/20"
              )}
            >
              <IconComponent
                className={clsx(
                  "w-6 h-6 transition-colors duration-150",
                  "text-muted-foreground group-hover:text-amber-400",
                  isActive && "text-amber-400",
                  isRunning && !isActive && "text-amber-400/90"
                )}
              />

              {/* Running indicator dot */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                    isActive
                      ? "bg-amber-400 shadow-amber-400/50 shadow"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 text-[8px] font-bold text-white bg-amber-500 rounded-full">
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

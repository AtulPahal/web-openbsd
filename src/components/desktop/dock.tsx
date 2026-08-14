"use client";

import { clsx } from "clsx";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";

interface DockProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
}

/**
 * GNOME-style dock (left-side, vertical, centered).
 * Mirrors GNOME Shell's dash behavior: favorite apps at the top,
 * running windows below.
 * Behavior:
 * — Icons zoom on hover (transform scale-110)
 * — Running windows have a coloured indicator dot
 * — Active window gets a highlighted background
 * — Transparent bg that becomes opaque on hover (backdrop-blur)
 */
export function Dock({ windows, onFocusWindow, onOpenApp }: DockProps) {
  // Apps that have at least one open window — used to show running indicators
  const openAppIds = new Set(
    windows.filter((w) => !w.isMinimized).map((w) => w.appId)
  );
  // Active window's app id — highlighted in the dock
  const activeAppId =
    windows.find((w) => w.isFocused && !w.isMinimized)?.appId ?? null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5">
      {/* Favorites: all registered apps */}
      <div className="flex flex-col items-center gap-2 p-1.5 bg-background/60 backdrop-blur border border-border/50 rounded-xl shadow-xl">
        {Object.values(APP_REGISTRY).map((app) => {
          const IconComponent =
            APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          const isRunning = openAppIds.has(app.id);
          const isActive = activeAppId === app.id;
          // Count how many windows of this app are open
          const winCount = windows.filter(
            (w) => w.appId === app.id && !w.isMinimized
          ).length;

          // Find the most-recently-focused window for this app (GNOME behavior)
          const appWindows = windows
            .filter((w) => w.appId === app.id && !w.isMinimized)
            .sort((a, b) => b.zIndex - a.zIndex);
          const mostRecentWin = appWindows[0];

          return (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                if (mostRecentWin) {
                  // App already running — focus its window
                  onFocusWindow(mostRecentWin.id);
                } else {
                  // App not running — launch it
                  onOpenApp(app.id);
                }
              }}
              aria-label={app.name}
              title={app.name}
              className={clsx(
                "group relative flex items-center justify-center w-12 h-12",
                "rounded-xl transition-all duration-200 ease-out",
                "hover:scale-110 hover:bg-amber-500/10",
                isActive && "bg-amber-500/20 scale-110",
                isRunning && !isActive && "bg-amber-500/5"
              )}
            >
              <IconComponent
                className={clsx(
                  "w-6 h-6 transition-all duration-200",
                  "text-muted-foreground group-hover:text-amber-400",
                  isActive && "text-amber-400",
                  isRunning && !isActive && "text-amber-400/80"
                )}
              />

              {/* Running indicator dot (GNOME-style, on the right side of icon) */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full",
                    "border-2 border-background",
                    isActive
                      ? "bg-amber-400 shadow-amber-400/50 shadow"
                      : "bg-muted-foreground/60"
                  )}
                />
              )}

              {/* Window count badge for multi-window apps */}
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

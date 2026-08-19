"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";
import { Shield } from "lucide-react";

interface DockProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onMinimizeWindow?: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
  dockMagnification?: boolean;
  onToggleAppSwitcher?: () => void;
}

/**
 * Ubuntu Touch & Desktop Dock:
 * - Desktop (md:): Vertical right-side dock with proximity fisheye magnification (NO scrollbar).
 * - Mobile (<md): Authentic Ubuntu Touch Left Edge Launcher (NO scrollbar, auto-fitting).
 * - Zero scrollbars at all times.
 */
export function Dock({
  windows,
  onFocusWindow,
  onMinimizeWindow,
  onOpenApp,
  dockMagnification = true,
  onToggleAppSwitcher,
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
    if (dist === 0) return 1.3;
    if (dist === 1) return 1.15;
    if (dist === 2) return 1.05;
    return 1.0;
  };

  return (
    <>
      {/* DESKTOP VIEW: Vertical Right-Side Dock (md:) */}
      <div className="hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center pointer-events-none">
        <div
          onMouseLeave={() => setHoveredIndex(null)}
          className="pointer-events-auto flex flex-col items-center gap-1.5 p-2 bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden"
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
                  "group relative flex items-center justify-center shrink-0 w-9 h-9 md:w-10 md:h-10 cursor-pointer",
                  "rounded-xl transition-all duration-150 ease-out origin-center",
                  isActive && "bg-amber-500/25 border border-amber-500/50 shadow-md shadow-amber-500/10",
                  isRunning && !isActive && "bg-amber-500/10 hover:bg-amber-500/20"
                )}
              >
                <IconComponent
                  className={clsx(
                    "w-5 h-5 transition-colors duration-150",
                    "text-muted-foreground group-hover:text-amber-400",
                    isActive && "text-amber-400",
                    isRunning && !isActive && "text-amber-400/90"
                  )}
                />

                {/* Running indicator dot */}
                {isRunning && (
                  <span
                    className={clsx(
                      "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background",
                      isActive
                        ? "bg-amber-400 shadow-amber-400/50 shadow"
                        : "bg-muted-foreground/60"
                    )}
                  />
                )}

                {/* Window count badge */}
                {winCount > 1 && (
                  <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-3.5 h-3.5 text-[7px] font-bold text-white bg-amber-500 rounded-full">
                    {winCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE VIEW: Authentic Ubuntu Touch Left Edge Launcher (<md) */}
      <div className="flex md:hidden fixed left-0 top-7 bottom-0 w-11 z-40 flex-col items-center justify-between py-1.5 bg-black/60 backdrop-blur-xl border-r border-white/10 shadow-2xl pointer-events-auto overflow-hidden select-none">
        {/* Top Ubuntu Touch BFB / Home Dash Button */}
        <button
          type="button"
          onClick={onToggleAppSwitcher}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-black shadow-md shadow-amber-500/30 cursor-pointer shrink-0 active:scale-90 transition-transform"
          title="Ubuntu Touch App Switcher"
        >
          <Shield className="w-4 h-4 fill-black" />
        </button>

        {/* Middle Running / Favorite Apps Strip (Auto-fitting, NO scrollbar) */}
        <div className="flex flex-col items-center gap-1.5 w-full justify-center flex-1 my-1 overflow-hidden">
          {appList.slice(0, 8).map((app) => {
            const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
            const isRunning = openAppIds.has(app.id);
            const isActive = activeAppId === app.id;

            const appWindows = windows
              .filter((w) => w.appId === app.id)
              .sort((a, b) => b.zIndex - a.zIndex);
            const targetWin = appWindows[0];

            return (
              <button
                key={app.id}
                type="button"
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
                className={clsx(
                  "relative flex items-center justify-center w-7 h-7 rounded-lg transition-all shrink-0 cursor-pointer active:scale-95",
                  isActive
                    ? "bg-amber-500/30 border border-amber-500/60 shadow-sm"
                    : isRunning
                    ? "bg-white/10"
                    : "hover:bg-white/10"
                )}
                title={app.name}
              >
                <IconComponent
                  className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-amber-300" : isRunning ? "text-amber-400/90" : "text-white/70"
                  )}
                />

                {/* Ubuntu Touch Left Pip Indicator */}
                {isRunning && (
                  <span
                    className={clsx(
                      "absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-full",
                      isActive ? "bg-amber-400" : "bg-white/60"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Settings Button */}
        <button
          type="button"
          onClick={() => onOpenApp("settings")}
          className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
          title="System Settings"
        >
          {(() => {
            const SettingsIcon = APP_ICON_MAP.Settings;
            return <SettingsIcon className="w-4 h-4" />;
          })()}
        </button>
      </div>
    </>
  );
}

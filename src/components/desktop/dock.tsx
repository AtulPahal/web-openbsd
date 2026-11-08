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
    if (dist === 0) return 1.28;
    if (dist === 1) return 1.14;
    if (dist === 2) return 1.05;
    return 1.0;
  };

  const getMarginX = (index: number) => {
    if (!dockMagnification || hoveredIndex === null) return 0;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 6;
    if (dist === 1) return 3;
    return 0;
  };

  return (
    <nav
      role="navigation"
      aria-label="Applications dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none select-none max-w-[98vw]"
    >
      {/* Liquid Glass Bottom Container */}
      <div
        onMouseLeave={() => setHoveredIndex(null)}
        className="pointer-events-auto flex max-w-full flex-row items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl dock-liquid-glass transition-all duration-200 overflow-x-auto scrollbar-thin"
      >
        {appList.map((app, index) => {
          const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          const isRunning = openAppIds[app.id] === true;
          const isActive = activeAppId === app.id;
          const isHovered = hoveredIndex === index;
          const scale = getScale(index);
          const marginX = getMarginX(index);

          const appWindows = windows
            .filter((w) => w.appId === app.id)
            .sort((a, b) => b.zIndex - a.zIndex);
          const winCount = appWindows.length;
          const targetWin = appWindows[0];

          return (
            <button
              key={app.id}
              type="button"
              onFocus={(event) => {
                setHoveredIndex(index);
                event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
              }}
              onBlur={() => setHoveredIndex(null)}
              title={app.name}
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
              aria-label={`${app.name}${isRunning ? (isActive ? " (Active)" : " (Running)") : ""}`}
              style={{
                transform: `scale(${scale})`,
                marginLeft: marginX ? `${marginX}px` : undefined,
                marginRight: marginX ? `${marginX}px` : undefined,
                boxShadow: isActive ? "0 0 15px var(--accent-glow, rgba(245, 158, 11, 0.4))" : undefined,
              }}
              className={clsx(
                "group relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 cursor-pointer",
                "rounded-xl transition-all duration-150 ease-out origin-bottom active:scale-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isActive && "bg-primary/25 border border-primary/60 shadow-lg text-primary",
                isRunning && !isActive && "bg-foreground/10 hover:bg-foreground/20 text-foreground",
                !isRunning && "hover:bg-foreground/10 text-tone-medium hover:text-foreground"
              )}
            >
              {/* Floating Tooltip Label on Hover */}
              {isHovered && (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-popover border border-border text-[10px] font-semibold text-popover-foreground whitespace-nowrap shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
                  {app.name}
                </span>
              )}

              <IconComponent
                className={clsx(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-150",
                  isActive
                    ? "text-primary"
                    : isRunning
                    ? "text-foreground"
                    : "text-tone-medium group-hover:text-foreground"
                )}
              />

              {/* Running indicator dot centered underneath */}
              {isRunning && (
                <span
                  className={clsx(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                    isActive
                      ? "bg-primary shadow-[0_0_6px_var(--accent-glow)] animate-pulse"
                      : "bg-foreground/80"
                  )}
                />
              )}

              {/* Window count badge */}
              {winCount > 1 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 text-[7px] sm:text-[8px] font-bold text-primary-foreground bg-primary rounded-full shadow-md">
                  {winCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

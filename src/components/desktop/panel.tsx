"use client";

import { AppLauncher } from "./app-launcher";
import { SystemTray } from "./system-tray";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";

interface PanelProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
}

export function Panel({ windows, onFocusWindow, onOpenApp }: PanelProps) {
  return (
    <div className="h-10 bg-card/90 backdrop-blur border-t border-border flex items-center justify-between px-2 select-none z-50 shrink-0">
      {/* Left: App Launcher */}
      <div className="flex items-center gap-2">
        <AppLauncher onOpenApp={onOpenApp} />
      </div>

      {/* Center: Open Window Taskbar */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
        {windows.map((win) => {
          const appMeta = APP_REGISTRY[win.appId];
          const IconComponent = appMeta ? APP_ICON_MAP[appMeta.icon] ?? APP_ICON_MAP.Terminal : APP_ICON_MAP.Terminal;
          const isActive = win.isFocused && !win.isMinimized;

          return (
            <button
              key={win.id}
              onClick={() => onFocusWindow(win.id)}
              className={`group h-7 px-3 flex items-center gap-2 text-xs font-mono border transition-all duration-200 truncate max-w-[180px] ${
                isActive
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold hover:bg-amber-500/30"
                  : win.isMinimized
                  ? "bg-background/40 border-border/40 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-amber-500/10"
                  : "bg-secondary/40 border-border/80 text-foreground hover:bg-amber-500/15 hover:text-amber-300"
              }`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isActive ? "text-amber-400" : "text-muted-foreground group-hover:text-amber-400"
                }`}
              />
              <span className="truncate">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right: System Tray */}
      <SystemTray />
    </div>
  );
}

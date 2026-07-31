"use client";

import { AppLauncher } from "./app-launcher";
import { SystemTray } from "./system-tray";
import type { WindowState, WindowId, AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { Terminal, Folder, FileText, Activity, Info, Globe, AudioLines, Clapperboard } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Folder,
  FileText,
  Activity,
  Info,
  Globe,
  AudioLines,
  Clapperboard,
};

interface PanelProps {
  windows: WindowState[];
  onFocusWindow: (id: WindowId) => void;
  onOpenApp: (appId: AppId) => void;
}

export function Panel({ windows, onFocusWindow, onOpenApp }: PanelProps) {
  return (
    <div className="h-10 bg-[#121212] border-t border-border flex items-center justify-between px-2 select-none z-50 shrink-0">
      {/* Left: App Launcher */}
      <div className="flex items-center gap-2">
        <AppLauncher onOpenApp={onOpenApp} />
      </div>

      {/* Center: Open Window Taskbar */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto px-4 scrollbar-none">
        {windows.map((win) => {
          const appMeta = APP_REGISTRY[win.appId];
          const IconComponent = appMeta ? ICON_MAP[appMeta.icon] ?? Terminal : Terminal;
          const isActive = win.isFocused && !win.isMinimized;

          return (
            <button
              key={win.id}
              onClick={() => onFocusWindow(win.id)}
              className={`h-7 px-3 flex items-center gap-2 text-xs font-mono border transition-all truncate max-w-[180px] ${
                isActive
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold"
                  : win.isMinimized
                  ? "bg-background/40 border-border/40 text-muted-foreground opacity-60 hover:opacity-100"
                  : "bg-secondary/40 border-border/80 text-foreground hover:bg-secondary"
              }`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? "text-amber-400" : "text-muted-foreground"
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

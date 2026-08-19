"use client";

import { AppLauncher } from "./app-launcher";
import { SystemTray } from "./system-tray";
import type { AppId, WindowState } from "@/types";

interface TopMenuBarProps {
  onOpenApp: (appId: AppId) => void;
  activeWorkspace: number;
  onSelectWorkspace: (ws: number) => void;
  windows?: WindowState[];
  onToggleNotificationCenter: () => void;
  unreadCount?: number;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (newLevel: number, muted?: boolean) => void;
}

export function TopMenuBar({
  onOpenApp,
  activeWorkspace,
  onSelectWorkspace,
  windows = [],
  onToggleNotificationCenter,
  unreadCount = 0,
  volume,
  isMuted,
  onVolumeChange,
}: TopMenuBarProps) {
  const workspaces = [1, 2, 3, 4];

  // Count active windows per workspace
  const getWorkspaceWindowCount = (ws: number) => {
    return windows.filter((w) => (w.workspace ?? 1) === ws).length;
  };

  return (
    <div className="h-7 bg-background/90 backdrop-blur border-b border-border/40 flex items-center justify-between px-1.5 sm:px-2 text-xs font-mono text-muted-foreground shrink-0 z-50 select-none overflow-hidden">
      {/* Left: OpenBSD App Launcher + Workspaces */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* OpenBSD Option */}
        <AppLauncher onOpenApp={onOpenApp} />

        <div className="text-border/80 text-xs px-0.5 hidden xs:inline">|</div>

        {/* 4 Workspaces Switcher */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws;
            const count = getWorkspaceWindowCount(ws);

            return (
              <button
                key={ws}
                type="button"
                onClick={() => onSelectWorkspace(ws)}
                className={`h-5 px-1.5 sm:px-2 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-mono border transition-all duration-150 rounded-none cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-300 font-bold shadow-sm"
                    : "bg-background/40 border-border/40 text-muted-foreground hover:bg-amber-500/10 hover:text-foreground"
                }`}
                title={`Switch to Workspace ${ws}${count > 0 ? ` (${count} open)` : ""}`}
              >
                <span>{ws}</span>
                {count > 0 && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isActive ? "bg-amber-400" : "bg-muted-foreground/60"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: Clean Spacer */}
      <div className="flex-1 min-w-1" />

      {/* Right: System Tray */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <SystemTray
          onToggleNotificationCenter={onToggleNotificationCenter}
          unreadCount={unreadCount}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
        />
      </div>
    </div>
  );
}

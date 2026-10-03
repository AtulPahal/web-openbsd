"use client";

import { Columns, Grid, Square, Maximize2 } from "lucide-react";
import { AppLauncher } from "./app-launcher";
import { SystemTray } from "./system-tray";
import type { AppId, WindowState } from "@/types";
import type { DriftLayoutMode } from "@/hooks/use-window-manager";

interface TopMenuBarProps {
  onOpenApp: (appId: AppId) => void;
  activeWorkspace: number;
  onSelectWorkspace: (ws: number) => void;
  windows?: WindowState[];
  layoutMode?: DriftLayoutMode;
  onToggleLayoutMode?: () => void;
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
  layoutMode = "floating",
  onToggleLayoutMode,
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
    <div className="h-7 bg-background/90 backdrop-blur border-b border-border/40 flex items-center justify-between px-1.5 sm:px-2 text-xs font-mono text-muted-foreground shrink-0 z-50 select-none overflow-visible">
      {/* Left: OpenBSD App Launcher + Workspaces + driftwm Layout Mode */}
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
                className={`h-5 px-1.5 sm:px-2 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-mono border transition-all duration-150 rounded-md cursor-pointer ${
                  isActive
                    ? "bg-primary/20 border-primary/60 text-primary font-bold shadow-sm"
                    : "bg-background/40 border-border/40 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
                title={`Switch to Workspace ${ws}${count > 0 ? ` (${count} open)` : ""}`}
              >
                <span>{ws}</span>
                {count > 0 && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isActive ? "bg-primary" : "bg-muted-foreground/60"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* driftwm Layout Mode Switcher Button */}
        {onToggleLayoutMode && (
          <>
            <div className="text-border/80 text-xs px-0.5 hidden xs:inline">|</div>
            <button
              type="button"
              onClick={onToggleLayoutMode}
              className="h-5 px-2 flex items-center gap-1.5 text-[10px] font-mono border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-all rounded-md cursor-pointer active:scale-95 shadow-sm"
              title={`driftwm layout: ${layoutMode.toUpperCase()} (Click or press Alt+Space to toggle)`}
            >
              {layoutMode === "floating" && <Maximize2 className="w-3 h-3" />}
              {layoutMode === "tiling" && <Columns className="w-3 h-3" />}
              {layoutMode === "split" && <Grid className="w-3 h-3" />}
              {layoutMode === "monocle" && <Square className="w-3 h-3" />}
              <span className="capitalize">{layoutMode}</span>
            </button>
          </>
        )}
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

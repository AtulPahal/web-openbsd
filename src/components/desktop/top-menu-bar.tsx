"use client";

import { ZoomIn, ZoomOut, Maximize2, Compass, Home, Focus, Eye } from "lucide-react";
import { AppLauncher } from "./app-launcher";
import { SystemTray } from "./system-tray";
import type { AppId, WindowState } from "@/types";
import type { CameraState } from "@/hooks/use-window-manager";

interface TopMenuBarProps {
  onOpenApp: (appId: AppId) => void;
  activeWorkspace?: number;
  onSelectWorkspace?: (ws: number) => void;
  windows?: WindowState[];
  camera?: CameraState;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onZoomToFit?: () => void;
  onCenterWindow?: () => void;
  onGoHome?: () => void;
  onToggleNotificationCenter: () => void;
  unreadCount?: number;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (newLevel: number, muted?: boolean) => void;
}

export function TopMenuBar({
  onOpenApp,
  windows = [],
  camera = { x: 0, y: 0, zoom: 1.0 },
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomToFit,
  onCenterWindow,
  onGoHome,
  onToggleNotificationCenter,
  unreadCount = 0,
  volume,
  isMuted,
  onVolumeChange,
}: TopMenuBarProps) {
  const visibleWindowsCount = windows.filter((w) => !w.isMinimized).length;

  return (
    <div className="h-7 bg-background/95 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-2 text-xs font-mono text-muted-foreground shrink-0 z-50 select-none overflow-visible">
      {/* Left: OpenBSD App Launcher + driftwm Camera Navigator */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* OpenBSD Option */}
        <AppLauncher onOpenApp={onOpenApp} />

        <div className="text-border/80 text-xs px-0.5 hidden xs:inline">|</div>

        {/* driftwm Camera Controls Strip */}
        <div className="flex items-center gap-1">
          {/* Home Button (Mod+A) */}
          <button
            type="button"
            onClick={onGoHome}
            className="h-5 px-1.5 sm:px-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-mono border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-primary/10 text-foreground hover:text-primary rounded-md transition-all cursor-pointer active:scale-95 shadow-sm"
            title="driftwm Home (Mod+A) — Jump to origin (0, 0)"
          >
            <Home className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Overview / Zoom to Fit (Mod+W) */}
          <button
            type="button"
            onClick={onZoomToFit}
            className="h-5 px-1.5 sm:px-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-mono border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-primary/10 text-foreground hover:text-primary rounded-md transition-all cursor-pointer active:scale-95 shadow-sm"
            title={`driftwm Overview (Mod+W) — Zoom to fit all ${visibleWindowsCount} windows`}
          >
            <Eye className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Overview</span>
            {visibleWindowsCount > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[8px] font-bold bg-primary/20 text-primary">
                {visibleWindowsCount}
              </span>
            )}
          </button>

          {/* Center Focused Window (Mod+C) */}
          <button
            type="button"
            onClick={onCenterWindow}
            className="h-5 px-1.5 sm:px-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-mono border border-border/50 hover:border-primary/50 bg-card/50 hover:bg-primary/10 text-foreground hover:text-primary rounded-md transition-all cursor-pointer active:scale-95 shadow-sm"
            title="driftwm Center (Mod+C) — Focus camera on active window"
          >
            <Focus className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Center</span>
          </button>
        </div>

        <div className="text-border/80 text-xs px-0.5 hidden sm:inline">|</div>

        {/* Zoom Controls HUD */}
        <div className="hidden sm:flex items-center gap-0.5 bg-background/50 border border-border/50 rounded-md p-0.5 text-[10px]">
          <button
            type="button"
            onClick={onZoomOut}
            className="w-4 h-4 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out (Mod+-)"
          >
            <ZoomOut className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="px-1 font-bold text-primary hover:underline transition-all cursor-pointer tabular-nums"
            title="Reset Zoom to 100% (Mod+0)"
          >
            {Math.round(camera.zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="w-4 h-4 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom In (Mod+=)"
          >
            <ZoomIn className="w-2.5 h-2.5" />
          </button>
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

"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Wifi,
  Bell,
  Cpu,
  Battery,
  SlidersHorizontal,
  Compass,
  Music,
  ImageIcon,
} from "lucide-react";
import { AppLauncher } from "./app-launcher";
import { PowerMenu } from "./power-menu";
import { NixLogo } from "@/components/ui/nix-logo";
import type { AppId, WindowState } from "@/types";
import type { RiceTheme } from "@/lib/rice-theme-config";
import { getRealHardwareInfo } from "@/lib/hardware-info";

interface TopMenuBarProps {
  onOpenApp: (appId: AppId) => void;
  activeWorkspace: number;
  onSelectWorkspace: (ws: number) => void;
  windows?: WindowState[];
  theme: RiceTheme;
  onToggleNotificationCenter: () => void;
  onToggleMediaOverlay: () => void;
  onToggleWallpaperCarousel: () => void;
  unreadCount?: number;
  nowPlayingTrack?: string;
  isMediaPlaying?: boolean;
  onLock?: () => void;
  onShutdown?: () => void;
}
export function TopMenuBar({
  onOpenApp,
  activeWorkspace,
  onSelectWorkspace,
  windows = [],
  theme,
  onToggleNotificationCenter,
  onToggleMediaOverlay,
  onToggleWallpaperCarousel,
  unreadCount = 0,
  nowPlayingTrack,
  isMediaPlaying = false,
  onLock,
  onShutdown,
}: TopMenuBarProps) {
  const workspaces = [1, 2, 3, 4];
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [ramUsage, setRamUsage] = useState("6.8G");

  const handleLock = () => {
    if (onLock) onLock();
    else window.dispatchEvent(new CustomEvent("system-lock"));
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleShutdown = () => {
    if (onShutdown) onShutdown();
    else window.dispatchEvent(new CustomEvent("system-shutdown"));
  };

  const handleSleep = () => {
    handleLock();
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hw = getRealHardwareInfo();
    const used = (hw.memoryGb * 0.42).toFixed(1);
    setRamUsage(`${used}G`);
  }, []);

  return (
    <div className="w-full pt-1.5 px-3 z-50 select-none flex items-center justify-between text-xs font-sans shrink-0 pointer-events-none">
      {/* ================= LEFT ISLAND: START, POWER, WORKSPACES & LAUNCHER ================= */}
      <div
        className="pointer-events-auto relative h-8 px-2.5 rounded-full shadow-lg border backdrop-blur-2xl flex items-center gap-2 transition-all"
        style={{
          backgroundColor: theme.pillBg,
          borderColor: theme.cardBorder,
          color: theme.textColor,
        }}
      >
        {/* Left Start Button (Nix Snowflake icon from user's screenshot) */}
        <button
          type="button"
          data-power-trigger
          onClick={() => setIsPowerMenuOpen((prev) => !prev)}
          className="w-5 h-5 flex items-center justify-center cursor-pointer transition-transform hover:scale-120 active:scale-90"
          title="Session & Power Menu (Shutdown, Lock, Restart, Sleep, Logout)"
        >
          <NixLogo className="w-4 h-4 drop-shadow-md" />
        </button>

        {/* Power Menu Dropdown Matching Screenshot #1 */}
        <PowerMenu
          isOpen={isPowerMenuOpen}
          onClose={() => setIsPowerMenuOpen(false)}
          theme={theme}
          onLock={handleLock}
          onRestart={handleRestart}
          onShutdown={handleShutdown}
          onSleep={handleSleep}
        />

        {/* Divider */}
        <div className="w-px h-3.5 bg-black/10 dark:bg-white/15" />

        {/* Workspaces Star & Dots Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/10 rounded-full">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws;
            return (
              <button
                key={ws}
                type="button"
                onClick={() => onSelectWorkspace(ws)}
                className="w-4 h-4 flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                title={`Workspace ${ws}`}
              >
                {isActive ? (
                  <span className="text-xs leading-none drop-shadow" style={{ color: theme.accent }}>
                    ✦
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-black/30 dark:bg-white/30" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Label */}
        <span className="font-semibold text-xs pr-0.5 hidden sm:inline">
          Workspace {activeWorkspace}
        </span>

        <div className="w-px h-3.5 bg-black/10 dark:bg-white/15" />

        {/* macOS Applications Manager (from previous requirement) */}
        <AppLauncher onOpenApp={onOpenApp} />
      </div>

      {/* ================= CENTER ISLAND: MEDIA & LIVE CLOCK ================= */}
      <div
        data-media-trigger
        onClick={onToggleMediaOverlay}
        className="pointer-events-auto h-8 px-3.5 rounded-full shadow-lg border backdrop-blur-2xl flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
        style={{
          backgroundColor: theme.pillBg,
          borderColor: theme.cardBorder,
          color: theme.textColor,
        }}
        title="Click to toggle Media Player & Audio Controls"
      >
        {/* Status Indicator circles */}
        <div className="flex items-center gap-1">
          <span
            className={`w-2 h-2 rounded-full ${isMediaPlaying ? "animate-pulse" : ""}`}
            style={{ backgroundColor: isMediaPlaying ? theme.accent : theme.textMuted }}
          />
          <span className="w-2 h-2 rounded-full border border-black/30 dark:border-white/30" />
        </div>

        {/* Track info or No media */}
        <div className="flex items-center gap-1.5 font-medium text-xs truncate max-w-[180px] sm:max-w-xs">
          <Music className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
          <span className="truncate">
            {nowPlayingTrack || "No media"}
          </span>
        </div>

        {/* Clock & Date */}
        <div className="hidden sm:flex items-center gap-1.5 border-l border-black/10 dark:border-white/10 pl-3 font-semibold tabular-nums text-xs">
          <span>{time}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-80">{date}</span>
        </div>
      </div>

      {/* ================= RIGHT ISLAND: TELEMETRY & SYSTEM CONTROLS ================= */}
      <div
        className="pointer-events-auto h-8 px-2.5 sm:px-3 rounded-full shadow-lg border backdrop-blur-2xl flex items-center gap-2 sm:gap-3 transition-all"
        style={{
          backgroundColor: theme.pillBg,
          borderColor: theme.cardBorder,
          color: theme.textColor,
        }}
      >
        {/* Battery Pill */}
        <div className="flex items-center gap-1.5 text-xs font-bold tabular-nums pr-1">
          <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
          <span>100%</span>
        </div>

        {/* RAM Telemetry Badge */}
        <div className="hidden xs:flex items-center gap-1 text-xs font-semibold tabular-nums opacity-85">
          <Cpu className="w-3.5 h-3.5 opacity-70" />
          <span>{ramUsage}</span>
        </div>

        {/* Network Wi-Fi Icon */}
        <div className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="Wi-Fi: Connected">
          <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        </div>

        {/* 3D Wallpaper Carousel Toggle */}
        <button
          type="button"
          onClick={onToggleWallpaperCarousel}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110 cursor-pointer"
          title="Wallpaper & Theme Coverflow Carousel"
        >
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
        </button>

        {/* Notification Center Bell Trigger */}
        <button
          type="button"
          onClick={onToggleNotificationCenter}
          className="relative p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all hover:scale-110 cursor-pointer"
          title="Notification Center & Controls"
        >
          <Bell className="w-3.5 h-3.5 text-primary" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

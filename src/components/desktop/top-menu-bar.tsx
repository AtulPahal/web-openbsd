"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  Bell,
  Cpu,
  Battery,
  Bluetooth,
} from "lucide-react";
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
  const [ramUsage, setRamUsage] = useState("8.0G");

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
          weekday: "long",
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
    const used = (hw.memoryGb * 0.45).toFixed(1);
    setRamUsage(`${used}G`);
  }, []);

  return (
    <header className="w-full h-8 sm:h-9 px-3 sm:px-4 topbar-liquid-glass flex items-center justify-between text-xs font-sans select-none text-white z-50 shrink-0">
      {/* ================= LEFT: START BUTTON, WORKSPACES & WORKSPACE LABEL ================= */}
      <div className="flex items-center gap-2.5 pointer-events-auto relative">
        {/* Nix Start Button */}
        <button
          type="button"
          data-power-trigger
          onClick={() => setIsPowerMenuOpen((prev) => !prev)}
          className="w-5 h-5 flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-90"
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

        {/* Workspaces Star & Dots Pill (Dark pill with light blue active circle disc) */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#1b212f] rounded-full border border-white/5">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace === ws;
            return (
              <button
                key={ws}
                type="button"
                onClick={() => onSelectWorkspace(ws)}
                className="cursor-pointer transition-all flex items-center justify-center"
                title={`Workspace ${ws}`}
              >
                {isActive ? (
                  <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#94a9ff] text-[#0d111a] flex items-center justify-center font-bold text-[11px] shadow-sm">
                    ✦
                  </div>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#94a9ff]/45 hover:bg-[#94a9ff]/80 transition-colors mx-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Workspace Label */}
        <span className="font-medium text-xs text-white/95 pl-1 hidden xs:inline">
          Workspace {activeWorkspace}
        </span>
      </div>

      {/* ================= CENTER: STATUS RINGS, MEDIA PILL & DATE/TIME ================= */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* Dual Concentric Status Rings */}
        <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1b212f] border border-white/5">
          <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#94a9ff]" />
          <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#94a9ff]" />
        </div>

        {/* Media Pill */}
        <div
          data-media-trigger
          onClick={onToggleMediaOverlay}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b212f] border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer shadow-sm text-xs"
          title="Toggle Media Player Overlay"
        >
          <span className="text-emerald-400 font-bold text-xs leading-none">♪</span>
          <span className="font-normal text-white/90 truncate max-w-[120px] sm:max-w-[200px] md:max-w-[260px]">
            {nowPlayingTrack || "Garrett Rose - Software en..."}
          </span>
        </div>

        {/* Live Clock & Full Date */}
        <div className="text-xs font-normal text-white/95 whitespace-nowrap hidden md:flex items-center gap-1.5">
          <span>{time}</span>
          <span className="opacity-40">•</span>
          <span>{date}</span>
        </div>
      </div>

      {/* ================= RIGHT: BATTERY GAUGE, RAM DONUT & SOLID PERIWINKLE PILL ================= */}
      <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
        {/* Battery Circular Progress Gauge */}
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Battery Status: 100% (Plugged In / Optimal Health)"
        >
          <div className="w-5 h-5 rounded-full border-[2.5px] border-[#8da5ff] flex items-center justify-center shrink-0">
            <Battery className="w-2.5 h-2.5 text-[#8da5ff] fill-[#8da5ff]" />
          </div>
          <span className="text-xs font-medium text-white/95 tabular-nums">100%</span>
        </div>

        {/* RAM Telemetry Circular Donut Gauge */}
        <div
          onClick={() => onOpenApp("system-monitor")}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          title={`RAM Usage: ${ramUsage} (Click to open System Monitor)`}
        >
          <div className="w-5 h-5 rounded-full border-[2.5px] border-[#8da5ff]/35 border-t-[#8da5ff] border-r-[#8da5ff] border-b-[#8da5ff] flex items-center justify-center shrink-0">
            <Cpu className="w-2.5 h-2.5 text-[#8da5ff]" />
          </div>
          <span className="text-xs font-medium text-white/95 tabular-nums">{ramUsage}</span>
        </div>

        {/* Solid Periwinkle Controls Pill (Bell, Wi-Fi, Bluetooth as Unified Single Element) */}
        <div
          onClick={onToggleNotificationCenter}
          className="h-7 px-3.5 bg-[#8da5ff] hover:bg-[#7e99ff] text-[#0d111a] rounded-full shadow-md flex items-center gap-3 cursor-pointer transition-all active:scale-95 select-none"
          title="Control Center & Quick Settings (Notifications, Wi-Fi, Bluetooth)"
        >
          {/* Notification Center Bell */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleNotificationCenter();
            }}
            className="hover:scale-115 active:scale-90 transition-transform cursor-pointer flex items-center"
            title="Toggle Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-[#0d111a] fill-[#0d111a] stroke-[2]" />
          </button>

          {/* Wi-Fi Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleNotificationCenter();
            }}
            className="hover:scale-115 active:scale-90 transition-transform cursor-pointer flex items-center"
            title="Wi-Fi: Connected (Click for Controls)"
          >
            <Wifi className="w-3.5 h-3.5 text-[#0d111a] stroke-[2.5]" />
          </button>

          {/* Bluetooth Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleNotificationCenter();
            }}
            className="hover:scale-115 active:scale-90 transition-transform cursor-pointer flex items-center"
            title="Bluetooth: Active (Click for Controls)"
          >
            <Bluetooth className="w-3.5 h-3.5 text-[#0d111a] stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}

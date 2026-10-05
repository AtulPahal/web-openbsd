"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Wifi,
  Bluetooth,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import type { DesktopNotification } from "@/types";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DesktopNotification[];
  onClearAll: () => void;
  onRemoveNotification: (id: string) => void;
  brightness?: number;
  onBrightnessChange?: (b: number) => void;
  onOpenCalendar?: () => void;
  isDndOn?: boolean;
  onToggleDnd?: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (newLevel: number, muted?: boolean) => void;
  theme: RiceTheme;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onRemoveNotification,
  brightness = 100,
  onBrightnessChange,
  onOpenCalendar,
  isDndOn = false,
  onToggleDnd,
  theme,
}: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Quick settings states
  const [wifiActive, setWifiActive] = useState(true);
  const [btActive, setBtActive] = useState(true);

  // Mini Calendar state
  const [calMonth, setCalMonth] = useState(9); // Oct (0-indexed)
  const [calYear, setCalYear] = useState(2026);
  const selectedDay = 4; // Matching Image #2

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const trigger = (e.target as HTMLElement).closest("[data-notif-trigger]");
        if (!trigger) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mini calendar calculation
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div
      ref={panelRef}
      className="fixed top-12 sm:top-14 right-2 sm:right-3.5 z-[70] w-88 sm:w-96 rounded-2xl dock-liquid-glass bg-[#0c121d]/90 backdrop-blur-3xl border border-white/15 p-3.5 space-y-3 select-none font-sans text-xs animate-in slide-in-from-top-2 fade-in-0 duration-200 text-foreground shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
    >
      {/* 1. TOP ROW: Quick Toggles (Bell in solid primary, Wi-Fi, Bluetooth) - Exact match to Image #2 */}
      <div className="flex items-center gap-2">
        {/* Bell Button (Active Theme Color) */}
        <button
          type="button"
          onClick={onToggleDnd}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title={isDndOn ? "DND: ON" : "Notifications: Active"}
        >
          <Bell className="w-5 h-5 fill-current" />
        </button>

        {/* Wi-Fi Button */}
        <button
          type="button"
          onClick={() => setWifiActive(!wifiActive)}
          className={`flex-1 h-11 rounded-xl bg-[#161c28] border border-white/5 flex items-center justify-center transition-all cursor-pointer ${
            wifiActive ? "text-primary" : "text-white/40"
          }`}
          title={wifiActive ? "Wi-Fi: Connected" : "Wi-Fi: Off"}
        >
          <Wifi className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Bluetooth Button */}
        <button
          type="button"
          onClick={() => setBtActive(!btActive)}
          className={`flex-1 h-11 rounded-xl bg-[#161c28] border border-white/5 flex items-center justify-center transition-all cursor-pointer ${
            btActive ? "text-primary" : "text-white/40"
          }`}
          title={btActive ? "Bluetooth: Active" : "Bluetooth: Off"}
        >
          <Bluetooth className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. SECOND ROW: Dark/Light Mode Box + Horizontal Brightness Slider - Exact match to Image #2 */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Mode Box */}
        <button
          type="button"
          onClick={() => {
            const nextMode = theme.mode === "dark" ? "light" : "dark";
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("theme-change", { detail: { isDark: nextMode === "dark" } })
              );
            }
          }}
          className="w-11 h-11 rounded-xl bg-[#161c28] border border-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shrink-0"
          title="Toggle Dark / Light Mode"
        >
          {theme.mode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Horizontal Brightness Slider with Theme Accent */}
        <div className="flex-1 h-11 rounded-xl bg-[#161c28] border border-white/5 flex items-center gap-2.5 px-3">
          <Sun className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => onBrightnessChange?.(Number(e.target.value))}
            style={{ accentColor: "var(--primary)" }}
            className="flex-1 h-1.5 cursor-pointer bg-black/20 rounded-full"
          />
          <span className="text-[11px] font-bold tabular-nums text-white/80 w-8 text-right">
            {brightness}%
          </span>
        </div>
      </div>

      {/* 3. NOTIFICATIONS SECTION - Exact match to Image #2 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-bold text-white/95">Notifications</span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5 scrollbar-thin">
          {/* Card 1: Screenshot captured */}
          <div className="p-3 bg-[#161c28]/90 rounded-xl border border-white/5 flex items-start gap-3 transition-all hover:bg-[#1a2233]">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
              <ImageIcon className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">Screenshot captured</div>
              <div className="text-[11px] text-white/70 leading-snug mt-0.5">
                You can paste the image from the clipboard.
              </div>
              <div className="text-[9px] text-white/50 mt-1">openbsd • 10:52</div>
            </div>
          </div>

          {/* Card 2: Home Manager */}
          <div className="p-3 bg-[#161c28]/90 rounded-xl border border-white/5 flex items-start gap-3 transition-all hover:bg-[#1a2233]">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
              <ImageIcon className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">Home Manager</div>
              <div className="text-[11px] text-white/70 leading-snug mt-0.5">
                System environment and rice themes synchronized.
              </div>
              <div className="text-[9px] text-white/50 mt-1">openbsd • 10:45</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. EMBEDDED MINI CALENDAR - Exact match to Image #2 */}
      <div
        className="p-3.5 bg-[#161c28]/90 rounded-xl border border-white/5 space-y-2.5 cursor-pointer"
        onClick={onOpenCalendar}
        title="Click to open full Calendar App"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white">
            {monthNames[calMonth]} {calYear}
          </span>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else {
                  setCalMonth((m) => m - 1);
                }
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else {
                  setCalMonth((m) => m + 1);
                }
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-white/60">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Day Grid with Day 4 Highlighted (Image #2) */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="py-0.5 opacity-20 text-[10px]">
              •
            </div>
          ))}
          {daysArray.map((d) => {
            const isSelected = d === selectedDay && calMonth === 9 && calYear === 2026;
            return (
              <div
                key={d}
                className={`py-0.5 rounded-lg transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold shadow-md"
                    : "text-white/85 hover:bg-white/10"
                }`}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

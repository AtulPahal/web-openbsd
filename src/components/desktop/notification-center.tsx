"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Wifi,
  Bluetooth,
  Sun,
  Moon,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Sparkles,
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
  const selectedDay = 4;

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
      className="fixed top-10 right-3 z-[70] w-80 sm:w-88 rounded-2xl dock-liquid-glass flex flex-col p-4 space-y-3.5 select-none font-sans text-xs animate-in slide-in-from-top-3 fade-in-0 duration-200 text-foreground"
    >
      {/* 1. TOP ROW: Quick Toggles (Bell, Wi-Fi, Bluetooth) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDnd}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            !isDndOn ? "shadow-md" : "opacity-60"
          }`}
          style={{
            backgroundColor: !isDndOn ? theme.accent : "rgba(0,0,0,0.06)",
            color: !isDndOn ? "#ffffff" : theme.textColor,
          }}
          title={isDndOn ? "DND: ON" : "DND: OFF"}
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setWifiActive(!wifiActive)}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            wifiActive ? "bg-black/5 dark:bg-white/10" : "opacity-40"
          }`}
          title={wifiActive ? "Wi-Fi Connected" : "Wi-Fi Disabled"}
        >
          <Wifi className="w-4 h-4" style={{ color: wifiActive ? theme.accent : undefined }} />
        </button>

        <button
          type="button"
          onClick={() => setBtActive(!btActive)}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            btActive ? "bg-black/5 dark:bg-white/10" : "opacity-40"
          }`}
          title={btActive ? "Bluetooth Active" : "Bluetooth Off"}
        >
          <Bluetooth className="w-4 h-4" style={{ color: btActive ? theme.accent : undefined }} />
        </button>
      </div>

      {/* 2. SECOND ROW: Theme Toggle + Brightness Slider */}
      <div className="flex items-center gap-2.5 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
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
          className="p-2 rounded-md bg-black/5 dark:bg-white/10 hover:scale-105 transition-all cursor-pointer shrink-0"
          title="Toggle Dark / Light Mode"
        >
          {theme.mode === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="flex-1 flex items-center gap-2 px-1">
          <Sun className="w-3.5 h-3.5 opacity-60 shrink-0" />
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => onBrightnessChange?.(Number(e.target.value))}
            style={{ accentColor: theme.accent }}
            className="flex-1 h-1.5 cursor-pointer bg-black/10 dark:bg-white/15 rounded-full"
          />
          <span className="text-[10px] font-bold tabular-nums opacity-70 w-8 text-right">
            {brightness}%
          </span>
        </div>
      </div>

      {/* 3. NOTIFICATIONS SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[10px] opacity-70 hover:opacity-100 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="p-3 text-center opacity-60 text-[11px] rounded-xl bg-black/5 dark:bg-white/5">
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="group relative p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-start gap-2.5 transition-all hover:bg-black/10 dark:hover:bg-white/10"
              >
                <div className="p-1.5 rounded-md bg-black/5 dark:bg-white/10 shrink-0 mt-0.5">
                  <ImageIcon className="w-3.5 h-3.5 opacity-70" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-xs truncate">{n.title}</div>
                  <div className="text-[11px] opacity-80 leading-tight mt-0.5 line-clamp-2">
                    {n.message}
                  </div>
                  <div className="text-[9px] opacity-60 mt-1">openbsd • {n.timestamp}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveNotification(n.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-opacity cursor-pointer shrink-0"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. EMBEDDED MINI CALENDAR (Exact match to Image #5) */}
      <div
        className="p-3.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2.5 cursor-pointer"
        onClick={onOpenCalendar}
        title="Click to open full Calendar App"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs">
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
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-semibold opacity-60">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="py-1 opacity-20 text-[10px]">
              •
            </div>
          ))}
          {daysArray.map((d) => {
            const isSelected = d === selectedDay && calMonth === 9 && calYear === 2026;
            return (
              <div
                key={d}
                className={`py-1 rounded-xl transition-all flex items-center justify-center ${
                  isSelected ? "font-bold shadow-md" : "hover:bg-black/10 dark:hover:bg-white/10"
                }`}
                style={{
                  backgroundColor: isSelected ? theme.accent : undefined,
                  color: isSelected ? "#ffffff" : undefined,
                }}
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

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Trash2,
  X,
  Shield,
  Activity,
  Calendar,
  Clock,
  Wifi,
  Bluetooth,
  Volume2,
  Sun,
  Moon,
  Check,
  Terminal,
  Folder,
  FileText,
  Globe,
  Info,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import type { DesktopNotification } from "@/types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DesktopNotification[];
  onClearAll: () => void;
  onRemoveNotification: (id: string) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onRemoveNotification,
}: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");

  // Embedded Quick Settings State
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [brightness, setBrightness] = useState(90);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
      setDayOfWeek(
        now.toLocaleDateString("en-US", {
          weekday: "long",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync master volume changes with system
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (isMuted) setIsMuted(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("master-volume-change", {
          detail: { volume: val / 100, isMuted: false, level: val },
        })
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const isClockBtn = (e.target as HTMLElement).closest("[data-time-trigger]");
        if (!isClockBtn) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-8 right-2 z-50 w-84 max-h-[88vh] bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl flex flex-col overflow-hidden font-mono text-xs select-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-background/50 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notification & Control Center</span>
        </div>
        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-1 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-300 rounded transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* macOS-style Date & Clock Card */}
        <div className="p-3 bg-background/60 border border-border/60 rounded-xl flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              {dayOfWeek}
            </span>
            <span className="text-amber-400">{SYSTEM_CONFIG.name}</span>
          </div>
          <div className="text-xl font-bold text-foreground tracking-wide mt-0.5">
            {time}
          </div>
          <div className="text-xs text-muted-foreground">{dateStr}</div>
        </div>

        {/* EMBEDDED CONTROL CENTER & QUICK SETTINGS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              QUICK SETTINGS
            </span>
          </div>

          {/* Quick Settings Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Wi-Fi Quick Card */}
            <button
              type="button"
              onClick={() => setWifiOn(!wifiOn)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                wifiOn
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-background/40 border-border/60 text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${wifiOn ? "bg-emerald-500 text-black" : "bg-muted text-muted-foreground"}`}>
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs">Wi-Fi</div>
                <div className="text-[10px] opacity-80 truncate">{wifiOn ? "OpenBSD-5G" : "Off"}</div>
              </div>
            </button>

            {/* Bluetooth Quick Card */}
            <button
              type="button"
              onClick={() => setBtOn(!btOn)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                btOn
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-400"
                  : "bg-background/40 border-border/60 text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${btOn ? "bg-sky-500 text-black" : "bg-muted text-muted-foreground"}`}>
                <Bluetooth className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs">Bluetooth</div>
                <div className="text-[10px] opacity-80 truncate">{btOn ? "AirPods Pro" : "Off"}</div>
              </div>
            </button>

            {/* Dark Mode Quick Card */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                darkMode
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-background/40 border-border/60 text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${darkMode ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"}`}>
                {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <div className="font-bold text-xs">Dark Mode</div>
                <div className="text-[10px] opacity-80 truncate">{darkMode ? "On" : "Off"}</div>
              </div>
            </button>

            {/* PF Firewall Card */}
            <div className="p-2.5 bg-background/40 border border-border/60 rounded-xl flex items-center gap-2 text-left">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-emerald-400">PF Active</div>
                <div className="text-[10px] text-muted-foreground">{SYSTEM_CONFIG.localIp}</div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Panel */}
          <div className="space-y-2 p-2.5 bg-background/40 border border-border/50 rounded-xl">
            {/* Display Brightness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" /> Brightness
                </span>
                <span className="font-bold text-foreground">{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
              />
            </div>

            {/* Sound Master Volume Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-400" /> Master Volume
                </span>
                <span className="font-bold text-foreground">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>NOTIFICATIONS ({notifications.length})</span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-5 text-center text-muted-foreground/60 space-y-1 bg-background/30 rounded-xl border border-border/30">
              <Bell className="w-5 h-5 mx-auto text-muted-foreground/30" />
              <p className="text-xs">No New Notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              return (
                <div
                  key={n.id}
                  className="group relative p-2.5 bg-background/70 hover:bg-background border border-border/60 rounded-xl flex flex-col gap-1 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-400 truncate max-w-[180px]">
                      {n.title}
                    </span>
                    <span className="text-muted-foreground/70 shrink-0">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-snug">
                    {n.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemoveNotification(n.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-opacity"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

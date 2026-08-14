"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Trash2, X, Shield, Activity, Calendar, Clock, Terminal, Folder, FileText, Globe, Info, User } from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import type { DesktopNotification } from "@/types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DesktopNotification[];
  onClearAll: () => void;
  onRemoveNotification: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Folder,
  FileText,
  Activity,
  Info,
  Globe,
  User,
};

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Only close if click was not on the system tray clock trigger button
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
      className="fixed top-8 right-2 z-50 w-80 max-h-[85vh] bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-xl flex flex-col overflow-hidden font-mono text-xs select-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-background/50 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notification Center</span>
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

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {/* macOS-style Date & Clock Widget */}
        <div className="p-3 bg-background/60 border border-border/60 rounded-lg flex flex-col gap-1 shadow-sm">
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

        {/* macOS-style Quick System Status */}
        <div className="p-2.5 bg-background/40 border border-border/40 rounded-lg flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>PF Active</span>
          </div>
          <div className="flex items-center gap-1 text-sky-400">
            <Activity className="w-3.5 h-3.5" />
            <span>{SYSTEM_CONFIG.hostname}</span>
          </div>
          <div className="text-amber-400/80 font-semibold">
            v{SYSTEM_CONFIG.desktopVersion}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>NOTIFICATIONS ({notifications.length})</span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground/60 space-y-1">
              <Bell className="w-6 h-6 mx-auto text-muted-foreground/30" />
              <p className="text-xs">No New Notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              return (
                <div
                  key={n.id}
                  className="group relative p-2.5 bg-background/70 hover:bg-background border border-border/60 rounded-lg flex flex-col gap-1 transition-all shadow-sm"
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

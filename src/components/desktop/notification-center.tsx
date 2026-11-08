"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellOff, Wifi, Bluetooth, Sun, Moon, ChevronLeft, ChevronRight, ImageIcon, Volume2, VolumeX, X } from "lucide-react";
import type { DesktopNotification } from "@/types";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DesktopNotification[];
  onClearAll: () => void;
  onRemoveNotification: (id: string) => void;
  brightness?: number;
  onBrightnessChange?: (brightness: number) => void;
  onOpenCalendar?: () => void;
  isDndOn?: boolean;
  onToggleDnd?: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number, muted?: boolean) => void;
  theme: RiceTheme;
  isDarkMode?: boolean;
}

export function NotificationCenter({ isOpen, onClose, notifications, onClearAll, onRemoveNotification, brightness = 100, onBrightnessChange, onOpenCalendar, isDndOn = false, onToggleDnd, volume, isMuted, onVolumeChange, theme, isDarkMode = true }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [wifiActive, setWifiActive] = useState(true);
  const [btActive, setBtActive] = useState(true);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.querySelector<HTMLButtonElement>("[data-notif-trigger]");
    const place = () => {
      const rect = trigger?.closest("header")?.getBoundingClientRect();
      if (rect) panelRef.current?.style.setProperty("top", `${rect.bottom + 8}px`);
    };
    place();
    panelRef.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !trigger?.contains(event.target)) closeRef.current();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        trigger?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", place);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = month.getDay();

  return createPortal(
    <div ref={panelRef} id="notification-center" role="dialog" aria-label="Control Center & Quick Settings" tabIndex={-1} className="notification-panel dock-liquid-glass fixed z-[70] w-96 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl font-sans text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Control Center</h2>
        <button type="button" onClick={onClose} aria-label="Close Control Center" className="rounded-md p-1.5 hover:bg-foreground/10"><X aria-hidden="true" className="size-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={onToggleDnd} aria-label="Do Not Disturb" aria-pressed={isDndOn} className={`flex h-11 items-center justify-center rounded-xl ${isDndOn ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
          {isDndOn ? <BellOff aria-hidden="true" className="size-5" /> : <Bell aria-hidden="true" className="size-5" />}
        </button>
        <button type="button" onClick={() => setWifiActive((active) => !active)} aria-label="Demo Wi-Fi toggle" aria-pressed={wifiActive} title="Simulated Wi-Fi; cannot control your device" className="flex h-11 items-center justify-center rounded-xl bg-muted/80">
          <Wifi aria-hidden="true" className={`size-5 ${wifiActive ? "text-primary" : "text-muted-foreground"}`} />
        </button>
        <button type="button" onClick={() => setBtActive((active) => !active)} aria-label="Demo Bluetooth toggle" aria-pressed={btActive} title="Simulated Bluetooth; cannot control your device" className="flex h-11 items-center justify-center rounded-xl bg-muted/80">
          <Bluetooth aria-hidden="true" className={`size-5 ${btActive ? "text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} onClick={() => window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: !isDarkMode } }))} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/80">
          {isDarkMode ? <Moon aria-hidden="true" className="size-4" /> : <Sun aria-hidden="true" className="size-4" />}
        </button>
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted/80 px-3">
          <Sun aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">Desktop brightness</span>
          <input type="range" min={10} max={100} value={brightness} onChange={(event) => onBrightnessChange?.(Number(event.target.value))} className="min-w-0 flex-1 accent-primary" />
          <span className="w-9 text-right text-xs tabular-nums">{brightness}%</span>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onVolumeChange(volume, !isMuted)} aria-label={isMuted ? "Unmute Audio" : "Mute Audio"} aria-pressed={isMuted} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/80">
          {isMuted ? <VolumeX aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
        </button>
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted/80 px-3">
          <span className="sr-only">Master volume</span>
          <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={(event) => onVolumeChange(Number(event.target.value), false)} className="min-w-0 flex-1 accent-primary" />
          <span className="w-9 text-right text-xs tabular-nums">{isMuted ? 0 : volume}%</span>
        </label>
      </div>
      <section aria-labelledby="notification-heading" className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 id="notification-heading" className="font-semibold">Notifications ({notifications.length})</h3>
          {notifications.length > 0 && <button type="button" onClick={onClearAll} className="text-xs text-tone-medium hover:text-foreground">Clear all</button>}
        </div>
        {notifications.length === 0 ? <p className="rounded-xl bg-muted/60 p-3 text-tone-medium">No active notifications — {theme.name}</p> : (
          <ul className="max-h-44 space-y-2 overflow-y-auto scrollbar-thin">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex items-start gap-2 rounded-xl bg-muted/75 p-3">
                <ImageIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <h4 className="break-words font-semibold">{notification.title}</h4>
                  <p className="break-words text-xs text-tone-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-tone-medium">{notification.timestamp}</p>
                </div>
                <button type="button" onClick={() => onRemoveNotification(notification.id)} aria-label={`Dismiss ${notification.title}`} className="shrink-0 rounded-md p-1 hover:bg-foreground/10"><X aria-hidden="true" className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-label="Mini calendar" className="space-y-2 rounded-xl bg-muted/75 p-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onOpenCalendar} className="font-semibold hover:text-primary">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</button>
          <div className="flex gap-1">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-md p-1 hover:bg-foreground/10"><ChevronLeft aria-hidden="true" className="size-4" /></button>
            <button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-md p-1 hover:bg-foreground/10"><ChevronRight aria-hidden="true" className="size-4" /></button>
          </div>
        </div>
        <div aria-hidden="true" className="grid grid-cols-7 text-center text-xs text-tone-medium">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length: days }, (_, index) => {
            const day = index + 1;
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const selected = date.toDateString() === selectedDate.toDateString();
            return <button key={day} type="button" aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} aria-pressed={selected} onClick={() => setSelectedDate(date)} className={`min-h-7 rounded-lg text-xs ${selected ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-foreground/10"}`}>{day}</button>;
          })}
        </div>
      </section>
    </div>, document.body
  );
}

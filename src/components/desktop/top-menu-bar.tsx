"use client";

import { useState, useEffect } from "react";
import { Wifi, Bell, Cpu, Bluetooth } from "lucide-react";
import { PowerMenu } from "./power-menu";
import { NixLogo } from "@/components/ui/nix-logo";
import type { AppId, WindowState } from "@/types";
import { getRealHardwareInfo } from "@/lib/hardware-info";

interface TopMenuBarProps {
  onOpenApp: (appId: AppId) => void;
  activeWorkspace: number;
  onSelectWorkspace: (ws: number) => void;
  windows?: WindowState[];
  onToggleNotificationCenter: () => void;
  isNotificationCenterOpen: boolean;
  unreadCount?: number;
  onLock?: () => void;
  onShutdown?: () => void;
}

const WORKSPACES = [1, 2, 3, 4];

export function TopMenuBar({
  onOpenApp, activeWorkspace, onSelectWorkspace, windows = [],
  onToggleNotificationCenter, isNotificationCenterOpen, unreadCount = 0,
  onLock, onShutdown,
}: TopMenuBarProps) {
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [memory] = useState(() => getRealHardwareInfo().memoryGb);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);


  return (
    <header aria-label="System top bar" className="system-topbar topbar-liquid-glass relative z-50 flex shrink-0 items-center justify-between rounded-2xl font-sans text-xs">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button" data-power-trigger aria-haspopup="menu"
          aria-controls={isPowerMenuOpen ? "power-menu" : undefined}
          aria-expanded={isPowerMenuOpen} aria-label="Session and power menu"
          onClick={() => {
            if (isNotificationCenterOpen) onToggleNotificationCenter();
            setIsPowerMenuOpen((open) => !open);
          }}
          className="flex size-7 items-center justify-center rounded-md hover:bg-foreground/10"
        >
          <NixLogo aria-hidden="true" className="size-5" />
        </button>
        <nav aria-label="Workspaces" className="flex items-center gap-1 rounded-full border border-border bg-muted/60 px-1 py-0.5">
          {WORKSPACES.map((workspace) => (
            <button
              key={workspace} type="button"
              aria-label={`Switch to Workspace ${workspace}`}
              aria-pressed={activeWorkspace === workspace}
              onClick={() => onSelectWorkspace(workspace)}
              title={`Workspace ${workspace}${windows.some((win) => (win.workspace ?? 1) === workspace) ? " (open windows)" : ""}`}
              className={`flex size-6 items-center justify-center rounded-full ${activeWorkspace === workspace ? "bg-primary text-primary-foreground" : "hover:bg-foreground/10"}`}
            >
              {activeWorkspace === workspace ? <span aria-hidden="true">✦</span> : <span aria-hidden="true" className={`rounded-full ${windows.some((win) => (win.workspace ?? 1) === workspace) ? "size-2 bg-primary" : "size-1.5 bg-primary/40"}`} />}
            </button>
          ))}
        </nav>
        <span className="hidden lg:inline text-tone-medium">Workspace {activeWorkspace}</span>
      </div>

      <button type="button" onClick={() => onOpenApp("calendar")} aria-label="Open Calendar" className="min-w-0 rounded-md px-1 py-1 hover:bg-foreground/10">
        <time dateTime={now?.toISOString()} className="flex items-center justify-center gap-2 whitespace-nowrap tabular-nums">
          <span className="font-semibold text-tone-high">{now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) ?? "—"}</span>
          <span aria-hidden="true" className="hidden md:inline text-tone-low">•</span>
          <span className="hidden md:inline text-tone-medium">{now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}</span>
        </time>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => onOpenApp("system-monitor")} aria-label="Open System Monitor" title={`Browser-reported memory estimate: ${memory} GB; not live usage`} className="hidden sm:flex items-center gap-1.5 rounded-md p-1 hover:bg-foreground/10">
          <Cpu aria-hidden="true" className="size-4 text-primary" />
          <span className="hidden lg:inline text-tone-medium">{memory} GB</span>
        </button>
        <button
          type="button" data-notif-trigger aria-haspopup="dialog"
          aria-label={`Control Center & Quick Settings${unreadCount ? `, ${unreadCount} notifications` : ""}`}
          aria-controls={isNotificationCenterOpen ? "notification-center" : undefined}
          aria-expanded={isNotificationCenterOpen}
          onClick={() => { setIsPowerMenuOpen(false); onToggleNotificationCenter(); }}
          className="relative flex h-8 items-center gap-2 rounded-full bg-primary px-3 text-primary-foreground hover:opacity-90"
        >
          <Bell aria-hidden="true" className="size-3.5" />
          <Wifi aria-hidden="true" className="size-3.5" />
          <Bluetooth aria-hidden="true" className="hidden xs:block size-3.5" />
          {unreadCount > 0 && <span aria-hidden="true" className="absolute right-0 top-0 size-2 rounded-full bg-destructive ring-1 ring-background" />}
        </button>
      </div>
      <PowerMenu isOpen={isPowerMenuOpen} onClose={() => setIsPowerMenuOpen(false)} onLock={() => onLock?.()} onShutdown={() => onShutdown?.()} onSleep={() => onLock?.()} onRestart={() => window.location.reload()} />
    </header>
  );
}

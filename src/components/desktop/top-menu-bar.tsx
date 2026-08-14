"use client";

import { useEffect, useState } from "react";
import { Shield, Clock, Monitor } from "lucide-react";
import { SystemTray } from "@/components/desktop/system-tray";
import { SYSTEM_CONFIG } from "@/lib/system-config";

export function TopMenuBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

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
          month: "short",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: "Portfolio", action: "portfolio" },
    { name: "Resume", action: "resume" },
    { name: "Projects", action: "projects" },
    { name: "Contact", action: "contact" },
  ];

  const handleMenuClick = (action: string) => {
    if (action === "resume") {
      window.open("/resume.pdf", "_blank");
    } else if (action === "portfolio") {
      window.dispatchEvent(
        new CustomEvent("open-app", { detail: { appId: "portfolio" } })
      );
    } else if (action === "projects") {
      window.dispatchEvent(
        new CustomEvent("open-app", { detail: { appId: "portfolio" } })
      );
    } else if (action === "contact") {
      window.dispatchEvent(
        new CustomEvent("open-app", { detail: { appId: "about" } })
      );
    }
  };

  return (
    <div className="h-7 bg-background/80 backdrop-blur border-b border-border/30 flex items-center justify-between px-3 text-xs font-mono text-muted-foreground shrink-0 z-50">
      {/* Left: App menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>OpenBSD</span>
        </div>
        <div className="flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleMenuClick(item.action)}
              className="px-2 py-0.5 hover:text-amber-400 hover:bg-amber-500/10 transition-colors rounded-none"
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="text-amber-400/40">|</div>
        <span className="text-xs">
          {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.osVersion}
        </span>
      </div>

      {/* Center: Empty */}
      <div className="flex-1"></div>

      {/* Right: System Tray + Status */}
      <div className="flex items-center gap-2">
        <SystemTray />
        <div className="flex items-center gap-1 text-emerald-400" title="PF Firewall Active">
          <Shield className="w-3.5 h-3.5" />
          <span>PF</span>
        </div>
        <div className="flex items-center gap-1 text-sky-400" title={`${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.desktopVersion}`}>
          <Monitor className="w-3.5 h-3.5" />
          <span>{SYSTEM_CONFIG.hostname}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 border border-border/50 text-foreground font-semibold min-w-[130px] justify-center">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{date}</span>
          <span className="text-amber-400">{time}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, Monitor } from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";

export function SystemTray() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  

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

  return (
    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground px-2">
      <div className="flex items-center gap-1 text-emerald-400" title="PF Firewall Active">
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">PF</span>
      </div>

      <div className="flex items-center gap-1 text-sky-400" title={`${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.desktopVersion}`}>
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{SYSTEM_CONFIG.name.toLowerCase()}</span>
      </div>

      <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 border border-border/50 text-foreground font-semibold min-w-[130px] justify-center">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        {true ? (
          <>
            <span>{date}</span>
            <span className="text-amber-400">{time}</span>
          </>
        ) : (
          <span className="text-muted-foreground">--:--:--</span>
        )}
      </div>
    </div>
  );
}

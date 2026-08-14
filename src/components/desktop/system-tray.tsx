"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SystemTrayProps {
  onToggleNotificationCenter?: () => void;
  unreadCount?: number;
}

export function SystemTray({
  onToggleNotificationCenter,
  unreadCount = 0,
}: SystemTrayProps) {
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
      {/* Clickable macOS-style Time/Date area */}
      <button
        type="button"
        data-time-trigger
        onClick={onToggleNotificationCenter}
        className="flex items-center gap-1.5 bg-background/50 hover:bg-amber-500/10 px-2 py-1 border border-border/50 hover:border-amber-500/50 text-foreground font-semibold min-w-[130px] justify-center transition-all duration-200 cursor-pointer rounded-none group relative"
        title="Click for Notification Center"
      >
        <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        {time ? (
          <>
            <span>{date}</span>
            <span className="text-amber-400">{time}</span>
          </>
        ) : (
          <span className="text-muted-foreground">--:--:--</span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border-2 border-background" />
        )}
      </button>
    </div>
  );
}

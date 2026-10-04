"use client";

import { useState, useEffect } from "react";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface DesktopHudProps {
  theme: RiceTheme;
}

export function DesktopHud({ theme }: DesktopHudProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
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

  return (
    <div className="absolute inset-0 pointer-events-none p-6 sm:p-8 md:p-10 flex justify-end items-start z-10 select-none overflow-hidden font-sans">
      {/* ================= AESTHETIC DESKTOP TIME & DATE WIDGET ================= */}
      <div className="mt-8 mr-2 text-right pointer-events-none transition-all duration-300">
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none drop-shadow-md select-none"
          style={{ color: theme.textColor }}
        >
          {time || "10:52"}
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-semibold opacity-85 mt-2 tracking-wide drop-shadow-sm select-none">
          {date || "Sunday, 04 Oct 2026"}
        </p>
      </div>
    </div>
  );
}

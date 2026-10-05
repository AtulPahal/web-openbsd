"use client";

import { useState, useEffect } from "react";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface DesktopHudProps {
  theme: RiceTheme;
}

export function DesktopHud({ theme }: DesktopHudProps) {
  const [time, setTime] = useState("");
  const [ampm, setAmpm] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const isPm = rawHours >= 12;
      const hours12 = rawHours % 12 || 12;

      setTime(`${hours12}:${minutes}`);
      setAmpm(isPm ? "PM" : "AM");

      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "2-digit",
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
      {/* ================= AESTHETIC DESKTOP TIME & DATE WIDGET (12-Hour AM/PM) ================= */}
      <div className="mt-8 mr-2 text-right pointer-events-none transition-all duration-300">
        <div className="flex items-baseline justify-end gap-2 sm:gap-3">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none drop-shadow-md select-none"
            style={{ color: theme.textColor }}
          >
            {time || "7:10"}
          </h1>
          <span
            className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider opacity-85 select-none uppercase drop-shadow-sm"
            style={{ color: theme.textColor }}
          >
            {ampm || "PM"}
          </span>
        </div>
        <p className="text-xs sm:text-sm md:text-base font-semibold opacity-85 mt-2 tracking-wide drop-shadow-sm select-none">
          {date || "Monday, Oct 05, 2026"}
        </p>
      </div>
    </div>
  );
}

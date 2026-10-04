"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Droplets,
  Leaf,
  Cloud,
  Thermometer,
  Cpu,
  Activity,
  Radio,
} from "lucide-react";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface DesktopHudProps {
  theme: RiceTheme;
}

export function DesktopHud({ theme }: DesktopHudProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [cpuUsage, setCpuUsage] = useState(1);
  const [cpuTemp, setCpuTemp] = useState(78);
  const [gpuTemp, setGpuTemp] = useState(56);
  const [uvIndex, setUvIndex] = useState(7.6);
  const [humidity, setHumidity] = useState(70);
  const [aqi, setAqi] = useState(52);

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

  // Subtle telemetry jitter for authentic live desktop feel
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setCpuUsage((prev) => Math.max(1, Math.min(100, Math.round(prev + (Math.random() - 0.5) * 4))));
      setCpuTemp((prev) => Math.max(45, Math.min(95, Math.round(prev + (Math.random() - 0.5) * 1.5))));
      setGpuTemp((prev) => Math.max(40, Math.min(85, Math.round(prev + (Math.random() - 0.5) * 1.2))));
    }, 3000);
    return () => clearInterval(telemetryInterval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 md:p-8 flex justify-between z-10 select-none overflow-hidden font-sans">
      {/* ================= LEFT COLUMN WIDGETS ================= */}
      <div className="flex flex-col justify-between max-w-[200px] sm:max-w-[230px] space-y-3 pointer-events-auto">
        <div className="space-y-3">
          {/* UV INDEX */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>UV INDEX</span>
            </div>
            <div className="flex items-center justify-between">
              <Sun className="w-5 h-5 opacity-80" style={{ color: theme.accent }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {uvIndex}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(uvIndex / 12) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.accent}, #e11d48)`,
                }}
              />
            </div>
          </div>

          {/* HUMIDITY */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>HUMIDITY</span>
            </div>
            <div className="flex items-center justify-between">
              <Droplets className="w-5 h-5 opacity-80" style={{ color: theme.accent }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {humidity}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${humidity}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
          </div>

          {/* AQI (Air Quality Index) */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>AQI</span>
            </div>
            <div className="flex items-center justify-between">
              <Leaf className="w-5 h-5 opacity-80" style={{ color: theme.accent }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {aqi}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(aqi / 150) * 100}%`,
                  backgroundColor: theme.accentSecondary,
                }}
              />
            </div>
          </div>
        </div>

        {/* WEATHER BOTTOM LEFT WIDGET */}
        <div
          className="p-4 sm:p-5 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border mt-4"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textColor,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter">30°</div>
              <div className="mt-2 text-xs font-semibold">Cloudy</div>
              <div className="text-[10px] opacity-70 mt-0.5">H 30° L 30°</div>
            </div>
            <Cloud className="w-8 h-8 mt-1" style={{ color: theme.accent }} />
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN WIDGETS ================= */}
      <div className="flex flex-col justify-between items-end max-w-[200px] sm:max-w-[240px] space-y-4 pointer-events-auto text-right">
        {/* BIG MINIMAL CLOCK (Top Right) */}
        <div className="mt-2 text-right">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none drop-shadow-md"
            style={{ color: theme.textColor }}
          >
            {time || "10:52"}
          </h1>
          <p className="text-xs sm:text-sm font-semibold opacity-80 mt-2 tracking-wide drop-shadow-sm">
            {date || "Sunday, 04 Oct 2026"}
          </p>
        </div>

        {/* SYSTEM HARDWARE METRIC CARDS (Bottom Right) */}
        <div className="space-y-3 w-full">
          {/* CPU TEMPERATURE */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border text-left"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>CPU TEMPERATURE</span>
            </div>
            <div className="flex items-center justify-between">
              <Thermometer className="w-5 h-5 opacity-80" style={{ color: theme.accent }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {cpuTemp}°C
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(cpuTemp / 100) * 100}%`,
                  background: `linear-gradient(90deg, ${theme.accent}, #ef4444)`,
                }}
              />
            </div>
          </div>

          {/* CPU USAGE */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border text-left"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>CPU USAGE</span>
            </div>
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 opacity-80" style={{ color: theme.accent }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {cpuUsage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cpuUsage}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
          </div>

          {/* GPU TEMPERATURE */}
          <div
            className="p-3.5 sm:p-4 rounded-3xl shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] border text-left"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textColor,
            }}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase flex items-center justify-between mb-2">
              <span>GPU TEMPERATURE</span>
            </div>
            <div className="flex items-center justify-between">
              <Thermometer className="w-5 h-5 opacity-80" style={{ color: theme.accentSecondary }} />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {gpuTemp}°C
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(gpuTemp / 100) * 100}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

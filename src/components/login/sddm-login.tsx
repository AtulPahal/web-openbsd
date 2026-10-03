"use client";

import { useState, useEffect } from "react";
import { User, ArrowRight, Power, RotateCcw, Unlock, Sparkles } from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";

interface SDDMLoginProps {
  onLogin: () => void;
}

export function SDDMLogin({ onLogin }: SDDMLoginProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setTimeout(() => {
      onLogin();
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUnlock();
    }
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleUnlock();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isUnlocking]);

  return (
    <div
      className={`min-h-[100dvh] h-full w-full bg-cover bg-center flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto transition-all duration-500 ease-out ${
        isUnlocking ? "scale-105 opacity-0 blur-sm pointer-events-none" : "scale-100 opacity-100 blur-0"
      }`}
      style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
      suppressHydrationWarning
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Top section: Clock */}
      <div className="flex flex-col items-center mt-6 sm:mt-12 md:mt-16 drop-shadow-lg" suppressHydrationWarning>
        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-white tracking-wider font-sans drop-shadow-md"
          suppressHydrationWarning
        >
          {mounted ? time : "--:--"}
        </h1>
        <p
          className="text-sm sm:text-lg md:text-xl text-white/90 mt-1 sm:mt-2 font-medium text-center drop-shadow"
          suppressHydrationWarning
        >
          {mounted ? date : ""}
        </p>
      </div>

      {/* Center section: Modern Glassmorphic Unlock Card */}
      <div className="flex flex-col items-center my-6 sm:my-10" suppressHydrationWarning>
        <div
          onClick={handleUnlock}
          className="group bg-black/40 hover:bg-black/50 backdrop-blur-2xl border border-white/20 hover:border-primary/60 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-[340px] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          suppressHydrationWarning
        >
          {/* Avatar Ring */}
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 group-hover:border-primary flex items-center justify-center mb-4 overflow-hidden shadow-xl transition-colors"
            suppressHydrationWarning
          >
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 group-hover:text-primary transition-colors" />
          </div>

          <h2 className="text-xl text-white font-bold mb-1 tracking-wide" suppressHydrationWarning>
            {SYSTEM_CONFIG.userFullName}
          </h2>
          <p className="text-xs text-white/70 font-mono mb-5" suppressHydrationWarning>
            {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.osVersion}
          </p>

          {/* Instant Unlock Button (No password required) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlock();
            }}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
            suppressHydrationWarning
          >
            <Unlock className="w-4 h-4" />
            <span>Click or Press Enter to Unlock</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom section: Power Controls & System Info */}
      <div
        className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center sm:items-end px-2 sm:px-4 pb-2 sm:pb-4"
        suppressHydrationWarning
      >
        <div className="text-white/70 text-xs sm:text-sm font-mono text-center sm:text-left drop-shadow">
          {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.desktopVersion} ({SYSTEM_CONFIG.architecture})
        </div>
        <div className="flex gap-2 sm:gap-4" suppressHydrationWarning>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs font-mono transition-all backdrop-blur-md shadow-sm"
            onClick={() => window.location.reload()}
            suppressHydrationWarning
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reboot</span>
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs font-mono transition-all backdrop-blur-md shadow-sm"
            onClick={() => window.close()}
            suppressHydrationWarning
          >
            <Power className="w-3.5 h-3.5" />
            <span>Shutdown</span>
          </button>
        </div>
      </div>
    </div>
  );
}

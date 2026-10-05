"use client";

import { useState, useEffect, useRef } from "react";
import { User, ArrowRight, Power, RotateCcw, Unlock, Sparkles, Shield, Fingerprint } from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { extractPywalFromImage, applyPywalTheme, getSavedPywalTheme } from "@/lib/pywal";
interface SDDMLoginProps {
  onLogin: () => void;
}

export function SDDMLogin({ onLogin }: SDDMLoginProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // 3D Parallax Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Apply pywal extracted theme from wallpaper so login screen immediately adopts it
    const initPywal = async () => {
      const saved = getSavedPywalTheme();
      if (saved) {
        applyPywalTheme(saved);
      } else {
        const pal = await extractPywalFromImage(SYSTEM_CONFIG.wallpaper);
        applyPywalTheme(pal);
      }
    };
    initPywal();

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  };

  const handleUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setTimeout(() => {
      onLogin();
    }, 450);
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
      className={`relative min-h-[100dvh] h-full w-full bg-cover bg-center flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isUnlocking
          ? "scale-110 opacity-0 blur-md pointer-events-none"
          : "scale-100 opacity-100 blur-0"
      }`}
      style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
      suppressHydrationWarning
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Ambient Floating 3D Glowing Orbs */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-sky-500/15 blur-[120px] pointer-events-none" />

      {/* Top section: Clock with Specular Glow */}
      <div className="relative z-10 flex flex-col items-center mt-6 sm:mt-12 md:mt-16 drop-shadow-2xl" suppressHydrationWarning>
        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-wider font-sans drop-shadow-2xl"
          suppressHydrationWarning
        >
          {mounted ? time : "--:--"}
        </h1>
        <p
          className="text-sm sm:text-lg md:text-xl text-white/90 mt-1 sm:mt-2 font-semibold text-center drop-shadow-md tracking-wide"
          suppressHydrationWarning
        >
          {mounted ? date : ""}
        </p>
      </div>

      {/* Center section: 3D Parallax Tilt Unlock Card */}
      <div className="relative z-10 flex flex-col items-center my-6 sm:my-10 perspective-[1000px]" suppressHydrationWarning>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleUnlock}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`,
            transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px var(--accent-glow, rgba(245, 158, 11, 0.2))`,
          }}
          className="group relative bg-black/45 hover:bg-black/55 backdrop-blur-3xl border border-white/20 hover:border-primary/80 p-7 sm:p-9 rounded-xl flex flex-col items-center w-full max-w-[350px] cursor-pointer overflow-hidden shadow-2xl"
          suppressHydrationWarning
        >
          {/* Specular Radial Shine Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
            style={{
              background: `radial-gradient(circle 220px at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.15), transparent 80%)`,
            }}
          />

          {/* Avatar Ring with 3D Depth */}
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border-2 border-white/30 group-hover:border-primary flex items-center justify-center mb-4 overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-105"
            suppressHydrationWarning
          >
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 group-hover:text-primary transition-colors" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 to-transparent pointer-events-none" />
          </div>

          <h2 className="text-xl text-white font-extrabold mb-1 tracking-wide" suppressHydrationWarning>
            {SYSTEM_CONFIG.userFullName}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-white/70 font-mono mb-6" suppressHydrationWarning>
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>{SYSTEM_CONFIG.name} {SYSTEM_CONFIG.osVersion} Pro</span>
          </div>

          {/* Instant Unlock Button with Pulse */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlock();
            }}
            className="w-full py-3.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold rounded-lg flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 cursor-pointer text-xs sm:text-sm tracking-wide group-hover:shadow-primary/30"
            suppressHydrationWarning
          >
            <Unlock className="w-4 h-4 animate-bounce" />
            <span>Press Enter to Unlock</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom section: Power Controls & System Info */}
      <div
        className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center sm:items-end px-2 sm:px-4 pb-2 sm:pb-4"
        suppressHydrationWarning
      >
        <div className="text-white/75 text-xs sm:text-sm font-mono text-center sm:text-left drop-shadow-md">
          {SYSTEM_CONFIG.name} {SYSTEM_CONFIG.desktopVersion} ({SYSTEM_CONFIG.architecture})
        </div>
        <div className="flex gap-2 sm:gap-4" suppressHydrationWarning>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer text-xs font-mono transition-all backdrop-blur-md shadow-md active:scale-95"
            onClick={() => window.location.reload()}
            suppressHydrationWarning
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reboot</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer text-xs font-mono transition-all backdrop-blur-md shadow-md active:scale-95"
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

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { Power, RotateCcw } from "lucide-react";

// Dynamically import desktop and login with ssr: false to prevent browser extensions from mutating SVGs during hydration
const Desktop = dynamic(
  () => import("@/components/desktop/desktop").then((m) => m.Desktop),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full min-h-[100dvh] w-full bg-cover bg-center flex items-center justify-center bg-[#0a0a0a]"
        style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
      />
    ),
  }
);

const SDDMLogin = dynamic(
  () => import("@/components/login/sddm-login").then((m) => m.SDDMLogin),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full min-h-[100dvh] w-full bg-cover bg-center flex items-center justify-center bg-[#0a0a0a]"
        style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
      />
    ),
  }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleLock = () => {
      setIsAuthenticated(false);
    };

    const handleShutdown = () => {
      setIsShutDown(true);
    };

    window.addEventListener("system-lock", handleLock);
    window.addEventListener("system-shutdown", handleShutdown);
    return () => {
      window.removeEventListener("system-lock", handleLock);
      window.removeEventListener("system-shutdown", handleShutdown);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-full min-h-[100dvh] w-full bg-cover bg-center bg-[#0a0a0a]"
        style={{ backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')` }}
        suppressHydrationWarning
      />
    );
  }

  // System Halted / Powered Down Screen
  if (isShutDown) {
    return (
      <div
        onClick={() => {
          setIsShutDown(false);
          setIsAuthenticated(false);
        }}
        className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white select-none p-6 font-mono cursor-pointer"
      >
        <div className="flex flex-col items-center max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Power className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white/90">
            System Safely Powered Down
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            The operating system has halted. All virtual filesystem buffers flushed to disk.
          </p>
          <div className="pt-4 flex items-center gap-2 text-xs text-primary animate-pulse">
            <RotateCcw className="w-4 h-4" />
            <span>Click anywhere or press any key to reboot</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SDDMLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Desktop
      onLock={() => setIsAuthenticated(false)}
      onShutdown={() => setIsShutDown(true)}
    />
  );
}

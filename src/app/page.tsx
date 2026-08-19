"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SYSTEM_CONFIG } from "@/lib/system-config";

// Dynamically import desktop and login with ssr: false to prevent browser extensions (DarkReader) from mutating SVGs during hydration
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

  useEffect(() => {
    setMounted(true);
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

  if (!isAuthenticated) {
    return <SDDMLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Desktop />;
}

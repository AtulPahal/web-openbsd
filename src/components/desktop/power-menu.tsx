"use client";

import { useEffect, useRef } from "react";
import { Power, Lock, RotateCw, LogOut } from "lucide-react";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface PowerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RiceTheme;
  onLock: () => void;
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
}

export function PowerMenu({
  isOpen,
  onClose,
  theme,
  onLock,
  onRestart,
  onShutdown,
  onSleep,
}: PowerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ================= 1. FROSTED DESKTOP BACKDROP BLUR OVERLAY ================= */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-md transition-all duration-200 animate-in fade-in-0 select-none"
      />

      {/* ================= 2. POWER MENU PANEL ATTACHED DIRECTLY UNDER TOPBAR ================= */}
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-full left-0 z-[80] w-56 sm:w-60 p-2.5 rounded-b-2xl rounded-t-none bg-[#0c121d]/90 backdrop-blur-3xl border-x border-b border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col space-y-1 text-white font-sans select-none animate-in slide-in-from-top-1 fade-in-0 duration-150"
      >
        {/* 1. Shutdown (Liquid Glass item; turns vibrant rose/pink ONLY on hover) */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onShutdown();
          }}
          className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-[#f472b6] text-white/95 hover:text-[#0c121d] font-semibold text-xs flex items-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer border border-white/5 hover:border-transparent group"
        >
          <Power className="w-4 h-4 text-rose-400 group-hover:text-[#0c121d] stroke-[2.5] transition-colors" />
          <span className="tracking-tight text-sm font-bold">Shutdown</span>
        </button>

        {/* 2. Lock */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onLock();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white transition-all cursor-pointer text-left"
        >
          <Lock className="w-4 h-4 text-white/70" />
          <span className="font-medium text-xs">Lock</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 3. Restart */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onRestart();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white transition-all cursor-pointer text-left"
        >
          <RotateCw className="w-4 h-4 text-white/70" />
          <span className="font-medium text-xs">Restart</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 4. Sleep */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onSleep();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white transition-all cursor-pointer text-left"
        >
          <div className="w-4 text-center font-mono font-bold leading-none select-none text-white/70">
            <span className="text-[11px]">z</span>
            <span className="text-[9px]">z</span>
            <span className="text-[8px]">z</span>
          </div>
          <span className="font-medium text-xs">Sleep</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 5. Logout */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onLock();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-white/70" />
          <span className="font-medium text-xs">Logout</span>
        </button>
      </div>
    </>
  );
}

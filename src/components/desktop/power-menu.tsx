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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const trigger = (e.target as HTMLElement).closest("[data-power-trigger]");
        if (!trigger) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible click-outside backdrop dismisser */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[75] select-none"
      />

      {/* Symmetrical Floating Liquid Glass Power Menu */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="Session and power options"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-11 sm:top-12 left-0 z-[80] w-56 sm:w-60 p-2.5 rounded-2xl dock-liquid-glass flex flex-col space-y-1 text-white font-sans select-none animate-in slide-in-from-top-2 fade-in-0 duration-150 shadow-2xl"
      >
        {/* 1. Shutdown (Liquid Glass item; turns vibrant rose/pink ONLY on hover) */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onShutdown();
          }}
          className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-[#f472b6] text-white/95 hover:text-[#0c121d] font-sans font-bold text-xs sm:text-sm flex items-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer border border-white/5 hover:border-transparent group shadow-sm"
        >
          <Power className="w-4 h-4 text-rose-400 group-hover:text-[#0c121d] stroke-[2.5] transition-colors shrink-0" />
          <span className="tracking-tight font-sans font-bold">Shutdown</span>
        </button>

        {/* 2. Lock */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onLock();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white font-sans font-medium transition-all cursor-pointer text-left"
        >
          <Lock className="w-4 h-4 text-white/70 shrink-0" />
          <span className="font-sans font-medium text-xs">Lock</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 3. Restart */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onRestart();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white font-sans font-medium transition-all cursor-pointer text-left"
        >
          <RotateCw className="w-4 h-4 text-white/70 shrink-0" />
          <span className="font-sans font-medium text-xs">Restart</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 4. Sleep */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onSleep();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white font-sans font-medium transition-all cursor-pointer text-left"
        >
          <div className="w-4 text-center font-mono font-bold leading-none select-none text-white/70 shrink-0">
            <span className="text-[11px]">z</span>
            <span className="text-[9px]">z</span>
            <span className="text-[8px]">z</span>
          </div>
          <span className="font-sans font-medium text-xs">Sleep</span>
        </button>
        <div className="h-px bg-white/10 my-0.5 mx-2" />

        {/* 5. Logout */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onLock();
          }}
          className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-3 text-xs text-white/85 hover:text-white font-sans font-medium transition-all cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-white/70 shrink-0" />
          <span className="font-sans font-medium text-xs">Logout</span>
        </button>
      </div>
    </>
  );
}

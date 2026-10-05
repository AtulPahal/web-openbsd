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
    <div
      ref={menuRef}
      className="absolute top-full left-0 z-[80] w-56 sm:w-60 p-2.5 rounded-b-2xl rounded-t-none bg-[#0c121d]/95 backdrop-blur-3xl border-x border-b border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col space-y-1.5 text-white font-sans select-none animate-in slide-in-from-top-1 fade-in-0 duration-150"
    >
      {/* 1. Shutdown (Solid Pastel Rose/Pink Pill Button) */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onShutdown();
        }}
        className="w-full p-3 rounded-lg bg-[#f472b6] hover:bg-[#ec4899] text-[#111827] font-semibold text-sm flex items-center gap-3.5 transition-transform active:scale-95 cursor-pointer shadow-md"
      >
        <Power className="w-4 h-4 stroke-[2.5]" />
        <span className="tracking-normal font-bold">Shutdown</span>
      </button>

      {/* 2. Lock */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onLock();
        }}
        className="w-full px-3 py-2.5 rounded-lg hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
      >
        <Lock className="w-4 h-4 text-white/80" />
        <span className="font-medium">Lock</span>
      </button>
      <div className="h-px bg-white/10 my-0.5 mx-2" />

      {/* 3. Restart */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onRestart();
        }}
        className="w-full px-3 py-2.5 rounded-lg hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
      >
        <RotateCw className="w-4 h-4 text-white/80" />
        <span className="font-medium">Restart</span>
      </button>
      <div className="h-px bg-white/10 my-0.5 mx-2" />

      {/* 4. Sleep (with staggered z z z) */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onSleep();
        }}
        className="w-full px-3 py-2.5 rounded-lg hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
      >
        <div className="w-4 text-center font-mono font-bold leading-none select-none text-white/80">
          <span className="text-[11px]">z</span>
          <span className="text-[9px]">z</span>
          <span className="text-[8px]">z</span>
        </div>
        <span className="font-medium">Sleep</span>
      </button>
      <div className="h-px bg-white/10 my-0.5 mx-2" />

      {/* 5. Logout */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onLock();
        }}
        className="w-full px-3 py-2.5 rounded-lg hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
      >
        <LogOut className="w-4 h-4 text-white/80" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}

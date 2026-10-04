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
      className="absolute top-9 left-0 z-[80] w-52 p-2 rounded-2xl bg-[#0f141c]/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.15)] flex flex-col space-y-1 text-white font-sans select-none animate-in slide-in-from-top-2 fade-in-0 duration-150"
    >
      {/* 1. Shutdown (Solid Pastel Rose/Pink Pill Button) */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onShutdown();
        }}
        className="w-full p-3 rounded-xl bg-[#f472b6] hover:bg-[#ec4899] text-[#111827] font-semibold text-sm flex items-center gap-3.5 transition-transform active:scale-95 cursor-pointer shadow-md"
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
        className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
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
        className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
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
        className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
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
        className="w-full px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3.5 text-sm text-white/95 hover:text-white transition-colors cursor-pointer text-left"
      >
        <LogOut className="w-4 h-4 text-white/80" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}

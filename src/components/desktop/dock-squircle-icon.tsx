"use client";

import type { AppId } from "@/types";

interface DockSquircleIconProps {
  appId: AppId;
}

export function DockSquircleIcon({ appId }: DockSquircleIconProps) {
  const dayOfMonth = new Date().getDate();

  switch (appId) {
    case "file-manager":
      // Finder: Two-tone Cyan/Blue smiling face
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#1ec8ff] via-[#0094f7] to-[#006bd6] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <svg viewBox="0 0 48 48" className="w-8 h-8 drop-shadow">
            {/* Split face line */}
            <path
              d="M24 6v22M17 18h14M15 32c2.5 3 6 4 9 4s6.5-1 9-4"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Eyes */}
            <circle cx="17" cy="18" r="2.2" fill="#ffffff" />
            <circle cx="31" cy="18" r="2.2" fill="#ffffff" />
          </svg>
        </div>
      );

    case "terminal":
      // Kitty: Dark squircle with cat ears and prompt
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#2b303c] via-[#1a1d24] to-[#0e1015] p-1.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
          {/* Cat ears */}
          <div className="flex gap-3 mb-0.5">
            <div className="w-2.5 h-2.5 bg-amber-400/90 rotate-45 rounded-xs" />
            <div className="w-2.5 h-2.5 bg-amber-400/90 rotate-45 rounded-xs" />
          </div>
          {/* Terminal prompt */}
          <div className="font-mono font-black text-xs text-emerald-400 tracking-tighter drop-shadow">
            &gt;_
          </div>
        </div>
      );

    case "firefox":
      // Firefox: Flame swirl
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-tr from-[#ff5e3a] via-[#ff2a6d] to-[#9b51e0] p-1 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md" fill="none">
            <circle cx="12" cy="12" r="7.5" fill="#2563eb" />
            <path
              d="M12 4.5c4 2 7 6 6 10s-5 6-8 5-6-4-5-8 4-7 7-7z"
              stroke="#fbbf24"
              strokeWidth="2.5"
              fill="#f97316"
              fillOpacity="0.85"
            />
            <circle cx="12" cy="12" r="3" fill="#ffffff" fillOpacity="0.9" />
          </svg>
        </div>
      );

    case "text-editor":
      // Obsidian: Faceted Purple Crystal
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#31204d] via-[#1e1430] to-[#0f0a18] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md">
            <path
              d="M12 2l7 5-3 12-8 3-4-8z"
              fill="url(#crystalGrad)"
              stroke="#c084fc"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M12 2v20M12 2l4 17M12 2l-8 7"
              stroke="#e9d5ff"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <defs>
              <linearGradient id="crystalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );

    case "system-monitor":
      // Activity Monitor: Concentric rings and pulse
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#242c38] via-[#151a22] to-[#0a0d12] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7">
            <circle cx="12" cy="12" r="9" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.4" />
            <circle cx="12" cy="12" r="6" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.7" />
            <circle cx="12" cy="12" r="3" fill="#38bdf8" />
          </svg>
        </div>
      );

    case "music":
      // Music: Magenta/Rose squircle with white note
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#fb7185] via-[#f43f5e] to-[#be123c] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow" fill="none">
            <path
              d="M9 18V5l11-2v13M9 18c0 1.6-1.3 3-3 3s-3-1.4-3-3 1.3-3 3-3c.7 0 1.4.2 1.9.6M20 16c0 1.6-1.3 3-3 3s-3-1.4-3-3 1.3-3 3-3c.7 0 1.4.2 1.9.6"
              fill="#ffffff"
            />
          </svg>
        </div>
      );

    case "video":
      // mpv: Indigo squircle with play triangle
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#6366f1] via-[#4338ca] to-[#312e81] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-inner pl-0.5">
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#4338ca]" />
          </div>
        </div>
      );

    case "portfolio":
      // Portfolio: Sunset user avatar
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-tr from-[#ec4899] via-[#f43f5e] to-[#f97316] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );

    case "resume":
      // Resume / PDF: Scarlet squircle with document
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#ef4444] via-[#dc2626] to-[#991b1b] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <div className="w-6 h-7 bg-white rounded-xs flex flex-col items-center justify-center p-0.5 shadow-sm">
            <span className="text-[8px] font-black text-[#dc2626] tracking-tight">CV</span>
            <div className="w-4 h-[1px] bg-slate-300 mt-0.5" />
            <div className="w-3 h-[1px] bg-slate-300 mt-0.5" />
          </div>
        </div>
      );

    case "calendar":
      // Apple Calendar: White squircle with red header and today's day number
      return (
        <div className="w-full h-full rounded-[13px] bg-white p-0 flex flex-col items-center justify-between relative overflow-hidden shadow-md border border-black/10">
          {/* Red header band */}
          <div className="w-full bg-[#ef4444] py-0.5 text-center text-white text-[7px] font-extrabold uppercase tracking-widest shrink-0">
            OCT
          </div>
          {/* Day number */}
          <div className="flex-1 flex items-center justify-center">
            <span className="font-sans font-bold text-lg text-[#1e293b] leading-none">
              {dayOfMonth}
            </span>
          </div>
        </div>
      );

    case "settings":
      // Settings: Metallic gear cog
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-[#9ca3af] via-[#6b7280] to-[#374151] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
      );

    case "ai-studio":
      // AI Studio: Glowing Brain / Neural
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-tr from-[#8b5cf6] via-[#6366f1] to-[#3b82f6] p-1.5 flex items-center justify-center relative overflow-hidden shadow-md border border-white/25">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />
          <svg viewBox="0 0 24 24" className="w-7 h-7 drop-shadow-md text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-full h-full rounded-[13px] bg-gradient-to-b from-slate-600 to-slate-800 p-1.5 flex items-center justify-center text-white border border-white/20">
          <span className="text-xs font-bold">App</span>
        </div>
      );
  }
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Mic,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { RiceTheme } from "@/lib/rice-theme-config";

interface MediaOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: RiceTheme;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number, muted?: boolean) => void;
}

const PLAYLIST = [
  {
    title: "Nu Nu Meta Phenomena",
    artist: "Machine Girl",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    duration: 202, // 3:22
  },
  {
    title: "Software engineer driven to insan...",
    artist: "Garrett Rose",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    duration: 1750, // 29:10
  },
  {
    title: "OpenBSD Puffy Wave",
    artist: "Atul Pahal",
    cover: "/wallpaper.jpg",
    duration: 180, // 3:00
  },
];

export function MediaOverlay({
  isOpen,
  onClose,
  theme,
  volume,
  isMuted,
  onVolumeChange,
}: MediaOverlayProps) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(10); // starts at 0:10 as in screenshot
  const [micLevel, setMicLevel] = useState(100);

  const currentTrack = PLAYLIST[trackIndex];
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Simulated playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= currentTrack.duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  if (!isOpen) return null;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleNext = () => {
    setTrackIndex((i) => (i + 1) % PLAYLIST.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setTrackIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  // Soundwave waveform bar heights matching Image #2
  const WAVEFORM_BARS = [
    30, 45, 75, 45, 30, 60, 95, 60, 40, 30, 60, 100, 75, 50, 40, 65, 85, 45, 25, 40,
    55, 70, 40, 85, 95, 60, 45, 75, 35, 50
  ];

  return (
    <>
      {/* ================= 1. FULL BACKGROUND BLUR OVERLAY ================= */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[65] bg-black/45 backdrop-blur-2xl transition-all duration-300 animate-in fade-in-0 select-none"
      />

      {/* ================= 2. REDESIGNED MUSIC SECTION (Exact match to Image #2) ================= */}
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="fixed top-10 left-1/2 -translate-x-1/2 z-[70] w-[95vw] max-w-4xl p-3 sm:p-4 bg-[#0a0e1a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1.5px_0_rgba(255,255,255,0.25)] flex flex-col md:flex-row items-stretch gap-3 select-none text-white font-sans animate-in slide-in-from-top-3 fade-in-0 duration-200"
      >
        {/* ================= LEFT MODULE: DUAL VERTICAL SLIDERS ================= */}
        <div className="p-3.5 bg-[#101625]/90 rounded-xl border border-white/5 flex flex-col justify-between items-center w-full md:w-32 shrink-0 shadow-inner">
          {/* Top Icons */}
          <div className="flex items-center justify-around w-full text-white/70 mb-2">
            <Volume2 className="w-4 h-4" />
            <Mic className="w-4 h-4" />
          </div>

          {/* Dual Sliders Side by Side */}
          <div className="flex items-center justify-around w-full h-36 py-1">
            {/* Speaker Volume Slider */}
            <div className="relative w-6 h-36 bg-[#1a2233] rounded-full overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
              <div
                className="w-full rounded-full transition-all duration-100 bg-[#8da5ff] relative"
                style={{ height: `${isMuted ? 0 : volume}%` }}
              >
                {/* White pill handle at top of fill */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3 rounded-full bg-white shadow-sm" />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value), false)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title={`Volume: ${volume}%`}
              />
            </div>

            {/* Microphone Level Slider */}
            <div className="relative w-6 h-36 bg-[#1a2233] rounded-full overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
              <div
                className="w-full rounded-full transition-all duration-100 bg-[#8da5ff] relative"
                style={{ height: `${micLevel}%` }}
              >
                {/* White pill handle at top of fill */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3 rounded-full bg-white shadow-sm" />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={micLevel}
                onChange={(e) => setMicLevel(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title={`Mic: ${micLevel}%`}
              />
            </div>
          </div>

          {/* Bottom Percentage Readouts */}
          <div className="flex items-center justify-around w-full font-mono font-bold text-xs text-white/90 mt-2">
            <span>{isMuted ? "0%" : `${volume}%`}</span>
            <span>{micLevel}%</span>
          </div>
        </div>

        {/* ================= RIGHT MODULE: ALBUM ART, WAVEFORM & CONTROLS ================= */}
        <div className="p-3.5 sm:p-4 bg-[#101625]/90 rounded-xl border border-white/5 flex items-center gap-3 sm:gap-4 flex-1 min-w-0 relative shadow-inner">
          {/* Left Arrow Vertical Pill (Image #2) */}
          <button
            type="button"
            onClick={handlePrev}
            className="h-32 sm:h-36 w-6 sm:w-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
            title="Previous Track"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Album Cover Art */}
          <div
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-cover bg-center shadow-xl border border-white/10 shrink-0 overflow-hidden"
            style={{ backgroundImage: `url('${currentTrack.cover}')` }}
          />

          {/* Song Info, Waveform & Controls */}
          <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2 py-0.5">
            {/* Title & Artist */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {currentTrack.title}
              </h2>
              <p className="text-xs text-[#8da5ff] font-medium mt-0.5 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Dynamic Soundwave Waveform Visualizer (Exact match to Image #2) */}
            <div className="flex items-end gap-1 h-9 sm:h-11 w-full py-1">
              {WAVEFORM_BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-200 bg-[#8da5ff]"
                  style={{
                    height: isPlaying
                      ? `${Math.max(15, (h * ((progress + i) % 7 + 4)) / 10)}%`
                      : `${h * 0.3}%`,
                    opacity: 0.9,
                  }}
                />
              ))}
            </div>

            {/* Progress Seek Bar */}
            <div className="space-y-1">
              <div className="relative w-full h-1.5 bg-[#1a2233] rounded-full overflow-hidden flex items-center">
                <div
                  className="h-full rounded-full transition-all duration-200 bg-[#8da5ff]"
                  style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-white/70">
                <span>{formatSecs(progress)}</span>
                <span>{formatSecs(currentTrack.duration)}</span>
              </div>
            </div>

            {/* Transport Playback Controls */}
            <div className="flex items-center justify-center gap-5 pt-1">
              <button
                type="button"
                onClick={handlePrev}
                className="text-white/80 hover:text-white transition-colors cursor-pointer active:scale-90"
                title="Previous"
              >
                <SkipBack className="w-4 h-4 fill-white/80" />
              </button>

              {/* Periwinkle Squircle Play/Pause Button (Exact match to Image #2) */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-10 rounded-xl bg-[#8da5ff] hover:bg-[#7b96ff] text-[#0a0e1a] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="text-white/80 hover:text-white transition-colors cursor-pointer active:scale-90"
                title="Next"
              >
                <SkipForward className="w-4 h-4 fill-white/80" />
              </button>
            </div>
          </div>

          {/* Right Arrow Vertical Pill (Image #2) */}
          <button
            type="button"
            onClick={handleNext}
            className="h-32 sm:h-36 w-6 sm:w-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
            title="Next Track"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

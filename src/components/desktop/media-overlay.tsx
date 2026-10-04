"use client";

import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Mic,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  X,
  Music,
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
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
    duration: 202, // 3:22
  },
  {
    title: "Software engineer driven to insan...",
    artist: "Garrett Rose",
    cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
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
  const [progress, setProgress] = useState(10);
  const [micLevel, setMicLevel] = useState(100);

  const currentTrack = PLAYLIST[trackIndex];
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const trigger = (e.target as HTMLElement).closest("[data-media-trigger]");
        if (!trigger) onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  return (
    <div
      ref={containerRef}
      className="fixed top-9 left-1/2 -translate-x-1/2 z-[70] flex items-center p-3 sm:p-4 rounded-3xl shadow-2xl border backdrop-blur-3xl animate-in slide-in-from-top-3 fade-in-0 duration-200 select-none max-w-[94vw] sm:max-w-2xl"
      style={{
        backgroundColor: theme.mode === "dark" ? "rgba(10, 15, 30, 0.92)" : "rgba(255, 255, 255, 0.92)",
        borderColor: theme.cardBorder,
        color: theme.textColor,
      }}
    >
      {/* ================= LEFT: DUAL VERTICAL SLIDERS ================= */}
      <div className="flex items-center gap-3 pr-4 border-r border-black/10 dark:border-white/10 shrink-0">
        {/* Speaker Volume Slider */}
        <div className="flex flex-col items-center gap-1.5 h-36 justify-between">
          <Volume2 className="w-4 h-4 opacity-70" />
          <div className="relative w-4 h-24 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
            <div
              className="w-full rounded-full transition-all duration-100"
              style={{
                height: `${isMuted ? 0 : volume}%`,
                backgroundColor: theme.accent,
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value), false)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums opacity-80">
            {isMuted ? "0%" : `${volume}%`}
          </span>
        </div>

        {/* Microphone Level Slider */}
        <div className="flex flex-col items-center gap-1.5 h-36 justify-between">
          <Mic className="w-4 h-4 opacity-70" />
          <div className="relative w-4 h-24 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
            <div
              className="w-full rounded-full transition-all duration-100"
              style={{
                height: `${micLevel}%`,
                backgroundColor: theme.accentSecondary,
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={micLevel}
              onChange={(e) => setMicLevel(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums opacity-80">
            {micLevel}%
          </span>
        </div>
      </div>

      {/* ================= CENTER & RIGHT: TRACK PLAYER ================= */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 pl-4 min-w-0">
        {/* Album Cover Art */}
        <div
          className="w-24 h-24 rounded-2xl bg-cover bg-center shadow-lg shrink-0 border border-black/10 dark:border-white/10 overflow-hidden"
          style={{ backgroundImage: `url('${currentTrack.cover}')` }}
        />

        <div className="flex-1 min-w-0 w-full flex flex-col justify-between space-y-2">
          {/* Track Info */}
          <div>
            <h3 className="font-bold text-sm truncate tracking-tight">{currentTrack.title}</h3>
            <p className="text-xs opacity-70 truncate font-medium">{currentTrack.artist}</p>
          </div>

          {/* Animated Audio Waveform Visualizer Bars */}
          <div className="flex items-end gap-1 h-8 w-full py-1">
            {[45, 75, 30, 90, 60, 100, 40, 85, 55, 95, 35, 70, 50, 80, 65, 40, 90, 75, 35, 60].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (progress % 5 + 3)) / 7)}%` : "20%",
                    backgroundColor: theme.accent,
                    opacity: 0.85,
                  }}
                />
              )
            )}
          </div>

          {/* Progress Timeline */}
          <div className="space-y-1">
            <div className="relative w-full h-1.5 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${(progress / currentTrack.duration) * 100}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] opacity-70 font-mono">
              <span>{formatSecs(progress)}</span>
              <span>{formatSecs(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full text-white shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: theme.accent }}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

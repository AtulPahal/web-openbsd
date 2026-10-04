"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Check, Sparkles } from "lucide-react";
import { RICE_THEMES, type RiceTheme } from "@/lib/rice-theme-config";

interface WallpaperCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: RiceTheme;
  onSelectTheme: (theme: RiceTheme) => void;
}

export function WallpaperCarousel({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}: WallpaperCarouselProps) {
  const themesList = Object.values(RICE_THEMES);
  const initialIndex = themesList.findIndex((t) => t.id === currentTheme.id);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    const idx = themesList.findIndex((t) => t.id === currentTheme.id);
    if (idx >= 0) setActiveIndex(idx);
  }, [currentTheme.id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + themesList.length) % themesList.length);
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % themesList.length);
      }
      if (e.key === "Enter") {
        onSelectTheme(themesList[activeIndex]);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, onClose, onSelectTheme]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-2xl flex flex-col items-center justify-center p-4 select-none animate-in fade-in-0 duration-200"
    >
      {/* Top Banner */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between px-4 py-3 mb-6 border-b border-white/10"
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Select Desktop Wallpaper & Theme</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3D Coverflow Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-72 sm:h-96 flex items-center justify-center perspective-[1200px] overflow-visible"
      >
        {themesList.map((theme, idx) => {
          const offset = idx - activeIndex;
          const isCenter = offset === 0;

          // Limit rendering range to -2 to +2 for clean carousel optics
          if (Math.abs(offset) > 2) return null;

          const translateX = offset * 220; // px
          const translateZ = isCenter ? 80 : -140;
          const rotateY = isCenter ? 0 : offset < 0 ? 35 : -35;
          const opacity = isCenter ? 1 : 0.6;
          const scale = isCenter ? 1.05 : 0.85;

          return (
            <div
              key={theme.id}
              onClick={() => {
                if (isCenter) {
                  onSelectTheme(theme);
                  onClose();
                } else {
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex: isCenter ? 30 : 20 - Math.abs(offset),
                opacity,
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className={`absolute w-64 sm:w-80 h-44 sm:h-56 rounded-xl overflow-hidden cursor-pointer shadow-2xl border-2 transition-all group ${
                isCenter ? "border-primary ring-4 ring-primary/40" : "border-white/20 hover:opacity-90"
              }`}
            >
              {/* Wallpaper Thumbnail (Fast lightweight thumb) */}
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${theme.thumb || theme.wallpaper}')` }}
              />

              {/* Title & Theme Label Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white">
                <div>
                  <div className="font-bold text-xs">{theme.name}</div>
                  <div className="text-[10px] opacity-80 capitalize">{theme.mode} Mode</div>
                </div>
                {theme.id === currentTheme.id && (
                  <span className="p-1 rounded-full bg-primary text-black">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-4 mt-8"
      >
        <button
          type="button"
          onClick={() => setActiveIndex((i) => (i - 1 + themesList.length) % themesList.length)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            onSelectTheme(themesList[activeIndex]);
            onClose();
          }}
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs tracking-wide shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          Apply {themesList[activeIndex].name}
        </button>

        <button
          type="button"
          onClick={() => setActiveIndex((i) => (i + 1) % themesList.length)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
          title="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

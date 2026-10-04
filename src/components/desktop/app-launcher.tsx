"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Search,
  X,
  Sparkles,
  Command,
} from "lucide-react";
import type { AppId, AppCategory } from "@/types";
import { APP_REGISTRY, APP_CATEGORIES } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";
import { SYSTEM_CONFIG } from "@/lib/system-config";

interface AppLauncherProps {
  onOpenApp: (appId: AppId) => void;
}

export function AppLauncher({ onOpenApp }: AppLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AppCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const appList = Object.values(APP_REGISTRY);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setActiveCategory("All");
    }
  }, [isOpen]);

  const filteredApps = useMemo(() => {
    return appList.filter((app) => {
      const matchesCategory =
        activeCategory === "All" || app.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [appList, activeCategory, searchQuery]);

  return (
    <>
      {/* Top Menu Bar Trigger (App Store 'A' Icon + Applications) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-all cursor-pointer font-sans"
        title="Open Applications Manager (Launchpad)"
      >
        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] italic">
          A
        </span>
        <span className="font-semibold text-xs hidden sm:inline">Applications</span>
      </button>

      {/* ================= macOS Sequoia App Library Overlay Modal ================= */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in-0 duration-150"
        >
          {/* Main Glassmorphic Container (matching screenshot) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] bg-[#1e1e24]/85 dark:bg-[#121217]/90 backdrop-blur-3xl border border-white/20 rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.25)] flex flex-col overflow-hidden text-white font-sans animate-in zoom-in-95 duration-200"
          >
            {/* 1. Header (A Applications with live search) */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* App Store 'A' Logo */}
                <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-white font-serif font-bold italic text-base shrink-0 shadow-sm">
                  A
                </div>

                {/* Input with Caret |Applications */}
                <div className="flex-1 flex items-center min-w-0 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Applications"
                    className="w-full bg-transparent border-none outline-none font-bold text-lg text-white placeholder-white/90 tracking-tight caret-primary"
                    spellCheck={false}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:text-white/60 text-white/40 transition-colors cursor-pointer mr-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Action Menu (...) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Category Filter Pills Bar */}
            <div className="flex items-center gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none border-b border-white/5 shrink-0">
              {APP_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/25 text-white font-semibold shadow-sm border border-white/30"
                        : "bg-white/10 hover:bg-white/15 text-white/75 hover:text-white border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* 3. App Squircles Grid (matching macOS Launchpad) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-thin">
              {filteredApps.length === 0 ? (
                <div className="py-16 text-center text-white/50 text-xs">
                  No applications found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-y-6 gap-x-4 sm:gap-x-6 justify-items-center">
                  {filteredApps.map((app) => {
                    const IconComponent =
                      APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          onOpenApp(app.id);
                          setIsOpen(false);
                        }}
                        className="group flex flex-col items-center gap-2 w-16 sm:w-20 cursor-pointer focus:outline-none transition-transform active:scale-95"
                      >
                        {/* macOS Squircle Icon */}
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-tr ${app.gradient || "from-blue-500 to-indigo-600"} flex items-center justify-center text-white shadow-xl shadow-black/40 border border-white/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-white/40`}
                        >
                          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-md" />
                        </div>

                        {/* App Label */}
                        <span className="text-[11px] sm:text-xs font-medium text-white/90 text-center truncate w-full group-hover:text-white transition-colors">
                          {app.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

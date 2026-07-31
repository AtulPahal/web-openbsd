"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const PLAYLIST = [
  { title: "OpenBSD Song 7.5", artist: "Puffy and the Developers", duration: 214 },
  { title: "Code Compilation Chill", artist: "Lofi Unix", duration: 185 },
  { title: "Kernel Panic", artist: "The Core Dumps", duration: 240 },
  { title: "Terminal Beats", artist: "Ksh Grooves", duration: 156 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicApp({ windowId }: { windowId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            setCurrentTrackIndex((i) => (i + 1) % PLAYLIST.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((i) => (i + 1) % PLAYLIST.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-foreground font-sans select-none">
      {/* Top Bar / Now Playing */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/20">
        <div className="w-16 h-16 bg-amber-500/20 rounded flex items-center justify-center border border-amber-500/30 shadow-inner">
          <ListMusic className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white truncate">{currentTrack.title}</h2>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(progress / currentTrack.duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        <Button variant="ghost" size="icon" onClick={prevTrack} className="hover:bg-white/10 rounded-full w-10 h-10">
          <SkipBack className="w-5 h-5 text-white/80" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={togglePlay} 
          className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-full w-12 h-12"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={nextTrack} className="hover:bg-white/10 rounded-full w-10 h-10">
          <SkipForward className="w-5 h-5 text-white/80" />
        </Button>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-hidden mt-2 border-t border-white/5 bg-black/40">
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {PLAYLIST.map((track, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setCurrentTrackIndex(idx);
                setProgress(0);
                setIsPlaying(true);
              }}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs transition-colors ${idx === currentTrackIndex ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500' : 'text-white/70 hover:bg-white/5 border-l-2 border-transparent'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className="w-4 text-right font-mono text-[10px] text-white/30">{idx + 1}</span>
                <div className="truncate">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-[10px] text-white/40 truncate">{track.artist}</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-white/40">{formatTime(track.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

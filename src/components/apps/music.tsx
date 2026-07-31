"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Music as MusicIcon, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VirtualFS } from "@/features/virtual-fs";

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicApp({ windowId, path }: { windowId: string; path?: string }) {
  const fsRef = useRef(new VirtualFS());
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Default to a known file if no path is provided
  const targetPath = path || "/home/user/Music/SoundHelix_Song_1.mp3";
  
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [title, setTitle] = useState("Unknown Song");

  useEffect(() => {
    // Load audio from Virtual FS
    const fileNode = fsRef.current.getNode(targetPath);
    if (fileNode && fileNode.type === "file" && fileNode.content) {
      setAudioUrl(fileNode.content);
      setTitle(fileNode.name.replace(/_/g, " ").replace(".mp3", ""));
    }
  }, [targetPath]);

  // Handle auto-play when URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      if (vol > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-neutral-800 to-black text-foreground font-sans select-none overflow-hidden">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Album Art (Apple Music Style) */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 rounded-3xl shadow-2xl flex items-center justify-center border border-white/5 mb-8 overflow-hidden backdrop-blur-xl transition-transform duration-500 ease-out hover:scale-105">
          <MusicIcon className="w-20 h-20 text-white/40 drop-shadow-lg" />
        </div>

        {/* Track Info */}
        <div className="text-center mb-8 w-full px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate drop-shadow-md">{title}</h2>
          <p className="text-sm text-white/60 font-medium truncate mt-1">OpenBSD Audio Player</p>
        </div>

        {/* Scrubber */}
        <div className="w-full max-w-sm px-4 mb-8">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none outline-none accent-white/90 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-medium text-white/50 mt-2 font-mono tracking-wider">
            <span>{formatTime(progress)}</span>
            <span>-{formatTime(duration - progress)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full w-12 h-12">
            <SkipBack className="w-6 h-6 text-white/90 fill-current" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePlay} 
            className="border-none bg-white/10 hover:bg-white/20 hover:scale-105 transition-all text-white rounded-full w-16 h-16 shadow-lg backdrop-blur-sm"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full w-12 h-12">
            <SkipForward className="w-6 h-6 text-white/90 fill-current" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-full max-w-xs px-8 mt-2 opacity-60 hover:opacity-100 transition-opacity">
          <button onClick={toggleMute} className="text-white/80 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none outline-none accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

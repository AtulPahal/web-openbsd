"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Film } from "lucide-react";
import { VirtualFS } from "@/features/virtual-fs";

export function VideoApp({ windowId, path }: { windowId: string; path?: string }) {
  const fsRef = useRef(new VirtualFS());
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [title, setTitle] = useState("mpv");

  useEffect(() => {
    if (path) {
      const fileNode = fsRef.current.getNode(path);
      if (fileNode && fileNode.type === "file" && fileNode.content) {
        setVideoUrl(fileNode.content);
        setTitle(`mpv - ${fileNode.name}`);
      }
    } else {
      setVideoUrl("");
      setTitle("mpv");
    }
  }, [path]);

  // Handle auto-play when URL changes
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    }
  }, [videoUrl]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, []);

  function formatTime(seconds: number) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // If no video URL is loaded, show a blank screen like real mpv
  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-[#1a1b26] flex flex-col items-center justify-center text-white/30 select-none font-mono">
        <Film className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-xl font-bold tracking-widest opacity-80">mpv</p>
        <p className="text-xs mt-2 opacity-50">Drop files or URLs to play</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* On-Screen Controller (OSC) mimicking mpv */}
      <div 
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-black/60 backdrop-blur-md border border-white/10 rounded-sm p-2 transition-opacity duration-300 flex items-center gap-3 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={togglePlay} 
          className="text-white hover:text-amber-400 transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        <span className="text-white text-[10px] font-mono shrink-0">
          {formatTime(progress)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1 bg-white/20 rounded-full appearance-none outline-none accent-amber-500 cursor-pointer"
        />

        <span className="text-white text-[10px] font-mono shrink-0">
          {formatTime(duration)}
        </span>

        <button 
          onClick={toggleMute} 
          className="text-white hover:text-amber-400 transition-colors shrink-0 ml-1"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Top Title Bar Overlay */}
      <div className={`absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-white text-xs font-mono font-semibold truncate drop-shadow-md px-1">
          {title}
        </h1>
      </div>
    </div>
  );
}

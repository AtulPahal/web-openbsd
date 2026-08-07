"use client";

import { useState, useRef, useEffect } from "react";
import { MEDIA_CONFIG } from "@/lib/media-config";
import { VirtualFS } from "@/features/virtual-fs";

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoApp({ windowId, path }: { windowId: string; path?: string }) {
  const fsRef = useRef(new VirtualFS());
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isYoutube, setIsYoutube] = useState(false);
  const [ytId, setYtId] = useState("");
  const [title, setTitle] = useState("mpv");
  const [isDragging, setIsDragging] = useState(false);

  const checkYoutube = (url: string) => {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      setIsYoutube(true);
      setYtId(ytMatch[1]);
    } else {
      setIsYoutube(false);
      setYtId("");
    }
  };

  useEffect(() => {
    if (path) {
      const fileNode = fsRef.current.getNode(path);
      if (fileNode && fileNode.type === "file" && fileNode.content) {
        setVideoUrl(fileNode.content);
        checkYoutube(fileNode.content);
        setTitle(`mpv - ${fileNode.name}`);
      }
    } else {
      setVideoUrl("");
      setIsYoutube(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsYoutube(false);
      setTitle(`mpv - ${file.name}`);
    } else {
      const text = e.dataTransfer.getData("text");
      if (text) {
        setVideoUrl(text);
        checkYoutube(text);
        setTitle("mpv - URL Stream");
      }
    }
  };

  // If no video URL is loaded, show a blank screen like real mpv
  if (!videoUrl) {
    return (
      <div
        className="w-full h-full bg-background text-foreground font-mono flex flex-col items-center justify-center select-none transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-4xl font-bold text-amber-400 tracking-widest">mpv</p>
        <p className="text-xs text-muted-foreground mt-2">
          {isDragging ? "Drop to play!" : "Drop files or URLs to play"}
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none group ${isDragging ? 'border-2 border-dashed border-amber-500/50 opacity-80' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
        handleDragLeave();
      }}
      onClick={!isYoutube ? togglePlay : undefined}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isYoutube ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
          className="w-full h-full border-none pointer-events-auto"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* On-Screen Controller (OSC) mimicking mpv */}
      {!isYoutube && (
        <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-background/90 border border-border rounded-none p-2 transition-opacity duration-300 flex items-center gap-3 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="px-2 py-1 text-sm border border-border text-foreground hover:text-amber-400 disabled:opacity-40"
        >
          <span className="nf text-lg" aria-hidden="true">{isPlaying ? MEDIA_CONFIG.glyphs.pause : MEDIA_CONFIG.glyphs.play}</span>
        </button>

        <span className="font-mono text-sm text-muted-foreground shrink-0">
          {formatTime(progress)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1 accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:rounded-none cursor-pointer"
        />

        <span className="font-mono text-sm text-muted-foreground shrink-0">
          {formatTime(duration)}
        </span>

        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="px-2 py-1 text-sm border border-border text-foreground hover:text-amber-400 disabled:opacity-40"
        >
          <span className="nf text-base" aria-hidden="true">{isMuted ? MEDIA_CONFIG.glyphs.mute : MEDIA_CONFIG.glyphs.volume}</span>
        </button>
        </div>
      )}

      {/* Top Title Bar Overlay */}
      <div className={`absolute top-0 left-0 right-0 p-2 bg-background/90 border-b border-border rounded-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-foreground text-xs font-mono font-semibold truncate px-1">
          {title}
        </h1>
      </div>
    </div>
  );
}
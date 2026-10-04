"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clapperboard,
  Film,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { VirtualFS } from "@/features/virtual-fs";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
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
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
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
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
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
    }, 2500);
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

  // If no video URL is loaded, show a clean modern mpv player placeholder
  if (!videoUrl) {
    return (
      <div
        className="w-full h-full bg-background text-foreground font-mono flex flex-col items-center justify-center select-none p-6 transition-colors"
        data-window-id={windowId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
          <Clapperboard className="w-8 h-8" />
        </div>
        <p className="text-3xl font-bold text-primary tracking-wider">mpv</p>
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
          {isDragging
            ? "Drop video file to start playback!"
            : "Drop video files (.mp4, .webm) or open videos from File Manager to play"}
        </p>

        {/* Demo Video Load Button */}
        <button
          type="button"
          onClick={() => {
            setVideoUrl("/bad_apple.mp4");
            setIsYoutube(false);
            setTitle("mpv - bad_apple.mp4");
          }}
          className="mt-5 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Film className="w-4 h-4" />
          <span>Play Sample Video (bad_apple.mp4)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none group ${
        isDragging ? "border-2 border-dashed border-primary/50 opacity-80" : ""
      }`}
      data-window-id={windowId}
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

      {/* On-Screen Controller (OSC) with Vector Lucide Icons */}
      {!isYoutube && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-2.5 transition-opacity duration-300 flex items-center gap-3 shadow-2xl ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            className="p-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-primary" />}
          </button>

          {/* Current Elapsed Time */}
          <span className="font-mono text-xs text-foreground/80 shrink-0 tabular-nums">
            {formatTime(progress)}
          </span>

          {/* Seek Progress Bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            style={{ accentColor: "var(--primary)" }}
            className="flex-1 h-1.5 cursor-pointer bg-muted rounded"
          />

          {/* Total Duration */}
          <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
            {formatTime(duration)}
          </span>

          {/* Mute/Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            className="p-1.5 text-foreground/80 hover:text-primary hover:bg-muted/60 rounded transition-colors cursor-pointer shrink-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      )}

      {/* Top Title Bar Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-2.5 bg-card/85 backdrop-blur-md border-b border-border/80 transition-opacity duration-300 flex items-center justify-between shadow-md ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-foreground text-xs font-mono font-semibold truncate px-1 flex items-center gap-2">
          <Clapperboard className="w-3.5 h-3.5 text-primary" />
          <span>{title}</span>
        </h1>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MEDIA_CONFIG } from "@/lib/media-config";
import { VirtualFS } from "@/features/virtual-fs";
import type { FSNode } from "@/types";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicApp({ windowId, path }: { windowId: string; path?: string }) {
  const fsRef = useRef(new VirtualFS());
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playlist, setPlaylist] = useState<FSNode[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [title, setTitle] = useState("");
  const [currentTrackPath, setCurrentTrackPath] = useState<string>("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  const targetPath = path || "";

  // Listen for global master volume changes from Top Bar System Tray & Control Center
  useEffect(() => {
    const handleMasterVolume = (e: Event) => {
      const customEvent = e as CustomEvent<{ volume: number; isMuted: boolean; level: number }>;
      const newVol = customEvent.detail.volume;
      const muted = customEvent.detail.isMuted;
      setVolume(customEvent.detail.level / 100);
      setIsMuted(muted);
      if (audioRef.current) {
        audioRef.current.volume = muted ? 0 : newVol;
      }
    };

    window.addEventListener("master-volume-change", handleMasterVolume);
    return () => {
      window.removeEventListener("master-volume-change", handleMasterVolume);
    };
  }, []);

  // Build the local music library from the virtual filesystem (once).
  useEffect(() => {
    const musicFolder = fsRef.current.getNode(MEDIA_CONFIG.musicDirectory);
    if (musicFolder && musicFolder.type === "directory" && musicFolder.children) {
      const files = musicFolder.children.filter((node) =>
        node.name.endsWith(MEDIA_CONFIG.musicExtension)
      );
      setPlaylist(files);

      // Preload audio duration metadata for tracklist
      files.forEach((file) => {
        if (file.content) {
          const tempAudio = new Audio(file.content);
          tempAudio.onloadedmetadata = () => {
            setDurations((prev) => ({
              ...prev,
              [file.path]: tempAudio.duration,
            }));
          };
        }
      });

      if (!path && files.length > 0) {
        loadTrack(files[0]);
      }
    }
  }, [path]);

  // When a path prop is supplied (open a file from the desktop), load it.
  useEffect(() => {
    if (targetPath) {
      const fileNode = fsRef.current.getNode(targetPath);
      if (fileNode && fileNode.type === "file" && fileNode.content) {
        loadTrack(fileNode);
      }
    }
  }, [targetPath]);

  // Auto-play when a new source is loaded.
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setProgress(nextTime);
    if (audioRef.current) audioRef.current.currentTime = nextTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : val;

    // Dispatch to system tray to keep top bar volume slider in sync!
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("master-volume-change", {
          detail: { volume: val, isMuted: false, level: Math.round(val * 100) },
        })
      );
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) audioRef.current.volume = nextMute ? 0 : volume;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("master-volume-change", {
          detail: { volume: nextMute ? 0 : volume, isMuted: nextMute, level: Math.round(volume * 100) },
        })
      );
    }
  };

  const loadTrack = (node: FSNode) => {
    if (!node.content) return;
    setAudioUrl(node.content);
    setTitle(node.name.replace(/\.[^/.]+$/, ""));
    setCurrentTrackPath(node.path);
  };

  const currentIndex = playlist.findIndex((n) => n.path === currentTrackPath);

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    loadTrack(playlist[nextIdx]);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(playlist[prevIdx]);
  };

  const currentTime = formatTime(progress);
  const remaining = formatTime(Math.max(0, (duration || 0) - progress));

  return (
    <div
      className="flex flex-col h-full bg-background text-foreground font-mono select-none"
      data-window-id={windowId}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
      />

      {/* Header / Now Playing Banner */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-xs bg-card/40">
        <Music className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-amber-400 font-bold">Now Playing:</span>
        <span className="text-foreground truncate font-semibold">
          {title || "No track loaded"}
        </span>
      </div>

      {/* Tracklist Library */}
      <div className="flex-1 overflow-y-auto p-4">
        {playlist.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No audio files found in {MEDIA_CONFIG.musicDirectory}
          </p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border/60 uppercase text-[10px]">
                <th className="pb-2 font-bold">Track</th>
                <th className="pb-2 font-bold">Duration</th>
                <th className="pb-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((node) => {
                const isCurrent = node.path === currentTrackPath;
                const isPlayingThis = isCurrent && isPlaying;
                return (
                  <tr
                    key={node.path}
                    onClick={() => loadTrack(node)}
                    className={`cursor-pointer border-b border-border/30 last:border-0 hover:bg-amber-500/10 transition-colors ${
                      isCurrent ? "bg-amber-500/15" : ""
                    }`}
                  >
                    <td className={`py-2 px-1 font-semibold ${isCurrent ? "text-amber-400" : "text-foreground"}`}>
                      {node.name}
                    </td>
                    <td className="py-2 px-1 text-muted-foreground">
                      {durations[node.path] ? formatTime(durations[node.path]) : "—"}
                    </td>
                    <td className="py-2 px-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPlayingThis
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : isCurrent
                            ? "bg-muted text-muted-foreground"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {isPlayingThis ? "PLAYING" : isCurrent ? "PAUSED" : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Progress Bar */}
      <div className="shrink-0 px-4 py-2 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-3 bg-card/20">
        <span className="w-10 text-right tabular-nums">{currentTime}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1.5 accent-amber-400 bg-muted rounded cursor-pointer"
        />
        <span className="w-10 text-left tabular-nums">-{remaining}</span>
      </div>

      {/* Transport Controls + Volume Bar */}
      <div className="shrink-0 px-4 py-3 border-t border-border flex items-center justify-between gap-4 bg-card/40">
        {/* Playback Controls (Lucide icons replacing broken text glyphs) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevTrack}
            disabled={playlist.length === 0}
            aria-label="Previous track"
            className="p-2 bg-card hover:bg-amber-500/20 border border-border/80 text-foreground hover:text-amber-300 disabled:opacity-40 rounded transition-colors"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`p-2 border rounded transition-all ${
              isPlaying
                ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm"
                : "bg-card hover:bg-amber-500/20 border-border/80 text-foreground hover:text-amber-300 disabled:opacity-40"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            disabled={playlist.length === 0}
            aria-label="Next track"
            className="p-2 bg-card hover:bg-amber-500/20 border border-border/80 text-foreground hover:text-amber-300 disabled:opacity-40 rounded transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Local Volume Bar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            disabled={!audioUrl}
            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
            className={`p-1.5 border rounded transition-colors ${
              isMuted || volume === 0
                ? "bg-red-500/20 text-red-300 border-red-500/40"
                : "bg-card hover:bg-amber-500/20 border-border/80 text-foreground hover:text-amber-300"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-28 h-1.5 accent-amber-400 bg-muted rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { VirtualFS } from "@/features/virtual-fs";
import type { FSNode } from "@/types";

const MUSIC_DIR = "/home/user/Music";

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

  // Absolute path of the file currently loaded into the player.
  const [currentTrackPath, setCurrentTrackPath] = useState<string>("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const targetPath = path || "";

  // Build the local music library from the virtual filesystem (once).
  useEffect(() => {
    const songs = fsRef.current
      .listDirectory(MUSIC_DIR)
      .filter((n) => n.type === "file" && n.name.toLowerCase().endsWith(".mp3"));
    setPlaylist(songs);
  }, []);

  // When a path prop is supplied (open a file from the desktop), load it.
  useEffect(() => {
    if (targetPath) {
      const node = fsRef.current.getNode(targetPath);
      if (node && node.type === "file" && node.content) {
        setAudioUrl(node.content);
        setTitle(node.name.replace(/_/g, " ").replace(/\.mp3$/i, ""));
        setCurrentTrackPath(node.path);
        setProgress(0);
        setDuration(0);
      }
    }
  }, [targetPath]);

  // Auto-play when a new source is loaded.
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentTrackPath) {
      const d = audioRef.current.duration;
      setDuration(d);
      setDurations((prev) => ({ ...prev, [currentTrackPath]: d }));
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

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.muted = next;
  };

  const loadTrack = (node: FSNode) => {
    if (!node.content) return;
    // Re-clicking the loaded track restarts it from the top.
    if (node.path === currentTrackPath) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setProgress(0);
      setDuration(0);
      if (audioRef.current) audioRef.current.play().then(() => setIsPlaying(true));
      return;
    }
    setAudioUrl(node.content);
    setTitle(node.name.replace(/_/g, " ").replace(/\.mp3$/i, ""));
    setCurrentTrackPath(node.path);
    setProgress(0);
    setDuration(0);
  };

  const currentIndex = playlist.findIndex((n) => n.path === currentTrackPath);

  const nextTrack = () => {
    if (!playlist.length) return;
    loadTrack(playlist[(currentIndex + 1) % playlist.length]);
  };

  const prevTrack = () => {
    if (!playlist.length) return;
    loadTrack(playlist[(currentIndex - 1 + playlist.length) % playlist.length]);
  };

  const currentTime = formatTime(progress);
  const remaining = formatTime(Math.max(0, (duration || 0) - progress));

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-mono select-none">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header / Now Playing */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-sm">
        <span className="nf text-amber-400" aria-hidden="true">{'\uF001'}</span>
        <span className="text-amber-400">Now Playing:</span>{" "}
        <span className="text-foreground">{title || "idle"}</span>
      </div>

      {/* Tracklist (library) */}
      <div className="flex-1 overflow-y-auto p-4">
        {playlist.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files found in {MUSIC_DIR}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-normal">Track</th>
                <th className="pb-2 font-normal">Duration</th>
                <th className="pb-2 font-normal">Status</th>
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
                    className="cursor-pointer border-b border-border/30 last:border-0 hover:bg-secondary/50"
                  >
                    <td className={`py-1.5 ${isCurrent ? "text-amber-400" : "text-foreground"}`}>
                      {node.name}
                    </td>
                    <td className="py-1.5 text-muted-foreground">
                      {durations[node.path] ? formatTime(durations[node.path]) : "—"}
                    </td>
                    <td className="py-1.5 text-muted-foreground">
                      {isPlayingThis ? "playing" : isCurrent ? "paused" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Progress bar */}
      <div className="shrink-0 px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
        <span className="w-10 text-right">{currentTime}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={progress}
          onChange={handleSeek}
          className="flex-1 h-1 accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:rounded-none"
        />
        <span className="w-10 text-left">-{remaining}</span>
      </div>

      {/* Transport controls + volume */}
      <div className="shrink-0 px-4 py-2 border-t border-border flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevTrack}
            disabled={playlist.length === 0}
            aria-label="Previous track"
            className="px-2 py-1 border border-border text-foreground disabled:opacity-40"
          >
            [<span className="nf" aria-hidden="true">{'\uF048'}</span>]
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`px-2 py-1 border border-border disabled:opacity-40 ${isPlaying ? "text-amber-400" : ""}`}
          >
            [<span className="nf" aria-hidden="true">{isPlaying ? '\uF04C' : '\uF04B'}</span>]
          </button>
          <button
            type="button"
            onClick={nextTrack}
            disabled={playlist.length === 0}
            aria-label="Next track"
            className="px-2 py-1 border border-border text-foreground disabled:opacity-40"
          >
            [<span className="nf" aria-hidden="true">{'\uF051'}</span>]
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            disabled={!audioUrl}
            aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
            className={`px-2 py-1 border border-border disabled:opacity-40 ${isMuted || volume === 0 ? "text-amber-400" : ""}`}
          >
            [<span className="nf" aria-hidden="true">{isMuted || volume === 0 ? '\uF026' : '\uF028'}</span>]
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-32 h-1 accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-2 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:rounded-none"
          />
        </div>
      </div>
    </div>
  );
}

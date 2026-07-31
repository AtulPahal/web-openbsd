"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Search, Home, Radio, Clock, Mic2, Disc3, Music as MusicIcon, 
  ShoppingBag, ListMusic, Shuffle, Repeat, MessageSquareQuote, 
  ListEnd, Apple 
} from "lucide-react";
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
  
  const [showLyrics, setShowLyrics] = useState(true);
  const [activeTab, setActiveTab] = useState("Home");
  
  const targetPath = path || ""; // If empty, it's just the browse screen
  
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (targetPath) {
      const fileNode = fsRef.current.getNode(targetPath);
      if (fileNode && fileNode.type === "file" && fileNode.content) {
        setAudioUrl(fileNode.content);
        setTitle(fileNode.name.replace(/_/g, " ").replace(".mp3", ""));
      }
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

  const SidebarItem = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => {
    const isActive = activeTab === label;
    return (
      <button 
        onClick={() => setActiveTab(label)}
        className={`flex items-center gap-3 px-3 py-1.5 rounded-md w-full transition-colors text-[13px] ${isActive ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon className={`size-4 ${isActive ? 'text-rose-500' : ''}`} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] text-foreground font-sans select-none overflow-hidden rounded-md">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* TOP BODY: Sidebar + Main + Right Panel */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-56 shrink-0 bg-[#252525] bg-opacity-95 border-r border-black/40 flex flex-col p-4 overflow-y-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/50" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-rose-500/50 focus:bg-black/40 transition-colors"
            />
          </div>

          <SidebarItem icon={Home} label="Home" />
          <SidebarItem icon={Radio} label="Radio" />

          <div className="mt-6 mb-2 px-3 text-[11px] font-semibold text-white/40 tracking-wider">Library</div>
          <SidebarItem icon={Clock} label="Recently Added" />
          <SidebarItem icon={Mic2} label="Artists" />
          <SidebarItem icon={Disc3} label="Albums" />
          <SidebarItem icon={MusicIcon} label="Songs" />

          <div className="mt-6 mb-2 px-3 text-[11px] font-semibold text-white/40 tracking-wider">Store</div>
          <SidebarItem icon={ShoppingBag} label="iTunes Store" />

          <div className="mt-6 mb-2 px-3 text-[11px] font-semibold text-white/40 tracking-wider">Playlists</div>
          <SidebarItem icon={ListMusic} label="All Playlists" />

          <div className="mt-auto pt-6">
            <div className="flex items-center gap-2 px-3 py-2 text-white/80 cursor-pointer hover:bg-white/5 rounded-md">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                AP
              </div>
              <span className="text-[13px] font-medium truncate">Atul Pahal</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#1e1e1e] overflow-y-auto p-8 shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
          </div>
        </div>

        {/* Right Sidebar (Lyrics/Queue) */}
        <div className={`shrink-0 bg-[#252525] bg-opacity-95 border-l border-black/40 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${showLyrics ? 'w-64' : 'w-0 border-l-0'}`}>
          <div className="w-full h-full flex items-center justify-center px-6 text-center">
            {title ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 flex items-center justify-center border border-white/5 shadow-lg">
                  <MusicIcon className="w-12 h-12 text-white/40" />
                </div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-[11px] text-rose-500">Lyrics unavailable</p>
              </div>
            ) : (
              <p className="text-[13px] text-white/40">Play a song to see lyrics here.</p>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM PLAYER BAR */}
      <div className="h-[72px] shrink-0 bg-[#2a2a2a] border-t border-black/60 flex items-center px-6 gap-4">
        
        {/* Left Controls */}
        <div className="flex items-center gap-4 shrink-0 text-white/70">
          <button className="hover:text-white"><Shuffle className="size-4" /></button>
          <button className="hover:text-white"><SkipBack className="size-5 fill-current" /></button>
          <button onClick={togglePlay} className="hover:text-white text-white">
            {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}
          </button>
          <button className="hover:text-white"><SkipForward className="size-5 fill-current" /></button>
          <button className="hover:text-white"><Repeat className="size-4" /></button>
        </div>

        {/* Center Display (Progress / Info) */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto">
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-white/50 shrink-0 w-8 text-right">
              {formatTime(progress)}
            </span>
            <div className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer">
              <span className="text-[11px] font-medium text-white truncate max-w-[200px]">
                {title || <Apple className="size-4 text-white/30 fill-white/30" />}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none accent-white/80 group-hover:h-1.5 transition-all"
              />
            </div>
            <span className="text-[10px] font-mono text-white/50 shrink-0 w-8 text-left">
              {title && duration ? `-${formatTime(duration - progress)}` : "0:00"}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 shrink-0 text-white/70 ml-4">
          <button 
            onClick={() => setShowLyrics(!showLyrics)}
            className={`${showLyrics ? 'text-rose-500 bg-rose-500/10' : 'hover:text-white'} p-1.5 rounded-md transition-colors`}
          >
            <MessageSquareQuote className="size-4" />
          </button>
          <button className="hover:text-white p-1.5 rounded-md">
            <ListEnd className="size-4" />
          </button>
          
          <div className="flex items-center gap-2 w-28 group">
            <button onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (audioRef.current) audioRef.current.muted = newMuted;
            }} className="hover:text-white shrink-0">
              {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-white/20 rounded-full appearance-none outline-none accent-white/80 group-hover:h-1.5 transition-all cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wifi,
  Volume2,
  Sun,
  Shield,
  Palette,
  Laptop,
  User,
  Check,
  Moon,
  VolumeX,
  Lock,
  Cpu,
  HardDrive,
  Globe,
  Sliders,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Code,
  Battery,
  BatteryCharging,
  Keyboard,
  Search,
  Monitor,
  Eye,
  Zap,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Image as ImageIcon,
  Key,
  Terminal,
} from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/lib/social-icons";
import { getRealHardwareInfo, type SystemHardwareInfo } from "@/lib/hardware-info";

type SettingsSection =
  | "wifi"
  | "sound"
  | "display"
  | "appearance"
  | "security"
  | "power"
  | "keyboard"
  | "system";

const WALLPAPERS = [
  { id: "default", name: "OpenBSD Puffy Default", url: "/wallpaper.jpg", thumb: "/wallpaper.jpg" },
  { id: "dark-minimal", name: "Obsidian Matrix", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop" },
  { id: "neon-cyber", name: "Cyberpunk Geometry", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=300&auto=format&fit=crop" },
  { id: "nordic-dusk", name: "Nordic Minimalist", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920&auto=format&fit=crop", thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=300&auto=format&fit=crop" },
];

const ACCENT_COLORS = [
  { id: "amber", name: "OpenBSD Amber", hex: "#f59e0b", ring: "ring-amber-500" },
  { id: "emerald", name: "Terminal Green", hex: "#10b981", ring: "ring-emerald-500" },
  { id: "sky", name: "BSD Sky", hex: "#0284c7", ring: "ring-sky-500" },
  { id: "purple", name: "Cyber Purple", hex: "#a855f7", ring: "ring-purple-500" },
  { id: "rose", name: "Neon Rose", hex: "#f43f5e", ring: "ring-rose-500" },
];

const PUFFY_ASCII = `
     _____
    /     \\
   | () () |
    \\  ^  /
     |||||
     |||||
`;

const ICON_MAP: Record<string, React.ElementType> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
};

function ToggleSwitch({
  checked,
  onChange,
  activeColor = "bg-amber-500",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? activeColor : "bg-muted/80"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function SystemSettings({ windowId }: { windowId: string }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("wifi");
  const [searchQuery, setSearchQuery] = useState("");

  // Real Hardware telemetry
  const [hwInfo, setHwInfo] = useState<SystemHardwareInfo>(getRealHardwareInfo);

  // Settings State
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [connectedWifi, setConnectedWifi] = useState(SYSTEM_CONFIG.defaultWifiNetworks[0]?.ssid || "OpenBSD-5G");
  const [ipMode, setIpMode] = useState<"dhcp" | "static">("dhcp");
  const [dnsServer, setDnsServer] = useState("1.1.1.1, 8.8.8.8");

  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [inputVolume, setInputVolume] = useState(80);
  const [soundEffects, setSoundEffects] = useState(true);
  const [outputDevice, setOutputDevice] = useState(SYSTEM_CONFIG.defaultAudioOutputDevices[0] || "Built-in Speakers");

  const [brightness, setBrightness] = useState(100);
  const [nightLight, setNightLight] = useState(false);
  const [resolution, setResolution] = useState(hwInfo.screenResolution);
  const [refreshRate, setRefreshRate] = useState("60Hz");
  const [displayScale, setDisplayScale] = useState("100%");

  const [darkMode, setDarkMode] = useState(true);
  const [activeWallpaper, setActiveWallpaper] = useState(SYSTEM_CONFIG.wallpaper);
  const [activeAccent, setActiveAccent] = useState("amber");
  const [dockMagnify, setDockMagnify] = useState(true);
  const [dockPosition, setDockPosition] = useState<"right" | "bottom">("right");

  const [pfActive, setPfActive] = useState(true);
  const [pfRuleMode, setPfRuleMode] = useState<"standard" | "stealth" | "strict">("standard");
  const [autoLockMinutes, setAutoLockMinutes] = useState(15);

  const [powerProfile, setPowerProfile] = useState<"performance" | "balanced" | "saver">("balanced");
  const [sleepTimeout, setSleepTimeout] = useState(30);

  const [shellKeyMode, setShellKeyMode] = useState<"emacs" | "vim">("emacs");
  const [keyRepeatDelay, setKeyRepeatDelay] = useState(250);
  const [keyRepeatRate, setKeyRepeatRate] = useState(30);

  useEffect(() => {
    setHwInfo(getRealHardwareInfo());
  }, []);

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (isMuted) setIsMuted(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("master-volume-change", {
          detail: { volume: newVal / 100, isMuted: false, level: newVal },
        })
      );
    }
  };

  const handleBrightnessChange = (newVal: number) => {
    setBrightness(newVal);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("brightness-change", { detail: { brightness: newVal } })
      );
    }
  };

  const handleWallpaperSelect = (url: string) => {
    setActiveWallpaper(url);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wallpaper-change", { detail: { wallpaper: url } })
      );
    }
  };

  const menuItems: Array<{ id: SettingsSection; label: string; icon: React.ElementType; color: string }> = [
    { id: "wifi", label: "Wi-Fi & Network", icon: Wifi, color: "text-emerald-400" },
    { id: "sound", label: "Sound & Audio", icon: Volume2, color: "text-amber-400" },
    { id: "display", label: "Displays & Graphics", icon: Sun, color: "text-sky-400" },
    { id: "appearance", label: "Appearance & Themes", icon: Palette, color: "text-rose-400" },
    { id: "security", label: "Security & Firewall", icon: Shield, color: "text-purple-400" },
    { id: "power", label: "Battery & Power", icon: BatteryCharging, color: "text-emerald-400" },
    { id: "keyboard", label: "Keyboard & Shell", icon: Keyboard, color: "text-blue-400" },
    { id: "system", label: "System & About", icon: Laptop, color: "text-amber-400" },
  ];

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter((m) => m.label.toLowerCase().includes(q));
  }, [searchQuery, menuItems]);

  return (
    <div
      className="flex flex-col sm:flex-row h-full w-full bg-background font-mono text-foreground text-xs select-none overflow-hidden"
      data-window-id={windowId}
    >
      {/* Left Sidebar (macOS Settings Style) */}
      <div className="w-full sm:w-56 border-b sm:border-b-0 sm:border-r border-border/60 bg-card/40 flex flex-col p-2.5 space-y-2.5 shrink-0 overflow-x-auto sm:overflow-x-visible scrollbar-none">
        {/* Search Settings Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Settings..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-background/60 border border-border/60 rounded-lg text-xs outline-none focus:border-amber-400 transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* User Account Card */}
        <div className="hidden sm:flex p-2.5 bg-background/60 border border-border/50 rounded-xl items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-bold text-xs text-foreground truncate">{SYSTEM_CONFIG.userFullName}</div>
            <div className="text-[10px] text-muted-foreground truncate">{SYSTEM_CONFIG.name} Account</div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-row sm:flex-col gap-1 sm:space-y-1 sm:overflow-y-auto scrollbar-thin sm:pr-1 w-full shrink-0 sm:shrink">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`p-2 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer shrink-0 sm:w-full ${
                  isActive
                    ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-sm"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className="hidden sm:block w-3.5 h-3.5 opacity-40 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 p-4 overflow-y-auto bg-card/20 space-y-4 scrollbar-thin">
        {/* 1. SECTION: Wi-Fi & Network */}
        {activeSection === "wifi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h2 className="text-sm font-bold text-foreground">Wi-Fi & Network Settings</h2>
                <p className="text-[10px] text-muted-foreground">Manage wireless connections, interfaces, and IP routing.</p>
              </div>
              <ToggleSwitch checked={wifiEnabled} onChange={setWifiEnabled} activeColor="bg-emerald-500" />
            </div>

            {wifiEnabled ? (
              <div className="space-y-3">
                {/* Active Connection Tile */}
                <div className="p-3 bg-card/60 border border-emerald-500/40 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <Wifi className="w-4 h-4" />
                      <span>{connectedWifi}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      IPv4: {SYSTEM_CONFIG.localIp} • Gateway: 10.0.0.1 • Link Speed: {hwInfo.downlinkMbps} Mbps
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Connected
                  </span>
                </div>

                {/* IP Configuration (DHCP vs Static) */}
                <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    TCP/IP Address Configuration
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIpMode("dhcp")}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        ipMode === "dhcp"
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-background/40 border-border/40 hover:bg-muted"
                      }`}
                    >
                      Automatic (DHCP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIpMode("static")}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                        ipMode === "static"
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-background/40 border-border/40 hover:bg-muted"
                      }`}
                    >
                      Manual Static IP
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <label className="text-[10px] text-muted-foreground">DNS Servers:</label>
                    <input
                      type="text"
                      value={dnsServer}
                      onChange={(e) => setDnsServer(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-background/60 border border-border/60 rounded-lg outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Available Networks List */}
                <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    Available Networks
                  </div>
                  {SYSTEM_CONFIG.defaultWifiNetworks.map((net) => (
                    <button
                      key={net.ssid}
                      type="button"
                      onClick={() => setConnectedWifi(net.ssid)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        connectedWifi === net.ssid
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
                          : "bg-background/40 border-border/40 hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{net.ssid}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{net.signal}%</span>
                        {connectedWifi === net.ssid && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-card/30 rounded-xl border border-border/40">
                Wi-Fi is currently disabled.
              </div>
            )}
          </div>
        )}

        {/* 2. SECTION: Sound & Audio */}
        {activeSection === "sound" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Sound & Audio Settings</h2>
              <p className="text-[10px] text-muted-foreground">Adjust master volume, input microphone, and output devices.</p>
            </div>

            {/* Master Volume */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>Master Output Volume</span>
                </span>
                <span className="font-bold text-amber-400 tabular-nums">{isMuted ? "Muted" : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-muted rounded-lg"
              />
            </div>

            {/* Input Volume */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">Microphone Input Level</span>
                <span className="font-bold text-foreground tabular-nums">{inputVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inputVolume}
                onChange={(e) => setInputVolume(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
              />
            </div>

            {/* Sound Effects Toggle */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">System Sound Effects</div>
                <div className="text-[10px] text-muted-foreground">Play alerts on window close, error, and notifications</div>
              </div>
              <ToggleSwitch checked={soundEffects} onChange={setSoundEffects} activeColor="bg-amber-500" />
            </div>

            {/* Output Device Selector */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                Select Audio Output Device
              </div>
              {SYSTEM_CONFIG.defaultAudioOutputDevices.map((dev) => (
                <button
                  key={dev}
                  type="button"
                  onClick={() => setOutputDevice(dev)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                    outputDevice === dev
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
                      : "bg-background/40 border-border/40 hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{dev}</span>
                  {outputDevice === dev && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. SECTION: Displays & Graphics */}
        {activeSection === "display" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Displays & Graphics</h2>
              <p className="text-[10px] text-muted-foreground">Adjust display brightness, refresh rate, and blue light filter.</p>
            </div>

            {/* Brightness */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Display Brightness</span>
                </span>
                <span className="font-bold text-amber-400 tabular-nums">{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-muted rounded-lg"
              />
            </div>

            {/* Night Light Filter */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Night Light (Blue Light Filter)</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Shift colors to warmer spectrum for eye comfort</div>
              </div>
              <ToggleSwitch checked={nightLight} onChange={setNightLight} activeColor="bg-amber-500" />
            </div>

            {/* Resolution & Refresh Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Resolution</span>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full p-2 bg-background/60 border border-border/60 rounded-lg text-xs outline-none focus:border-amber-400"
                >
                  <option value={hwInfo.screenResolution}>{hwInfo.screenResolution} (Native)</option>
                  <option value="1920x1080">1920x1080 (16:9)</option>
                  <option value="2560x1440">2560x1440 (2K QHD)</option>
                  <option value="3840x2160">3840x2160 (4K UHD)</option>
                </select>
              </div>

              <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Refresh Rate</span>
                <select
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(e.target.value)}
                  className="w-full p-2 bg-background/60 border border-border/60 rounded-lg text-xs outline-none focus:border-amber-400"
                >
                  <option value="60Hz">60 Hz (Standard)</option>
                  <option value="120Hz">120 Hz (Smooth)</option>
                  <option value="144Hz">144 Hz (ProMotion)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4. SECTION: Appearance & Themes */}
        {activeSection === "appearance" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Appearance & Desktop Themes</h2>
              <p className="text-[10px] text-muted-foreground">Customize dark/light mode, wallpapers, and accent colors.</p>
            </div>

            {/* Dark / Light Mode */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>Dark Mode Theme</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Toggle between Light and Dark visual palette</div>
              </div>
              <ToggleSwitch
                checked={darkMode}
                onChange={(val) => {
                  setDarkMode(val);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("theme-change", { detail: { isDark: val } })
                    );
                  }
                }}
                activeColor="bg-amber-500"
              />
            </div>

            {/* Live Wallpaper Gallery */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Desktop Wallpaper Gallery</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {WALLPAPERS.map((wp) => {
                  const isSelected = activeWallpaper === wp.url;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => handleWallpaperSelect(wp.url)}
                      className={`group relative flex flex-col items-center rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        isSelected ? "border-amber-400 ring-2 ring-amber-400/50 shadow-md" : "border-border/60 hover:border-border"
                      }`}
                    >
                      <div
                        className="w-full h-16 bg-cover bg-center group-hover:scale-105 transition-transform"
                        style={{ backgroundImage: `url('${wp.thumb}')` }}
                      />
                      <span className="p-1 text-[10px] font-semibold text-foreground truncate w-full text-center bg-card/80">
                        {wp.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>System Accent Color</span>
              </div>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map((c) => {
                  const isSelected = activeAccent === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveAccent(c.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                        isSelected ? `scale-110 ring-2 ${c.ring} ring-offset-2 ring-offset-background` : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dock Magnification */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs">Dock Proximity Magnification</div>
                <div className="text-[10px] text-muted-foreground">Fisheye zoom when hovering over dock icons</div>
              </div>
              <ToggleSwitch
                checked={dockMagnify}
                onChange={(val) => {
                  setDockMagnify(val);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("dock-magnification-change", { detail: { enabled: val } })
                    );
                  }
                }}
                activeColor="bg-amber-500"
              />
            </div>
          </div>
        )}

        {/* 5. SECTION: Security & Firewall */}
        {activeSection === "security" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Security & PF Firewall</h2>
              <p className="text-[10px] text-muted-foreground">OpenBSD Packet Filter (PF), pledge sandbox, and login authentication.</p>
            </div>

            {/* PF Status */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span>PF (Packet Filter) Firewall</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Active filtering on interface em0</div>
              </div>
              <ToggleSwitch checked={pfActive} onChange={setPfActive} activeColor="bg-emerald-500" />
            </div>

            {/* Firewall Rules Mode */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                PF Firewall Rule Preset
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "standard", label: "Standard", desc: "Block inbound, permit stateful out" },
                  { id: "stealth", label: "Stealth", desc: "Drop all unsolicited probes silently" },
                  { id: "strict", label: "Strict Sandbox", desc: "Enforce strict pledge() & unveil()" },
                ].map((rule) => {
                  const isSelected = pfRuleMode === rule.id;
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setPfRuleMode(rule.id as typeof pfRuleMode)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold" : "bg-background/40 border-border/40 hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs">{rule.label}</span>
                      <span className="text-[9px] text-muted-foreground mt-1">{rule.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auto Lock Screen */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold">Automatic Screen Lock Timer</span>
                <span className="font-bold text-amber-400">{autoLockMinutes} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 6. SECTION: Battery & Power */}
        {activeSection === "power" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Battery & Power Settings</h2>
              <p className="text-[10px] text-muted-foreground">Manage power profiles and sleep management.</p>
            </div>

            {/* Battery Status */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Power Source: AC Adapter (Connected)</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">100% Fully Charged • Battery Health: 98%</div>
                </div>
              </div>
            </div>

            {/* Power Mode Grid */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                Energy Mode Profile
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "performance", label: "High Performance", desc: "Maximize CPU clock frequencies" },
                  { id: "balanced", label: "Balanced (Default)", desc: "Optimal performance and battery balance" },
                  { id: "saver", label: "Power Saver", desc: "Reduce display & background task clocks" },
                ].map((pm) => {
                  const isSelected = powerProfile === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPowerProfile(pm.id as typeof powerProfile)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold" : "bg-background/40 border-border/40 hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs">{pm.label}</span>
                      <span className="text-[9px] text-muted-foreground mt-1">{pm.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 7. SECTION: Keyboard & Input */}
        {activeSection === "keyboard" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Keyboard & Terminal Input</h2>
              <p className="text-[10px] text-muted-foreground">Configure shell keybindings and key repeat rates.</p>
            </div>

            {/* Shell Mode (Emacs vs Vim) */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                Shell Command Line Keybinding Mode
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShellKeyMode("emacs")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                    shellKeyMode === "emacs" ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold" : "bg-background/40 border-border/40 hover:bg-muted"
                  }`}
                >
                  <span className="text-xs">Emacs / Standard Bash</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">Ctrl+A (head), Ctrl+E (end), Ctrl+K (kill line)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShellKeyMode("vim")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                    shellKeyMode === "vim" ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold" : "bg-background/40 border-border/40 hover:bg-muted"
                  }`}
                >
                  <span className="text-xs">Vi / Vim Mode</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">ESC for normal mode (h, j, k, l, w, b, dd)</span>
                </button>
              </div>
            </div>

            {/* Key Repeat Delay */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold">Key Repeat Delay</span>
                <span className="font-bold text-amber-400">{keyRepeatDelay} ms</span>
              </div>
              <input
                type="range"
                min="150"
                max="600"
                step="25"
                value={keyRepeatDelay}
                onChange={(e) => setKeyRepeatDelay(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 8. SECTION: System & About */}
        {activeSection === "system" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">System & About</h2>
              <p className="text-[10px] text-muted-foreground">System specifications, developer profile, and build details.</p>
            </div>

            {/* Developer About Profile Card */}
            <div className="p-4 bg-card/40 border border-border/60 rounded-xl flex flex-col items-center text-center space-y-3 shadow-sm">
              <pre className="text-amber-400 text-xs leading-tight font-mono">{PUFFY_ASCII}</pre>
              <div>
                <h3 className="text-base font-bold text-foreground">{PORTFOLIO_DATA.name}</h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">{PORTFOLIO_DATA.title}</p>
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{PORTFOLIO_DATA.location}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{PORTFOLIO_DATA.email}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{PORTFOLIO_DATA.phone}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {PORTFOLIO_DATA.social.map((s) => {
                  const Icon = ICON_MAP[s.icon] ?? Mail;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={s.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* System Hardware Specifications Card */}
            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-xs text-amber-400 border-b border-border/40 pb-1.5 flex items-center justify-between">
                <span>System Specifications</span>
                <span className="text-[10px] text-muted-foreground font-normal">v{SYSTEM_CONFIG.desktopVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OS Name:</span>
                <span className="font-bold text-amber-400">{SYSTEM_CONFIG.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OS Version:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.osVersion} (GENERIC.MP)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">CPU Core Count:</span>
                <span className="font-semibold text-foreground">{hwInfo.cpuCores} Cores ({hwInfo.platform})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Memory:</span>
                <span className="font-semibold text-foreground">{hwInfo.memoryGb} GB RAM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Display:</span>
                <span className="font-semibold text-foreground">{hwInfo.screenResolution} @ {hwInfo.pixelRatio}x</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Hostname:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.hostname}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Shell:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.shell}</span>
              </div>
            </div>

            {/* Build & Copyright Footer Card */}
            <div className="p-3 bg-card/30 border border-border/40 rounded-xl text-center text-xs text-muted-foreground space-y-1">
              <p className="text-foreground/80 font-medium">Built with Next.js 16 • React 19 • TypeScript • Tailwind CSS v4 • Bun</p>
              <p className="text-[10px] text-muted-foreground/60">
                &copy; {new Date().getFullYear()} {PORTFOLIO_DATA.name}. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

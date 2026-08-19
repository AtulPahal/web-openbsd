"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/lib/social-icons";

type SettingsSection = "wifi" | "sound" | "display" | "security" | "appearance" | "system";

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

  // Settings State
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [connectedWifi, setConnectedWifi] = useState("OpenBSD-5G");

  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [outputDevice, setOutputDevice] = useState("Built-in Speakers");

  const [brightness, setBrightness] = useState(100);
  const [darkMode, setDarkMode] = useState(true);

  const [pfActive, setPfActive] = useState(true);
  const [dockMagnify, setDockMagnify] = useState(true);

  // Sync Master Volume with Desktop
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

  const menuItems: Array<{ id: SettingsSection; label: string; icon: React.ElementType; color: string }> = [
    { id: "wifi", label: "Wi-Fi & Network", icon: Wifi, color: "text-emerald-400" },
    { id: "sound", label: "Sound & Audio", icon: Volume2, color: "text-amber-400" },
    { id: "display", label: "Display & Brightness", icon: Sun, color: "text-sky-400" },
    { id: "security", label: "Security & Firewall", icon: Shield, color: "text-purple-400" },
    { id: "appearance", label: "Appearance & Dock", icon: Palette, color: "text-rose-400" },
    { id: "system", label: "System & About", icon: Laptop, color: "text-amber-400" },
  ];

  return (
    <div
      className="flex flex-col sm:flex-row h-full w-full bg-background font-mono text-foreground text-xs select-none overflow-hidden"
      data-window-id={windowId}
    >
      {/* Left / Top Navigation Bar */}
      <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-border/60 bg-card/40 flex flex-row sm:flex-col p-2 sm:p-2.5 gap-2 sm:space-y-3 shrink-0 overflow-x-auto sm:overflow-x-visible scrollbar-none">
        {/* Account Profile Header (Desktop only or compact on mobile) */}
        <div className="hidden sm:flex p-2.5 bg-background/60 border border-border/50 rounded-xl items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="font-bold text-xs text-foreground truncate">{SYSTEM_CONFIG.userFullName}</div>
            <div className="text-[10px] text-muted-foreground truncate">{SYSTEM_CONFIG.name} Account</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row sm:flex-col gap-1 sm:space-y-1 sm:overflow-y-auto scrollbar-thin sm:pr-1 w-full shrink-0 sm:shrink">
          {menuItems.map((item) => {
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
      <div className="flex-1 p-4 overflow-y-auto bg-card/20 space-y-4">
        {/* SECTION: Wi-Fi & Network */}
        {activeSection === "wifi" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h2 className="text-sm font-bold text-foreground">Wi-Fi & Network Settings</h2>
                <p className="text-[10px] text-muted-foreground">Manage wireless connections and network interfaces.</p>
              </div>
              <ToggleSwitch checked={wifiEnabled} onChange={setWifiEnabled} activeColor="bg-emerald-500" />
            </div>

            {wifiEnabled ? (
              <div className="space-y-3">
                <div className="p-3 bg-card/60 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Wifi className="w-4 h-4" />
                      <span>{connectedWifi}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      IPv4: {SYSTEM_CONFIG.localIp} • Speed: 433 Mbps • Signal: 98%
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Connected
                  </span>
                </div>

                <div className="p-3 bg-card/40 border border-border/60 rounded-xl space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    Available Networks
                  </div>
                  {SYSTEM_CONFIG.defaultWifiNetworks.map((net) => (
                    <button
                      key={net.ssid}
                      type="button"
                      onClick={() => setConnectedWifi(net.ssid)}
                      className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                        connectedWifi === net.ssid
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
                          : "bg-background/40 border-border/40 hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{net.ssid}</span>
                      {connectedWifi === net.ssid && <Check className="w-3.5 h-3.5 text-amber-400" />}
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

        {/* SECTION: Sound & Audio */}
        {activeSection === "sound" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Sound & Audio Settings</h2>
              <p className="text-[10px] text-muted-foreground">Adjust master volume and output device preferences.</p>
            </div>

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

            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                Select Output Device
              </div>
              {SYSTEM_CONFIG.defaultAudioOutputDevices.map((dev) => (
                <button
                  key={dev}
                  type="button"
                  onClick={() => setOutputDevice(dev)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
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

        {/* SECTION: Display & Brightness */}
        {activeSection === "display" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Display & Brightness Settings</h2>
              <p className="text-[10px] text-muted-foreground">Adjust display brightness and desktop theme.</p>
            </div>

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
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-muted rounded-lg"
              />
            </div>

            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs">Dark Mode Theme</div>
                <div className="text-[10px] text-muted-foreground">Toggle between Light and Dark Mode</div>
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
          </div>
        )}

        {/* SECTION: Security & Firewall */}
        {activeSection === "security" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Security & PF Firewall</h2>
              <p className="text-[10px] text-muted-foreground">Proactively secure system firewall and authentication.</p>
            </div>

            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                  <Shield className="w-4 h-4" />
                  <span>PF Firewall Protection</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Packet Filter rules active on em0</div>
              </div>
              <ToggleSwitch checked={pfActive} onChange={setPfActive} activeColor="bg-emerald-500" />
            </div>

            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl space-y-2">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Login Password</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Current password: <span className="text-amber-300 font-bold">{SYSTEM_CONFIG.loginPassword}</span> (demo)
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Appearance & Dock */}
        {activeSection === "appearance" && (
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h2 className="text-sm font-bold text-foreground">Appearance & Dock Settings</h2>
              <p className="text-[10px] text-muted-foreground">Customize macOS dock magnification and desktop layout.</p>
            </div>

            <div className="p-3.5 bg-card/40 border border-border/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs">Dock Proximity Magnification</div>
                <div className="text-[10px] text-muted-foreground">Fisheye zoom on dock icon hover</div>
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

        {/* SECTION: System & About */}
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
                      className="px-2.5 py-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1.5 transition-colors"
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
                <span>System Specs</span>
                <span className="text-[10px] text-muted-foreground font-normal">v{SYSTEM_CONFIG.desktopVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OS Name:</span>
                <span className="font-bold text-amber-400">{SYSTEM_CONFIG.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">OS Version:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.osVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Desktop Version:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.desktopVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-semibold text-foreground">{SYSTEM_CONFIG.architecture}</span>
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

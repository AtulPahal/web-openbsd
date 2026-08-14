"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Volume2,
  VolumeX,
  Check,
  Sun,
  Moon,
  Shield,
  Monitor,
} from "lucide-react";
import { SYSTEM_CONFIG } from "@/lib/system-config";

interface SystemTrayProps {
  onToggleNotificationCenter?: () => void;
  unreadCount?: number;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (newLevel: number, muted?: boolean) => void;
}

type ActivePopover = "wifi" | "bluetooth" | "audio" | null;

function ToggleSwitch({
  checked,
  onChange,
  activeColor = "bg-emerald-500",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor?: string;
}) {
  return (
    <button
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

export function SystemTray({
  onToggleNotificationCenter,
  unreadCount = 0,
  volume = 75,
  isMuted = false,
  onVolumeChange,
}: SystemTrayProps) {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);

  // Wi-Fi State
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [connectedWifi, setConnectedWifi] = useState("OpenBSD-5G");
  const [wifiNetworks, setWifiNetworks] = useState([
    { ssid: "OpenBSD-5G", signal: 98, secured: true, connected: true },
    { ssid: "Atul_Home_Fiber", signal: 85, secured: true, connected: false },
    { ssid: "Drone_Tech_Lab", signal: 60, secured: true, connected: false },
    { ssid: "Guest_WiFi_Free", signal: 45, secured: false, connected: false },
  ]);

  // Bluetooth State
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [btDevices, setBtDevices] = useState([
    { id: "1", name: "AirPods Pro", type: "audio", connected: true },
    { id: "2", name: "Keychron K2 Keyboard", type: "input", connected: true },
    { id: "3", name: "MX Master 3S Mouse", type: "input", connected: false },
  ]);

  const [outputDevice, setOutputDevice] = useState("Built-in Speakers");
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopover = (popover: ActivePopover) => {
    setActivePopover((prev) => (prev === popover ? null : popover));
  };

  const handleConnectWifi = (ssid: string) => {
    setConnectedWifi(ssid);
    setWifiNetworks((prev) =>
      prev.map((n) => ({ ...n, connected: n.ssid === ssid }))
    );
  };

  const handleToggleBtDevice = (id: string) => {
    setBtDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
  };

  return (
    <div ref={trayRef} className="relative flex items-center gap-1.5 text-xs font-mono select-none">
      {/* 1. Wi-Fi Button */}
      <button
        type="button"
        onClick={() => togglePopover("wifi")}
        className={`p-1 rounded hover:bg-amber-500/10 transition-colors cursor-pointer ${
          activePopover === "wifi" ? "bg-amber-500/20 text-amber-300" : "text-foreground/80 hover:text-amber-400"
        }`}
        title={`Wi-Fi: ${wifiEnabled ? connectedWifi : "Off"}`}
      >
        {wifiEnabled ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {/* 2. Bluetooth Button */}
      <button
        type="button"
        onClick={() => togglePopover("bluetooth")}
        className={`p-1 rounded hover:bg-amber-500/10 transition-colors cursor-pointer ${
          activePopover === "bluetooth" ? "bg-amber-500/20 text-amber-300" : "text-foreground/80 hover:text-amber-400"
        }`}
        title={`Bluetooth: ${bluetoothEnabled ? "On" : "Off"}`}
      >
        {bluetoothEnabled ? (
          <Bluetooth className="w-3.5 h-3.5 text-sky-400" />
        ) : (
          <BluetoothOff className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* 3. Audio / Volume Button */}
      <button
        type="button"
        onClick={() => togglePopover("audio")}
        className={`p-1 rounded hover:bg-amber-500/10 transition-colors cursor-pointer ${
          activePopover === "audio" ? "bg-amber-500/20 text-amber-300" : "text-foreground/80 hover:text-amber-400"
        }`}
        title={`Volume: ${isMuted ? "Muted" : `${volume}%`}`}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
        )}
      </button>

      {/* Divider */}
      <div className="text-border/80 text-xs px-0.5">|</div>

      {/* 4. Clickable macOS-style Time/Date area */}
      <button
        type="button"
        data-time-trigger
        onClick={onToggleNotificationCenter}
        className="flex items-center gap-1.5 bg-background/50 hover:bg-amber-500/10 px-2 py-0.5 border border-border/50 hover:border-amber-500/50 text-foreground font-semibold min-w-[130px] justify-center transition-all duration-200 cursor-pointer rounded-none group relative"
        title="Click for Notification Center"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
        {time ? (
          <>
            <span>{date}</span>
            <span className="text-amber-600 dark:text-amber-400">{time}</span>
          </>
        ) : (
          <span className="text-muted-foreground">--:--:--</span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border-2 border-background" />
        )}
      </button>

      {/* --- POPOVERS --- */}

      {/* Wi-Fi Popover */}
      {activePopover === "wifi" && (
        <div className="absolute top-8 right-24 z-50 w-64 p-3 bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Wi-Fi Network</span>
            </div>
            <ToggleSwitch
              checked={wifiEnabled}
              onChange={(val) => setWifiEnabled(val)}
              activeColor="bg-emerald-500"
            />
          </div>

          {wifiEnabled ? (
            <div className="space-y-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-between text-[11px]">
                <div className="truncate">
                  <div className="font-bold text-emerald-400">{connectedWifi}</div>
                  <div className="text-[10px] text-muted-foreground">IP: {SYSTEM_CONFIG.localIp} • 433 Mbps</div>
                </div>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>

              <div className="text-[10px] font-bold text-muted-foreground uppercase pt-1">
                AVAILABLE NETWORKS
              </div>
              <div className="space-y-1">
                {wifiNetworks.map((net) => (
                  <button
                    key={net.ssid}
                    type="button"
                    onClick={() => handleConnectWifi(net.ssid)}
                    className={`w-full p-2 text-left rounded flex items-center justify-between text-xs transition-colors ${
                      net.connected
                        ? "bg-amber-500/15 text-amber-300 font-bold"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <span>{net.ssid}</span>
                    <span className="text-[10px] text-muted-foreground">{net.signal}%</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">Wi-Fi is turned off</div>
          )}
        </div>
      )}

      {/* Bluetooth Popover */}
      {activePopover === "bluetooth" && (
        <div className="absolute top-8 right-16 z-50 w-64 p-3 bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Bluetooth className="w-4 h-4 text-sky-400" />
              <span>Bluetooth</span>
            </div>
            <ToggleSwitch
              checked={bluetoothEnabled}
              onChange={(val) => setBluetoothEnabled(val)}
              activeColor="bg-sky-500"
            />
          </div>

          {bluetoothEnabled ? (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                DEVICES
              </div>
              <div className="space-y-1">
                {btDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-2 bg-background/50 border border-border/40 rounded flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <div className="font-semibold text-foreground">{dev.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {dev.connected ? "Connected" : "Not Connected"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleBtDevice(dev.id)}
                      className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                        dev.connected
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {dev.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">Bluetooth is turned off</div>
          )}
        </div>
      )}

      {/* Audio Popover */}
      {activePopover === "audio" && (
        <div className="absolute top-8 right-8 z-50 w-64 p-3 bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Sound & Audio</span>
            </div>
            <button
              type="button"
              onClick={() => onVolumeChange?.(volume, !isMuted)}
              className={`px-2 py-0.5 text-[10px] rounded border font-semibold ${
                isMuted ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-muted text-foreground border-border"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Master Volume</span>
              <span className="font-bold text-amber-400 tabular-nums">{isMuted ? "Muted" : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange?.(Number(e.target.value), false)}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-muted rounded-lg"
            />

            {/* Audio Output Device Selection List */}
            <div className="text-[10px] font-bold text-muted-foreground uppercase pt-1 border-t border-border/40">
              OUTPUT DEVICE
            </div>
            <div className="space-y-1">
              {[
                { id: "Built-in Speakers", name: "Built-in Speakers" },
                { id: "AirPods Pro (Bluetooth)", name: "AirPods Pro (Bluetooth)" },
                { id: "Headphones (3.5mm Jack)", name: "Headphones (3.5mm Jack)" },
              ].map((dev) => {
                const isSelected = outputDevice === dev.id;
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => setOutputDevice(dev.id)}
                    className={`w-full p-2 text-left rounded flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 text-amber-300 font-bold border border-amber-500/40"
                        : "hover:bg-muted/60 text-foreground border border-transparent"
                    }`}
                  >
                    <span className="truncate">{dev.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

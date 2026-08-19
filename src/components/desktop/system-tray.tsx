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
  Volume1,
  Check,
  Lock,
  Headphones,
  Keyboard,
  Mouse,
  Speaker,
  Settings,
  Shield,
  Radio,
  ExternalLink,
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

interface WifiNetworkItem {
  ssid: string;
  signal: number;
  secured: boolean;
  connected: boolean;
}

interface BluetoothDeviceItem {
  id: string;
  name: string;
  type: string;
  connected: boolean;
  battery?: number;
}

function ToggleSwitch({
  checked,
  onChange,
  activeColor,
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
      style={checked ? { backgroundColor: activeColor || "var(--primary)" } : {}}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? (activeColor ? "" : "bg-primary") : "bg-muted/80"
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

  // 1. Wi-Fi State
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [connectedWifi, setConnectedWifi] = useState(
    SYSTEM_CONFIG.defaultWifiNetworks[0]?.ssid || "OpenBSD-5G"
  );
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetworkItem[]>(() => [
    ...SYSTEM_CONFIG.defaultWifiNetworks,
  ]);
  const [connectingSsid, setConnectingSsid] = useState<string | null>(null);

  // 2. Bluetooth State
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [btDevices, setBtDevices] = useState<BluetoothDeviceItem[]>([
    { id: "1", name: "AirPods Pro", type: "audio", connected: true, battery: 95 },
    { id: "2", name: "Keychron K2 Keyboard", type: "input", connected: true, battery: 80 },
    { id: "3", name: "MX Master 3S Mouse", type: "input", connected: false, battery: 65 },
  ]);

  // 3. Audio Output Device State
  const [outputDevice, setOutputDevice] = useState(
    SYSTEM_CONFIG.defaultAudioOutputDevices[0] || "Built-in Speakers"
  );

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
    if (ssid === connectedWifi) return;
    setConnectingSsid(ssid);
    setTimeout(() => {
      setConnectedWifi(ssid);
      setWifiNetworks((prev) =>
        prev.map((n) => ({ ...n, connected: n.ssid === ssid }))
      );
      setConnectingSsid(null);
    }, 600);
  };

  const handleDisconnectWifi = () => {
    setConnectedWifi("");
    setWifiNetworks((prev) =>
      prev.map((n) => ({ ...n, connected: false }))
    );
  };

  const handleToggleBtDevice = (id: string) => {
    setBtDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
  };

  const handleOpenSettings = (appSection?: string) => {
    setActivePopover(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-app", {
          detail: { appId: "settings" },
        })
      );
    }
  };

  const getDeviceIcon = (name: string, type: string) => {
    if (name.includes("AirPods") || name.includes("Headphones") || type === "audio") {
      return Headphones;
    }
    if (name.includes("Keyboard")) {
      return Keyboard;
    }
    if (name.includes("Mouse")) {
      return Mouse;
    }
    return Radio;
  };

  return (
    <div ref={trayRef} className="relative flex items-center gap-1 text-xs font-mono select-none">
      {/* 1. Wi-Fi Button */}
      <button
        type="button"
        onClick={() => togglePopover("wifi")}
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          activePopover === "wifi"
            ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/40"
            : "text-foreground/80 hover:text-primary hover:bg-primary/10"
        }`}
        title={`Wi-Fi: ${wifiEnabled ? (connectedWifi || "Connected") : "Off"}`}
      >
        {wifiEnabled ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* 2. Bluetooth Button */}
      <button
        type="button"
        onClick={() => togglePopover("bluetooth")}
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          activePopover === "bluetooth"
            ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/40"
            : "text-foreground/80 hover:text-primary hover:bg-primary/10"
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
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          activePopover === "audio"
            ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/40"
            : "text-foreground/80 hover:text-primary hover:bg-primary/10"
        }`}
        title={`Volume: ${isMuted || volume === 0 ? "Muted" : `${volume}%`}`}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
        ) : volume < 50 ? (
          <Volume1 className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-primary" />
        )}
      </button>

      {/* Divider */}
      <div className="text-border/80 text-xs px-0.5">|</div>

      {/* 4. Clickable macOS-style Time/Date area */}
      <button
        type="button"
        data-time-trigger
        onClick={onToggleNotificationCenter}
        className="flex items-center gap-1.5 bg-background/50 hover:bg-primary/10 px-1.5 sm:px-2 py-0.5 border border-border/50 hover:border-primary/50 text-foreground font-semibold min-w-0 sm:min-w-[130px] justify-center transition-all duration-200 cursor-pointer rounded-none group relative"
        title="Click for Notification & Control Center"
      >
        <Clock className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
        {time ? (
          <>
            <span>{date}</span>
            <span className="text-primary font-bold">{time}</span>
          </>
        ) : (
          <span className="text-muted-foreground">--:--:--</span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse border-2 border-background" />
        )}
      </button>

      {/* ==================== 1. REFINED WI-FI POPOVER ==================== */}
      {activePopover === "wifi" && (
        <div className="absolute top-9 right-0 z-[60] w-72 sm:w-80 p-3.5 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs">Wi-Fi Network</div>
                <div className="text-[10px] text-muted-foreground font-normal">
                  {wifiEnabled ? (connectedWifi ? "Connected" : "Scanning...") : "Disabled"}
                </div>
              </div>
            </div>
            <ToggleSwitch
              checked={wifiEnabled}
              onChange={(val) => setWifiEnabled(val)}
              activeColor="bg-emerald-500"
            />
          </div>

          {wifiEnabled ? (
            <div className="space-y-2.5">
              {/* Active Connection Card */}
              {connectedWifi ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-xs">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>{connectedWifi}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      WPA3 Secured
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>IP: {SYSTEM_CONFIG.localIp}</span>
                    <span>Speed: 433 Mbps</span>
                    <button
                      type="button"
                      onClick={handleDisconnectWifi}
                      className="text-red-400 hover:text-red-300 font-semibold cursor-pointer underline"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-background/50 border border-border/40 rounded-xl text-center text-[11px] text-muted-foreground">
                  No active network connected
                </div>
              )}

              {/* Available Networks List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                  AVAILABLE NETWORKS
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                  {wifiNetworks.map((net) => {
                    const isCurrent = connectedWifi === net.ssid;
                    const isConnecting = connectingSsid === net.ssid;

                    return (
                      <button
                        key={net.ssid}
                        type="button"
                        onClick={() => handleConnectWifi(net.ssid)}
                        disabled={isCurrent || isConnecting}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-primary/15 text-primary font-bold border border-primary/40"
                            : isConnecting
                            ? "bg-muted/70 text-foreground animate-pulse border border-border/60"
                            : "hover:bg-muted/60 text-foreground border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Wifi className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{net.ssid}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {net.secured && <Lock className="w-3 h-3 text-muted-foreground/80" />}
                          <span className="text-[10px] text-muted-foreground">{net.signal}%</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Shortcut */}
              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => handleOpenSettings("wifi")}
                  className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Wi-Fi Settings...</span>
                </button>
                <span className="text-muted-foreground">Interface: em0</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs space-y-1">
              <WifiOff className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">Wi-Fi is Turned Off</p>
              <p className="text-[10px]">Enable Wi-Fi to scan and join wireless networks.</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. REFINED BLUETOOTH POPOVER ==================== */}
      {activePopover === "bluetooth" && (
        <div className="absolute top-9 right-0 z-[60] w-72 sm:w-80 p-3.5 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
                <Bluetooth className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs">Bluetooth</div>
                <div className="text-[10px] text-muted-foreground font-normal">
                  {bluetoothEnabled ? "Discoverable as openbsd.local" : "Disabled"}
                </div>
              </div>
            </div>
            <ToggleSwitch
              checked={bluetoothEnabled}
              onChange={(val) => setBluetoothEnabled(val)}
              activeColor="bg-sky-500"
            />
          </div>

          {bluetoothEnabled ? (
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                PAIRED DEVICES
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {btDevices.map((dev) => {
                  const DeviceIcon = getDeviceIcon(dev.name, dev.type);

                  return (
                    <div
                      key={dev.id}
                      className="p-2.5 bg-background/50 border border-border/40 rounded-xl flex items-center justify-between text-xs transition-colors hover:border-border"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`p-1.5 rounded-lg ${dev.connected ? "bg-sky-500/15 text-sky-400" : "bg-muted text-muted-foreground"}`}>
                          <DeviceIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-foreground text-xs truncate">
                            {dev.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${dev.connected ? "bg-emerald-400" : "bg-muted-foreground/50"}`} />
                            <span>{dev.connected ? "Connected" : "Disconnected"}</span>
                            {dev.battery && dev.connected && (
                              <span>• {dev.battery}% Battery</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBtDevice(dev.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          dev.connected
                            ? "bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30"
                            : "bg-muted text-foreground border-border hover:bg-muted/80"
                        }`}
                      >
                        {dev.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer Shortcut */}
              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px]">
                <button
                  type="button"
                  onClick={() => handleOpenSettings("bluetooth")}
                  className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Bluetooth Settings...</span>
                </button>
                <span className="text-muted-foreground">BT 5.3 Ready</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs space-y-1">
              <BluetoothOff className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">Bluetooth is Turned Off</p>
              <p className="text-[10px]">Turn on Bluetooth to connect accessories and audio devices.</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. REFINED AUDIO & VOLUME POPOVER ==================== */}
      {activePopover === "audio" && (
        <div className="absolute top-9 right-0 z-[60] w-72 sm:w-80 p-3.5 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs">Sound & Master Audio</div>
                <div className="text-[10px] text-muted-foreground font-normal">
                  {isMuted ? "Muted" : `${volume}% Volume`}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onVolumeChange?.(volume, !isMuted)}
              className={`px-2.5 py-1 text-[10px] rounded-lg border font-bold transition-all cursor-pointer ${
                isMuted
                  ? "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30"
                  : "bg-muted text-foreground border-border hover:bg-muted/80"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="p-3 bg-background/50 border border-border/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                )}
                <span>Master Output</span>
              </span>
              <span className="font-bold text-primary tabular-nums">
                {isMuted ? "0%" : `${volume}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange?.(Number(e.target.value), false)}
              style={{ accentColor: "var(--primary)" }}
              className="w-full cursor-pointer h-2 bg-muted rounded-lg"
            />
          </div>

          {/* Output Device Selector List */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-1">
              SELECT OUTPUT DEVICE
            </div>
            <div className="space-y-1">
              {SYSTEM_CONFIG.defaultAudioOutputDevices.map((devName) => {
                const isSelected = outputDevice === devName;
                const DeviceIcon = devName.includes("AirPods")
                  ? Headphones
                  : devName.includes("Headphones")
                  ? Headphones
                  : Speaker;

                return (
                  <button
                    key={devName}
                    type="button"
                    onClick={() => setOutputDevice(devName)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 text-primary font-bold border border-primary/40 shadow-sm"
                        : "hover:bg-muted/60 text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <DeviceIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{devName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Shortcut */}
          <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={() => handleOpenSettings("sound")}
              className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Sound Settings...</span>
            </button>
            <span className="text-muted-foreground">Stereo 48kHz</span>
          </div>
        </div>
      )}
    </div>
  );
}

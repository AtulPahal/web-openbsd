export interface SystemConfig {
  readonly name: string;
  readonly osVersion: string;
  readonly desktopVersion: string;
  readonly architecture: string;
  readonly hostname: string;
  readonly username: string;
  readonly userFullName: string;
  readonly home: string;
  readonly shell: string;
  readonly path: string;
  readonly terminal: string;
  readonly localIp: string;
  readonly loginPassword: string;
  readonly wallpaper: string;
  readonly website: string;
  readonly browserHome: string;
  readonly userAgent: string;
  readonly productTitle: string;
  readonly productDescription: string;
  readonly userEmail: string;
  readonly userPhone: string;
  readonly userLocation: string;
  readonly defaultWifiNetworks: ReadonlyArray<{
    ssid: string;
    signal: number;
    secured: boolean;
    connected: boolean;
  }>;
  readonly defaultBluetoothDevices: ReadonlyArray<{
    id: string;
    name: string;
    type: string;
    connected: boolean;
  }>;
  readonly defaultAudioOutputDevices: ReadonlyArray<string>;
}

export const SYSTEM_CONFIG: SystemConfig = {
  name: "OpenBSD",
  osVersion: "7.5",
  desktopVersion: "7.6-web",
  architecture: "amd64",
  hostname: "openbsd.local",
  username: "atulpahal",
  userFullName: "Atul Pahal",
  home: "/home/atulpahal",
  shell: "/bin/ksh",
  path: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin",
  terminal: "kitty",
  localIp: "10.0.0.2",
  // Demo-only client-side value
  loginPassword: "2026",
  wallpaper: "/wallpaper.jpg",
  website: "https://github.com/AtulPahal",
  browserHome: "https://github.com/AtulPahal",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  productTitle: "openBSD-Portfolio",
  productDescription:
    "Portfolio of Atul Pahal — AI/ML Engineer & Full-Stack Developer building browser-native AI apps",
  userEmail: "atulpahal@gmail.com",
  userPhone: "+91-9499190701",
  userLocation: "Sonipat, Haryana, India",
  defaultWifiNetworks: [
    { ssid: "OpenBSD-5G", signal: 98, secured: true, connected: true },
    { ssid: "Atul_Home_Fiber", signal: 85, secured: true, connected: false },
    { ssid: "Drone_Tech_Lab", signal: 60, secured: true, connected: false },
    { ssid: "Guest_WiFi_Free", signal: 45, secured: false, connected: false },
  ],
  defaultBluetoothDevices: [
    { id: "1", name: "AirPods Pro", type: "audio", connected: true },
    { id: "2", name: "Keychron K2 Keyboard", type: "input", connected: true },
    { id: "3", name: "MX Master 3S Mouse", type: "input", connected: false },
  ],
  defaultAudioOutputDevices: [
    "Built-in Speakers",
    "AirPods Pro (Bluetooth)",
    "Headphones (3.5mm Jack)",
  ],
} as const;

export const SYSTEM_PATHS = {
  home: SYSTEM_CONFIG.home,
  documents: `${SYSTEM_CONFIG.home}/Documents`,
  downloads: `${SYSTEM_CONFIG.home}/Downloads`,
  music: `${SYSTEM_CONFIG.home}/Music`,
  videos: `${SYSTEM_CONFIG.home}/Videos`,
  root: "/",
} as const;

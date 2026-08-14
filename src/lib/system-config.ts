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
}

export const SYSTEM_CONFIG = {
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
  terminal: "xterm-256color",
  localIp: "10.0.0.2",
  // Demo-only client-side value; this is not a security boundary.
  loginPassword: "2026",
  wallpaper: "/wallpaper.jpg",
  website: "https://github.com/atulpahal",
  browserHome: "https://github.com/atulpahal",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  productTitle: "Atul Pahal | AI/ML Engineer & Developer",
  productDescription:
    "Portfolio of Atul Pahal — AI/ML Engineer & Full-Stack Developer building browser-native AI apps",
  userEmail: "atulpahal@gmail.com",
  userPhone: "+91-9499190701",
  userLocation: "Sonipat, Haryana, India",
} as const satisfies SystemConfig;

export const SYSTEM_PATHS = {
  home: SYSTEM_CONFIG.home,
  documents: `${SYSTEM_CONFIG.home}/Documents`,
  downloads: `${SYSTEM_CONFIG.home}/Downloads`,
  music: `${SYSTEM_CONFIG.home}/Music`,
  videos: `${SYSTEM_CONFIG.home}/Videos`,
  root: "/",
} as const;

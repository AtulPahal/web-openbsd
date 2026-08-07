export interface SystemConfig {
  readonly name: string;
  readonly osVersion: string;
  readonly desktopVersion: string;
  readonly architecture: string;
  readonly hostname: string;
  readonly username: string;
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
}

export const SYSTEM_CONFIG = {
  name: "OpenBSD",
  osVersion: "7.5",
  desktopVersion: "7.6-web",
  architecture: "amd64",
  hostname: "openbsd.local",
  username: "user",
  home: "/home/user",
  shell: "/bin/ksh",
  path: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin",
  terminal: "xterm-256color",
  localIp: "10.0.0.2",
  // Demo-only client-side value; this is not a security boundary.
  loginPassword: "2026",
  wallpaper: "/wallpaper.jpg",
  website: "https://www.openbsd.org",
  browserHome: "https://en.wikipedia.org/wiki/OpenBSD",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  productTitle: "OpenBSD Web Desktop",
  productDescription: "An OpenBSD-inspired desktop environment in your browser",
} as const satisfies SystemConfig;

export const SYSTEM_PATHS = {
  home: SYSTEM_CONFIG.home,
  documents: `${SYSTEM_CONFIG.home}/Documents`,
  downloads: `${SYSTEM_CONFIG.home}/Downloads`,
  music: `${SYSTEM_CONFIG.home}/Music`,
  videos: `${SYSTEM_CONFIG.home}/Videos`,
  root: "/",
} as const;

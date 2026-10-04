/**
 * Rice Desktop Theme Configuration
 * Built with the user's curated 6 aesthetic wallpapers and dynamic theme palettes.
 */

export interface RiceTheme {
  id: string;
  name: string;
  wallpaper: string;
  thumb: string;
  mode: "light" | "dark";
  accent: string;
  accentSecondary: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  textMuted: string;
  pillBg: string;
  barBg: string;
}

export const RICE_THEMES: Record<string, RiceTheme> = {
  "cyber-game-over": {
    id: "cyber-game-over",
    name: "Cyber Game Over",
    wallpaper: "/wallpapers/cyber-game-over.jpg",
    thumb: "/wallpapers/thumbs/cyber-game-over.jpg",
    mode: "dark",
    accent: "#38bdf8", // Electric Cyan
    accentSecondary: "#2563eb",
    cardBg: "rgba(11, 15, 25, 0.85)",
    cardBorder: "rgba(56, 189, 248, 0.25)",
    textColor: "#f0f9ff",
    textMuted: "#7dd3fc",
    pillBg: "rgba(15, 23, 42, 0.9)",
    barBg: "rgba(11, 15, 25, 0.92)",
  },
  "frieren-azure": {
    id: "frieren-azure",
    name: "Frieren Azure",
    wallpaper: "/wallpapers/frieren-azure.jpg",
    thumb: "/wallpapers/thumbs/frieren-azure.jpg",
    mode: "light",
    accent: "#0284c7", // Sky Azure Blue
    accentSecondary: "#d97706",
    cardBg: "rgba(255, 255, 255, 0.88)",
    cardBorder: "rgba(2, 132, 199, 0.2)",
    textColor: "#0c4a6e",
    textMuted: "#0284c7",
    pillBg: "rgba(255, 255, 255, 0.92)",
    barBg: "rgba(240, 249, 255, 0.9)",
  },
  "heterochromia-dolls": {
    id: "heterochromia-dolls",
    name: "Heterochromia Dolls",
    wallpaper: "/wallpapers/heterochromia-dolls.jpg",
    thumb: "/wallpapers/thumbs/heterochromia-dolls.jpg",
    mode: "dark",
    accent: "#ef4444", // Ruby Eye Crimson
    accentSecondary: "#3b82f6",
    cardBg: "rgba(18, 18, 24, 0.86)",
    cardBorder: "rgba(239, 68, 68, 0.25)",
    textColor: "#f8fafc",
    textMuted: "#94a3b8",
    pillBg: "rgba(20, 20, 30, 0.92)",
    barBg: "rgba(14, 14, 20, 0.92)",
  },
  "dual-gaze": {
    id: "dual-gaze",
    name: "Dual Gaze",
    wallpaper: "/wallpapers/dual-gaze.png",
    thumb: "/wallpapers/thumbs/dual-gaze.png",
    mode: "dark",
    accent: "#38bdf8", // Luminous Cyan
    accentSecondary: "#f43f5e",
    cardBg: "rgba(14, 22, 36, 0.85)",
    cardBorder: "rgba(56, 189, 248, 0.22)",
    textColor: "#f0f9ff",
    textMuted: "#93c5fd",
    pillBg: "rgba(15, 23, 42, 0.9)",
    barBg: "rgba(10, 17, 30, 0.9)",
  },
  "golden-rose-yor": {
    id: "golden-rose-yor",
    name: "Golden Rose Yor",
    wallpaper: "/wallpapers/golden-rose-yor.png",
    thumb: "/wallpapers/thumbs/golden-rose-yor.png",
    mode: "dark",
    accent: "#f59e0b", // Warm Antique Gold
    accentSecondary: "#e11d48",
    cardBg: "rgba(28, 19, 24, 0.88)",
    cardBorder: "rgba(245, 158, 11, 0.25)",
    textColor: "#fffbeb",
    textMuted: "#fcd34d",
    pillBg: "rgba(32, 20, 26, 0.92)",
    barBg: "rgba(22, 14, 18, 0.92)",
  },
  "office-roxy": {
    id: "office-roxy",
    name: "Office Roxy",
    wallpaper: "/wallpapers/office-roxy.png",
    thumb: "/wallpapers/thumbs/office-roxy.png",
    mode: "light",
    accent: "#2563eb", // Cobalt Royal Blue
    accentSecondary: "#0284c7",
    cardBg: "rgba(248, 250, 252, 0.9)",
    cardBorder: "rgba(37, 99, 235, 0.18)",
    textColor: "#1e293b",
    textMuted: "#64748b",
    pillBg: "rgba(255, 255, 255, 0.92)",
    barBg: "rgba(241, 245, 249, 0.92)",
  },
};

export const DEFAULT_RICE_THEME = RICE_THEMES["golden-rose-yor"];

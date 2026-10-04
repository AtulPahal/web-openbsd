/**
 * Rice Desktop Theme Configuration
 * Faithfully mirrors the aesthetic Linux/Wayland rice shown in the reference screenshots.
 */

export interface RiceTheme {
  id: string;
  name: string;
  wallpaper: string;
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
  "white-sanctuary": {
    id: "white-sanctuary",
    name: "White Sanctuary",
    wallpaper: "/wallpapers/white-sanctuary.png",
    mode: "light",
    accent: "#0d9488", // Teal / Emerald
    accentSecondary: "#14b8a6",
    cardBg: "rgba(255, 255, 255, 0.82)",
    cardBorder: "rgba(0, 0, 0, 0.08)",
    textColor: "#0f172a",
    textMuted: "#64748b",
    pillBg: "rgba(255, 255, 255, 0.9)",
    barBg: "rgba(255, 255, 255, 0.85)",
  },
  "gothic-atelier": {
    id: "gothic-atelier",
    name: "Gothic Atelier",
    wallpaper: "/wallpapers/gothic-atelier.png",
    mode: "dark",
    accent: "#60a5fa", // Ice Blue
    accentSecondary: "#38bdf8",
    cardBg: "rgba(15, 23, 42, 0.8)",
    cardBorder: "rgba(255, 255, 255, 0.12)",
    textColor: "#f8fafc",
    textMuted: "#94a3b8",
    pillBg: "rgba(15, 23, 42, 0.9)",
    barBg: "rgba(10, 15, 30, 0.88)",
  },
  "night-train": {
    id: "night-train",
    name: "Night Train",
    wallpaper: "/wallpapers/night-train.png",
    mode: "dark",
    accent: "#f43f5e", // Rose / Pink
    accentSecondary: "#fb7185",
    cardBg: "rgba(26, 18, 38, 0.82)",
    cardBorder: "rgba(244, 63, 94, 0.22)",
    textColor: "#fdf2f8",
    textMuted: "#d4a5b8",
    pillBg: "rgba(28, 18, 42, 0.92)",
    barBg: "rgba(18, 12, 30, 0.9)",
  },
  "crimson-carnival": {
    id: "crimson-carnival",
    name: "Crimson Carnival",
    wallpaper: "/wallpapers/crimson-carnival.png",
    mode: "dark",
    accent: "#f87171", // Coral / Red
    accentSecondary: "#ef4444",
    cardBg: "rgba(34, 18, 18, 0.85)",
    cardBorder: "rgba(239, 68, 68, 0.25)",
    textColor: "#fff1f2",
    textMuted: "#fda4af",
    pillBg: "rgba(38, 16, 16, 0.92)",
    barBg: "rgba(24, 10, 10, 0.9)",
  },
  "pastel-mirror": {
    id: "pastel-mirror",
    name: "Pastel Mirror",
    wallpaper: "/wallpapers/pastel-mirror.png",
    mode: "light",
    accent: "#b45309", // Warm Amber
    accentSecondary: "#f59e0b",
    cardBg: "rgba(255, 248, 252, 0.88)",
    cardBorder: "rgba(217, 119, 6, 0.15)",
    textColor: "#292524",
    textMuted: "#78716c",
    pillBg: "rgba(255, 250, 252, 0.92)",
    barBg: "rgba(255, 245, 250, 0.9)",
  },
  "carousel-dream": {
    id: "carousel-dream",
    name: "Carousel Dream",
    wallpaper: "/wallpapers/carousel-dream.png",
    mode: "light",
    accent: "#7c3aed", // Lilac / Purple
    accentSecondary: "#a855f7",
    cardBg: "rgba(255, 250, 255, 0.85)",
    cardBorder: "rgba(124, 58, 237, 0.15)",
    textColor: "#1e1b4b",
    textMuted: "#6b7280",
    pillBg: "rgba(255, 252, 255, 0.92)",
    barBg: "rgba(252, 248, 255, 0.9)",
  },
};

export const DEFAULT_RICE_THEME = RICE_THEMES["white-sanctuary"];

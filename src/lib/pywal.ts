"use client";

import { SYSTEM_CONFIG } from "@/lib/system-config";

/** Pywal-compatible palette data. Browser extraction is not the Python pywal CLI. */
export interface PywalPalette {
  wallpaper: string;
  special: { background: string; foreground: string; cursor: string; accent: string; accentSecondary: string };
  colors: Record<`color${number}`, string>;
}

const paletteCache = new Map<string, Promise<PywalPalette>>();

export function getSavedWallpaper(): string {
  try { return localStorage.getItem("desktop_wallpaper") || SYSTEM_CONFIG.wallpaper; } catch { return SYSTEM_CONFIG.wallpaper; }
}

export function getSavedDarkMode(): boolean {
  try { return localStorage.getItem("desktop_dark_mode") !== "false"; } catch { return true; }
}

export function getSavedPywalTheme(): PywalPalette | null {
  try {
    const value = JSON.parse(localStorage.getItem("pywal_palette") || "null") as PywalPalette | null;
    if (!value || typeof value.wallpaper !== "string" || !value.special || !value.colors) return null;
    const colors = [value.special.background, value.special.foreground, value.special.cursor, value.special.accent, value.special.accentSecondary, ...Array.from({ length: 16 }, (_, index) => value.colors[`color${index}`])];
    return colors.every((color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)) ? value : null;
  } catch { return null; }
}

export function applyPywalTheme(palette: PywalPalette, dark = getSavedDarkMode()) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  const background = dark ? palette.special.background : palette.special.foreground;
  const foreground = dark ? palette.special.foreground : palette.special.background;
  const accent = palette.special.accent;
  const rgb = accent.match(/\w\w/g)!.map((component) => parseInt(component, 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  const onAccent = luminance > 0.179 ? "#000000" : "#ffffff";
  const variables: Record<string, string> = {
    background, foreground, primary: accent, "primary-foreground": onAccent,
    accent, "accent-foreground": onAccent, ring: accent, "accent-color": accent,
    "accent-glow": `${accent}4d`, "accent-secondary": palette.special.accentSecondary,
    card: `${background}e6`, "card-foreground": foreground,
    popover: `${background}eb`, "popover-foreground": foreground,
    muted: `${foreground}14`, "muted-foreground": `color-mix(in srgb, ${foreground} 75%, ${background})`,
    secondary: `${foreground}1a`, "secondary-foreground": foreground,
    border: `${foreground}30`, input: `${foreground}30`, "card-border": `${accent}55`,
    sidebar: `${background}eb`, "sidebar-foreground": foreground,
    "sidebar-primary": accent, "sidebar-primary-foreground": onAccent,
    "sidebar-ring": accent, "sidebar-border": `${foreground}30`,
    "sidebar-accent": `${accent}26`, "sidebar-accent-foreground": foreground,
    "pywal-bg": palette.special.background, "pywal-fg": palette.special.foreground,
  };
  for (let index = 1; index <= 5; index++) variables[`chart-${index}`] = palette.colors[`color${index}`];
  for (const [name, color] of Object.entries(variables)) root.style.setProperty(`--${name}`, color);
  for (const [name, color] of Object.entries(palette.colors)) root.style.setProperty(`--${name}`, color);
  try {
    localStorage.setItem("pywal_palette", JSON.stringify(palette));
    localStorage.setItem("desktop_wallpaper", palette.wallpaper);
    localStorage.setItem("desktop_dark_mode", String(dark));
  } catch { /* Current session still works when storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent("pywal-palette-change", { detail: { palette, isDark: dark } }));
}

export async function extractPywalFromImage(imageUrl: string): Promise<PywalPalette> {
  const existing = paletteCache.get(imageUrl);
  if (existing) return existing;
  const { promise, resolve, reject } = Promise.withResolvers<PywalPalette>();
  paletteCache.set(imageUrl, promise);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Wallpaper color extraction is unavailable");
      context.drawImage(image, 0, 0, 96, 96);
      const pixels = context.getImageData(0, 0, 96, 96).data;
      const counts = new Map<number, number>();
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 128) continue;
        const key = (pixels[index] >> 4) * 256 + (pixels[index + 1] >> 4) * 16 + (pixels[index + 2] >> 4);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 64).map(([key, count]) => {
        const rgb = [(key >> 8) * 16 + 8, ((key >> 4) & 15) * 16 + 8, (key & 15) * 16 + 8];
        const max = Math.max(...rgb); const min = Math.min(...rgb);
        return { rgb, count, light: (max + min) / 510, saturation: (max - min) / Math.max(1, max) };
      });
      if (!ranked.length) throw new Error("Wallpaper contains no visible pixels");
      const darkest = [...ranked].sort((a, b) => a.light - b.light)[0].rgb;
      const lightest = [...ranked].sort((a, b) => b.light - a.light)[0].rgb;
      const accents = ranked.filter((color) => color.light > 0.32 && color.light < 0.85).sort((a, b) => (b.saturation * 2 + Math.log(b.count + 1) / 10) - (a.saturation * 2 + Math.log(a.count + 1) / 10));
      const toHex = (rgb: number[]) => `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0")).join("")}`;
      const background = toHex(darkest.map((channel) => channel * 0.35));
      const foreground = toHex(lightest.map((channel) => channel + (255 - channel) * 0.75));
      const accent = toHex((accents[0] ?? ranked[0]).rgb);
      const secondary = toHex((accents.find((color) => color.rgb.some((channel, index) => Math.abs(channel - (accents[0] ?? ranked[0]).rgb[index]) > 64)) ?? accents[1] ?? ranked[0]).rgb);
      const colors: PywalPalette["colors"] = { color0: background, color7: foreground, color8: toHex(darkest.map((channel) => channel * 0.75)), color15: foreground };
      for (let index = 1; index <= 6; index++) {
        const rgb = (accents[(index - 1) % Math.max(1, accents.length)] ?? ranked[(index - 1) % ranked.length]).rgb;
        colors[`color${index}`] = toHex(rgb);
        colors[`color${index + 8}`] = toHex(rgb.map((channel) => channel + (255 - channel) * 0.25));
      }
      resolve({ wallpaper: imageUrl, special: { background, foreground, cursor: accent, accent, accentSecondary: secondary }, colors });
    } catch (error) { paletteCache.delete(imageUrl); reject(error); }
  };
  image.onerror = () => { paletteCache.delete(imageUrl); reject(new Error("Wallpaper could not be loaded for color extraction")); };
  image.src = imageUrl;
  return promise;
}

"use client";

/**
 * Pywal Color Extraction & Dynamic Theming Engine
 * Based on Dylan Araps' pywal (https://github.com/dylanaraps/pywal)
 *
 * Extracts 16 terminal colors, background, foreground, and primary/secondary accents
 * directly from wallpapers and applies them system-wide via CSS custom properties.
 */

export interface PywalPalette {
  wallpaper: string;
  special: {
    background: string;
    foreground: string;
    cursor: string;
    accent: string;
    accentSecondary: string;
  };
  colors: {
    color0: string; // bg
    color1: string; // red
    color2: string; // green
    color3: string; // yellow
    color4: string; // blue
    color5: string; // magenta
    color6: string; // cyan
    color7: string; // white / fg
    color8: string; // bright black
    color9: string; // bright red
    color10: string; // bright green
    color11: string; // bright yellow
    color12: string; // bright blue
    color13: string; // bright magenta
    color14: string; // bright cyan
    color15: string; // bright white
  };
}

/** Pre-computed pywal palettes for the system wallpapers for instant zero-latency startup */
export const DEFAULT_PYWAL_PALETTES: Record<string, PywalPalette> = {
  "golden-rose-yor.png": {
    wallpaper: "golden-rose-yor.png",
    special: {
      background: "#0c0d14",
      foreground: "#fff6eb",
      cursor: "#f59e0b",
      accent: "#f59e0b", // Warm Golden Rose
      accentSecondary: "#e11d48", // Crimson Rose
    },
    colors: {
      color0: "#0c0d14",
      color1: "#e11d48",
      color2: "#10b981",
      color3: "#f59e0b",
      color4: "#38bdf8",
      color5: "#ec4899",
      color6: "#06b6d4",
      color7: "#f1f5f9",
      color8: "#262e3d",
      color9: "#fb7185",
      color10: "#34d399",
      color11: "#fbbf24",
      color12: "#60a5fa",
      color13: "#f472b6",
      color14: "#22d3ee",
      color15: "#ffffff",
    },
  },
  "frieren-azure.jpg": {
    wallpaper: "frieren-azure.jpg",
    special: {
      background: "#070b15",
      foreground: "#f0f9ff",
      cursor: "#38bdf8",
      accent: "#38bdf8", // Sky Azure
      accentSecondary: "#f59e0b",
    },
    colors: {
      color0: "#070b15",
      color1: "#f43f5e",
      color2: "#10b981",
      color3: "#fbbf24",
      color4: "#38bdf8",
      color5: "#a855f7",
      color6: "#06b6d4",
      color7: "#e2e8f0",
      color8: "#1e293b",
      color9: "#fb7185",
      color10: "#34d399",
      color11: "#fde047",
      color12: "#60a5fa",
      color13: "#c084fc",
      color14: "#38bdf8",
      color15: "#ffffff",
    },
  },
  "heterochromia-dolls.jpg": {
    wallpaper: "heterochromia-dolls.jpg",
    special: {
      background: "#0d0e14",
      foreground: "#f8fafc",
      cursor: "#ef4444",
      accent: "#ef4444", // Crimson Ruby
      accentSecondary: "#3b82f6", // Sapphire
    },
    colors: {
      color0: "#0d0e14",
      color1: "#ef4444",
      color2: "#10b981",
      color3: "#f59e0b",
      color4: "#3b82f6",
      color5: "#d946ef",
      color6: "#06b6d4",
      color7: "#e2e8f0",
      color8: "#272733",
      color9: "#f87171",
      color10: "#34d399",
      color11: "#fbbf24",
      color12: "#60a5fa",
      color13: "#e879f9",
      color14: "#22d3ee",
      color15: "#ffffff",
    },
  },
  "cyber-game-over.jpg": {
    wallpaper: "cyber-game-over.jpg",
    special: {
      background: "#07090e",
      foreground: "#f0fdf4",
      cursor: "#22c55e",
      accent: "#38bdf8", // Cyber Neon Cyan
      accentSecondary: "#22c55e",
    },
    colors: {
      color0: "#07090e",
      color1: "#f43f5e",
      color2: "#22c55e",
      color3: "#eab308",
      color4: "#38bdf8",
      color5: "#a855f7",
      color6: "#14b8a6",
      color7: "#e2e8f0",
      color8: "#1e293b",
      color9: "#fb7185",
      color10: "#4ade80",
      color11: "#facc15",
      color12: "#60a5fa",
      color13: "#c084fc",
      color14: "#2dd4bf",
      color15: "#ffffff",
    },
  },
  "dual-gaze.png": {
    wallpaper: "dual-gaze.png",
    special: {
      background: "#0a0e17",
      foreground: "#f0f9ff",
      cursor: "#06b6d4",
      accent: "#06b6d4", // Electric Cyan
      accentSecondary: "#ec4899",
    },
    colors: {
      color0: "#0a0e17",
      color1: "#ec4899",
      color2: "#10b981",
      color3: "#f59e0b",
      color4: "#06b6d4",
      color5: "#8b5cf6",
      color6: "#38bdf8",
      color7: "#f1f5f9",
      color8: "#1e293b",
      color9: "#f472b6",
      color10: "#34d399",
      color11: "#fbbf24",
      color12: "#22d3ee",
      color13: "#a78bfa",
      color14: "#67e8f9",
      color15: "#ffffff",
    },
  },
  "office-roxy.png": {
    wallpaper: "office-roxy.png",
    special: {
      background: "#080d1a",
      foreground: "#f8fafc",
      cursor: "#2563eb",
      accent: "#3b82f6", // Royal Cobalt
      accentSecondary: "#0ea5e9",
    },
    colors: {
      color0: "#080d1a",
      color1: "#f43f5e",
      color2: "#10b981",
      color3: "#fbbf24",
      color4: "#3b82f6",
      color5: "#8b5cf6",
      color6: "#0ea5e9",
      color7: "#f1f5f9",
      color8: "#1e293b",
      color9: "#fb7185",
      color10: "#34d399",
      color11: "#fde047",
      color12: "#60a5fa",
      color13: "#a78bfa",
      color14: "#38bdf8",
      color15: "#ffffff",
    },
  },
  "white-sanctuary.png": {
    wallpaper: "white-sanctuary.png",
    special: {
      background: "#0b0c16",
      foreground: "#faf5ff",
      cursor: "#a855f7",
      accent: "#a855f7", // Violet Sanctuary
      accentSecondary: "#ec4899",
    },
    colors: {
      color0: "#0b0c16",
      color1: "#ec4899",
      color2: "#10b981",
      color3: "#f59e0b",
      color4: "#a855f7",
      color5: "#d946ef",
      color6: "#38bdf8",
      color7: "#f1f5f9",
      color8: "#23243a",
      color9: "#f472b6",
      color10: "#34d399",
      color11: "#fbbf24",
      color12: "#c084fc",
      color13: "#e879f9",
      color14: "#60a5fa",
      color15: "#ffffff",
    },
  },
  "night-train.png": {
    wallpaper: "night-train.png",
    special: {
      background: "#080f14",
      foreground: "#f0fdf4",
      cursor: "#10b981",
      accent: "#10b981", // Emerald Neon
      accentSecondary: "#38bdf8",
    },
    colors: {
      color0: "#080f14",
      color1: "#f43f5e",
      color2: "#10b981",
      color3: "#facc15",
      color4: "#38bdf8",
      color5: "#8b5cf6",
      color6: "#14b8a6",
      color7: "#e2e8f0",
      color8: "#1a2c33",
      color9: "#fb7185",
      color10: "#34d399",
      color11: "#fde047",
      color12: "#60a5fa",
      color13: "#a78bfa",
      color14: "#2dd4bf",
      color15: "#ffffff",
    },
  },
};

export const DEFAULT_PYWAL = DEFAULT_PYWAL_PALETTES["golden-rose-yor.png"];

/**
 * Apply Pywal Palette to DOM root CSS variables
 */
export function applyPywalTheme(palette: PywalPalette) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { special, colors } = palette;

  // 1. Core theme accents
  root.style.setProperty("--primary", special.accent);
  root.style.setProperty("--ring", special.accent);
  root.style.setProperty("--accent", special.accent);
  root.style.setProperty("--accent-color", special.accent);
  root.style.setProperty("--accent-glow", `${special.accent}4d`);
  root.style.setProperty("--accent-secondary", special.accentSecondary);

  // 2. Background and text
  root.style.setProperty("--background", special.background);
  root.style.setProperty("--foreground", special.foreground);
  root.style.setProperty("--card-border", `${special.accent}33`);

  // 3. Pywal 16 Terminal Colors
  Object.entries(colors).forEach(([slot, val]) => {
    root.style.setProperty(`--${slot}`, val);
  });

  // Store in localStorage for instant retrieval across pages
  try {
    localStorage.setItem("pywal_palette", JSON.stringify(palette));
  } catch (e) {}

  // Dispatch event so all listening components update immediately
  window.dispatchEvent(
    new CustomEvent("pywal-palette-change", { detail: { palette } })
  );
}

/**
 * Retrieve saved Pywal Palette from localStorage if available
 */
export function getSavedPywalTheme(): PywalPalette | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pywal_palette");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Extract Pywal Palette dynamically from any wallpaper image using HTML5 Canvas
 */
export async function extractPywalFromImage(imageUrl: string): Promise<PywalPalette> {
  // Check if we have pre-computed palette
  const filename = imageUrl.split("/").pop() || "";
  if (DEFAULT_PYWAL_PALETTES[filename]) {
    return DEFAULT_PYWAL_PALETTES[filename];
  }

  const { promise, resolve } = Promise.withResolvers<PywalPalette>();

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(DEFAULT_PYWAL);
        return;
      }

      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size).data;
      const colorCounts: Record<string, number> = {};

      // Sample pixels with quantization
      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 16) * 16;
        const g = Math.round(imgData[i + 1] / 16) * 16;
        const b = Math.round(imgData[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }

      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([k]) => {
          const [r, g, b] = k.split(",").map(Number);
          return [r, g, b];
        });

      // Pick dominant accent with good saturation
      let bestAccent = [245, 158, 11];
      let maxSat = 0;
      for (const [r, g, b] of sortedColors.slice(0, 20)) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat > maxSat && max > 60 && min < 220) {
          maxSat = sat;
          bestAccent = [r, g, b];
        }
      }

      const toHex = (c: number[]) =>
        `#${c.map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, "0")).join("")}`;

      const accentHex = toHex(bestAccent);
      const bgHex = "#0a0e17";

      const generated: PywalPalette = {
        wallpaper: filename,
        special: {
          background: bgHex,
          foreground: "#f8fafc",
          cursor: accentHex,
          accent: accentHex,
          accentSecondary: "#38bdf8",
        },
        colors: {
          color0: bgHex,
          color1: "#ef4444",
          color2: "#10b981",
          color3: "#f59e0b",
          color4: accentHex,
          color5: "#ec4899",
          color6: "#06b6d4",
          color7: "#e2e8f0",
          color8: "#1e293b",
          color9: "#f87171",
          color10: "#34d399",
          color11: "#fbbf24",
          color12: accentHex,
          color13: "#f472b6",
          color14: "#22d3ee",
          color15: "#ffffff",
        },
      };

      resolve(generated);
    } catch (e) {
      resolve(DEFAULT_PYWAL);
    }
  };

  img.onerror = () => resolve(DEFAULT_PYWAL);
  img.src = imageUrl;

  return promise;
}

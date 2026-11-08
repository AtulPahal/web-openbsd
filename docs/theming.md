# Theming & Pywal Engine

Technical specification for wallpaper color extraction, CSS variable injection, and visual theme persistence implemented in `src/lib/pywal.ts` and `src/lib/rice-theme-config.ts`.

---

## 1. Overview & Heritage

Theming is powered by an in-browser implementation of **Dylan Araps' `pywal`** (https://github.com/dylanaraps/pywal).

Instead of forcing users into rigid themes, the desktop dynamically extracts an authentic 16-color ANSI terminal palette, primary accent, and secondary accent from the current desktop wallpaper using an HTML5 Canvas image quantization pipeline.

---

## 2. Color Extraction Pipeline (`extractPywalFromImage`)

When a wallpaper changes or loads:
1. **Downsampling**: The wallpaper image is drawn onto an in-memory $96 \times 96$ HTML5 Canvas.
2. **Quantization**: 2D pixel data is scanned in 16-level RGB bins to compute frequency density.
3. **Luminance & Saturation Ranking**:
   - Relative luminance:
     $$Y = 0.2126R + 0.7152G + 0.0722B$$
   - Saturation:
     $$S = \frac{\max(R,G,B) - \min(R,G,B)}{\max(1, \max(R,G,B))}$$
4. **Palette Generation**:
   - `--color0` (Darkest tone): Scaled to 35% luminance for deep contrast.
   - `--color7` / `--color15` (Lightest tone): Boosted for high legibility.
   - `--primary` (Dominant Accent): Selected from buckets within $0.32 < L < 0.85$ weighted by $S \times 2 + \frac{\ln(\text{count})}{10}$.
   - `--accent-secondary`: Selected from contrasting chromatic buckets.

---

## 3. CSS Variable Mapping (`applyPywalTheme`)

The generated palette injects variables into `document.documentElement`:

| CSS Custom Property | Value / Derivation | Applied Context |
|---|---|---|
| `--primary` | Extracted dominant accent | Active buttons, focus rings, window highlights |
| `--primary-foreground` | Dynamic `#000000` or `#ffffff` based on $Y > 0.179$ | Button and badge text |
| `--ring` | Same as `--primary` | Accessible focus-visible outlines |
| `--accent-glow` | `var(--primary)` at 30% alpha | Subtle ambient drop shadow on focused windows |
| `--accent-secondary` | Secondary complementary accent | Secondary tags, status badges |
| `--border` | `rgba(255, 255, 255, 0.16)` in dark mode | Hairline borders on windows and cards |
| `--color0` – `--color15` | 16 ANSI terminal colors | Terminal emulator and code blocks |

---

## 4. Curated Rice Themes (`src/lib/rice-theme-config.ts`)

| Theme ID | Name | Mode | Primary Accent | Vibe |
|---|---|---|---|---|
| `golden-rose-yor` | Golden Rose Yor | Dark | `#f59e0b` (Warm Gold) | Elegant gold and rose crimson |
| `frieren-azure` | Frieren Azure | Light | `#0284c7` (Sky Azure) | Ethereal high-key anime aesthetic |
| `heterochromia-dolls`| Heterochromia Dolls | Dark | `#ef4444` (Ruby Crimson) | Moody obsidian with sapphire |
| `cyber-game-over` | Cyber Game Over | Dark | `#38bdf8` (Electric Cyan) | Retro CRT arcade neon |
| `dual-gaze` | Dual Gaze | Dark | `#06b6d4` (Luminous Cyan) | Deep midnight blue with magenta |
| `office-roxy` | Office Roxy | Light | `#2563eb` (Cobalt Royal) | Clean editorial workstation |
| `evil-martians` | Evil Martians | Dark | `#cb009e` (Martian Magenta) | High-contrast Martian developer aesthetic |
| `white-sanctuary` | White Sanctuary | Dark | `#a855f7` (Violet Sanctuary) | Minimalist lavender sanctuary |
| `night-train` | Night Train | Dark | `#10b981` (Emerald Neon) | Atmospheric green neon rail |

# DESIGN.md — OpenBSD Web Desktop Design System
*Inspired by Evil Martians (`evilmartians.com`) via OpenDesignMD*

---

## 1. Design Philosophy

This design system combines **Evil Martians' severe, theatrical developer identity** with **OpenBSD's uncompromising Unix craftsmanship** and **macOS's fluid desktop ergonomics**:

* **Black First, Contrast Driven**: A deep near-black backdrop (`#000000` to `#080c14`) frames every surface. Chrome recedes; content, code, and technical data take center stage.
* **Technical Precision over Ornament**: Sharp hairline borders (`rgba(255, 255, 255, 0.16)`), disciplined 8px (`rounded-lg`) geometry for windows, and zero decorative fluff.
* **Code as a First-Class Citizen**: Syntax and terminal output are styled with mechanical clarity. Code isn't treated as plain text; it has dedicated contrast, geometry, and color syntax.
* **Dynamic Chromatic Voltage**: The interface structure remains neutral and disciplined, while dynamic chromatic accents (extracted from wallpapers via `pywal`) light up active controls, indicators, and charts.

---

## 2. Color System

### Base Surface Ladder (Dark Mode Active)
| Token | Hex / Value | Semantic Role |
|---|---|---|
| `canvas` / `--background` | `#080c14` | Primary viewport backdrop under wallpapers |
| `surface-1` / `--card` | `rgba(16, 20, 30, 0.72)` | Window frames and elevated application cards |
| `surface-popover` / `--popover` | `rgba(16, 20, 30, 0.90)` | Floating topbar, dock, and control center panels |
| `hairline` / `--border` | `rgba(255, 255, 255, 0.16)` | Precise outer window contours and panel borders |
| `specular-rim` | `rgba(255, 255, 255, 0.38)` | Top edge specular highlight simulating frosted acrylic |

### Chromatic Accents (Evil Martians & Pywal Fusion)
| Token | Default Hex | Role |
|---|---|---|
| `accent-primary` | Dynamic (`#f59e0b` default) | Focus rings, active workspace pill, primary action buttons |
| `accent-secondary` | Dynamic (`#e11d48` default) | Secondary indicators, status tags, badges |
| `accent-violet` | `#550098` | Chart segments, technical badges |
| `accent-magenta` | `#CB009E` | Syntax highlights, active status dots |
| `accent-olive` / `emerald` | `#10b981` | Success states, Wi-Fi / power indicators |
| `destructive` / `ruby` | `#ef4444` | Window close button, error states, shutdown highlight |

---

## 3. Typography: Figtree & Monospace Pairing

| Role | Font Family | Weights | Tracking | Usage |
|---|---|---|---|---|
| **UI Headings** | Figtree (`var(--font-figtree)`) | 700 (Bold), 900 (Black) | `-0.02em` | Desktop clock widget, app titles, modal headers |
| **UI Body & Controls** | Figtree (`var(--font-figtree)`) | 400 (Regular), 500 (Medium) | `0em` | Window chrome, settings items, buttons, menus |
| **Labels & Tags** | Figtree (`var(--font-figtree)`) | 600 (Semibold) | `0.05em` | Workspace labels, section uppercase tags, status pills |
| **Terminal & Code** | Monospace (`ui-monospace, SFMono`) | 400, 700 | `0em` | Terminal emulator (`kitty`), virtual-fs paths, code snippets |

### Contrast Tone Hierarchy
All text opacity is dynamically calculated from `var(--foreground)`:
* **High Contrast (`--tone-high`)**: `color-mix(in srgb, var(--foreground) 85%, transparent)`
* **Medium Contrast (`--tone-medium`)**: `color-mix(in srgb, var(--foreground) 70%, transparent)`
* **Low Contrast (`--tone-low`)**: `color-mix(in srgb, var(--foreground) 30%, transparent)`

---

## 4. 3-Tier Spacing Architecture

```
Outer Margins (12px / 16px)
  └── Container Padding (14px / 16px)
        └── Component Gap (4px / 8px / 12px)
```

1. **Tier 1 (Outer Spacing)**: `--space-outer-x: 0.75rem` (12px), `--space-outer-y: 0.625rem` (10px). Controls viewport margins for the topbar, dock, and floating panels.
2. **Tier 2 (Inner Spacing)**: `--space-inner-x: 1rem` (16px), `--space-inner-y: 0.875rem` (14px). Internal padding for windows, control panels, and application dialogs.
3. **Tier 3 (In-between Gaps)**: `--space-gap-xs: 0.25rem` (4px), `--space-gap-sm: 0.5rem` (8px), `--space-gap-md: 0.75rem` (12px).

---

## 5. Geometry & Corner Discipline

* **Application Windows (`liquid-window`)**: Strictly **`rounded-lg` (8px)**. Never use bubbly or oversized corners on windows.
* **Desktop Shell Elements (`topbar`, `dock`, `panels`)**: **`rounded-2xl` (16px)** to emphasize floating ergonomic surfaces.
* **Control Buttons & Toggles**: **`rounded-xl` (12px)** or **`rounded-lg` (8px)** depending on component density.

---

## 6. Frosted Liquid Glass Implementation

```css
.dock-liquid-glass {
  background: var(--popover);
  color: var(--popover-foreground);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid var(--border);
  border-top-color: color-mix(in srgb, var(--foreground) 25%, transparent);
  border-radius: 1rem;
  box-shadow: 
    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.42),
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.35),
    0 25px 60px -10px rgba(0, 0, 0, 0.75),
    0 10px 25px -5px rgba(0, 0, 0, 0.5);
}
```

* **Core Rule**: Frosted glass effects are strictly localized to component containers. Full-screen desktop blur overlays are forbidden during menu interaction to preserve wallpaper fidelity.

# Design System

The visual language of OpenBSD Web Desktop is inspired by classic UNIX workstations, CDE/fvwm/cwm window managers, and CRT terminals. Every design decision prioritizes function over decoration.

## Color Palette

All colors are defined as CSS custom properties in `src/app/globals.css` and consumed via Tailwind utility classes. No raw hex values are used in components.

### Dark Theme (active)

| Token                  | Value                  | Usage                                 |
| ---------------------- | ---------------------- | ------------------------------------- |
| `--background`         | `oklch(0.145 0 0)`    | Desktop and window backgrounds        |
| `--foreground`         | `oklch(0.985 0 0)`    | Primary text                          |
| `--card`               | `oklch(0.205 0 0)`    | Elevated surfaces (panels, cards)     |
| `--card-foreground`    | `oklch(0.985 0 0)`    | Text on elevated surfaces             |
| `--primary`            | `oklch(0.922 0 0)`    | Primary interactive elements          |
| `--primary-foreground` | `oklch(0.205 0 0)`    | Text on primary elements              |
| `--secondary`          | `oklch(0.269 0 0)`    | Secondary surfaces                    |
| `--muted`              | `oklch(0.269 0 0)`    | Disabled/subdued surfaces             |
| `--muted-foreground`   | `oklch(0.708 0 0)`    | Secondary text, timestamps, metadata  |
| `--accent`             | `oklch(0.269 0 0)`    | Hover states, selected items          |
| `--border`             | `oklch(1 0 0 / 10%)`  | Window borders, dividers              |
| `--input`              | `oklch(1 0 0 / 15%)`  | Input field borders                   |
| `--ring`               | `oklch(0.556 0 0)`    | Focus ring                            |
| `--destructive`        | `oklch(0.704 0.191 22.216)` | Error states, close buttons      |

### Amber Accent

The amber/gold accent color is applied contextually for active elements, the terminal cursor, focused window title bars, and interactive highlights. It evokes the phosphor glow of vintage CRT displays.

## Typography

| Font         | Variable               | Usage                          |
| ------------ | ---------------------- | ------------------------------ |
| Geist Sans   | `--font-geist-sans`    | UI labels, menus, title bars   |
| Geist Mono   | `--font-geist-mono`    | Terminal, code, file listings  |

Both fonts are loaded via `next/font/google` in the root layout to eliminate layout shift.

- **Body text:** Geist Sans at the default size
- **Terminal output:** Geist Mono, rendered in the terminal's monospace context
- **File listings:** Geist Mono for alignment of columns (name, size, permissions)
- **Title bars:** Geist Sans, medium weight

## Spacing

The project uses Tailwind's default spacing scale (multiples of 0.25rem / 4px). Key spacing decisions:

| Context               | Value   | Tailwind Class |
| --------------------- | ------- | -------------- |
| Window padding        | 0       | `p-0`          |
| Panel height          | 2.5rem  | `h-10`         |
| Title bar height      | 2rem    | `h-8`          |
| App content padding   | 1rem    | `p-4`          |
| Gap between elements  | 0.5rem  | `gap-2`        |

## Border Radius

```
--radius: 0
```

All windows use sharp corners (border-radius: 0). This is a deliberate design choice that reinforces the utilitarian, CDE-inspired aesthetic. shadcn/ui components inside app content may retain subtle rounding for usability (buttons, inputs), but window chrome is always sharp.

## Window Chrome

The window frame is the most distinctive UI element:

```
┌─────────────────────────────────────────────┐
│ ■ App Name                        ─  □  ×  │  ← Title bar (h-8, solid bg)
├─────────────────────────────────────────────┤
│                                             │
│              App Content                    │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

- **Title bar:** Solid background color, white text, Geist Sans font
- **Window controls:** Minimize (─), maximize (□), close (×) — right-aligned
- **Border:** 1px solid using `--border` token
- **No rounded corners** on the window frame
- **Shadow:** Subtle drop shadow for depth separation
- **Focused window:** Higher z-index, visually distinct title bar (amber accent or brighter background)
- **Drag handle:** Entire title bar is draggable
- **Resize:** Edge/corner drag handles on all sides

## Panel

The panel sits at the bottom (or top) of the desktop:

```
┌─────────────────────────────────────────────┐
│ [Apps]  ·  Terminal  Files  Editor  │ 14:32 │
└─────────────────────────────────────────────┘
```

- **Height:** 2.5rem (h-10)
- **Background:** `--card` token (elevated surface)
- **Border:** Top or bottom 1px solid `--border`
- **App launcher:** Left-aligned, lists running and pinned apps
- **System tray:** Right-aligned, displays clock and status indicators
- **Font:** Geist Sans, small size

## Chart Colors

Used by the System Monitor for CPU/memory graphs:

| Token       | Value              |
| ----------- | ------------------ |
| `--chart-1` | `oklch(0.87 0 0)`  |
| `--chart-2` | `oklch(0.556 0 0)` |
| `--chart-3` | `oklch(0.439 0 0)` |
| `--chart-4` | `oklch(0.371 0 0)` |
| `--chart-5` | `oklch(0.269 0 0)` |

A grayscale palette that maintains the monochrome aesthetic even in data visualization.

# openBSD-Portfolio — Atul Pahal

An interactive, browser-native OpenBSD & macOS-inspired web desktop environment showcasing the AI/ML and full-stack engineering portfolio of **Atul Pahal**. Built with Next.js 16 (Turbopack), React 19, TypeScript 5, Tailwind CSS v4, and Bun.

**Live GitHub Profile:** [https://github.com/AtulPahal](https://github.com/AtulPahal)  
**Login Password:** `2026`

---

## Documentation Index

| Guide | Description |
|---|---|
| **[AGENT.md](AGENT.md)** | Operational guidelines, architectural rules, and engineering standards for AI coding assistants. |
| **[DESIGN.md](DESIGN.md)** | **Evil Martians (`evilmartians.com`)** design system specification, palette tokens, Figtree typography, and liquid glass rules. |
| **[docs/models.md](docs/models.md)** | Mathematical formulas and schemas for AI heuristics (NDVI, Cellular morphology score, Vector cosine similarity), VirtualFS, and spatial models. |
| **[docs/testing.md](docs/testing.md)** | Testing strategy, automated build commands, headless Chromium browser verification scripts, and QA checklist. |
| **[CHANGELOG.md](CHANGELOG.md)** | Complete version history through v0.4.0. |
| **[docs/recent-changes.md](docs/recent-changes.md)** | In-depth log of recent architectural improvements, bug fixes, and security hardening. |

---

## Key Features

### Desktop Shell & Multitasking
- **SDDM-Style Login Screen** — Password-gated entry (`2026`) with live clock and wallpaper. Adapts automatically to the active wallpaper's extracted color palette.
- **4 Virtual Workspaces (1, 2, 3, 4)** — Top bar workspace switcher; windows are isolated per workspace. Background windows stay mounted to preserve form state, terminal history, and media positions.
- **Bottom Liquid Glass Dock** — Floating bottom-centered dock with frosted liquid glass styling, proximity upward fisheye magnification (`origin-bottom`), centered active running indicator dots, and window count badges.
- **Topbar Architecture** —
  - **Left**: Dynamic Nix OS SVG logo adapting its colors to the active theme. Seamlessly attached Power Menu with Shutdown, Lock, Restart, Sleep, and Logout actions.
  - **Center**: Standard 12-hour format clock with `AM`/`PM` and date (`h:mm A • Date`, e.g. `7:15 PM • Monday, Oct 05, 2026`).
  - **Right**: Circular battery ring gauge, circular RAM donut gauge, and unified Control Center & Quick Settings pill button.
- **Control Center & Notification Drawer** — Interactive flyout drawer:
  - **Quick Toggles**: Do Not Disturb (`DND`), simulated Wi-Fi, and simulated Bluetooth.
  - **Theme Toggle**: Switch between Dark Mode and Light Mode.
  - **Sliders**: Master display brightness and 2-way synchronized master sound volume.
  - **Notifications**: Dismissible notification cards with "Clear all" action.
  - **Mini Calendar**: Month calendar with day selection.
- **Dynamic Pywal Theming Engine (`src/lib/pywal.ts`)** — Browser-native Canvas image quantization dynamically extracting 16 terminal colors and primary/secondary accents from wallpapers, persisting choices in `localStorage`.
- **Desktop Context Menu** — Right-click anywhere on the desktop wallpaper to switch themes or launch applications.

---

## Interactive Desktop Applications

| App | Description |
|-----|-------------|
| **AI Studio** | Interactive in-browser machine learning heuristic demonstration studio featuring Multispectral Vegetation Index (NDVI/SAVI), Cellular Morphology Diagnostic Scoring, and 3D Vector Embedding Semantic Matching. |
| **System Settings** | macOS-style settings application with navigation for **Wi-Fi & Network**, **Sound & Audio**, **Displays & Graphics**, **Appearance & Themes** (wallpapers and accent colors), **Notifications**, **Privacy**, **Security**, **Power**, **Storage**, and **System & About**. |
| **Portfolio** | Developer OS dashboard with profile hero header, quick metric cards, interactive contact cards, categorized skills progress bars, project cards, and education timeline. |
| **Calendar** | Modern desktop calendar app with month navigation, chronological event ordering, valid time entry (`type="time"`), schedule agenda, and persistent `localStorage` storage. |
| **System Monitor** | `btop`/`htop` styled monitor with real-time SVG sparkline history charts for CPU, RAM, and Network throughput, process filter, column sorting, and process termination. |
| **Terminal** | `kitty`-styled terminal emulator running against the shared reactive `VirtualFS`. Includes ANSI SGR escape code parsing and commands: `help`, `fastfetch`, `neofetch`, `portfolio`, `resume`, `ls`, `cd`, `cat`, `pwd`, `clear`, `exit`, `wc`, `head`, `tail`, `grep`, `mkdir`, `rm`, `github`, `sysctl`, `ping`. |
| **Text Editor** | In-memory text editor with line numbers, word wrap, cursor position tracking, and transactional save/open against the shared VirtualFS. |
| **File Manager** | Directory tree sidebar, sortable file table, breadcrumb navigation, and multi-app file associations (.txt, .md, .mp3, .wav, .ogg, .mp4, .webm). |
| **Firefox** | Iframe web browser with URL bar, bookmark bar, and an SSRF-hardened proxy route (`/api/proxy`) that validates public IPv4 destinations, caps streaming bodies at 5 MB, and isolates third-party scripts via sandboxed iframes. |
| **Music App** | Local music player scanning `~/Music` for `.mp3`, `.wav`, and `.ogg` files with transport controls, seeking bar, and 2-way master volume synchronization. |
| **mpv Video App** | Media player supporting HTML5 video, YouTube embeds, and drag-and-drop file playback with automatic object URL memory cleanup. |
| **Resume** | Embedded PDF viewer for full resume with download (`/resume.pdf`) and pop-out links. |

---

## Tech Stack

| Technology | Role |
|---|---|
| **Next.js 16** | Framework (App Router & Turbopack) |
| **React 19** | UI Library & Hooks State Management |
| **TypeScript 5** | Strict Type System |
| **Tailwind CSS v4** | Modern CSS Engine & Custom Theme Variables |
| **Figtree** | Primary Variable Typeface (weights 300–900) |
| **shadcn/ui** | UI Primitives |
| **Lucide React** | Vector SVG Icons |
| **Bun** | Fast Runtime & Package Manager |

---

## Getting Started

### Installation & Development

```bash
# Install dependencies using Bun
bun install

# Run Next.js development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in with password `2026`.

### Build & Typecheck

```bash
# Production Build
bun run build

# TypeScript Strict Check
bun run typecheck

# ESLint Linting
bun run lint
```

---

## License

ISC License

---

## Disclaimer

Not affiliated with, endorsed by, or connected to the OpenBSD project or the OpenBSD Foundation. The OpenBSD name and aesthetic are referenced for design inspiration only.

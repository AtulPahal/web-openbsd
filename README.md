# Atul Pahal — Portfolio

An interactive OpenBSD-inspired terminal desktop environment showcasing my AI/ML and full-stack development portfolio. Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Bun.

**Login password:** `2026` (demo only — opens the desktop to explore)

## Screenshots

> Open apps from the panel launcher or right-click the desktop. Launch the **Portfolio** app to see projects/skills/experience, or the **Resume** app to view the full PDF resume.

## What's Here

This isn't a static resume page — it's a *browser-based desktop environment* built as a living showcase of full-stack engineering. Navigate a login screen, window manager, panel, and terminal — all running purely client-side.

### Desktop Shell
- **SDDM-style login screen** — password-gated entry with clock and wallpaper
- **Window manager** — draggable, resizable windows with minimize / maximize / close; z-index stacking and cascade placement
- **Panel taskbar** — app launcher, open-window buttons with active state, system tray
- **System tray** — live clock, PF firewall indicator, hostname chip (now showing your name)
- **Right-click context menu** — launch any app from the desktop

### Portfolio Apps
| App | Description |
|-----|-------------|
| **Portfolio** | Interactive showcase of projects, technical skills, education, certifications, and interests — tabbed interface with project detail view |
| **Resume** | Embedded PDF viewer for the full resume with download and pop-out links |
| **About** | Personal info card with social links, Puffy ASCII art, and tech stack |

### System Apps
| App | Description |
|-----|-------------|
| **Terminal** | ksh-style shell against a virtual filesystem. Run `resume` or `portfolio` commands for quick summaries |
| **File Manager** | Directory tree sidebar, sortable file listing, breadcrumb navigation — includes a `resume.txt` file |
| **Text Editor** | Line numbers, word wrap toggle, cursor position, Ctrl+S save to VirtualFS |
| **System Monitor** | Live process table with simulated CPU/memory jitter, uptime counter, network RX/TX graph |
| **Firefox** | iframe browser with back/forward/reload, proxy mode to bypass X-Frame-Options headers |
| **Music** | Auto-scans `/home/user/Music`, tabular tracklist, prev/next/play/pause controls |
| **Video** | HTML5 video, YouTube embed, drag-and-drop files/URLs, Nerd Font OSC controls |

### Terminal Commands (Portfolio additions)

```
resume          Print contact info, skills, and project summary
portfolio       Print projects, education, and certifications summary
```

All the original OpenBSD-style commands also work (`ls`, `cd`, `cat`, `fastfetch`, `man`, etc.).

## Tech Stack

| Technology    | Version | Role                       |
|---------------|---------|----------------------------|
| Next.js       | 16      | Framework (App Router)     |
| React         | 19      | UI library                 |
| TypeScript    | 5       | Language (strict mode)     |
| Tailwind CSS  | 4       | Styling                    |
| shadcn/ui     | 4       | UI primitives (base-nova)  |
| Lucide React  | 1       | Icons                      |
| Geist         | —       | Typography (Sans + Mono)   |
| **Bun**      | 1.x     | **Runtime & package manager** |

> Developed with **Bun** instead of npm. All dependency management and execution uses `bun`.

## Getting Started

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in with password `2026`.

## Build & Lint

```bash
bun run build     # production build
bun run lint      # ESLint via Next.js
bun run typecheck # TypeScript strict check
```

## Resume

The full resume PDF is available:
- **In the app:** Open the **Resume** application from the panel launcher
- **Directly:** [`/resume.pdf`](public/resume.pdf) (served from `public/resume.pdf`)
- **In the terminal:** Run `cat ~/Documents/resume.txt` or the `resume` command

## Project Structure

```
src/
  app/
    api/proxy/      Next.js route — strips X-Frame-Options for Firefox proxy mode
    globals.css     Theme tokens, Nerd Font @font-face, .nf helper class
    layout.tsx      Root layout with fonts, metadata, OG tags
    page.tsx        Entry point — login gate + Desktop
  components/
    apps/           Terminal, FileManager, TextEditor, Music, Video, Firefox,
                    SystemMonitor, About, Portfolio, Resume
    desktop/        Desktop, Panel, AppLauncher, SystemTray
    login/          SDDMLogin
    ui/             shadcn/ui primitives
    window/         WindowFrame (drag, resize, z-index)
  features/
    virtual-fs/     In-memory VirtualFS (normalizePath, resolve, read, write,
                    mkdir, remove, exists, list, getNode, listDirectory)
    command-interpreter.ts   ksh command parser + executor (async curl support,
                             plus portfolio/resume commands)
  hooks/
    use-window-manager.ts    Window state (open, close, focus, minimize, maximize,
                             move, resize, cascade)
  lib/
    app-registry.ts          App metadata (id, name, icon, defaultSize, minSize)
    portfolio-data.ts        Structured resume/portfolio data (skills, projects,
                             education, certifications)
    system-config.ts         System + user config (name, contact, branding)
    virtual-fs-seed.ts       Virtual filesystem tree (with resume.txt)
    command-data.ts          MOTD, fastfetch, man pages
    browser-config.ts        Firefox proxy URL builder
    media-config.ts          Music/video Nerd Font glyphs
```

## API Routes

| Route | Purpose |
|-------|---------|
| `GET /api/proxy?url=<url>` | Fetches the target URL server-side, strips `X-Frame-Options` / CSP headers, injects a `<base>` tag, and returns the body. Used by Firefox proxy mode and the terminal `curl` command. |

## License

ISC

## Disclaimer

Not affiliated with, endorsed by, or connected to the OpenBSD project or the OpenBSD Foundation. The OpenBSD name and aesthetic are referenced for inspiration only.

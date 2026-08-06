# OpenBSD Web Desktop

A browser-based desktop environment inspired by OpenBSD and classic UNIX window managers. Built with Next.js 16, React 19, and TypeScript.

**Login password:** `2026`

## Screenshots

> Open apps from the panel launcher or right-click the desktop.

## Features

### Desktop Shell
- **SDDM-style login screen** — password-gated entry with clock and wallpaper
- **Window manager** — draggable, resizable windows with minimize / maximize / close; z-index stacking and cascade placement
- **Panel taskbar** — app launcher, open-window buttons with active state, system tray
- **System tray** — live clock, PF firewall indicator, hostname chip
- **Right-click context menu** — launch any app from the desktop

### Apps

| App | Description |
|-----|-------------|
| **Terminal** | ksh-style shell against a virtual filesystem. 20+ commands including `curl`, `grep`, `wc`, `head`, `tail`, `touch`, `mkdir`, `rm`, `history`, `man`, `fastfetch` |
| **File Manager** | Directory tree sidebar, sortable file listing, breadcrumb navigation, double-click to open files in the correct app |
| **Text Editor** | Line numbers, word wrap toggle, cursor position, Ctrl+S save to VirtualFS, Ctrl+K cut line, Ctrl+X close |
| **Music Player** | Auto-scans `/home/user/Music`, tabular tracklist, prev/next/play/pause, Nerd Font glyphs, sharp amber slider |
| **mpv (Video)** | HTML5 video, YouTube embed, URL streams, drag-and-drop files/URLs, Nerd Font OSC controls, auto-hide on play |
| **Firefox** | iframe browser with back/forward/reload, proxy mode to bypass X-Frame-Options headers |
| **System Monitor** | Live process table with simulated CPU/memory jitter, uptime counter, network RX/TX graph |
| **About** | System info and version |

### Terminal Commands

```
ls [-la]        List directory contents
cd <dir>        Change directory
pwd             Print working directory
cat <file>      Print file contents
echo <text>     Echo text
clear           Clear screen
curl <url>      Fetch a URL (async, via proxy)
grep <pat> <f>  Search file for pattern
wc <file>       Count lines/words/chars
head/tail <f>   First/last N lines
touch <file>    Create or update file
mkdir <dir>     Create directory
rm [-r] <path>  Remove file or directory
history         Show command history
man <cmd>       Manual page
fastfetch       System information (Puffy ASCII)
env/export      Environment variables
uname [-a]      System info
date            Current date/time
whoami/id       User info
hostname        Hostname
uptime          Stable uptime since window open
reboot          Reload the page
shutdown        Close the tab
exit            Close terminal window
```

### Virtual Filesystem

In-memory file tree modeled after OpenBSD's directory layout. All apps share the same VirtualFS instance per window — changes made in the terminal (`touch`, `mkdir`, `rm`) are immediately visible in the File Manager, and files saved in the Text Editor can be `cat`-ed in the terminal.

```
/
├── bin/        ksh, ls, cat, ...
├── dev/        null, zero, random
├── etc/        hostname, hosts, pf.conf, myname, ...
├── home/
│   └── user/
│       ├── .profile, .kshrc
│       ├── Documents/  readme.txt
│       ├── Downloads/
│       ├── Music/      SoundHelix-Song-1.mp3, SoundHelix-Song-2.mp3
│       └── Videos/     bad_apple.mp4
├── tmp/
├── usr/
│   ├── bin/    man, grep, sed, ...
│   └── local/
└── var/
    └── log/    messages, authlog, daemon
```

### Design System

- **Palette** — near-black background `#0a0a0a`, amber accent `#f0c040`, muted foreground `#999`
- **Typography** — Geist Mono (`font-mono`) throughout; `--radius: 0px` (zero border-radius everywhere)
- **Nerd Font glyphs** — `public/fonts/SymbolsNerdFont.woff2` subset for media icons (play `U+F04B`, pause `U+F04C`, volume `U+F028`/`U+F026`, music `U+F001`)
- **Colour tokens** — `bg-background`, `text-foreground`, `border-border`, `text-amber-400`, `accent-amber-500`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — log in with password **`2026`**.

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

## Project Structure

```
src/
  app/
    api/proxy/      Next.js route — strips X-Frame-Options for Firefox proxy mode
    globals.css     Theme tokens, Nerd Font @font-face, .nf helper class
  components/
    apps/           Terminal, FileManager, TextEditor, Music, Video, Firefox,
                    SystemMonitor, About
    desktop/        Desktop, Panel, AppLauncher, SystemTray
    login/          SDDMLogin
    ui/             shadcn/ui primitives
    window/         WindowFrame (drag, resize, z-index)
  features/
    virtual-fs/     In-memory VirtualFS (normalizePath, resolve, read, write,
                    mkdir, remove, exists, list, getNode, listDirectory)
    command-interpreter.ts   ksh command parser + executor (async curl support)
  hooks/
    use-window-manager.ts    Window state (open, close, focus, minimize, maximize,
                             move, resize, cascade)
  lib/
    app-registry.ts          App metadata (id, name, icon, defaultSize, minSize)
  types/            Shared TypeScript types
docs/               Architecture, design decisions, changelog
```

## API Routes

| Route | Purpose |
|-------|---------|
| `GET /api/proxy?url=<url>` | Fetches the target URL server-side, strips `X-Frame-Options` / CSP headers, injects a `<base>` tag, and returns the body. Used by Firefox proxy mode and the terminal `curl` command. |

## License

ISC

## Disclaimer

Not affiliated with, endorsed by, or connected to the OpenBSD project or the OpenBSD Foundation. The OpenBSD name and aesthetic are referenced for inspiration only.

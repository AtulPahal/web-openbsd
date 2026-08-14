# openBSD-Portfolio — Atul Pahal

An interactive, browser-native OpenBSD & macOS-inspired web desktop environment showcasing the AI/ML and full-stack engineering portfolio of **Atul Pahal**. Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Bun.

**Live GitHub Profile:** [https://github.com/AtulPahal](https://github.com/AtulPahal)  
**Login Password:** `2026`

---

## 🌟 Key Features

### 🖥️ Desktop Shell & Multitasking
- **SDDM-Style Login Screen** — Password-gated entry (`2026`) with live clock and wallpaper.
- **4 Workspaces (1, 2, 3, 4)** — Top bar workspace switcher; windows are isolated per workspace with running window indicators.
- **GNOME / macOS Fisheye Dock** — Vertical right-side dock featuring proximity fisheye magnification (`1.45x` zoom on hover, `1.25x` neighbor scale), running indicators, and window count badges. Toggleable magnification setting in System Settings.
- **macOS Notification & Control Center Drawer** — Interactive flyout drawer triggered by clicking the top Date/Time area:
  - **Live Date & Clock Card** — Clickable date header that opens the **Calendar App**.
  - **Quick Settings Grid** — Wi-Fi status, Bluetooth status, Dark Mode toggle, and Do Not Disturb (`DND`) mode toggle.
  - **Display Brightness & Sound Master Volume Sliders** — Real-time screen dimming overlay and 100% 2-way synchronized master volume control across all playing media.
- **Global Light & Dark Mode Themes** — Toggle between Dark Mode and precision off-white Light Mode (`#f5f3ef` Command Center color palette).
- **Desktop Context Menu** — Right-click anywhere on the desktop wallpaper to open applications.

---

## 🚀 Interactive Desktop Applications

| Icon | App | Description |
|:---:|-----|-------------|
| ⚙️ | **System Settings** | macOS-style settings application with sidebar navigation for **Wi-Fi & Network**, **Sound & Audio**, **Display & Brightness**, **Security & PF Firewall**, **Appearance & Dock**, and **System & About** (containing the full developer profile, contact details, system specs, and tech stack). |
| 👤 | **Portfolio** | Developer OS dashboard with profile hero header, 4 quick metric cards (*4+ SOTA Projects*, *94.7% KNN Diagnostic Model*, *100% ONNX Web Inference*), interactive contact cards, categorized skills progress bars, project cards, and education timeline. |
| 📅 | **Calendar** | Modern desktop calendar app with month navigation (`August 2026`), micro event preview pills rendered directly inside calendar day cells, agenda schedule, and form to add reminders. |
| 📈 | **System Monitor** | `btop`/`htop` styled monitor with real-time SVG sparkline history charts for CPU, RAM, and Network throughput. Includes process search filter, interactive column sorting (`PID`, `CPU%`, `MEM%`), and process kill action. |
| 💻 | **Terminal** | `ksh`-style terminal running against an in-memory VirtualFS. Includes commands: `help`, `fastfetch`, `neofetch`, `portfolio`, `resume`, `ls`, `cd`, `cat`, `pwd`, `clear`, `exit`, `banner`. |
| 📄 | **Resume** | Embedded PDF viewer for full resume with download (`/resume.pdf`) and pop-out links. |
| 📂 | **File Manager** | Directory tree sidebar, sortable file table, breadcrumb navigation, and `resume.txt` file viewing. |
| 📝 | **Text Editor** | Line numbers, word wrap toggle, cursor position, Ctrl+S save to VirtualFS. |
| 🌐 | **Firefox** | Iframe web browser with URL bar, Proxy Mode to strip `X-Frame-Options` headers, fallback handling, and external tab shortcuts (`https://github.com/AtulPahal`). |
| 🎵 | **Music App** | Local music player scanning `/home/user/Music` with Lucide transport controls, seeking bar, and 2-way master volume synchronization. |
| 🎬 | **mpv Video App** | Video player supporting HTML5 video, YouTube embeds, and drag-and-drop file playback. |

---

## 🛠️ Tech Stack

| Technology | Role |
|------------|------|
| **Next.js 16** | Framework (App Router & Turbopack) |
| **React 19** | UI Library & Hooks State Management |
| **TypeScript 5** | Strict Type System |
| **Tailwind CSS v4** | Utility Styling & Custom Theme Variables |
| **shadcn/ui** | UI Primitives |
| **Lucide React** | Vector SVG Icons |
| **Bun** | Fast Runtime & Package Manager |

---

## 💻 Terminal Commands

```bash
help               # Show available commands
fastfetch          # Display system info & specs with ASCII art (neofetch)
portfolio          # Print portfolio & project summary
resume             # Print resume & technical skills summary
banner <text>      # Render text banner surrounded by asterisks
ls [-l]            # List directory contents
cd <dir>           # Change working directory
cat <file>         # Print file contents
pwd                # Print working directory path
clear              # Clear terminal screen
exit               # Close terminal window
```

---

## 🏃 Getting Started

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
```

---

## 📂 Project Architecture

```
src/
  app/
    api/proxy/              Next.js route — proxies external URLs and strips X-Frame-Options
    globals.css             Theme CSS tokens (Light & Dark mode definitions)
    layout.tsx              Root layout with metadata and styling
    page.tsx                App entry point (Login gate + Desktop)
  components/
    apps/                   Calendar, SystemSettings, Portfolio, SystemMonitor,
                            Terminal, FileManager, TextEditor, Firefox, Music, Video, Resume
    desktop/                Desktop, TopMenuBar, Dock, AppLauncher, SystemTray, NotificationCenter
    login/                  SDDMLogin
    ui/                     shadcn/ui primitives (Tabs, ContextMenu, DropdownMenu, Button, Separator)
    window/                 WindowFrame (drag, resize, focus, z-index, traffic lights)
  features/
    virtual-fs/             In-memory virtual filesystem tree & navigation methods
    command-interpreter.ts  Terminal shell parser & execution engine
  hooks/
    use-window-manager.ts   Window state manager (open, close, focus, minimize, maximize, move, resize, workspaces)
  lib/
    app-icons.ts            Lucide icon mapping for registered desktop apps
    app-registry.ts         Application definitions & window geometry configs
    browser-config.ts       Firefox proxy URL builder
    command-data.ts         MOTD banner, fastfetch formatting, man pages
    media-config.ts         Audio/video configuration
    portfolio-data.ts       Single source of truth for portfolio, projects, skills, education
    social-icons.tsx        SVG icons for GitHub, LinkedIn, Email
    system-config.ts        System configuration (OS version, user info, website)
    system-monitor-config.ts Initial processes, network interfaces (em0, lo0)
    utils.ts                Tailwind utility helpers and notification dispatchers
  types/
    index.ts                Core TypeScript interfaces (WindowState, AppId, DesktopNotification, FSNode)
```

---

## 📜 License

ISC License

---

## ⚠️ Disclaimer

Not affiliated with, endorsed by, or connected to the OpenBSD project or the OpenBSD Foundation. The OpenBSD name and aesthetic are referenced for design inspiration only.

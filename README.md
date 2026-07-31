# OpenBSD Web Desktop

A browser-based desktop environment inspired by the OpenBSD operating system and classic UNIX window managers.

![Screenshot placeholder](docs/screenshot.png)

## Features

- **Window Manager** — Draggable, resizable windows with minimize, maximize, and close controls, z-index stacking, and keyboard-style focus management
- **Terminal Emulator** — Monospace terminal with a command interpreter supporting basic shell commands (ls, cd, pwd, cat, mkdir, echo, clear, help) against a virtual filesystem
- **File Manager** — Directory tree, sortable file listing, breadcrumb navigation, UNIX-style permissions display
- **Text Editor** — Textarea-based editor with line numbers, open/save via the virtual filesystem, cursor position tracking
- **System Monitor** — Process table with simulated CPU and memory usage, tabbed interface
- **Desktop Shell** — App launcher panel, system tray with clock, right-click context menu
- **Virtual Filesystem** — In-memory file tree modeled after OpenBSD's directory layout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Technology     | Version | Role                        |
| -------------- | ------- | --------------------------- |
| Next.js        | 16      | Framework (App Router)      |
| React          | 19      | UI library                  |
| TypeScript     | 5       | Language (strict mode)      |
| Tailwind CSS   | 4       | Styling                     |
| shadcn/ui      | 4       | UI primitives (base-nova)   |
| Lucide React   | 1       | Icons                       |
| Geist          | —       | Typography (Sans + Mono)    |

## Project Structure

```
src/
  app/              Next.js App Router (layout, page, globals.css)
  components/
    ui/             shadcn/ui primitives (button, scroll-area, tooltip, etc.)
    desktop/        Desktop shell (Desktop, Panel, AppLauncher, SystemTray)
    window/         Window manager (WindowFrame, TitleBar)
    apps/           App components (Terminal, FileManager, TextEditor, etc.)
  features/         Feature logic (virtual filesystem, command interpreter)
  hooks/            React hooks (useWindowManager, useDesktop)
  lib/              Utilities and app registry
  types/            Shared TypeScript type definitions
docs/               Project documentation
```

## Documentation

- [Project Overview](docs/project.md)
- [Architecture](docs/architecture.md)
- [Design Decisions (ADRs)](docs/decisions.md)
- [Task Tracker](docs/tasks.md)
- [Changelog](docs/changelog.md)
- [Design System](docs/design-system.md)

## License

ISC

## Disclaimer

This project is not affiliated with, endorsed by, or connected to the OpenBSD project or the OpenBSD Foundation. The OpenBSD name and aesthetic are referenced for inspiration only.

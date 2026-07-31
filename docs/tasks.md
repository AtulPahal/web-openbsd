# Task Tracker

## Completed

### T-001: Project Scaffold
Set up Next.js 16 App Router project with TypeScript strict, Tailwind CSS v4, shadcn/ui, and Lucide icons. Configure root layout with Geist fonts, dark theme, and full-viewport body.

**Status:** Done

---

### T-002: Design Tokens
Define CSS custom properties in `globals.css` for the OpenBSD-inspired dark theme. Set up color palette (background, foreground, primary, muted, accent, border, destructive), Tailwind theme integration, and base styles. Override shadcn defaults for dark mode.

**Status:** Done

---

### T-003: Window Manager
Implement `useWindowManager` hook with full window lifecycle: open, close, focus, minimize, maximize, move, resize. Define shared types (`WindowId`, `Position`, `Size`, `WindowState`) in `src/types/index.ts`. Build `WindowFrame` and `TitleBar` components with sharp-cornered chrome and drag-to-move/resize.

**Status:** Done

---

### T-004: Desktop Shell
Build the `Desktop` component as the top-level client container. Implement `Panel` with `AppLauncher` (app grid/list from the app registry) and `SystemTray` (clock, status indicators). Add right-click context menu on the desktop background.

**Status:** Done

---

### T-005: Terminal Emulator
Build the `Terminal` app component with command input, scrollable output history, and a synchronous command interpreter. Support basic shell commands against the virtual filesystem (ls, cd, pwd, cat, mkdir, etc.). Style with monospace font and amber-on-dark color scheme.

**Status:** Done

---

### T-006: File Manager
Build the `FileManager` app component with directory tree navigation, file listing with columns (name, size, permissions, modified), breadcrumb path bar, and file/directory icons. Connect to the virtual filesystem.

**Status:** Done

---

### T-007: Text Editor
Build the `TextEditor` app component with a textarea-based editor, file open/save against the virtual filesystem, line numbers, and a status bar showing cursor position and file path.

**Status:** Done

---

### T-008: System Monitor
Build the `SystemMonitor` app component with a process table (pid, name, CPU%, memory%, state, user), simulated CPU/memory usage display, and auto-refreshing data. Style as a tabbed interface.

**Status:** Done

---

### T-009: About Dialog
Build the `About` app component displaying project name, version (0.1.0), the OpenBSD mascot reference, tech stack, and license (ISC). Styled as a compact dialog window.

**Status:** Done

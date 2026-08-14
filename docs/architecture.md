# Architecture

## Overview

OpenBSD Web Desktop is a client-side single-page application rendered via the Next.js App Router. The server renders the initial HTML shell (root layout, metadata, fonts); all interactive desktop functionality runs as React client components in the browser.

## Component Hierarchy

```
RootLayout (server)
  └── page.tsx
        └── Desktop (client)
              ├── Panel
              │     ├── AppLauncher
              │     └── SystemTray
              └── Windows[]
                    └── WindowFrame
                          ├── TitleBar (close, minimize, maximize)
                          └── App Content
                                ├── Terminal
                                ├── FileManager
                                ├── TextEditor
                                ├── SystemMonitor
                                ├── About (Portfolio-focused)
                                ├── Portfolio (new)
                                ├── Resume (new)
                                ├── Firefox
                                ├── Music
                                └── Video
```

## State Management

All window management state is co-located in a single React hook: `useWindowManager`. This hook owns the array of `WindowState` objects and exposes operations to open, close, focus, minimize, maximize, move, and resize windows. No external state management library is used — React `useState` is sufficient for the scope of this project.

The `Desktop` component is the top-level client component that calls `useWindowManager` and threads the state and callbacks down through props.

## Virtual Filesystem

The virtual filesystem is an in-memory tree of `FSNode` objects. Each node has a `name`, `path`, `type` (file, directory, or symlink), UNIX-style `permissions` string, `owner`, `group`, `size`, and `modified` timestamp. Files carry an optional `content` string; directories carry an optional `children` array.

The filesystem is initialized with a default directory tree (modeled after OpenBSD's `/` layout) and is not persisted — it resets on every page reload.

## Command Interpreter

The terminal emulator includes a synchronous command interpreter that processes shell-like commands against the virtual filesystem. Commands execute immediately and return output as `TerminalLine` objects with typed content (input, output, error, system).

## App Registry

Applications are registered in `src/lib/app-registry.ts` as a `Record<string, AppDefinition>`. Each entry declares the app's `id`, display `name`, Lucide `icon` name, `defaultSize`, and `minSize`. The registry is the single source of truth for which apps are available in the launcher.

Registered apps: `terminal`, `file-manager`, `text-editor`, `system-monitor`, `about`.

## Directory Structure

```
src/
  app/                — Next.js App Router (layout, page, globals.css)
  components/
    ui/               — shadcn/ui primitives (button, scroll-area, tooltip, etc.)
    desktop/          — Desktop shell (Desktop, Panel, AppLauncher, SystemTray)
    window/           — Window manager (Window, WindowFrame, TitleBar)
    apps/             — App components (Terminal, FileManager, TextEditor, etc.)
  features/           — Feature logic (virtual filesystem, command interpreter)
  hooks/              — React hooks (useWindowManager, useDesktop)
  lib/                — Utilities (utils.ts, app-registry.ts)
  types/              — Shared TypeScript types (index.ts)
```

## Data Flow

1. User clicks an app in the `Panel` → `AppLauncher` calls `openWindow(appId)`
2. `useWindowManager` creates a new `WindowState` with a unique ID, default position/size from the registry, and pushes it to the windows array
3. `Desktop` renders a `WindowFrame` for each non-minimized window, sorted by `zIndex`
4. Clicking a window calls `focusWindow(id)`, promoting its `zIndex` to the top
5. Dragging the title bar calls `moveWindow(id, position)`; dragging edges calls `resizeWindow(id, size)`
6. Close/minimize/maximize buttons update the corresponding `WindowState` fields
7. The app component inside the window receives only `{ windowId: string }` and uses hooks to interact with the window manager or filesystem as needed

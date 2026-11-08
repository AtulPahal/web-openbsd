# Architecture

System architecture, component tree, and state management specifications for the OpenBSD Web Desktop Portfolio.

---

## 1. Component Hierarchy

```
RootLayout (server)
  └── page.tsx (Login Gate & Halt Screen)
        ├── SDDMLogin (client)
        └── Desktop (client)
              ├── TopMenuBar (client)
              │     ├── NixLogo (SVG start icon)
              │     ├── PowerMenu (client portal)
              │     ├── WorkspaceSwitcher
              │     ├── LiveClock (<time>)
              │     └── ControlCenterToggle
              ├── NotificationCenter (client portal)
              ├── DesktopHud (Time & Date widget)
              ├── WallpaperCarousel (Coverflow modal)
              ├── Dock (client)
              └── main (Workspace Canvas)
                    └── WindowFrame[]
                          ├── TitleBar (traffic lights, drag, double-click maximize)
                          └── App Content (preserved in DOM via hidden attribute)
                                ├── Terminal
                                ├── FileManager
                                ├── TextEditor
                                ├── SystemMonitor
                                ├── Firefox
                                ├── MusicApp
                                ├── VideoApp
                                ├── Portfolio
                                ├── Resume
                                ├── CalendarApp
                                ├── SystemSettings
                                └── AIStudio
```

---

## 2. State Management

All window management state is co-located in the custom `useWindowManager` hook (`src/hooks/use-window-manager.ts`).

* **Window State Map**: Owns a `Map<WindowId, WindowState>` tracking coordinates, size, focus, z-index, minimization, maximization, and workspace index.
* **Canvas Boundary Clamping**: Uses a `ResizeObserver` on `<main aria-label="Desktop workspace">` with the pure `fitBounds` algorithm to prevent windows from escaping screen boundaries.
* **In-DOM Preservation**: All open window instances remain mounted in the DOM with `hidden={!isVisible || win.isMinimized}`, preserving unsaved text editor buffers, active terminal shells, and media playback across workspace switches.

---

## 3. Shared Reactive Virtual Filesystem

The virtual filesystem (`src/features/virtual-fs/index.ts`) is a singleton tree of `FSNode` objects shared by all applications:
* **Storage**: Serialized to `localStorage` under `virtual_fs`.
* **Reactivity**: Mutations trigger `subscribeFileSystem` listeners consumed by `useSyncExternalStore` in `FileManager`, `MusicApp`, and `TextEditor`.
* **Transactionality**: In-memory mutations roll back automatically if local storage quota is exceeded.

---

## 4. Theming & Pywal Engine

Wallpaper color extraction is handled by `src/lib/pywal.ts`:
* Pixel data is sampled via an HTML5 Canvas $96 \times 96$ quantization pipeline.
* Extracted primary accent, secondary accent, and 16 terminal colors are injected directly into `:root` CSS variables.
* The selected wallpaper and theme persist in `localStorage` across page reloads.

---

## 5. Security & Isolation

* **Proxy Route (`/api/proxy`)**: Blocks SSRF attacks against RFC 1918 private subnets, loopback addresses, and cloud metadata addresses (`BlockList`).
* **Iframe Sandbox**: Embedded webpages in Firefox run in a sandboxed iframe without `allow-same-origin`.

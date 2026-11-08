# Recent Code Changes & Architectural Fixes (October 2026)

This document provides a detailed breakdown of the comprehensive code review, UI refinements, bug fixes, and security enhancements applied to the OpenBSD Web Desktop Portfolio.

---

## 1. UI & Design System Modernization

### Evil Martians Design Foundation (`DESIGN.md`)
* **Adopted Aesthetic**: High-contrast, technical software identity inspired by `evilmartians.com`.
* **Surfaces**: Pure dark canvas (`#080c14`), hairline borders (`rgba(255, 255, 255, 0.16)`), disciplined 8px (`rounded-lg`) window geometry, and vibrant chromatic technical accents.
* **Liquid Glass Philosophy**: Frosted glass effects (`backdrop-filter: blur(28px) saturate(160%)`) and specular borders are strictly contained inside component cards (`.dock-liquid-glass`, `.topbar-liquid-glass`, `.liquid-window`). **Full-screen desktop blur overlays were eliminated** to keep wallpapers sharp and vibrant.

### Figtree Variable Typography (`src/app/layout.tsx` & `src/app/globals.css`)
* Replaced Geist with **Figtree** (`next/font/google`, weights 300 to 900) globally across `<html>` and `<body>`.
* Monospace (`ui-monospace, SFMono`) is now strictly reserved for code blocks, terminal emulator output, and file permissions.

### 3-Tier Spacing & Color Topography
* **Spacing Tokens**: Implemented `--space-outer-*` (12px/16px screen margins), `--space-inner-*` (14px/16px container padding), and `--space-gap-*` (4px to 16px component gaps) in `src/app/globals.css`.
* **Contrast Tones**: Replaced hardcoded white opacities with `.text-tone-high` (85%), `.text-tone-medium` (70%), and `.text-tone-low` (30%) derived dynamically from `var(--foreground)`.

### Topbar & Dock Refinements
* **Topbar**:
  * Center: Replaced music pill with a clean **12-hour AM/PM clock and date** (`h:mm A • Date`, e.g. `7:15 PM • Monday, Oct 05, 2026`).
  * Left: Dynamic Nix OS SVG logo (`src/components/ui/nix-logo.tsx`) adapting its fill colors to the active Pywal theme.
  * Power Menu: Anchors flush under the topbar with zero gap (`top-full left-0`), rounded-2xl glass contour, and neutral hover-only rose/pink highlight on Shutdown.
  * Right: Unified Quick Settings & Control Center capsule pill button (`[ 🔔 📶 ᛒ ]`).
* **Dock**:
  * Removed the trash can icon and unneeded dividers.
  * Restored clean vector app icons (`APP_ICON_MAP`) with smooth upward magnification (`origin-bottom`) and glowing active indicator dots.
  * Added horizontal scroll containment (`max-w-full overflow-x-auto`) to eliminate overflow on mobile screens ($< 480\text{px}$).

---

## 2. Core Functional & State Bug Fixes

### Shared Reactive Virtual Filesystem (`src/features/virtual-fs/index.ts`)
* **Problem**: Previously, every app (`FileManager`, `TextEditor`, `Terminal`, `MusicApp`, `VideoApp`) instantiated its own isolated filesystem in `useMemo()`, meaning edits saved in Text Editor never appeared in Files or Terminal.
* **Fix**: Established a shared reactive client-side store with `subscribeFileSystem` and `useSyncExternalStore`.
* **Persistence & Rollback**: Added `localStorage` persistence under `virtual_fs` and transaction rollback protection if disk storage throws quota errors.

### Window Management & State Preservation (`src/hooks/use-window-manager.ts` & `src/components/window/window-frame.tsx`)
* **Problem**: Minimizing a window or switching virtual workspaces previously unmounted app components, immediately destroying unsaved text editor edits, browser tabs, terminal sessions, and video playback positions.
* **Fix**: Windows remain continuously mounted and hidden via `hidden={!isVisible || win.isMinimized}`, preserving all in-memory application state.
* **Bounds Clamping**: Replaced magic viewport constants with strict canvas bounding (`fitBounds`) observed via `ResizeObserver` on `<main>`.
* **Unsaved Close Guards**: Integrated `before-close-window` cancelable events so windows with unsaved changes prompt the user before closing.

### Dynamic Pywal Theme Extraction (`src/lib/pywal.ts`)
* Implemented browser-native Canvas quantization extracting an authentic 16-color ANSI terminal palette, primary accent, and secondary accent from any wallpaper image.
* Selected wallpaper and color palette persist reliably across reloads and synchronize between the SDDM Login Screen and Desktop environment.

### Calendar Data Persistence (`src/components/apps/calendar.tsx`)
* Added `localStorage` persistence under `calendar_events`.
* Enforced strict HTML5 time input validation (`type="time"`, `/^([01]\d|2[0-3]):[0-5]\d$/`) with chronological event sorting and accessible delete controls.

### Audio & Video Synchronization (`src/components/apps/music.tsx` & `src/components/apps/video.tsx`)
* **Audio Fix**: Separated volume changes from playback; adjusting master volume on paused audio no longer forces autoplay.
* **Video Fix**: Dropped-file `blob:` object URLs are tracked and explicitly revoked via `URL.revokeObjectURL()` on replacement and unmount to prevent memory leaks.
* Supported audio file extensions expanded to case-insensitive `.mp3`, `.wav`, and `.ogg`.

### Terminal ANSI SGR Parsing (`src/components/apps/terminal.tsx`)
* Replaced brittle hardcoded string matching with a standards-compliant ANSI escape code parser handling text colors, background colors, bold styling, and resets mapped to `--color0` through `--color15`.

---

## 3. Security Hardening

### Server-Side Request Forgery (SSRF) Protection (`src/app/api/proxy/route.ts`)
* **Vulnerability**: Previously allowed arbitrary HTTP(S) requests, exposing loopback (`127.0.0.1`), LAN subnets (`192.168.0.0/16`, `10.0.0.0/8`), and cloud metadata (`169.254.169.254`).
* **Fix**:
  * Pinned destination IP addresses using Node's `BlockList` to block all private, loopback, link-local, and reserved ranges.
  * Re-resolves and validates destination IPs across redirects.
  * Capped upstream streaming payloads at 5 MB.
* **Iframe Sandboxing**: Removed `allow-same-origin` from the Firefox iframe (`sandbox="allow-scripts allow-popups allow-forms"`), isolating external web content from the application origin.

---

## 4. Verification Summary

* `bun run typecheck`: **0 errors**.
* `bun run lint`: **0 errors, 0 warnings**.
* `bun run build`: Turbopack production build compiled in under 2 seconds.
* Headless Chromium browser automation confirmed correct mobile dock boundaries, 12-hour AM/PM clocks, attached Power Menu, and document state persistence.

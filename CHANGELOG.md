# Changelog

All notable changes to the OpenBSD Web Desktop Portfolio are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] — 2026-10-06

### Added
- **Evil Martians Design Foundation**: Integrated `DESIGN.md` based on `evilmartians.com` from OpenDesignMD: high-contrast dark canvas, technical precision, code as a first-class citizen, and rich chromatic accents.
- **Dynamic Pywal Theming Engine (`src/lib/pywal.ts`)**: Browser-native Canvas quantization extracting 16 terminal colors and primary/secondary accents from wallpapers, dynamically injecting CSS variables and persisting across reloads.
- **Figtree Variable Typography**: Migrated system-wide to Figtree (`var(--font-figtree)`, weights 300 to 900) across all UI chrome, windows, and panels.
- **3-Tier Spacing Architecture**: Implemented standardized outer (`--space-outer-*`), inner (`--space-inner-*`), and component gap (`--space-gap-*`) CSS variables.
- **Color Topography Contrast Hierarchy**: Established `.text-tone-high` (85%), `.text-tone-medium` (70%), and `.text-tone-low` (30%) derived dynamically from `var(--foreground)`.
- **Comprehensive Models Documentation (`docs/models.md`)**: Full architectural reference for AI heuristic algorithms (NDVI, Cellular morphology score, Vector cosine similarity), VirtualFS, window manager spatial models, and calendar schemas.
- **Testing & Quality Assurance Guide (`docs/testing.md`)**: Detailed automated and manual test scenarios, headless browser verification scripts, and regression checklists.
- **Recent Changes Reference (`docs/recent-changes.md`)**: Complete summary of recent architectural fixes and design system unification.

### Changed
- **Top Menu Bar**:
  - Center section now cleanly displays 12-hour clock with `AM`/`PM` and full date (e.g. `7:15 PM • Monday, Oct 05, 2026`).
  - Left section features dynamic Nix OS SVG logo adapting its colors to the active Pywal theme.
  - Attached Power Menu anchors seamlessly under the topbar with zero jagged gaps.
  - Right section unified into a single solid capsule button for Quick Settings & Control Center.
- **Desktop Dock**:
  - Removed the trash can icon and unneeded separators.
  - Restored clean minimalist vector icons with upward proximity magnification (`origin-bottom`).
  - Added running indicator dots centered directly underneath active applications.
  - Dock container geometry refined to sleek `rounded-2xl` (16px) with liquid glass styling.
  - Added horizontal scroll containment on mobile viewports ($< 480\text{px}$) to prevent horizontal layout overflow.
- **Window Management & State Preservation**:
  - Refined window frames to modest, crisp `rounded-lg` (8px) corners with 1px specular borders.
  - Kept background window instances mounted when switching workspaces or minimizing (`hidden={!isVisible}`), preserving unsaved form edits, text editor cursor positions, and media state.
  - Rewrote window bounds fitting (`fitBounds`) to ensure windows strictly stay inside visible workspace boundaries.
- **Shared Reactive Virtual Filesystem**:
  - Single `VirtualFS` store shared across all apps (`FileManager`, `TextEditor`, `Terminal`, `MusicApp`, `VideoApp`) with `useSyncExternalStore` reactivity.
  - Implemented transactional write and remove rollback protection.
- **Proxy Endpoint Security**:
  - Blocked SSRF attacks by restricting destinations against RFC 1918 private subnets, loopback, and cloud metadata addresses using Node `BlockList`.
  - Enforced 5 MB response stream size limit and sandboxed proxied iframes without `allow-same-origin`.

### Removed
- Removed intrusive full-screen desktop blur overlay during Power Menu and Control Center display. Wallpaper remains 100% crisp and clear.
- Removed unneeded music pill and media overlay dropdown from topbar.
- Removed unused `src/lib/design-tokens.ts` in favor of native CSS tokens in `src/app/globals.css`.

---

## [0.3.0] — 2026-10-04

### Added
- **Liquid Glass & Frosted Acrylic Styling**: Introduced `.liquid-glass`, `.dock-liquid-glass`, and `.liquid-window` utility classes with backdrop-filter blur and specular highlights.
- **Session Control Dropdown**: Added interactive session dropdown with Shutdown, Lock, Restart, Sleep, and Logout actions.
- **Curated Rice Wallpapers**: Added curated high-resolution wallpapers and thumbnails with dynamic theme palettes.

---

## [0.2.0] — 2026-08-14

### Added
- **Portfolio & Resume Apps**: Interactive portfolio dashboard with technical skills cloud, project cards, and embedded PDF resume viewer.
- **Terminal Shell Enhancements**: Custom fastfetch ASCII banner and portfolio/resume commands.
- **OpenGraph & SEO Metadata**: Complete OpenGraph, Favicon, and viewport configurations.
- **Bun Runtime Migration**: Migrated package management and build tooling to Bun.

---

## [0.1.0] — 2026-05-01

### Added
- **Initial OpenBSD Web Desktop Environment**: Window manager, SDDM login gate, virtual filesystem tree, and core utilities.

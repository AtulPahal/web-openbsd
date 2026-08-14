# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0 — Portfolio Transformation

### Added

- **Portfolio app** — Interactive tab-based showcase of projects, technical skills, education, certifications, and interests. Includes a project detail pane with stack tags and links.
- **Resume app** — Embedded PDF viewer for the full resume (`public/resume.pdf`) with download and pop-out links.
- **Structured portfolio data** — New `src/lib/portfolio-data.ts` module as the single source of truth for resume content (skills, projects, education, certifications, social links).
- **Social icon components** — Custom SVG icons for GitHub, LinkedIn, and email (`src/lib/social-icons.tsx`).
- **Terminal commands** — `resume` and `portfolio` commands that print formatted summaries to the terminal. Man pages for both new commands.
- **Virtual filesystem** — `resume.txt` added to `~/Documents/` with contact info and skills summary.
- **Login screen enhancement** — Added password hint and "View Resume" / "GitHub" quick links below the login box.
- **Metadata** — OpenGraph tags, favicon.png, and updated description for portfolio SEO.
- **Bun runtime** — Migrated from npm to Bun 1.x for dependency management and script execution.

### Changed

- **System config** — Username updated to `atulpahal`, product title/description now reflect the portfolio. Contact info (email, phone, location) exposed via `SYSTEM_CONFIG`.
- **About app** — Now displays portfolio contact info, social links, and tech stack instead of OpenBSD system info.
- **App registry** — Registered `portfolio` and `resume` apps with appropriate icons and window sizes.
- **TypeScript / ESLint** — Fixed all lint errors: moved `SortIndicator` out of `FileManager` render scope, replaced `useRef` patterns with `useMemo`, eliminated `any` types, fixed unescaped entities.
- **README** — Comprehensive rewrite for portfolio context with Bun instructions.
- `.gitignore` — Updated for Bun lockfile.
- `eslint.config.mjs` — Added `argsIgnorePattern` for underscore-prefixed unused args.

### Removed

- `package-lock.json` — Replaced by Bun's native lockfile (`bun.lock`).

---

## v0.1.0 — Initial Release

### Added

- **Desktop Shell** — Full-screen desktop with right-click context menu, app launcher panel, and system tray with clock
- **Window Manager** — Draggable, resizable windows with minimize/maximize/close controls, z-index stacking, and focus management
- **Terminal Emulator** — Monospace terminal with command interpreter supporting basic shell commands (ls, cd, pwd, cat, mkdir, echo, clear, help, etc.) against the virtual filesystem
- **File Manager** — Directory tree navigation, sortable file listing with name/size/permissions/modified columns, breadcrumb path bar
- **Text Editor** — Textarea-based editor with line numbers, file open/save via the virtual filesystem, cursor position in status bar
- **System Monitor** — Tabbed interface with process table (pid, name, CPU%, memory%, state, user) and simulated system resource usage
- **About Dialog** — Project info, version, tech stack, and license
- **Virtual Filesystem** — In-memory FSNode tree modeled after OpenBSD's directory layout
- **Design System** — Dark monochrome theme with amber accent, sharp window corners, Geist Sans/Mono typography, shadcn/ui primitives

# AGENT.md — Project Guide & Engineering Standards

Operational guide, design system invariants, and architectural rules for AI coding assistants working in the **OpenBSD Web Desktop Portfolio** (`openbsd-portfolio`).

---

## 1. Project Orientation & Documentation Map
Before planning or executing changes in this repository, check the relevant documentation file:

| Topic / Requirement | Primary File to Check | Description |
|---|---|---|
| **Overview & Setup** | [`README.md`](README.md) | High-level features, tech stack, installation, Bun commands, and terminal shell overview. |
| **Agent Standards** | [`AGENT.md`](AGENT.md) | Operational invariants, coding conventions, UI rules, and verification checklist. |
| **Design System** | [`DESIGN.md`](DESIGN.md) & [`docs/design-system.md`](docs/design-system.md) | **Evil Martians (`evilmartians.com`)** design foundation, color tokens, typography, and liquid glass rules. |
| **Data & Domain Models** | [`docs/models.md`](docs/models.md) | Comprehensive schemas, AI heuristic math formulas (NDVI, Cellular morphology score, Cosine similarity), VirtualFS, and spatial models. |
| **Testing & QA** | [`docs/testing.md`](docs/testing.md) | Test suites, headless Chromium verification scripts, regression checklists, and accessibility audits. |
| **Version History** | [`CHANGELOG.md`](CHANGELOG.md) | Complete version-by-version release history (v0.1.0 through v0.4.0). |
| **Recent Refactors** | [`docs/recent-changes.md`](docs/recent-changes.md) | In-depth log of recent architectural improvements, bug fixes, and security hardening. |
| **Architecture & Structure** | [`docs/architecture.md`](docs/architecture.md) | Component hierarchy, subsystem interactions, and data flow. |
| **Architectural Decisions** | [`docs/decisions.md`](docs/decisions.md) | Recorded ADRs explaining design choices, state models, and dependency trade-offs. |

---

## 2. Inviolable UI & Design System Invariants

### Evil Martians Visual Foundation
* **Severe, Theatrical Developer Identity**: Near-black canvas (`#080c14` / `#000000`), white reading surfaces, and technical precision over decorative chrome.
* **Single Font Family**: **Figtree** (`next/font/google` loaded in `src/app/layout.tsx` as `--font-figtree`, weights `300` to `900`). All application chrome and labels use `font-sans` (Figtree). Monospace (`ui-monospace, SFMono`) is strictly reserved for code snippets, terminal emulator text, and file permissions.
* **Color Topography & Contrast Tones**: Always derive text contrast from `var(--foreground)`:
  * High Emphasis (`--tone-high` / `.text-tone-high`): `color-mix(in srgb, var(--foreground) 85%, transparent)`
  * Medium Emphasis (`--tone-medium` / `.text-tone-medium`): `color-mix(in srgb, var(--foreground) 70%, transparent)`
  * Low Emphasis (`--tone-low` / `.text-tone-low`): `color-mix(in srgb, var(--foreground) 30%, transparent)`
* **3-Tier Spacing Architecture**:
  * Tier 1 (Outer): Screen margins and insets (`--space-outer-x: 0.75rem`, `--space-outer-y: 0.625rem`).
  * Tier 2 (Inner): Panel and card interior padding (`--space-inner-x: 1rem`, `--space-inner-y: 0.875rem`).
  * Tier 3 (In-between / Gap): Micro (`0.25rem`), Small (`0.5rem`), Medium (`0.75rem`), Large (`1.0rem`).
* **Geometry Discipline**:
  * Window Frames & Cards: Crisp, modern **`rounded-lg` (8px)** with hairline borders. Never use oversized or bubbly corners on windows.
  * Desktop Floating Shell (Topbar, Dock, Panels): **`rounded-2xl` (16px)**.
* **Liquid Glass Containment**:
  * Blur and specular reflections are strictly contained **inside component containers** (`dock-liquid-glass`, `topbar-liquid-glass`, `liquid-window`).
  * **NEVER apply a full-screen desktop blur overlay** when opening menus or drawers. The wallpaper and background desktop text must always remain 100% crisp, vibrant, and visible.
* **Dock Invariants**:
  * Minimalist clean vector glyphs (`APP_ICON_MAP`), not custom colored squircles.
  * **No Trash Can** or unneeded separators.
  * Proximity upward fisheye magnification on hover (`origin-bottom`) with glowing indicator dots centered underneath active apps.
* **Topbar Invariants**:
  * Left: Dynamic Nix OS SVG logo adapting its colors via `var(--primary)` and `var(--accent-secondary)`. Click opens attached Power Menu.
  * Center: Clean 12-hour format clock with `AM`/`PM` and full date (e.g. `7:15 PM • Monday, Oct 05, 2026`). **No music pill** in topbar.
  * Right: Circular battery ring gauge, circular RAM donut gauge, and unified solid periwinkle pill button for Control Center.

---

## 3. Engineering & Code Rules

1. **Type Imports**:
   * Always use top-level `import type` for type-only dependencies. Never write inline `import("pkg").Type`.
2. **Asynchronous Resolvers**:
   * Always prefer `Promise.withResolvers<T>()` over `new Promise((resolve, reject) => ...)` for linear control flow.
3. **No Unneeded State in Effects**:
   * Avoid calling `setState` synchronously inside `useEffect` bodies when derived state or event handlers suffice.
4. **Virtual Filesystem State**:
   * All file consumers (`FileManager`, `TextEditor`, `MusicApp`, `VideoApp`, `Terminal`) share the single reactive `VirtualFS` singleton.
   * Subscribe via `subscribeFileSystem` and `useSyncExternalStore` for reactive UI updates across windows.
5. **Security (Proxy Endpoint)**:
   * `src/app/api/proxy/route.ts` strictly blocks private/loopback/metadata IP ranges using `BlockList` subnet checking.
   * Responses are capped at 5 MB, HTML is sanitized, and the iframe runs with sandboxing (`allow-scripts allow-popups allow-forms`) without `allow-same-origin`.
6. **No Mocked Failures or Fabricated APIs**:
   * Keep model outputs and GitHub data truthful. Propagate actual errors rather than pretending to fetch another user's live profile with hardcoded data.

---

## 4. Verification & Testing Workflow

Before committing or yielding any task, run the full verification chain:
```bash
# 1. TypeScript Strict Check
bun run typecheck

# 2. ESLint Static Code Analysis
bun run lint

# 3. Next.js Turbopack Production Build
bun run build
```
* Ensure 0 TypeScript errors and 0 ESLint warnings.
* Run browser verification scenarios outlined in [`docs/testing.md`](docs/testing.md).

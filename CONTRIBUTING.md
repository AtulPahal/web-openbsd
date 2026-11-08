# Contributing to OpenBSD Web Desktop

Thank you for your interest in contributing to the **OpenBSD Web Desktop Portfolio**! This document provides guidelines for opening issues, writing code, maintaining design system invariants, and submitting pull requests.

---

## 1. Development Workflow

1. **Fork & Branch**:
   * Always branch off of the `dev` branch:
     ```bash
     git checkout dev
     git pull origin dev
     git checkout -b feature/your-feature-name
     ```
2. **Install Dependencies**:
   * This project uses **Bun**:
     ```bash
     bun install
     ```
3. **Local Development**:
   * Start the Turbopack dev server:
     ```bash
     bun run dev
     ```
   * Open [http://localhost:3000](http://localhost:3000) (Login password: `2026`).

---

## 2. Inviolable Design System Rules

All contributions must follow the **Evil Martians (`evilmartians.com`)** design foundation defined in [`DESIGN.md`](DESIGN.md):

* **Typography**:
  * Use **Figtree** (`var(--font-figtree)`, weights 300 to 900) for all UI text, headings, buttons, and chrome.
  * Monospace (`ui-monospace, SFMono`) is strictly reserved for code blocks, terminal emulator output, and file permissions.
* **Color Hierarchy**:
  * Never hardcode raw hex values in components.
  * Derive text contrast from `var(--foreground)` using `.text-tone-high` (85%), `.text-tone-medium` (70%), or `.text-tone-low` (30%).
* **Window Corners**:
  * Application windows must strictly use **`rounded-lg` (8px)** corners. Bubbly or oversized window borders are forbidden.
  * Floating desktop shell elements (Dock, Topbar, Control Center, Power Menu) use **`rounded-2xl` (16px)**.
* **Liquid Glass Containment**:
  * Glass blur and specular borders are strictly contained **inside component cards** (`dock-liquid-glass`, `topbar-liquid-glass`, `liquid-window`).
  * **Never apply a full-screen desktop blur overlay** when opening menus or drawers.
* **Dock Invariants**:
  * Clean minimalist vector icons (`APP_ICON_MAP`), upward magnification (`origin-bottom`), centered running indicator dots, and **no trash can**.

---

## 3. Engineering & Code Invariants

* **Type-Only Imports**:
  * Always use top-level `import type` declarations. Never write inline `import("pkg").Type`.
* **Asynchronous Resolvers**:
  * Always prefer `Promise.withResolvers<T>()` over `new Promise((resolve, reject) => ...)` for linear control flow.
* **Virtual Filesystem State**:
  * All file-consuming applications share the unified `VirtualFS` singleton. Use `subscribeFileSystem` and `useSyncExternalStore` for reactive UI synchronization.
* **Security**:
  * Any proxy or external web fetching must go through `/api/proxy` with strict SSRF validation blocking private networks and link-local addresses.
  * Embedded iframes must never use `allow-same-origin`.

---

## 4. Submitting a Pull Request

Before pushing your branch and opening a pull request, verify that all quality gates pass:

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint
bun run lint

# 3. Production Build
bun run build
```

* Ensure **0 errors** and **0 warnings**.
* PRs should target the `dev` branch.
* Follow the [Release Checklist](docs/release-checklist.md) for quality verification.

# Architecture Decision Records (ADRs)

---

## ADR-001: Use Next.js App Router
* **Status**: Accepted
* **Context**: The desktop environment requires server-side rendering for the initial HTML shell, OpenGraph SEO metadata, and font optimization, while the interactive desktop runs client-side.
* **Decision**: Use Next.js 16 with the App Router and Turbopack. `RootLayout` serves as the server shell; `Desktop` and windowed applications use `"use client"`.

---

## ADR-002: Co-located Window State in Custom Hook
* **Status**: Accepted
* **Context**: Multi-window management requires tracking position, size, z-index, minimization, maximization, and workspace mapping.
* **Decision**: Implement all window operations in a custom React hook `useWindowManager` with standard React state and native `ResizeObserver` canvas boundary enforcement. Avoid heavy external state management libraries (Redux, MobX).

---

## ADR-003: Shared Reactive Virtual Filesystem with Storage Persistence
* **Status**: Accepted (Supersedes in-memory-only prototype)
* **Context**: Multiple applications (Text Editor, File Manager, Terminal, Music App) must read and write from the same file tree, and saved files must survive page reloads.
* **Decision**: Implement a singleton `VirtualFS` store with `localStorage` persistence and transaction rollback. Components subscribe via `subscribeFileSystem` and React's `useSyncExternalStore`.

---

## ADR-004: shadcn/ui for Component Primitives
* **Status**: Accepted
* **Context**: Need unstyled, accessible UI primitives (Context Menu, Tooltip, Scroll Area, Tabs) customizable via Tailwind CSS.
* **Decision**: Use shadcn/ui primitives in `src/components/ui/`, customized to match the design system tokens.

---

## ADR-005: Adopt Figtree Variable Typeface
* **Status**: Accepted
* **Context**: The interface requires a versatile, highly legible geometric sans-serif typeface across all UI controls, windows, and panels.
* **Decision**: Standardize on **Figtree** (`var(--font-figtree)`, weights 300 to 900) loaded via `next/font/google`. Reserve monospace exclusively for code blocks, terminal emulator output, and filesystem paths.

---

## ADR-006: In-Browser Pywal Dynamic Theming Engine
* **Status**: Accepted
* **Context**: Allow arbitrary desktop wallpapers to dynamically generate matching 16-color ANSI terminal palettes and primary/secondary accents without requiring an external Python backend.
* **Decision**: Implement a browser-native Canvas quantization pipeline in `src/lib/pywal.ts` that dynamically computes luminance/saturation and injects CSS custom properties into `:root`.

---

## ADR-007: Adopt Evil Martians Design Foundation
* **Status**: Accepted
* **Context**: The interface aesthetic requires a cohesive, high-contrast developer identity fitting OpenBSD's UNIX heritage.
* **Decision**: Adopt the **Evil Martians (`evilmartians.com`)** design specification from OpenDesignMD (`DESIGN.md`): near-black canvas, white contrast typography hierarchy, strict 8px window corners, 16px floating shell elements, and local liquid glass blur.

# Architecture Decision Records

## ADR-001: Use Next.js App Router

**Status:** Accepted

**Context:** The project needs a React framework that provides good defaults for TypeScript, font loading, and project structure. The desktop environment is primarily client-side, but the initial page load benefits from server-side rendering of the shell.

**Decision:** Use Next.js 16 with the App Router. The root layout is a server component that loads fonts (Geist Sans, Geist Mono) and sets metadata. The `Desktop` component and all interactive children use the `"use client"` directive.

**Consequences:**
- Fast initial render via SSR of the outer HTML shell
- Client components handle all interactivity without hydration issues
- File-based routing is unused beyond the single page, but the project structure remains conventional
- Font optimization via `next/font/google` eliminates layout shift

---

## ADR-002: No External State Management Library

**Status:** Accepted

**Context:** The window manager needs to track position, size, z-index, and focus state for multiple windows. Options considered: Zustand, Jotai, Redux Toolkit, or plain React hooks.

**Decision:** Use React `useState` inside a custom `useWindowManager` hook. No external state library.

**Consequences:**
- Zero additional dependencies for state management
- All state is co-located in one hook, easy to reason about
- State resets on page reload (acceptable — no persistence requirement)
- If the app grew significantly (dozens of windows, cross-tab sync), this decision would need revisiting

---

## ADR-003: Virtual Filesystem In-Memory

**Status:** Accepted

**Context:** The file manager and terminal need a filesystem to operate on. Options: IndexedDB persistence, localStorage, or in-memory only.

**Decision:** Implement the virtual filesystem as an in-memory tree of `FSNode` objects. No persistence layer.

**Consequences:**
- Simplest possible implementation — a JavaScript object tree
- Filesystem resets to defaults on every page reload
- No storage quota concerns, no async APIs
- Users cannot save files across sessions (acceptable for a demo/portfolio project)
- The `FSNode` type supports files, directories, and symlinks with UNIX-style permissions

---

## ADR-004: shadcn/ui for Component Primitives

**Status:** Accepted

**Context:** The project needs accessible, unstyled UI primitives (context menus, tooltips, scroll areas, dropdowns) that can be themed to match the OpenBSD aesthetic.

**Decision:** Use shadcn/ui with the base-nova style. Components are copied into `src/components/ui/` and customized via Tailwind and CSS variables.

**Consequences:**
- No runtime CSS-in-JS cost — components are plain React + Tailwind
- Full control over styling; components are owned source code, not a dependency
- Accessible by default (keyboard navigation, ARIA attributes, focus management)
- Available primitives: button, scroll-area, context-menu, tooltip, dropdown-menu, separator, tabs

---

## ADR-005: Monochrome + Amber Accent Theme

**Status:** Accepted

**Context:** The project's visual identity is inspired by OpenBSD and classic UNIX workstations. The design must be high-contrast, functional, and visually distinct from typical web applications.

**Decision:** Use a monochrome dark theme with amber/gold accent color for active and interactive elements. Sharp corners on all windows (border-radius: 0). Typography: Geist Sans for UI elements, Geist Mono for terminal and code.

**Consequences:**
- Strong visual identity that evokes CRT terminals and classic window managers
- High contrast (light text on dark background) meets WCAG accessibility guidelines
- Amber accent provides clear visual hierarchy for focused/active elements
- Sharp corners reinforce the utilitarian, no-nonsense aesthetic
- Design tokens are defined as CSS custom properties in `globals.css` and consumed via Tailwind utility classes

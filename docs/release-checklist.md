# Release & Pre-Deployment Checklist

Quality gate checklist required before tagging a new release or merging into the `main` production branch.

---

## 1. Automated Verification Gates

Run the complete verification pipeline locally:

```bash
# 1. TypeScript Strict Typecheck
bun run typecheck

# 2. ESLint Analysis
bun run lint

# 3. Next.js Turbopack Production Build
bun run build
```

- [ ] `bun run typecheck` passes with **0 errors**.
- [ ] `bun run lint` passes with **0 errors and 0 warnings**.
- [ ] `bun run build` compiles all static pages and dynamic routes successfully under Turbopack.

---

## 2. Desktop Shell Smoke Verification

- [ ] **Login Screen (`SDDMLogin`)**:
  - [ ] Live clock renders time in 12-hour AM/PM format.
  - [ ] Pressing `Enter`, `Space`, or clicking "Press Enter to Unlock" transitions smoothly to the desktop.
  - [ ] Wallpaper and Pywal theme match active settings.
- [ ] **Top Menu Bar (`TopMenuBar`)**:
  - [ ] Nix OS SVG logo adapts to active theme colors.
  - [ ] Attached Power Menu opens directly flush under topbar with zero desktop background blur.
  - [ ] Shutdown button is neutral glass by default, revealing rose/pink highlight only on hover.
  - [ ] 12-hour AM/PM center clock and date display correctly.
  - [ ] Unified Control Center capsule opens with quick toggles, brightness slider, master volume slider, and mini calendar.
- [ ] **Bottom Dock (`Dock`)**:
  - [ ] Dock is horizontally centered at the bottom with `dock-liquid-glass` styling.
  - [ ] Proximity upward fisheye magnification (`origin-bottom`) functions smoothly.
  - [ ] Glowing indicator dots appear underneath running applications.
  - [ ] No trash can icon or unneeded dividers appear.
  - [ ] Mobile viewport ($< 480\text{px}$) activates horizontal scrolling without layout clipping.

---

## 3. Window & Data Layer Verification

- [ ] **Window Bounds & Focus (`useWindowManager`)**:
  - [ ] Window drag and resize operations clamp strictly within desktop canvas (`main`).
  - [ ] Window titlebar and body maintain crisp `rounded-lg` (8px) corners.
  - [ ] Switching workspaces or minimizing windows keeps application states mounted.
- [ ] **Shared Virtual Filesystem (`VirtualFS`)**:
  - [ ] Saving an edited file in Text Editor reflects immediately in File Manager and Terminal.
  - [ ] File creation and deletion persist across browser page reloads.
- [ ] **Security (`/api/proxy`)**:
  - [ ] Requests to `127.0.0.1` and `169.254.169.254` return `403 Forbidden`.
  - [ ] Firefox iframe runs with sandboxing without `allow-same-origin`.

---

## 4. Documentation & Versioning

- [ ] Version bumped in `package.json`.
- [ ] Release highlights added to [`CHANGELOG.md`](../CHANGELOG.md).
- [ ] Architecture notes updated in [`docs/architecture.md`](architecture.md) if structural contracts changed.
- [ ] Git working tree clean before tagging.

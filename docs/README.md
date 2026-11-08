# OpenBSD Web Desktop — Documentation Book

Welcome to the technical documentation book for the **OpenBSD Web Desktop Portfolio**, built and maintained by **Atul Pahal**.

---

## What is OpenBSD Web Desktop?

The OpenBSD Web Desktop is a browser-native web desktop environment designed to combine:
1. **OpenBSD's Utilitarian Heritage**: High reliability, sane defaults, strict security boundaries, and a terminal-first workflow.
2. **Evil Martians' Visual Identity**: Severe contrast, pure dark canvases, Figtree typography, hairline borders, and sharp technical styling.
3. **macOS Desktop Ergonomics**: Bottom floating liquid glass dock, top menu bar with attached session controls, and workspace multitasking.
4. **Browser-Native Execution**: 100% client-side execution with transactional in-memory virtual filesystem storage, dynamic Canvas-based Pywal theme extraction, and local heuristics.

---

## Structure of this Book

* **[Getting Started](installation.md)**: Prerequisites, Bun package manager setup, local development server, and configuration overrides.
* **[Core Architecture](architecture.md)**: Component tree, event-driven inter-process messaging, window bounds management, and virtual filesystem invariants.
* **[Desktop Shell & Theming](theming.md)**: How wallpaper color extraction works, CSS variable injection, Figtree typography, and liquid glass styling.
* **[Interactive Applications](applications.md)**: Deep dive into all 12 registered desktop applications.
* **[Models & Mathematics](models.md)**: Mathematical formulas (NDVI, Cellular morphology score, Vector cosine similarity), schemas, and spatial geometry.
* **[Testing & Quality Assurance](testing.md)**: Automated tests, headless browser smoke verification scripts, and quality gates.
* **[Function & API Reference](functions.md)**: Complete method-by-method documentation for every internal function.

---

## Quick Navigation

```
docs/
├── SUMMARY.md             # Book Table of Contents
├── README.md              # Introduction (This document)
├── installation.md        # Environment & setup
├── config.md              # System settings & paths
├── controls.md            # Keyboard & pointer bindings
├── architecture.md        # High-level architecture
├── window-manager.md      # Spatial window manager hook
├── virtual-fs.md          # Shared transactional filesystem
├── terminal.md            # Terminal shell & ANSI parser
├── theming.md             # Pywal theme extraction
├── desktop-shell.md       # Topbar, dock, panels
├── applications.md        # 12-app suite reference
├── models.md              # AI & domain data models
├── security.md            # SSRF-safe proxy & iframes
├── functions.md           # Exhaustive API reference
├── testing.md             # Test strategy & scripts
├── debugging.md           # Troubleshooting & tools
├── known-issues.md        # Browser limits & workarounds
├── release-checklist.md   # Pre-release quality gate
├── recent-changes.md      # Refactor & bugfix log
└── decisions.md           # Architecture Decision Records
```

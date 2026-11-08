# Testing Strategy & Quality Assurance Guide

Comprehensive test specifications, automation commands, and manual verification procedures for the OpenBSD Web Desktop Portfolio.

---

## 1. Quick Verification Suite

Run all automated checks with Bun before submitting or merging changes:

```bash
# 1. TypeScript Strict Typecheck
bun run typecheck

# 2. ESLint Static Code Analysis
bun run lint

# 3. Next.js Turbopack Production Build
bun run build
```

* **Acceptance Criteria**:
  * `typecheck`: **0 errors**. No `any` escapes or implicit type coercions.
  * `lint`: **0 errors, 0 warnings**. Strict React 19 hook dependency rules and unescaped entity enforcement.
  * `build`: Successful static page collection and route compilation in under 2 seconds.

---

## 2. Automated Browser Smoke Testing

The runtime environment includes a headless Chromium browser driver via the global `browser` interface in JavaScript evaluation cells.

### Basic Test Script Example
```javascript
const tab = await browser.open({
  url: "http://localhost:3000",
  viewport: { width: 1440, height: 900 },
  app: { relay: false, tern: false },
  headed: false,
});

// Unlock SDDM login screen
await tab.waitForSelector('role/button[name="Press Enter to Unlock"]');
await tab.click('role/button[name="Press Enter to Unlock"]');

// Wait for Desktop canvas
await tab.waitForSelector('[data-power-trigger]');

// Verify DOM metrics and window state
const snapshot = await tab.observe();
console.log("Desktop mounted successfully:", snapshot.elements.length > 0);

await tab.close();
```

---

## 3. Core Test Scenarios & Regressions Checklist

### Scenario A: Window Lifecycle & Bounds Fitting
* **Test**: Open multiple applications (Terminal, Files, Editor, Calendar). Drag and resize them. Switch viewport between mobile (`390x844`) and desktop (`1440x900`).
* **Expected Invariants**:
  * Windows must stay strictly within the visible canvas (`main[aria-label="Desktop workspace"]`).
  * Window coordinates never overflow into the topbar (`y < 0`) or hide beneath the bottom dock.
  * Maximizing a window fits it precisely to the canvas bounds; restoring returns it to its previous geometry (`prevBounds`).
  * Corner radius remains strictly **`rounded-lg` (8px)** on all application windows.

### Scenario B: Multi-App Shared VirtualFS & Document State
* **Test**:
  1. Open Text Editor, type content into `untitled-*.txt`, and save (`^O Save`).
  2. Open Files app, navigate to `Documents/`, verify the saved file appears immediately without page reload.
  3. Double-click the file or press Enter to reopen it in Text Editor.
  4. Edit text in the editor without saving, switch to Workspace 2, and switch back to Workspace 1.
* **Expected Invariants**:
  * File changes committed in one app immediately synchronize to all others via `subscribeFileSystem` and `useSyncExternalStore`.
  * Switching workspaces or minimizing windows keeps application state mounted; unsaved text and form fields are never lost.

### Scenario C: Topbar Clock & Attached Power Menu
* **Test**:
  1. Inspect the topbar center clock.
  2. Click the Nix logo on the left to open the Power Menu.
  3. Press Arrow Down / Arrow Up to navigate menu items.
  4. Press Escape to close.
* **Expected Invariants**:
  * Center clock displays standard 12-hour time with `AM`/`PM` (e.g. `7:15 PM • Monday, Oct 05, 2026`).
  * Power Menu anchors seamlessly under the topbar (`top-full left-0`) with rounded-2xl glass geometry and no jagged seams.
  * Desktop wallpaper behind the menu remains 100% crisp and clear—**zero full-screen blur**.
  * Shutdown button renders as neutral glass by default, lighting up in vibrant rose/pink only on hover.

### Scenario D: Dynamic Pywal Wallpaper Theming
* **Test**:
  1. Open Settings -> Appearance & Themes (or Wallpaper Carousel).
  2. Select a different wallpaper (e.g. *Frieren Azure* or *Heterochromia Dolls*).
  3. Reload the browser page (`F5` or `Cmd+R`).
* **Expected Invariants**:
  * Wallpaper color extraction runs in real time via HTML5 Canvas quantization in `src/lib/pywal.ts`.
  * The extracted primary accent and 16 terminal colors apply to `--primary`, `--ring`, and active UI elements.
  * Chosen wallpaper and theme mode persist across page reloads and between the Login screen and Desktop via `localStorage`.

### Scenario E: Proxy Endpoint & Security Hardening
* **Test**:
  1. Request `GET /api/proxy?url=http://127.0.0.1:3000` or `http://169.254.169.254`.
  2. Request a valid public web page (`https://duckduckgo.com`).
  3. Inspect response headers and sandboxed iframe in Firefox app.
* **Expected Invariants**:
  * Private, loopback, link-local, and AWS/cloud metadata IP ranges return `403 Forbidden`.
  * Responses are stream-limited to a maximum of 5 MB.
  * Proxied iframes run with sandboxing (`allow-scripts allow-popups allow-forms`) without `allow-same-origin`, preventing script execution on the parent origin.

---

## 4. Accessibility & Mobile Standards
* All interactive buttons must have visible `:focus-visible` styling (`outline: 2px solid var(--primary)`).
* Screen readers must receive semantic roles: `banner` (topbar), `main` (canvas), `navigation` (dock & workspaces), `dialog` (control center & modals), `menu` (power menu).
* On mobile devices ($< 640\text{px}$):
  * Dock switches to `overflow-x-auto` with touch scrolling and never extends beyond `100vw`.
  * Control Center drawer scales dynamically within `max-w-[calc(100vw-1rem)]`.
  * Windows launch maximized by default for ergonomic touch access.

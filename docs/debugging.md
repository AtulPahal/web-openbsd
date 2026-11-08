# Debugging & Diagnostics Guide

Techniques, tools, and workflows for inspecting and debugging the OpenBSD Web Desktop environment.

---

## 1. Browser DevTools & Inspection

Because the entire desktop is rendered client-side with Next.js Turbopack:
* **DOM Inspection (`F12` or `Cmd+Option+I`)**:
  * Verify CSS custom properties on `document.documentElement` (`--primary`, `--background`, `--foreground`, etc.).
  * Inspect the stacking context on `WindowFrame` components (`style="z-index: N"`).
  * Inspect `canvasRef` client dimensions on `<main aria-label="Desktop workspace">`.
* **React DevTools**:
  * Inspect window state map inside `useWindowManager`.
  * Track custom events dispatched on `window` (`close-window`, `open-app`, `master-volume-change`, `theme-change`, `wallpaper-change`).

---

## 2. Headless Browser Automation Debugging

You can run automated browser diagnostics via the global `browser` runner:

```javascript
// Open tab in headless browser
const tab = await browser.open({
  url: "http://localhost:3000",
  viewport: { width: 1440, height: 900 }
});

// Unlock SDDM login screen
await tab.click('role/button[name="Press Enter to Unlock"]');
await tab.waitForSelector('[data-power-trigger]');

// Check for unhandled console errors
const errors = await tab.errors();
console.log("Console errors:", errors.entries);

// Inspect computed styles of the liquid-glass dock
const dockMetrics = await tab.run(async ({ page }) => {
  return page.evaluate(() => {
    const dock = document.querySelector('[role="toolbar"]');
    return {
      rect: dock?.getBoundingClientRect(),
      backdropFilter: getComputedStyle(dock).backdropFilter,
      background: getComputedStyle(dock).backgroundColor,
    };
  });
});
console.log("Dock metrics:", dockMetrics);

await tab.screenshot();
await tab.close();
```

---

## 3. Virtual Filesystem Inspection

To inspect the virtual filesystem directly from the browser developer console:

```javascript
// Access localStorage tree representation
const rawFs = localStorage.getItem("virtual_fs");
if (rawFs) {
  const tree = JSON.parse(rawFs);
  console.log("VirtualFS Root Directory:", tree);
}

// Reset VirtualFS to initial seed
localStorage.removeItem("virtual_fs");
window.location.reload();
```

---

## 4. Pywal Palette Debugging

To verify extracted wallpaper color tokens:

```javascript
// Read active pywal palette
const palette = JSON.parse(localStorage.getItem("pywal_palette"));
console.table(palette.colors);
console.log("Special colors:", palette.special);

// Manually trigger palette re-extraction
import { extractPywalFromImage, applyPywalTheme } from "@/lib/pywal";
extractPywalFromImage("/wallpapers/frieren-azure.jpg").then(applyPywalTheme);
```

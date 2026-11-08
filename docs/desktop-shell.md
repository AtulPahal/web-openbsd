# Desktop Shell & Controls Guide

Architecture and component specifications for the top-level desktop shell (`TopMenuBar`, `Dock`, `PowerMenu`, `NotificationCenter`, `DesktopHud`).

---

## 1. Top Menu Bar (`src/components/desktop/top-menu-bar.tsx`)

A floating liquid glass bar spanning the top of the display with outer margins (`mx-2 sm:mx-3 mt-2 sm:mt-2.5 h-9 sm:h-10 rounded-2xl`):

```
[Nix Logo] [✦ • • •] Workspace 1        1:52 AM • Friday, Oct 23, 2026        [16 GB] [🔔 📶 ᛒ]
```

* **Left Section**:
  * **Nix Start Button**: Dual-tone Nix OS SVG logo (`src/components/ui/nix-logo.tsx`) that dynamically adapts its fill colors to the active Pywal theme. Clicking opens the attached session Power Menu.
  * **Workspace Navigation Pill**: Dark pill containing interactive buttons for workspaces 1 through 4. The active workspace displays a glowing star disc `✦`, and dots indicate workspaces with running windows.
  * **Workspace Label**: Text label styled with medium contrast (`--tone-medium`).
* **Center Section**:
  * **12-Hour Clock & Full Date**: High-contrast, semantic `<time>` tag formatted as `h:mm A • Weekday, Month DD, YYYY`. Clicking opens the **Calendar App**.
* **Right Section**:
  * **RAM Telemetry Indicator**: Browser-reported hardware memory gauge. Clicking opens **System Monitor**.
  * **Unified Control Center Button**: Solid primary capsule button (`[ 🔔 📶 ᛒ ]`) triggering the Control Center & Quick Settings drawer.

---

## 2. Attached Power Menu (`src/components/desktop/power-menu.tsx`)

* **Seamless Attachment**: Rendered via React portal (`createPortal`) anchored directly flush under the topbar with `top-full left-0` alignment and no visual gaps.
* **Liquid Glass Styling**: Translucent glass (`dock-liquid-glass`, `backdrop-blur-3xl`) with 16px (`rounded-2xl`) corners and specular highlights.
* **Contained Blur**: The frosted blur is strictly localized within the menu card itself—the wallpaper remains 100% crisp.
* **Hover-Only Highlight**: By default, the Shutdown button is neutral glass; hovering lights up the button in vibrant rose/pink (`#f472b6`).
* **Keyboard Accessible**: Arrow Up/Down cycles through items, Escape closes and restores trigger focus, and Enter executes the selected action.

---

## 3. Bottom Floating Dock (`src/components/desktop/dock.tsx`)

* **Horizontal Centered Capsule**: Positioned at `fixed bottom-3 left-1/2 -translate-x-1/2 z-30` with `rounded-2xl dock-liquid-glass` styling.
* **Minimalist Icons**: Clean Lucide vector icons styled with medium contrast (`--tone-medium`), turning white/primary on hover and active focus.
* **Running Indicators**: Centered glowing dots (`w-1.5 h-1.5 rounded-full`) underneath open applications.
* **Proximity Fisheye Magnification**: Hovering an icon smoothly scales it upward (`origin-bottom`) by 1.28x, with neighbor icons scaling by 1.14x and 1.05x.
* **Mobile Responsiveness**: Constrained within `max-w-[98vw]` with horizontal scroll containment (`overflow-x-auto scrollbar-thin`) to prevent mobile viewport clipping.

---

## 4. Control Center & Notification Drawer (`src/components/desktop/notification-center.tsx`)

* **Quick Settings Grid**: Large touch-friendly toggles for Do Not Disturb (`DND`), simulated Wi-Fi, and Bluetooth.
* **Theme & Brightness Row**:
  * Dark/Light mode toggle button.
  * Desktop brightness dimming slider with live percentage readout.
  * Master sound volume slider synchronized with all media audio elements.
* **Notifications Section**: List of active system notifications with single-click dismiss and "Clear all" button.
* **Mini Calendar**: Embedded month calendar with previous/next month navigation and day selection.

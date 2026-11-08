# Configuration Guide

Reference guide for system settings, virtual filesystem path constants, hardware telemetry defaults, and desktop configuration values.

---

## 1. System Configuration (`src/lib/system-config.ts`)

Central static metadata describing the operating system, author profile, and default networking environment.

```typescript
export const SYSTEM_CONFIG = {
  name: "OpenBSD",
  osVersion: "7.5",
  desktopVersion: "7.6-web",
  architecture: "amd64",
  hostname: "openbsd.local",
  username: "atulpahal",
  userFullName: "Atul Pahal",
  home: "/home/atulpahal",
  shell: "/bin/ksh",
  path: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin",
  terminal: "xterm-256color",
  localIp: "10.0.0.2",
  loginPassword: "2026",
  wallpaper: "/wallpapers/golden-rose-yor.png",
  website: "https://github.com/atulpahal",
  browserHome: "about:home",
  userEmail: "atulpahal@gmail.com",
  userPhone: "+91-9499190701",
  userLocation: "Sonipat, Haryana, India",
} as const satisfies SystemConfig;
```

---

## 2. Standard Virtual Filesystem Paths (`SYSTEM_PATHS`)

Path constants mapped to standard OpenBSD and XDG user directory structures:

| Key | Path | Description |
|---|---|---|
| `root` | `/` | Root filesystem directory |
| `home` | `/home/atulpahal` | User home directory (`~`) |
| `documents` | `/home/atulpahal/Documents` | Default destination for Text Editor saves and `resume.txt` |
| `downloads` | `/home/atulpahal/Downloads` | Browser downloads and external assets |
| `music` | `/home/atulpahal/Music` | Default audio library scanned by Music App |
| `videos` | `/home/atulpahal/Videos` | Media storage scanned by mpv Video App |

---

## 3. Desktop Shell Metrics (`src/lib/desktop-config.ts`)

Layout constants consumed by the window manager and desktop canvas:

* **`BASE_OFFSET = 60`**: Initial coordinate offset in pixels for the first window spawned in a workspace.
* **`CASCADE_STEP = 30`**: Incremental pixel shift added to sequential window spawns to avoid full overlap.
* **`PANEL_HEIGHT = 48`**: Clearance allocated for the system topbar.

---

## 4. Local Storage Configuration Keys

| Storage Key | Type | Description |
|---|---|---|
| `desktop_wallpaper` | `string` | Active wallpaper URL (e.g. `/wallpapers/frieren-azure.jpg`) |
| `desktop_dark_mode` | `"true" \| "false"` | Active visual theme mode (Dark vs. Light) |
| `pywal_palette` | `JSON` | Active 16-color Pywal palette and accent tokens |
| `virtual_fs` | `JSON` | Persisted root `FSNode` tree with committed modifications |
| `calendar_events` | `JSON` | Array of user-created and default `CalendarEvent` items |

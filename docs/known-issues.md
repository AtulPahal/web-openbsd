# Known Issues & Limitations

Documented platform constraints, browser sandbox limitations, and known behavioral characteristics.

---

## 1. Browser Autoplay Policies

* **Issue**: Browsers (Chromium, WebKit, Gecko) restrict programmatic audio playback until the user has interacted with the document (the User Activation requirement).
* **Behavior in App**:
  * On initial boot or fresh tab load, opening the Music App or mpv Video App without prior user clicking may log an `Autoplay prevented` console warning.
  * Audio playback smoothly resumes once the user clicks any control or unlocks the SDDM login screen.

---

## 2. External Webpage Embedding in Firefox App

* **Issue**: Many major web platforms (Google, GitHub, Twitter, Banking sites) set strict client-side checks, CORS constraints, or Frame-Ancestors policies that resist proxy rewrites.
* **Behavior in App**:
  * Websites with client-side anti-framing JavaScript detect iframe embedding and display a blank page or error.
  * The Firefox app explicitly detects known unframeable domains (`google.com`, `github.com`) and displays a clean **"External Frame Protection"** card with an **"Open in External Tab ↗"** shortcut button.

---

## 3. Local Storage Quota Boundaries

* **Issue**: Browsers enforce an origin storage quota (typically 5 MB to 10 MB per origin for `localStorage`).
* **Behavior in App**:
  * Storing very large files (e.g. uploading large video files into `VirtualFS`) will exceed local storage limits.
  * `VirtualFS` implements transactional rollback: if `localStorage.setItem()` throws a quota error, in-memory modifications are rolled back and an alert is displayed to the user.

---

## 4. Hardware Telemetry Web API Scope

* **Issue**: Web privacy standards restrict access to exact host hardware metrics to prevent browser fingerprinting.
* **Behavior in App**:
  * RAM is reported in coarse estimates (e.g. 8 GB, 16 GB via `navigator.deviceMemory`).
  * System Monitor clearly displays: *"Simulated CPU, memory, processes, network traffic and uptime; browser hardware values are estimates."*

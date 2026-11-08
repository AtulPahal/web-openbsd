# Interactive Application Suite

Comprehensive reference for all 12 registered applications in the OpenBSD Web Desktop environment.

---

## Application Summary Table

| App ID | Display Name | Icon | Default Size | Min Size | Category |
|---|---|---|---|---|---|
| `terminal` | Terminal (`kitty`) | Terminal | $680 \times 420$ | $400 \times 250$ | Utilities |
| `file-manager` | Files | Folder | $720 \times 480$ | $400 \times 300$ | Utilities |
| `text-editor` | Editor | FileText | $640 \times 480$ | $360 \times 280$ | Productivity & Finance |
| `system-monitor`| System Monitor | Activity | $600 \times 400$ | $400 \times 300$ | Utilities |
| `firefox` | Firefox | Globe | $800 \times 600$ | $400 \times 300$ | Utilities |
| `music` | Music | AudioLines | $500 \times 400$ | $350 \times 300$ | Entertainment |
| `video` | mpv | Clapperboard | $640 \times 360$ | $400 \times 225$ | Entertainment |
| `portfolio` | Portfolio | User | $720 \times 520$ | $400 \times 300$ | Productivity & Finance |
| `resume` | Resume | FileText | $760 \times 600$ | $400 \times 300$ | Productivity & Finance |
| `calendar` | Calendar | Calendar | $680 \times 480$ | $420 \times 320$ | Productivity & Finance |
| `settings` | Settings | Settings | $740 \times 500$ | $480 \times 350$ | Utilities |
| `ai-studio` | AI Studio | Brain | $780 \times 560$ | $440 \times 340$ | Creativity |

---

## Application Deep Dive

### 1. Terminal Emulator (`src/components/apps/terminal.tsx`)
* Simulates OpenBSD `ksh` with in-memory execution against `VirtualFS`.
* Features ANSI SGR escape code parsing, command line history navigation, and commands: `help`, `fastfetch`, `portfolio`, `resume`, `ls`, `cd`, `cat`, `pwd`, `clear`, `wc`, `head`, `tail`, `grep`, `mkdir`, `rm`, `github`, `sysctl`, `ping`.

### 2. File Manager (`src/components/apps/file-manager.tsx`)
* Tree navigation with standard Places (`Home`, `Documents`, `Downloads`, `Music`, `Videos`, `Root`).
* Table listing with column sorting (Name, Size, Permissions, Modified).
* Double-click / Enter activation routes files to associated applications (`.txt` -> Text Editor, `.mp3` -> Music, `.mp4` -> mpv).
* Uses `useSyncExternalStore` for instant multi-window filesystem reactivity.

### 3. Text Editor (`src/components/apps/text-editor.tsx`)
* Textarea-based code and text editor with line numbers, word wrap toggle, and cursor position tracking.
* Transactional save against `VirtualFS` (`Ctrl+S`, `Ctrl+O`) and line deletion (`Ctrl+K`).
* Protected by `before-close-window` event: prompts user before closing if unsaved modifications exist.

### 4. System Monitor (`src/components/apps/system-monitor.tsx`)
* `btop`/`htop` styled system dashboard with real-time SVG sparkline history charts for CPU, RAM, and Network throughput.
* Interactive process table with column sorting (`PID`, `CPU%`, `MEM%`, `User`, `State`) and process kill capability.
* Accurately distinguishes between browser hardware estimates and simulated metrics.

### 5. Firefox Browser (`src/components/apps/firefox.tsx`)
* Tabbed web browser interface with URL input, bookmarks bar, and back/forward history.
* Routes web navigation through the secure `/api/proxy` endpoint.
* Sandboxed iframe (`sandbox="allow-scripts allow-popups allow-forms"`) with same-origin restrictions, preventing third-party web content from accessing desktop storage or DOM.

### 6. Music Player (`src/components/apps/music.tsx`)
* Scans `~/Music` for `.mp3`, `.wav`, and `.ogg` files.
* Includes transport controls, seek bar, track progress, and 2-way master volume synchronization.
* Separates volume adjustments from playback to prevent accidental resumption on muted states.

### 7. mpv Video Player (`src/components/apps/video.tsx`)
* Media player supporting HTML5 video, YouTube embeds, and local drag-and-drop file playback.
* Clicking the video surface toggles play/pause.
* Automatically revokes `blob:` object URLs via `URL.revokeObjectURL()` on replacement and unmount to prevent browser memory leaks.

### 8. Developer Portfolio (`src/components/apps/portfolio.tsx`)
* Interactive showcase of projects, technical skills, education timeline, and certifications.
* Displays verified GitHub repository data when online, with graceful offline fallbacks.

### 9. Interactive Resume (`src/components/apps/resume.tsx`)
* Embedded PDF viewer for full developer resume with download (`/resume.pdf`) and pop-out links.
* Toggleable text view option parsing `resume.txt` directly from `VirtualFS`.

### 10. Calendar (`src/components/apps/calendar.tsx`)
* Modern desktop calendar with month navigation and day cell event preview pills.
* Form to add reminders with HTML5 time input validation (`type="time"`).
* Persists user events across browser sessions in `localStorage`.

### 11. System Settings (`src/components/apps/system-settings.tsx`)
* macOS-style preference center with sidebar navigation:
  * **Wi-Fi & Network**, **Sound & Audio**, **Displays & Graphics**, **Appearance & Themes** (wallpapers and accent colors), **Notifications**, **Privacy**, **Security**, **Power**, **Storage**, and **System & About**.
* Allows live wallpaper switching, accent color customization, and dock magnification toggling.

### 12. AI Studio (`src/components/apps/ai-studio.tsx`)
* Interactive machine learning demonstration studio featuring:
  * Multispectral Vegetation Index (NDVI, SAVI, Biomass).
  * Cellular Morphology Diagnostic Scoring (Logistic Sigmoid).
  * 3D Vector Embedding Semantic Similarity Matching.
* Real-time sliders allow tweaking inputs to observe dynamic heuristic classification outputs.

# Function & API Reference (`docs/functions.md`)

Comprehensive technical reference documenting every function, method, custom hook, and API handler in the OpenBSD Web Desktop Portfolio.

---

## Table of Contents
1. [Virtual Filesystem Functions (`src/features/virtual-fs/index.ts`)](#1-virtual-filesystem-functions)
2. [Command Interpreter & Shell Handlers (`src/features/command-interpreter.ts`)](#2-command-interpreter--shell-handlers)
3. [Window Manager Hook & Spatial Geometry (`src/hooks/use-window-manager.ts`)](#3-window-manager-hook--spatial-geometry)
4. [Pywal Theming & Image Color Extraction (`src/lib/pywal.ts`)](#4-pywal-theming--image-color-extraction)
5. [Hardware Telemetry Prober (`src/lib/hardware-info.ts`)](#5-hardware-telemetry-prober)
6. [Live GitHub API Client (`src/lib/github-api.ts`)](#6-live-github-api-client)
7. [AI Studio Heuristic Prediction Functions (`src/lib/ai-models-data.ts`)](#7-ai-studio-heuristic-prediction-functions)
8. [File Associations & Routing Helpers (`src/lib/file-associations.ts`, `src/lib/browser-config.ts`)](#8-file-associations--routing-helpers)
9. [Secure Proxy Endpoint (`src/app/api/proxy/route.ts`)](#9-secure-proxy-endpoint)
10. [Core UI Utilities (`src/lib/utils.ts`)](#10-core-ui-utilities)

---

## 1. Virtual Filesystem Functions
*File: `src/features/virtual-fs/index.ts`*

### Store Subscription & Revision Helpers
#### `subscribeFileSystem(listener: () => void): () => void`
* **Purpose**: Registers a reactive listener that triggers whenever any file or directory is modified, created, or deleted.
* **Returns**: An unsubscribe cleanup function.
* **Usage**: Consumed by `useSyncExternalStore` in `FileManager` and `MusicApp` for instant multi-window synchronization.

#### `getFileSystemRevision(): number`
* **Purpose**: Returns the monotonic integer revision of the virtual filesystem. Increments on every transactional commit.
* **Returns**: Current revision count (`0, 1, 2, ...`).

---

### `VirtualFS` Class Methods
#### `constructor()`
* Initializes `this.root`. In browser runtimes, checks `localStorage` key `virtual_fs` for saved tree state. If valid, restores modified timestamps as `Date` instances. Falls back to `buildVirtualFileSystem()` seed.

#### `normalizePath(path: string, cwd: string): string`
* **Parameters**:
  * `path`: Relative or absolute path input (e.g., `~/Documents`, `../bin`, `notes.txt`).
  * `cwd`: Current working directory (e.g., `/home/atulpahal`).
* **Behavior**: Expands `~` to `SYSTEM_CONFIG.home`, resolves `.` and `..` segments, and returns a canonical absolute path starting with `/`.

#### `resolve(path: string, cwd: string): FSNode | null`
* **Parameters**: Target path and current working directory.
* **Behavior**: Normalizes path and walks the `FSNode` tree. Returns matching `FSNode` or `null` if any segment does not exist or traverses a non-directory node.

#### `read(path: string, cwd: string): string | null`
* **Returns**: File text content string, or `null` if the path does not exist or represents a directory.

#### `write(path: string, cwd: string, content: string): boolean`
* **Parameters**: Destination file path, working directory, and UTF-8 content string.
* **Behavior**: Transactional write. If target exists as a file, captures previous state, updates content, byte size, and timestamp, then commits to `localStorage`. If creating a new file, appends to parent directory. If storage commit fails, rolls back in-memory mutation and throws. Returns `true` on success, `false` on invalid target.

#### `mkdir(path: string, cwd: string): boolean`
* **Behavior**: Creates a new directory node with mode `rwxr-xr-x` and current timestamp. Persists to storage with rollback protection.

#### `remove(path: string, cwd: string): boolean`
* **Behavior**: Removes a file or empty directory node. Refuses removal of root (`/`) or non-empty directories. Persists with rollback protection.

#### `exists(path: string, cwd: string): boolean`
* **Returns**: Boolean indicating if the resolved node exists.

#### `getNode(path: string): FSNode | null`
* **Convenience Alias**: Calls `this.resolve(path, "/")`.

#### `listDirectory(path: string): FSNode[]`
* **Convenience Alias**: Calls `this.list(path, "/")`.

---

## 2. Command Interpreter & Shell Handlers
*File: `src/features/command-interpreter.ts`*

### `CommandInterpreter` Class
#### `constructor(fs: VirtualFS)`
* Initializes shell session with cwd set to `SYSTEM_CONFIG.home` (`/home/atulpahal`) and records monotonic start timestamp.

#### `getPrompt(): string`
* **Returns**: Formatted shell prompt string, e.g. `atulpahal@openbsd:~$ ` or `atulpahal@openbsd:/var/log$ `.

#### `execute(input: string): Promise<string> | string`
* **Parameters**: Raw shell command line string.
* **Behavior**: Trims input, parses command name and whitespace-separated arguments, and routes to built-in command handlers.

### Built-in Command Handlers
* `cmdLs(args: string[]): string`: Lists directory contents. Supports `-l` (long format with permissions, owner, byte size, timestamp) and `-a` (includes hidden dotfiles).
* `cmdCd(args: string[]): string`: Changes current working directory with path normalization.
* `cmdCat(args: string[]): string`: Concatenates and prints file contents.
* `cmdMkdir(args: string[]): string`: Creates directories in virtual filesystem.
* `cmdRm(args: string[]): string`: Removes files. Rejects unsupported `-r`/`-rf` flags with explicit error.
* `cmdGrep(args: string[]): string`: Searches files for regex or literal patterns.
* `cmdWc(args: string[]): string`: Counts newline characters, words, and UTF-8 bytes in files.
* `cmdHead(args: string[], fromEnd?: boolean): string`: Implements both `head` and `tail`. Correctly handles `-n 0` without displaying lines.
* `cmdGitHub(args: string[]): Promise<string>`: Queries live GitHub profile and top repositories for given username. Reports explicit fetch errors.
* `cmdPing(args: string[]): Promise<string>`: Simulates ICMP echo packets with realistic millisecond latency.
* `cmdSysctl(args: string[]): string`: Prints OpenBSD kernel state values (`hw.machine`, `hw.ncpu`, `hw.physmem`).
* `cmdFastfetch(args: string[]): string`: Renders ASCII mascot alongside real hardware telemetry and uptime.

---

## 3. Window Manager Hook & Spatial Geometry
*File: `src/hooks/use-window-manager.ts`*

#### `fitBounds(position: Position, size: Size, area: Size): { size: Size; position: Position }`
* **Pure Mathematical Algorithm**:
  * Clamps window width to `min(size.width, area.width)` and height to `min(size.height, area.height)`.
  * Clamps `x` coordinates to `[0, area.width - width]`.
  * Clamps `y` coordinates to `[0, area.height - height]`.
  * Guarantees windows never render outside visible canvas boundaries.

#### `useWindowManager(canvasRef: RefObject<HTMLElement | null>)`
* **Core Window Lifecycle Hook**:
  * Observes canvas dimensions with a `ResizeObserver` and refits all open windows on resize.
  * `openWindow(appId, appState?, workspace?)`: Computes cascading initial offset (`BASE_OFFSET + (count % 8) * CASCADE_STEP`), fits bounds to canvas, generates a UUID, and elevates zIndex. On mobile viewports ($< 640\text{px}$), opens maximized automatically.
  * `closeWindow(id)`: Removes window. If closed window held focus, automatically promotes next highest window in same workspace.
  * `focusWindow(id)`: Sets `isFocused: true`, un-focuses others, un-minimizes window, and increments zIndex.
  * `minimizeWindow(id)`: Sets `isMinimized: true`, un-focuses, and promotes next highest active window.
  * `maximizeWindow(id)`: Toggles maximization state. Stores current coordinates in `prevBounds` before expanding to `{ x: 0, y: 0, width: area.width, height: area.height }`, and restores them on toggle.
  * `moveWindow(id, position)`: Clamps target position within canvas bounds using `fitBounds`.
  * `resizeWindow(id, size)`: Enforces `minSize` constraints and fits bounds to canvas.
  * `getWindow(id)`: Retrieves `WindowState` by ID.

---

## 4. Pywal Theming & Image Color Extraction
*File: `src/lib/pywal.ts`*

#### `getSavedWallpaper(): string`
* Reads `desktop_wallpaper` from `localStorage`, falling back to `SYSTEM_CONFIG.wallpaper`.

#### `getSavedDarkMode(): boolean`
* Reads `desktop_dark_mode` from `localStorage`, defaulting to `true` (Dark Mode).

#### `getSavedPywalTheme(): PywalPalette | null`
* Reads and validates `pywal_palette` JSON from `localStorage`. Verifies 16 hex color strings.

#### `applyPywalTheme(palette: PywalPalette, dark?: boolean): void`
* **Behavior**:
  * Toggles `.dark` class on `document.documentElement`.
  * Inverts background and foreground contrast between light and dark modes.
  * Calculates relative luminance of the primary accent:
    $$Y = 0.2126R + 0.7152G + 0.0722B$$
  * Sets `--primary-foreground` to `#000000` if $Y > 0.179$, else `#ffffff`.
  * Injects `--primary`, `--ring`, `--accent`, `--accent-glow`, `--card`, `--popover`, `--border`, and 16 terminal `--color0`..`--color15` CSS custom properties.
  * Synchronizes choices to `localStorage` and dispatches `pywal-palette-change` CustomEvent.

#### `extractPywalFromImage(imageUrl: string): Promise<PywalPalette>`
* **Behavior**:
  * Caches in-flight promises in `paletteCache`.
  * Loads image with `crossOrigin = "anonymous"`.
  * Draws onto a $96 \times 96$ HTML5 Canvas and reads raw RGBA pixel buffer.
  * Groups colors into 16-level quantized buckets, ranking by frequency and saturation.
  * Chooses darkest bucket for `--color0`, lightest for `--color7`, and most saturated mid-luminance bucket ($0.32 < L < 0.85$) for the primary accent.
  * Resolves complete 16-color `PywalPalette`.

---

## 5. Hardware Telemetry Prober
*File: `src/lib/hardware-info.ts`*

#### `getRealHardwareInfo(): SystemHardwareInfo`
* Probes real browser Web APIs:
  * `navigator.hardwareConcurrency` for CPU cores (defaults to 8).
  * `navigator.deviceMemory` for RAM in GB (defaults to 8).
  * `window.screen.width` and `height` for physical resolution.
  * `window.devicePixelRatio` for display scale factor.
  * `navigator.connection` for `effectiveType` (e.g. 4G), `downlink` (Mbps), and `rtt` (ms). Preserves valid zero values using nullish coalescing (`??`).

---

## 6. Live GitHub API Client
*File: `src/lib/github-api.ts`*

#### `fetchGitHubUser(username?: string): Promise<GitHubUser>`
* Queries `https://api.github.com/users/{username}` with a 4000 ms timeout and in-memory TTL caching (5 minutes). Rejects with explicit error if network or user is unavailable.

#### `fetchGitHubRepos(username?: string): Promise<GitHubRepo[]>`
* Queries `https://api.github.com/users/{username}/repos?sort=updated&per_page=10` with caching. Returns repository metadata (stars, forks, language, description).

---

## 7. AI Studio Heuristic Prediction Functions
*File: `src/lib/ai-models-data.ts`*

#### `AI_MODELS["crop-disease-detector"].predict(inputs)`
* **Formula**:
  $$\text{NDVI} = \frac{\text{nir} - \text{red}}{\text{nir} + \text{red}}, \quad \text{SAVI} = \frac{\text{nir} - \text{red}}{\text{nir} + \text{red} + 0.5} \times 1.5$$
* Returns classification ("Healthy Foliage", "Early Blight", "Severe Leaf Scorching") and computed biomass indices.

#### `AI_MODELS["breast-cancer-knn"].predict(inputs)`
* **Formula**: Computes weighted morphological score across cell radius, perimeter, area, and texture. Applies logistic sigmoid:
  $$P(\text{Malignant}) = \frac{1}{1 + e^{-4(\text{Score}-1.05)}}$$
* Returns malignant/benign probability distribution and confidence score.

#### `AI_MODELS["movie-recommender"].predict(inputs)`
* **Formula**: Computes 3-dimensional vector cosine similarity:
  $$\text{Sim}(\mathbf{v}, \mathbf{r}) = \frac{\mathbf{v} \cdot \mathbf{r}}{\|\mathbf{v}\| \|\mathbf{r}\|}$$
  against reference vector $[0.80, 0.50, 0.95]$.
* Returns high/moderate/low affinity classification and confidence metrics.

---

## 8. File Associations & Routing Helpers
*Files: `src/lib/file-associations.ts`, `src/lib/browser-config.ts`*

#### `getFileAssociation(fileName: string): FileAssociationAppId`
* Inspects file extension case-insensitively. Maps audio (`.mp3`, `.wav`, `.ogg`) to `"music"`, video (`.mp4`, `.webm`, `.mov`) to `"video"`, and all other extensions to `"text-editor"`.

#### `buildProxyUrl(url: string): string`
* Constructs `/api/proxy?url={encodeURIComponent(url)}` for secure isolated iframe web browsing in Firefox.

---

## 9. Secure Proxy Endpoint
*File: `src/app/api/proxy/route.ts`*

#### `GET(request: Request): Promise<NextResponse>`
* **Security Checks**:
  1. Validates HTTP/HTTPS protocol and rejects user/password credentials in URL.
  2. Resolves destination hostname to IPv4 using `node:dns/promises`.
  3. Checks resolved IP against private networks using `BlockList` (blocks RFC 1918, loopback `127.0.0.0/8`, link-local `169.254.0.0/16`, cloud metadata).
  4. Follows up to 5 redirects, re-validating every intermediate destination.
  5. Enforces a strict 5 MB stream size limit to prevent memory exhaustion.
  6. Replaces origin with `<base href="...">` and sets response headers:
     `Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups; frame-ancestors 'self'`.

---

## 10. Core UI Utilities
*File: `src/lib/utils.ts`*

#### `cn(...inputs: ClassValue[]): string`
* Merges Tailwind utility classes using `clsx` and `tailwind-merge` to resolve styling conflicts.

#### `showNotification(message: string, title?: string, duration?: number): void`
* Dispatches a global `show-notification` CustomEvent caught by the desktop notification manager to render toast alerts.

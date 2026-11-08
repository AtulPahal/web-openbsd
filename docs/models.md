# System Data & Domain Models Documentation

Comprehensive architectural reference for all data models, domain entities, mathematical algorithms, and state specifications implemented in the OpenBSD Web Desktop Portfolio.

---

## Table of Contents
1. [AI Studio & Heuristic Models](#1-ai-studio--heuristic-models)
   - [Model 1: Crop Disease & Vegetation Index (`crop-disease-detector`)](#model-1-crop-disease--vegetation-index)
   - [Model 2: Cellular Morphology Diagnostic Analyzer (`breast-cancer-knn`)](#model-2-cellular-morphology-diagnostic-analyzer)
   - [Model 3: Vector Embedding Semantic Matcher (`movie-recommender`)](#model-3-vector-embedding-semantic-matcher)
2. [Virtual Filesystem Model (`VirtualFS` & `FSNode`)](#2-virtual-filesystem-model)
3. [Window Management & Spatial Models (`WindowState`)](#3-window-management--spatial-models)
4. [Color Extraction & Theme Engine (`PywalPalette`)](#4-color-extraction--theme-engine)
5. [Hardware Telemetry & System Config Models](#5-hardware-telemetry--system-config-models)
6. [Calendar & Scheduling Models](#6-calendar--scheduling-models)
7. [Application Registry & Desktop Models](#7-application-registry--desktop-models)
8. [Portfolio & Resume Data Models](#8-portfolio--resume-data-models)

---

## 1. AI Studio & Heuristic Models
*Source files: `src/lib/ai-models-data.ts`, `src/components/apps/ai-studio.tsx`*

The AI Studio features interactive demonstration algorithms simulating machine learning heuristics directly in the browser runtime without external backend dependencies.

### Core Types & Interfaces
```typescript
export interface ModelFeature {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
}

export interface ModelClass {
  label: string;
  color: string;
  description: string;
}

export interface PredictionResult {
  predictedClass: string;
  confidence: number; // Percentage (0.0 to 100.0)
  probabilities: Record<string, number>;
  metrics: Record<string, number>;
}

export interface ModelDefinition {
  id: string;
  name: string;
  category: "Computer Vision" | "Healthcare" | "Recommendation";
  architecture: string;
  accuracy: string;
  description: string;
  features: ModelFeature[];
  classes: ModelClass[];
  predict: (inputs: Record<string, number>) => PredictionResult;
}
```

---

### Model 1: Crop Disease & Vegetation Index
* Identifier: `crop-disease-detector`
* Category: Computer Vision / Remote Sensing
* Architecture: Multispectral Band Analysis & NDVI Thresholding

#### Features / Inputs
| Feature ID | Name | Range | Default | Unit | Description |
|---|---|---|---|---|---|
| `nir` | Near-Infrared Reflectance | 0.10 – 0.90 | 0.72 | Reflectance | Measures healthy chlorophyll and leaf cell structure |
| `red` | Red Band Reflectance | 0.05 – 0.50 | 0.12 | Reflectance | Chlorophyll light absorption for photosynthesis |

#### Mathematical Formulas & Algorithms
1. **Normalized Difference Vegetation Index (NDVI)**:
   $$\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED}}$$
2. **Soil-Adjusted Vegetation Index (SAVI)** ($L = 0.5$):
   $$\text{SAVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED} + L} \times (1 + L) = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED} + 0.5} \times 1.5$$
3. **Relative Biomass Index**:
   $$\text{Biomass} = \max(0, \text{NDVI} \times 1.45)$$

#### Classification Thresholds
* **Healthy Foliage (`#10b981`)**: $\text{NDVI} > 0.60$
* **Early Blight (`#f59e0b`)**: $0.35 \le \text{NDVI} \le 0.60$
* **Severe Leaf Scorching (`#ef4444`)**: $\text{NDVI} < 0.35$

---

### Model 2: Cellular Morphology Diagnostic Analyzer
* Identifier: `breast-cancer-knn`
* Category: Healthcare / Cellular Diagnostics
* Architecture: Weighted Multi-Feature Morphological Scoring

#### Features / Inputs
| Feature ID | Name | Range | Default | Unit | Description |
|---|---|---|---|---|---|
| `meanRadius` | Mean Cell Radius | 6.0 – 30.0 | 14.1 | mm | Distance from cell nucleus center to perimeter |
| `meanPerimeter` | Mean Cell Perimeter | 40.0 – 190.0 | 92.0 | mm | Size of nuclear boundary |
| `meanArea` | Mean Cell Area | 140.0 – 2500.0 | 655.0 | $\text{mm}^2$ | Nuclear cross-sectional area |
| `meanTexture` | Mean Texture | 9.0 – 40.0 | 19.3 | std dev | Gray-scale value standard deviation |

#### Mathematical Formulas & Algorithms
1. **Normalized Risk Composite Score**:
   $$\text{Score} = \left(\frac{\text{Radius}}{15.0}\right) \times 0.30 + \left(\frac{\text{Perimeter}}{100.0}\right) \times 0.30 + \left(\frac{\text{Area}}{750.0}\right) \times 0.25 + \left(\frac{\text{Texture}}{22.0}\right) \times 0.15$$
2. **Logistic Malignancy Probability**:
   $$P(\text{Malignant}) = \text{clamp}\left(\frac{1}{1 + e^{-4 \times (\text{Score} - 1.05)}}, 0.01, 0.99\right)$$
3. **Benign Probability**:
   $$P(\text{Benign}) = 1 - P(\text{Malignant})$$
4. **Cellular Density Metric**:
   $$\text{Density} = \frac{\text{Area}}{\max(1, \pi \times \text{Radius}^2)}$$

#### Diagnostic Classes
* **Benign / Non-Cancerous (`#10b981`)**: $P(\text{Malignant}) \le 0.50$
* **Malignant / Abnormal (`#ef4444`)**: $P(\text{Malignant}) > 0.50$

---

### Model 3: Vector Embedding Semantic Matcher
* Identifier: `movie-recommender`
* Category: Recommendation & Information Retrieval
* Architecture: 3-Dimensional Vector Cosine Similarity Metric

#### Features / Inputs
| Feature ID | Name | Range | Default | Unit | Description |
|---|---|---|---|---|---|
| `actionWeight` | Action / Sci-Fi Affinity | 0 – 100 | 85 | % | Preference for high-energy content |
| `dramaWeight` | Drama / Depth Affinity | 0 – 100 | 60 | % | Preference for narrative character depth |
| `aiTechWeight` | AI / Tech Affinity | 0 – 100 | 95 | % | Preference for computing & ML topics |

#### Mathematical Formulas & Algorithms
1. **Target Feature Vector**:
   $$\mathbf{v} = \left[\frac{\text{actionWeight}}{100}, \frac{\text{dramaWeight}}{100}, \frac{\text{aiTechWeight}}{100}\right]$$
2. **Reference Vector**:
   $$\mathbf{r} = [0.80, 0.50, 0.95]$$
3. **Cosine Similarity**:
   $$\text{Sim}(\mathbf{v}, \mathbf{r}) = \frac{\mathbf{v} \cdot \mathbf{r}}{\|\mathbf{v}\| \|\mathbf{r}\|} = \frac{v_1 r_1 + v_2 r_2 + v_3 r_3}{\sqrt{v_1^2 + v_2^2 + v_3^2} \sqrt{0.80^2 + 0.50^2 + 0.95^2}}$$
   * Note: Reference magnitude $\|\mathbf{r}\| = \sqrt{0.64 + 0.25 + 0.9025} = \sqrt{1.7925} \approx 1.3388$.

#### Similarity Classes
* **High Relevance Match (`#10b981`)**: $\text{Sim} > 0.82$
* **Moderate Match (`#f59e0b`)**: $0.50 \le \text{Sim} \le 0.82$
* **Low Affinity (`#64748b`)**: $\text{Sim} < 0.50$

---

## 2. Virtual Filesystem Model
*Source files: `src/types/index.ts`, `src/features/virtual-fs/index.ts`, `src/lib/virtual-fs-seed.ts`*

The virtual filesystem provides in-memory hierarchical Unix tree storage with local storage persistence and transaction safety.

### Node Specification (`FSNode`)
```typescript
export interface FSNode {
  name: string;                       // File or directory name
  path: string;                       // Absolute Unix path (e.g. /home/atulpahal/Documents)
  type: "file" | "directory" | "symlink";
  permissions: string;                // POSIX mode string (e.g. "rw-r--r--", "rwxr-xr-x")
  owner: string;                      // POSIX user (e.g. "root", "user")
  group: string;                      // POSIX group (e.g. "wheel", "user")
  size: number;                       // UTF-8 byte length
  modified: Date;                     // Modification timestamp
  content?: string;                   // Text or media URL data (files only)
  children?: FSNode[];                // Child node array (directories only)
}
```

### VirtualFS Methods & Contracts
* `normalizePath(path: string, cwd: string): string`: Resolves `~`, `.`, `..`, and relative segments into a canonical absolute path.
* `resolve(path: string, cwd: string): FSNode | null`: Traverses the tree and returns the node or `null`.
* `read(path: string, cwd: string): string | null`: Returns file content or `null`.
* `write(path: string, cwd: string, content: string): boolean`: Transactional write. Replaces existing file or creates new node in parent directory; commits to `localStorage` and notifies reactive subscriptions. Rolls back in-memory mutation if disk serialization fails.
* `mkdir(path: string, cwd: string): boolean`: Creates directory node with POSIX permissions and timestamps.
* `remove(path: string, cwd: string): boolean`: Removes file or empty directory node with rollback protection.
* `list(path: string, cwd: string): FSNode[]`: Lists directory children.
* `subscribeFileSystem(listener: () => void): () => void`: Reactive store subscription used with `useSyncExternalStore` for automatic UI synchronization across file manager, music player, and text editor.

---

## 3. Window Management & Spatial Models
*Source files: `src/types/index.ts`, `src/hooks/use-window-manager.ts`, `src/components/window/window-frame.tsx`*

### Spatial Types
```typescript
export interface Position {
  x: number; // Viewport-relative horizontal offset (px)
  y: number; // Viewport-relative vertical offset (px)
}

export interface Size {
  width: number;  // Bounded width (px)
  height: number; // Bounded height (px)
}

export interface WindowState {
  id: string;               // Unique UUID identifier
  title: string;            // Window titlebar text
  appId: AppId;             // Registered application identifier
  position: Position;       // Current coordinates inside workspace canvas
  size: Size;               // Current dimensions
  minSize: Size;            // Hard minimum width/height
  zIndex: number;           // Stacking context elevation
  isMinimized: boolean;     // Hidden in dock
  isMaximized: boolean;     // Expanded to full canvas area
  isFocused: boolean;       // Active keyboard and pointer focus
  workspace?: number;       // Virtual desktop index (1, 2, 3, or 4)
  appState?: { path?: string; [key: string]: unknown };
  prevBounds?: {            // Restored coordinates prior to maximization
    position: Position;
    size: Size;
  };
}
```

### Spatial Invariants & Algorithms
1. **Fit Bounds (`fitBounds`)**:
   $$\text{width} = \min(\text{size.width}, \text{area.width}), \quad \text{height} = \min(\text{size.height}, \text{area.height})$$
   $$x = \max(0, \min(\text{position.x}, \text{area.width} - \text{width}))$$
   $$y = \max(0, \min(\text{position.y}, \text{area.height} - \text{height}))$$
2. **Focus Priority**: Focusing a window elevates its `zIndex` to `nextZIndexRef++` and un-focuses all other windows.
3. **Workspace Isolation**: Minimized or cross-workspace windows remain mounted with `hidden={!isVisible}` to preserve unsaved form edits, text editor cursor positions, and media playback.

---

## 4. Color Extraction & Theme Engine
*Source files: `src/lib/pywal.ts`, `src/lib/rice-theme-config.ts`*

Implements the Unix `pywal` color palette schema with dynamic browser Canvas image quantization.

### Pywal Palette Structure
```typescript
export interface PywalPalette {
  wallpaper: string;
  special: {
    background: string;       // Deep canvas color (e.g. #0c0d14)
    foreground: string;       // High-contrast text (e.g. #fff6eb)
    cursor: string;           // Terminal cursor color
    accent: string;           // Dominant saturated primary accent
    accentSecondary: string;  // Complementary secondary accent
  };
  colors: {
    color0: string;   // Standard Black / Background
    color1: string;   // Standard Red
    color2: string;   // Standard Green
    color3: string;   // Standard Yellow
    color4: string;   // Standard Blue
    color5: string;   // Standard Magenta
    color6: string;   // Standard Cyan
    color7: string;   // Standard White / Foreground
    color8: string;   // Bright Black
    color9: string;   // Bright Red
    color10: string;  // Bright Green
    color11: string;  // Bright Yellow
    color12: string;  // Bright Blue
    color13: string;  // Bright Magenta
    color14: string;  // Bright Cyan
    color15: string;  // Bright White
  };
}
```

### Color Extraction Algorithm
1. Downsamples the wallpaper image onto a $96 \times 96$ HTML5 Canvas.
2. Quantizes color channels into 16-step bins to compute frequency density.
3. Calculates relative luminance ($Y = 0.2126R + 0.7152G + 0.0722B$) and HSL saturation ($S = \frac{\max - \min}{\max}$).
4. Ranks candidates to select readable primary accent ($0.32 < L < 0.85$ with highest $S$).
5. Injects CSS custom properties into `:root`: `--primary`, `--primary-foreground`, `--background`, `--foreground`, `--accent`, `--accent-glow`, `--card`, `--border`, and 16 terminal `--color0`..`--color15` tokens.
6. Persists theme choices in `localStorage` (`pywal_palette`, `desktop_wallpaper`, `desktop_dark_mode`).

---

## 5. Hardware Telemetry & System Config Models
*Source files: `src/lib/hardware-info.ts`, `src/lib/system-config.ts`, `src/lib/system-monitor-config.ts`*

### Telemetry Interface
```typescript
export interface SystemHardwareInfo {
  cpuCores: number;           // navigator.hardwareConcurrency (defaults to 8)
  memoryGb: number;           // navigator.deviceMemory estimate (defaults to 8)
  screenResolution: string;   // window.screen dimensions (e.g. "1920x1080")
  pixelRatio: number;         // window.devicePixelRatio (e.g. 2.0)
  platform: string;           // navigator.platform
  userAgent: string;          // Browser User-Agent string
  networkType: string;        // navigator.connection.effectiveType or "4G"
  downlinkMbps: number;       // navigator.connection.downlink bandwidth
  rttMs: number;              // navigator.connection.rtt round-trip time
}
```

### System Configuration Interface
```typescript
export interface SystemConfig {
  name: string;                   // "OpenBSD"
  osVersion: string;               // "7.5"
  desktopVersion: string;          // "7.6-web"
  architecture: string;            // "amd64"
  hostname: string;                // "openbsd.local"
  username: string;                // "atulpahal"
  userFullName: string;            // "Atul Pahal"
  home: string;                    // "/home/atulpahal"
  shell: string;                   // "/bin/ksh"
  path: string;                    // Default Unix PATH
  terminal: string;                // "kitty"
  localIp: string;                 // "10.0.0.2"
  wallpaper: string;               // Default wallpaper path
  website: string;                 // GitHub portfolio link
  productTitle: string;
  productDescription: string;
}
```

---

## 6. Calendar & Scheduling Models
*Source files: `src/lib/calendar-data.ts`, `src/components/apps/calendar.tsx`*

```typescript
export interface CalendarEvent {
  id: string;                                           // Unique event ID
  dateStr: string;                                      // Canonical ISO date "YYYY-MM-DD"
  title: string;                                        // Event title
  time: string;                                         // Canonical display time "12:00 PM"
  category: "Work" | "Personal" | "Project" | "Milestone";
}
```
* **Storage Contract**: Events persist in `localStorage` under `calendar_events`.
* **Validation Invariant**: Event times validate against regex `/^([01]\d|2[0-3]):[0-5]\d$/` and sort chronologically by timestamp.

---

## 7. Application Registry & Desktop Models
*Source files: `src/types/index.ts`, `src/lib/app-registry.ts`*

```typescript
export type AppId =
  | "terminal"
  | "file-manager"
  | "text-editor"
  | "system-monitor"
  | "firefox"
  | "music"
  | "video"
  | "portfolio"
  | "resume"
  | "calendar"
  | "settings"
  | "ai-studio";

export interface AppDefinition {
  id: AppId;
  name: string;
  category: AppCategory;
  icon: string;               // Lucide or custom vector glyph key
  gradient?: string;          // Tailored theme gradient
  defaultSize: Size;          // Initial window width and height
  minSize: Size;              // Hard lower bound for resizing
}

export interface DesktopNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  appId?: AppId;
}
```

---

## 8. Portfolio & Resume Data Models
*Source files: `src/lib/portfolio-data.ts`*

```typescript
export interface SkillCategory {
  label: string;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  date: string;
  links?: { label: string; href: string }[];
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  details?: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}
```

---
*Maintained as part of the OpenBSD Web Desktop Portfolio architecture specifications.*

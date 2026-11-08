# Controls & Shortcuts Guide

Complete specification of keyboard shortcuts, window frame controls, pointer gestures, and navigation workflows across the desktop environment.

---

## 1. Global Desktop Shortcuts

| Shortcut | Context | Action |
|---|---|---|
| `Enter` or `Space` | SDDM Login Screen | Unlock screen and transition to Desktop |
| `Escape` | Power Menu / Control Center / Wallpaper Carousel | Close open floating drawer or modal dialog |
| `ArrowUp` / `ArrowDown` | Power Menu | Navigate between menu items |
| `ArrowLeft` / `ArrowRight` | Wallpaper Carousel | Cycle through wallpaper themes |
| `Enter` | Wallpaper Carousel | Apply selected wallpaper and theme |
| Right-Click | Desktop Background | Open Desktop Context Menu (launch apps, toggle widgets) |

---

## 2. Window Frame Controls

Each application window features standard macOS-inspired traffic light controls on the left side of the titlebar:

| Control | Color | Action | Behavior |
|---|---|---|---|
| **Close** | Red (`#ff5f56`) | Close Window | Triggers `before-close-window` event (prompts if unsaved changes exist) |
| **Minimize** | Yellow (`#ffbd2e`) | Minimize to Dock | Hides window from canvas; keeps instance mounted in memory |
| **Maximize** | Green (`#27c93f`) | Maximize / Restore | Expands window to fill workspace canvas; toggles back to previous size |
| **Titlebar Drag** | Grab Cursor | Move Window | Drags window across canvas; bounded by `fitBounds` |
| **Titlebar Double-Click** | Title Area | Maximize Toggle | Quickly maximizes or restores window |
| **Resize Handles** | 8 Edges / Corners | Resize Window | Interactively resizes width/height within `minSize` and canvas limits |

---

## 3. Application-Specific Shortcuts

### Text Editor (`src/components/apps/text-editor.tsx`)
| Shortcut | Action | Description |
|---|---|---|
| `Ctrl+S` or `Ctrl+O` | Save File | Commits buffer to VirtualFS and updates `localStorage` |
| `Ctrl+X` | Close Editor | Checks for unsaved modifications before closing window |
| `Ctrl+K` | Cut Line | Cuts the entire logical line at current cursor position |
| `Ctrl+G` | Toggle Help | Displays or dismisses keyboard shortcut overlay banner |
| `Tab` | Indent | Inserts 4 spaces at cursor location without losing focus |

### Terminal Emulator (`src/components/apps/terminal.tsx`)
| Key | Action | Description |
|---|---|---|
| `Enter` | Execute Command | Submits command line to `CommandInterpreter` |
| `ArrowUp` | History Previous | Recalls previously executed command from history |
| `ArrowDown` | History Next | Advances to newer commands in execution history |
| `Tab` | Auto-Focus | Clicking anywhere in the terminal window focuses the input field |

### File Manager (`src/components/apps/file-manager.tsx`)
| Interaction | Target | Action |
|---|---|---|
| Single Click | Table Row | Selects file or directory item |
| Double Click or `Enter` | Directory | Navigates into selected folder and updates breadcrumb bar |
| Double Click or `Enter` | File | Opens file in associated app (Text Editor, Music, mpv) |
| Click Column Header | Name / Size / Perms / Modified | Sorts table ascending or descending |

### mpv Video Player (`src/components/apps/video.tsx`)
| Interaction | Target | Action |
|---|---|---|
| Click | Video Surface | Toggles play / pause |
| Drag & Drop | Window Body | Drops `.mp4` or `.webm` file from desktop to play immediately |

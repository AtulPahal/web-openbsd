# Window Management Architecture

Deep dive into the spatial geometry, focus stacking context, lifecycle management, and workspace isolation implemented in `src/hooks/use-window-manager.ts` and `src/components/window/window-frame.tsx`.

---

## 1. Spatial Geometry & The `fitBounds` Algorithm

Windows must never clip outside visible desktop boundaries or disappear behind the topbar or bottom dock.

The window manager uses the pure `fitBounds` algorithm:

```typescript
function fitBounds(position: Position, size: Size, area: Size): { size: Size; position: Position } {
  const fitted = {
    width: Math.min(size.width, area.width),
    height: Math.min(size.height, area.height),
  };
  return {
    size: fitted,
    position: {
      x: Math.min(Math.max(0, position.x), area.width - fitted.width),
      y: Math.min(Math.max(0, position.y), area.height - fitted.height),
    },
  };
}
```

### Canvas Observation via `ResizeObserver`
The desktop canvas `<main ref={canvasRef}>` is observed directly using the browser's native `ResizeObserver`. Whenever the viewport resizes (e.g. mobile orientation change or desktop browser resizing):
1. The canvas client area (`clientWidth`, `clientHeight`) updates `areaRef.current`.
2. Maximized windows adjust their dimensions to `{ width: area.width, height: area.height }`.
3. Floating windows have their `position` and `size` refitted through `fitBounds`.
4. Prior restore bounds (`prevBounds`) are also refitted so restoring a maximized window on a smaller screen will not place it off-screen.

---

## 2. Window State Model (`WindowState`)

```typescript
export interface WindowState {
  id: WindowId;             // Unique UUID string
  title: string;            // Titlebar heading
  appId: AppId;             // Registered application identifier
  position: Position;       // { x: number, y: number } in pixels
  size: Size;               // { width: number, height: number } in pixels
  minSize: Size;            // Lower constraint on resizing
  zIndex: number;           // Stacking context elevation
  isMinimized: boolean;     // Hidden from canvas; shown in dock
  isMaximized: boolean;     // Expanded to full canvas
  isFocused: boolean;       // Active keyboard and pointer focus
  workspace?: number;       // Virtual desktop index (1, 2, 3, or 4)
  appState?: AppState;      // Optional state (e.g. { path: string })
  prevBounds?: {            // Restored coordinates prior to maximization
    position: Position;
    size: Size;
  };
}
```

---

## 3. Focus Stacking & Promotion

1. **Focus Elevation**: Focusing a window (`focusWindow(id)`) assigns `zIndex = nextZIndexRef.current++` and sets `isFocused = true`, while setting `isFocused = false` on all other windows.
2. **Focus Promotion on Close or Minimize**: When the currently focused window is closed or minimized, the window manager filters all remaining windows belonging to the current workspace, sorts by `zIndex` descending, and automatically focuses the highest remaining window.

---

## 4. Workspace Isolation & State Preservation

Rather than unmounting window components when users switch workspaces or minimize windows, `src/components/desktop/desktop.tsx` renders all open windows in the DOM with:

```tsx
<WindowFrame
  key={win.id}
  window={win}
  isVisible={(win.workspace ?? 1) === activeWorkspace && !win.isMinimized}
  ...
/>
```

Inside `WindowFrame`, the window section receives `hidden={!isVisible || win.isMinimized}`.

### Benefits of In-DOM Preservation:
* **Unsaved Text Remains Safe**: Text being typed in the Text Editor is never wiped when switching workspaces.
* **Terminal Shell State Intact**: Shell command history, working directory, and running output persist across workspace toggles.
* **Media Playback Continues**: Audio or video continues streaming without re-buffering.

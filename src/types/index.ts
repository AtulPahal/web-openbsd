// Core types for the OpenBSD Web Desktop Environment

/** Unique window identifier */
export type WindowId = string;

/** Position on the desktop */
export interface Position {
  x: number;
  y: number;
}

/** Dimensions */
export interface Size {
  width: number;
  height: number;
}

/** Window state managed by the window manager */
/** Application-specific state passed when opening a window */
export interface AppState {
  path?: string;
  [key: string]: unknown;
}

export interface WindowState {
  id: WindowId;
  title: string;
  appId: AppId;
  position: Position;
  size: Size;
  minSize: Size;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  workspace?: number;
  appState?: AppState;
}

export interface DesktopNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  appId?: AppId;
}

/** Registered application identifiers */
export type AppId =
  | "terminal"
  | "file-manager"
  | "text-editor"
  | "system-monitor"
  | "about"
  | "firefox"
  | "music"
  | "video"
  | "portfolio"
  | "resume"
  | "calendar";
/** Application metadata for the launcher / taskbar */
export interface AppDefinition {
  id: AppId;
  name: string;
  icon: string; // Lucide icon name
  defaultSize: Size;
  minSize: Size;
}

/** Virtual filesystem node */
export interface FSNode {
  name: string;
  path: string;
  type: "file" | "directory" | "symlink";
  permissions: string; // e.g. "rwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  modified: Date;
  content?: string; // only for files
  children?: FSNode[]; // only for directories
}

/** Terminal line output */
export interface TerminalLine {
  id: number;
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: Date;
}

/** System process for the monitor */
export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  state: "running" | "sleeping" | "stopped" | "zombie";
  user: string;
}

/** Desktop context menu item */
export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
}

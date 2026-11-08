import type { FSNode } from "@/types";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { buildVirtualFileSystem } from "@/lib/virtual-fs-seed";

let sharedRoot: FSNode | undefined;
let revision = 0;
const listeners = new Set<() => void>();

export function subscribeFileSystem(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getFileSystemRevision() { return revision; }

function commitFileSystem(root: FSNode) {
  if (typeof localStorage !== "undefined") localStorage.setItem("virtual_fs", JSON.stringify(root));
  revision++;
  for (const listener of listeners) listener();
}
export class VirtualFS {
  private root: FSNode;

  constructor() {
    if (typeof window === "undefined") {
      this.root = buildVirtualFileSystem();
      return;
    }
    if (!sharedRoot) {
      try {
        const saved = localStorage.getItem("virtual_fs");
        if (saved) {
          const restored = JSON.parse(saved, (key, value) => key === "modified" ? new Date(value) : value) as FSNode;
          if (restored.type === "directory" && restored.path === "/" && Array.isArray(restored.children)) sharedRoot = restored;
        }
      } catch { /* Missing or invalid storage starts with the seed. */ }
      sharedRoot ??= buildVirtualFileSystem();
    }
    this.root = sharedRoot;
  }

  /** Normalize a path relative to cwd into an absolute path */
  normalizePath(path: string, cwd: string): string {
    if (!path) return cwd;

    let abs: string;
    if (path.startsWith("/")) {
      abs = path;
    } else if (path === "~" || path.startsWith("~/")) {
      abs = SYSTEM_CONFIG.home + path.slice(1);
    } else {
      abs = cwd === "/" ? "/" + path : cwd + "/" + path;
    }

    const parts = abs.split("/").filter(Boolean);
    const resolved: string[] = [];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") {
        resolved.pop();
      } else {
        resolved.push(p);
      }
    }
    return "/" + resolved.join("/");
  }

  /** Resolve a path to a FSNode or null */
  resolve(path: string, cwd: string): FSNode | null {
    const abs = this.normalizePath(path, cwd);
    if (abs === "/") return this.root;

    const parts = abs.split("/").filter(Boolean);
    let current: FSNode = this.root;
    for (const part of parts) {
      if (current.type !== "directory" || !current.children) return null;
      const child = current.children.find((c) => c.name === part);
      if (!child) return null;
      current = child;
    }
    return current;
  }

  /** List children of a directory */
  list(path: string, cwd: string): FSNode[] {
    const node = this.resolve(path, cwd);
    if (!node || node.type !== "directory") return [];
    return node.children ?? [];
  }

  /** Read file content */
  read(path: string, cwd: string): string | null {
    const node = this.resolve(path, cwd);
    if (!node || node.type !== "file") return null;
    return node.content ?? "";
  }

  /** Write content to a file, creating it if it doesn't exist */
  write(path: string, cwd: string, content: string): boolean {
    const abs = this.normalizePath(path, cwd);
    const node = this.resolve(abs, "/");
    if (node) {
      if (node.type !== "file") return false;
      const previous = { content: node.content, size: node.size, modified: node.modified };
      node.content = content;
      node.size = new TextEncoder().encode(content).length;
      node.modified = new Date();
      try { commitFileSystem(this.root); } catch (error) { Object.assign(node, previous); throw error; }
      return true;
    }

    // Create in parent
    const lastSlash = abs.lastIndexOf("/");
    const parentPath = abs.slice(0, lastSlash) || "/";
    const fileName = abs.slice(lastSlash + 1);
    const parent = this.resolve(parentPath, "/");
    if (!parent || parent.type !== "directory") return false;
    if (!parent.children) parent.children = [];

    parent.children.push({
      name: fileName,
      path: abs,
      type: "file",
      permissions: "rw-r--r--",
      owner: "user",
      group: "user",
      size: new TextEncoder().encode(content).length,
      modified: new Date(),
      content,
    });
    try { commitFileSystem(this.root); } catch (error) { parent.children.pop(); throw error; }
    return true;
  }

  /** Create a directory */
  mkdir(path: string, cwd: string): boolean {
    const abs = this.normalizePath(path, cwd);
    if (this.resolve(abs, "/")) return false; // already exists

    const lastSlash = abs.lastIndexOf("/");
    const parentPath = abs.slice(0, lastSlash) || "/";
    const dirName = abs.slice(lastSlash + 1);
    const parent = this.resolve(parentPath, "/");
    if (!parent || parent.type !== "directory") return false;
    if (!parent.children) parent.children = [];

    parent.children.push({
      name: dirName,
      path: abs,
      type: "directory",
      permissions: "rwxr-xr-x",
      owner: "user",
      group: "user",
      size: 512,
      modified: new Date(),
      children: [],
    });
    try { commitFileSystem(this.root); } catch (error) { parent.children.pop(); throw error; }
    return true;
  }

  /** Remove a file or empty directory */
  remove(path: string, cwd: string): boolean {
    const abs = this.normalizePath(path, cwd);
    if (abs === "/") return false;

    const lastSlash = abs.lastIndexOf("/");
    const parentPath = abs.slice(0, lastSlash) || "/";
    const name = abs.slice(lastSlash + 1);
    const parent = this.resolve(parentPath, "/");
    if (!parent || !parent.children) return false;

    const idx = parent.children.findIndex((c) => c.name === name);
    if (idx === -1) return false;

    const target = parent.children[idx];
    if (target.type === "directory" && target.children && target.children.length > 0) {
      return false; // non-empty directory
    }

    parent.children.splice(idx, 1);
    try { commitFileSystem(this.root); } catch (error) { parent.children.splice(idx, 0, target); throw error; }
    return true;
  }

  /** Check if a path exists */
  exists(path: string, cwd: string): boolean {
    return this.resolve(path, cwd) !== null;
  }

  /** Alias for resolve(path, "/") */
  getNode(path: string): FSNode | null {
    return this.resolve(path, "/");
  }

  /** Alias for list(path, "/") */
  listDirectory(path: string): FSNode[] {
    return this.list(path, "/");
  }

  /** Return root directory */
  getRoot(): FSNode {
    return this.root;
  }
}

export default VirtualFS;

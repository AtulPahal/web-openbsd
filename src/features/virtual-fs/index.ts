import type { FSNode } from "@/types";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { buildVirtualFileSystem } from "@/lib/virtual-fs-seed";

export class VirtualFS {
  private root: FSNode;

  constructor() {
    this.root = buildVirtualFileSystem();
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
      node.content = content;
      node.size = content.length;
      node.modified = new Date();
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
      size: content.length,
      modified: new Date("2024-10-01T00:00:00Z"),
      content,
    });
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
      modified: new Date("2024-10-01T00:00:00Z"),
      children: [],
    });
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

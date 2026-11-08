# Virtual Filesystem Architecture

Detailed documentation of the browser-based Unix filesystem implementation in `src/features/virtual-fs/index.ts` and `src/lib/virtual-fs-seed.ts`.

---

## 1. Overview & Invariants

The Virtual Filesystem (`VirtualFS`) simulates an OpenBSD-like hierarchical directory tree directly inside the browser memory.

### Core Guarantees:
* **Single Client-Side Store**: All apps (`FileManager`, `TextEditor`, `Terminal`, `MusicApp`, `VideoApp`) share a single unified `VirtualFS` singleton instance.
* **Reactive Subscriptions**: Mutating the filesystem immediately notifies all active application windows via `subscribeFileSystem` and `useSyncExternalStore`.
* **Local Storage Persistence**: Changes are serialized to `localStorage` under `virtual_fs`.
* **Transactional Rollback**: If disk serialization throws (e.g. storage quota exceeded or disabled storage), the in-memory mutation is automatically rolled back, keeping the tree in a consistent state.

---

## 2. Node Data Structure (`FSNode`)

```typescript
export interface FSNode {
  name: string;                         // Name of file or directory (e.g. "resume.txt")
  path: string;                         // Absolute Unix path (e.g. "/home/atulpahal/Documents/resume.txt")
  type: "file" | "directory" | "symlink";
  permissions: string;                  // POSIX string (e.g. "rw-r--r--", "rwxr-xr-x")
  owner: string;                        // POSIX owner (e.g. "root", "user")
  group: string;                        // POSIX group (e.g. "wheel", "user")
  size: number;                         // Exact UTF-8 byte length
  modified: Date;                       // Last modified timestamp
  content?: string;                     // File content payload (files only)
  children?: FSNode[];                  // Child nodes array (directories only)
}
```

---

## 3. Seed Hierarchy

Modeled after OpenBSD's standard directory structure:

```
/
├── bin/              # Essential command binaries (ksh, ls, cat, etc.)
├── etc/              # System configurations (motd, pf.conf, hostname.em0)
├── home/
│   └── atulpahal/    # User home directory (~)
│       ├── .kshrc
│       ├── .profile
│       ├── Documents/
│       │   ├── resume.txt
│       │   └── projects.txt
│       ├── Downloads/
│       │   └── bad_apple.mp4
│       └── Music/
│           ├── puffy_wave.mp3
│           └── cyber_pulse.mp3
├── sbin/             # System binaries (init, pfctl, reboot)
├── usr/              # Secondary hierarchy (include, lib, share)
└── var/
    └── log/          # System messages and daemon logs
```

---

## 4. Reactive Store API

```typescript
// Subscribe to any file system mutation
export function subscribeFileSystem(listener: () => void): () => void;

// Retrieve the current revision number (increments on every write/mkdir/remove)
export function getFileSystemRevision(): number;
```

### React Component Usage
```typescript
import { subscribeFileSystem, getFileSystemRevision } from "@/features/virtual-fs";

export function FileManager() {
  // Triggers re-render automatically whenever files are written or deleted
  const revision = useSyncExternalStore(
    subscribeFileSystem,
    getFileSystemRevision,
    () => 0
  );
  ...
}
```

---

## 5. Operations Reference

### `write(path, cwd, content): boolean`
1. Resolves path against working directory.
2. If file exists: stores previous content and modified date, sets new content and UTF-8 byte size, then commits to storage. If commit fails, restores previous values.
3. If creating a new file: resolves parent directory, creates `FSNode`, and pushes to children. If commit fails, pops the node.

### `mkdir(path, cwd): boolean`
1. Verifies path does not already exist.
2. Resolves parent directory and appends a directory node with `permissions: "rwxr-xr-x"` and `size: 512`.

### `remove(path, cwd): boolean`
1. Refuses deletion of root directory (`/`).
2. If target is a directory, verifies it has no children.
3. Splices node from parent children array. Rolls back if storage commit fails.

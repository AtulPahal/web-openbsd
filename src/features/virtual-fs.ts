import type { FSNode } from "@/types";

function makeDir(
  name: string,
  path: string,
  owner = "root",
  group = "wheel",
  children: FSNode[] = []
): FSNode {
  return {
    name,
    path,
    type: "directory",
    permissions: "rwxr-xr-x",
    owner,
    group,
    size: 512,
    modified: new Date("2024-10-01T00:00:00Z"),
    children,
  };
}

function makeFile(
  name: string,
  path: string,
  content = "",
  owner = "root",
  group = "wheel",
  permissions = "rw-r--r--"
): FSNode {
  return {
    name,
    path,
    type: "file",
    permissions,
    owner,
    group,
    size: content.length,
    modified: new Date("2024-10-01T00:00:00Z"),
    content,
  };
}

const MOTD = `OpenBSD 7.5 (GENERIC.MP) #1: Sat Apr  6 12:00:00 MDT 2024

Welcome to OpenBSD: The proactively secure Unix-like operating system.

Please use the sendbug(1) utility to report bugs in the system.
Before reporting a bug, please try to reproduce it with the latest
version of the code. With bug reports, please try to ensure that
enough information to reproduce the problem is enclosed, and if a
known fix for it exists, include that as well.
`;

const PF_CONF = `# $OpenBSD: pf.conf,v 1.55 2024/01/01 00:00:00 $
#
# See pf.conf(5) and /etc/examples/pf.conf

set skip on lo

block return    # block stateless traffic
pass            # establish keep-state

# By default, do not permit remote connections to X11
block return in on ! lo0 proto tcp to port 6000:6010
`;

const HOSTNAME_EM0 = `inet 10.0.0.2 255.255.255.0 10.0.0.255
`;

const PROFILE = `# $OpenBSD: dot.profile,v 1.8 2024/01/01 00:00:00 $
#
# sh/ksh initialization

PATH=$HOME/bin:/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
export PATH HOME TERM
export PS1='\\u@\\h:\\w\\$ '
export ENV=$HOME/.kshrc
`;

function buildDefaultFS(): FSNode {
  return makeDir("/", "/", "root", "wheel", [
    makeDir("bin", "/bin", "root", "wheel", [
      makeFile("ksh", "/bin/ksh", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("ls", "/bin/ls", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("cat", "/bin/cat", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("echo", "/bin/echo", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("rm", "/bin/rm", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("mkdir", "/bin/mkdir", "", "root", "wheel", "rwxr-xr-x"),
    ]),
    makeDir("sbin", "/sbin", "root", "wheel", [
      makeFile("pfctl", "/sbin/pfctl", "", "root", "wheel", "rwxr-xr-x"),
      makeFile("reboot", "/sbin/reboot", "", "root", "wheel", "rwxr-xr-x"),
    ]),
    makeDir("etc", "/etc", "root", "wheel", [
      makeFile("motd", "/etc/motd", MOTD),
      makeFile("hostname.em0", "/etc/hostname.em0", HOSTNAME_EM0),
      makeFile("pf.conf", "/etc/pf.conf", PF_CONF),
      makeFile("hosts", "/etc/hosts", "127.0.0.1\tlocalhost\n::1\t\tlocalhost\n10.0.0.2\topenbsd.local\n"),
      makeFile("myname", "/etc/myname", "openbsd.local\n"),
    ]),
    makeDir("home", "/home", "root", "wheel", [
      makeDir("user", "/home/user", "user", "user", [
        makeFile(".profile", "/home/user/.profile", PROFILE, "user", "user"),
        makeFile(".kshrc", "/home/user/.kshrc", "# ksh configuration\nset -o emacs\nalias ll='ls -la'\n", "user", "user"),
        makeDir("Documents", "/home/user/Documents", "user", "user", [
          makeFile("readme.txt", "/home/user/Documents/readme.txt",
            "Welcome to OpenBSD.\n\nThis is a virtual filesystem running in your browser.\nFeel free to explore!\n", "user", "user"),
        ]),
        makeDir("Downloads", "/home/user/Downloads", "user", "user"),
        makeDir("Music", "/home/user/Music", "user", "user", [
          makeFile("SoundHelix_Song_1.mp3", "/home/user/Music/SoundHelix_Song_1.mp3", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "user", "user", "rw-r--r--"),
          makeFile("SoundHelix_Song_2.mp3", "/home/user/Music/SoundHelix_Song_2.mp3", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "user", "user", "rw-r--r--"),
        ]),
        makeDir("Videos", "/home/user/Videos", "user", "user", [
          makeFile("OpenBSD_Guide.mp4", "/home/user/Videos/OpenBSD_Guide.mp4", "https://youtu.be/FtutLA63Cp8", "user", "user", "rw-r--r--"),
        ]),
      ]),
    ]),
    makeDir("usr", "/usr", "root", "wheel", [
      makeDir("bin", "/usr/bin", "root", "wheel", [
        makeFile("man", "/usr/bin/man", "", "root", "wheel", "rwxr-xr-x"),
        makeFile("grep", "/usr/bin/grep", "", "root", "wheel", "rwxr-xr-x"),
        makeFile("sed", "/usr/bin/sed", "", "root", "wheel", "rwxr-xr-x"),
      ]),
      makeDir("local", "/usr/local", "root", "wheel", [
        makeDir("bin", "/usr/local/bin", "root", "wheel"),
        makeDir("lib", "/usr/local/lib", "root", "wheel"),
        makeDir("share", "/usr/local/share", "root", "wheel"),
      ]),
      makeDir("share", "/usr/share", "root", "wheel", [
        makeDir("man", "/usr/share/man", "root", "wheel"),
        makeDir("misc", "/usr/share/misc", "root", "wheel"),
      ]),
    ]),
    makeDir("var", "/var", "root", "wheel", [
      makeDir("log", "/var/log", "root", "wheel", [
        makeFile("messages", "/var/log/messages", "Jan  1 00:00:00 openbsd syslogd: start\n"),
        makeFile("authlog", "/var/log/authlog", ""),
      ]),
      makeDir("run", "/var/run"),
      makeDir("tmp", "/var/tmp"),
    ]),
    makeDir("tmp", "/tmp", "root", "wheel"),
  ]);
}

export class VirtualFS {
  private root: FSNode;

  constructor() {
    this.root = buildDefaultFS();
  }

  /** Normalize a path relative to cwd into an absolute path */
  normalizePath(path: string, cwd: string): string {
    if (!path) return cwd;

    let abs: string;
    if (path.startsWith("/")) {
      abs = path;
    } else if (path === "~" || path.startsWith("~/")) {
      abs = "/home/user" + path.slice(1);
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

    parent.children.push(
      makeFile(fileName, abs, content, "user", "user")
    );
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

    parent.children.push(makeDir(dirName, abs, "user", "user"));
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

import type { FSNode } from "@/types";

function mkFile(
  name: string,
  parentPath: string,
  opts: {
    permissions?: string;
    owner?: string;
    group?: string;
    size?: number;
    content?: string;
    modified?: Date;
  } = {}
): FSNode {
  const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
  return {
    name,
    path,
    type: "file",
    permissions: opts.permissions ?? "rw-r--r--",
    owner: opts.owner ?? "root",
    group: opts.group ?? "wheel",
    size: opts.size ?? opts.content?.length ?? 0,
    modified: opts.modified ?? new Date("2026-04-15T10:30:00"),
    content: opts.content,
  };
}

function mkDir(
  name: string,
  parentPath: string,
  children: FSNode[],
  opts: {
    permissions?: string;
    owner?: string;
    group?: string;
    modified?: Date;
  } = {}
): FSNode {
  const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
  return {
    name,
    path,
    type: "directory",
    permissions: opts.permissions ?? "rwxr-xr-x",
    owner: opts.owner ?? "root",
    group: opts.group ?? "wheel",
    size: 512,
    modified: opts.modified ?? new Date("2026-04-15T10:30:00"),
    children,
  };
}

function buildDefaultFS(): FSNode {
  const etcDir = mkDir("etc", "/", [
    mkFile("rc.conf", "/etc", {
      content:
        '# OpenBSD rc.conf\npkg_scripts=""\nntpd_flags=""\nsmtpd_flags=""\nsshd_flags=""\n',
      size: 92,
      modified: new Date("2026-03-12T08:00:00"),
    }),
    mkFile("hostname.em0", "/etc", {
      content: "dhcp\n",
      size: 5,
      permissions: "rw-r-----",
    }),
    mkFile("pf.conf", "/etc", {
      content:
        '# Packet Filter configuration\nset skip on lo\nblock return\npass out quick\npass in on egress proto tcp to port { 22, 80, 443 }\n',
      size: 128,
      permissions: "rw-r-----",
    }),
    mkFile("myname", "/etc", { content: "openbsd.localdomain\n", size: 20 }),
    mkFile("passwd", "/etc", {
      content:
        "root:*:0:0:Charlie &:/root:/bin/ksh\nnobody:*:32767:32767:Unprivileged user:/nonexistent:/sbin/nologin\nuser:*:1000:1000:Regular User:/home/user:/bin/ksh\n",
      size: 156,
      permissions: "rw-r--r--",
    }),
    mkFile("fstab", "/etc", {
      content:
        "# Device\tMountpoint\tFStype\tOptions\t\tDump\tPass\n/dev/sd0a\t/\t\tffs\trw\t\t1\t1\n/dev/sd0b\tnone\t\tswap\tsw\t\t0\t0\n",
      size: 142,
    }),
    mkDir("ssh", "/etc", [
      mkFile("sshd_config", "/etc/ssh", {
        content:
          "# OpenSSH daemon configuration\nPort 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\n",
        size: 108,
        permissions: "rw-------",
      }),
    ]),
  ]);

  const homeDir = mkDir("home", "/", [
    mkDir(
      "user",
      "/home",
      [
        mkFile(".profile", "/home/user", {
          content:
            'export PATH=$HOME/bin:$PATH\nexport ENV=$HOME/.kshrc\nexport TERM=xterm-256color\n',
          size: 78,
          owner: "user",
          group: "user",
        }),
        mkFile(".kshrc", "/home/user", {
          content:
            "# ksh configuration\nset -o emacs\nalias ll='ls -la'\nalias la='ls -a'\nPS1='\\u@\\h:\\w\\$ '\n",
          size: 90,
          owner: "user",
          group: "user",
        }),
        mkDir(
          "Documents",
          "/home/user",
          [
            mkFile("notes.txt", "/home/user/Documents", {
              content:
                "OpenBSD Notes\n=============\n\n- pf(4) is the packet filter\n- smtpd(8) for mail\n- httpd(8) for web server\n- relayd(8) for load balancing\n",
              size: 134,
              owner: "user",
              group: "user",
            }),
            mkFile("todo.md", "/home/user/Documents", {
              content:
                "# TODO\n\n- [x] Configure pf.conf\n- [ ] Set up httpd virtual hosts\n- [ ] Enable relayd\n- [ ] Review doas.conf\n",
              size: 106,
              owner: "user",
              group: "user",
            }),
          ],
          { owner: "user", group: "user" }
        ),
        mkDir(
          "src",
          "/home/user",
          [
            mkFile("hello.c", "/home/user/src", {
              content:
                '#include <stdio.h>\n\nint\nmain(void)\n{\n\tprintf("Hello, OpenBSD!\\n");\n\treturn 0;\n}\n',
              size: 80,
              owner: "user",
              group: "user",
            }),
            mkFile("Makefile", "/home/user/src", {
              content:
                "PROG=hello\nSRCS=hello.c\n\n.include <bsd.prog.mk>\n",
              size: 48,
              owner: "user",
              group: "user",
            }),
          ],
          { owner: "user", group: "user" }
        ),
      ],
      { owner: "user", group: "user" }
    ),
  ]);

  const usrDir = mkDir("usr", "/", [
    mkDir("bin", "/usr", [
      mkFile("ssh", "/usr/bin", {
        permissions: "rwxr-xr-x",
        size: 394728,
        modified: new Date("2026-02-20T15:00:00"),
      }),
      mkFile("tmux", "/usr/bin", {
        permissions: "rwxr-xr-x",
        size: 298512,
        modified: new Date("2026-02-20T15:00:00"),
      }),
      mkFile("vi", "/usr/bin", {
        permissions: "rwxr-xr-x",
        size: 266240,
        modified: new Date("2026-02-20T15:00:00"),
      }),
    ]),
    mkDir("local", "/usr", [
      mkDir("bin", "/usr/local", [
        mkFile("node", "/usr/local/bin", {
          permissions: "rwxr-xr-x",
          size: 45219840,
        }),
        mkFile("python3", "/usr/local/bin", {
          permissions: "rwxr-xr-x",
          size: 14832,
        }),
      ]),
      mkDir("share", "/usr/local", [
        mkDir("doc", "/usr/local/share", [
          mkFile("README", "/usr/local/share/doc", {
            content:
              "OpenBSD packages documentation directory.\nSee /usr/local/share/doc/pkg-readmes/ for package notes.\n",
            size: 96,
          }),
        ]),
      ]),
    ]),
    mkDir("share", "/usr", [
      mkDir("man", "/usr/share", [
        mkFile("man1", "/usr/share/man", {
          permissions: "rwxr-xr-x",
          size: 512,
        }),
      ]),
    ]),
  ]);

  const varDir = mkDir("var", "/", [
    mkDir("log", "/var", [
      mkFile("messages", "/var/log", {
        content:
          "Apr 15 10:30:01 openbsd syslogd: start\nApr 15 10:30:02 openbsd kernel: OpenBSD 7.6 (GENERIC.MP)\nApr 15 10:30:03 openbsd pflogd: listening on pflog0\n",
        size: 152,
        permissions: "rw-r-----",
        owner: "root",
        group: "wheel",
      }),
      mkFile("authlog", "/var/log", {
        content:
          "Apr 15 10:31:00 openbsd sshd: Server listening on 0.0.0.0 port 22\n",
        size: 68,
        permissions: "rw-------",
      }),
      mkFile("daemon", "/var/log", {
        content: "",
        size: 0,
        permissions: "rw-r-----",
      }),
    ]),
    mkDir("run", "/var", [
      mkFile("dmesg.boot", "/var/run", {
        content:
          "OpenBSD 7.6 (GENERIC.MP) #0: Mon Apr  1 00:00:00 MDT 2026\n",
        size: 58,
        permissions: "rw-r--r--",
      }),
    ]),
  ]);

  const tmpDir = mkDir("tmp", "/", [], {
    permissions: "rwxrwxrwt",
    modified: new Date("2026-04-15T12:00:00"),
  });

  const rootHome = mkDir("root", "/", [
    mkFile(".profile", "/root", {
      content: 'export PATH=/sbin:/usr/sbin:$PATH\nexport ENV=$HOME/.kshrc\n',
      size: 56,
      permissions: "rw-------",
    }),
  ], { permissions: "rwx------" });

  const binDir = mkDir("bin", "/", [
    mkFile("ksh", "/bin", { permissions: "rwxr-xr-x", size: 319488 }),
    mkFile("ls", "/bin", { permissions: "rwxr-xr-x", size: 43008 }),
    mkFile("cat", "/bin", { permissions: "rwxr-xr-x", size: 22528 }),
    mkFile("cp", "/bin", { permissions: "rwxr-xr-x", size: 30720 }),
    mkFile("mv", "/bin", { permissions: "rwxr-xr-x", size: 26624 }),
    mkFile("rm", "/bin", { permissions: "rwxr-xr-x", size: 22528 }),
  ]);

  const sbinDir = mkDir("sbin", "/", [
    mkFile("pfctl", "/sbin", { permissions: "rwxr-xr-x", size: 253952 }),
    mkFile("ifconfig", "/sbin", { permissions: "rwxr-xr-x", size: 126976 }),
    mkFile("reboot", "/sbin", { permissions: "rwxr-xr-x", size: 14336 }),
  ]);

  const devDir = mkDir("dev", "/", [
    mkFile("null", "/dev", { permissions: "rw-rw-rw-", size: 0 }),
    mkFile("random", "/dev", { permissions: "rw-r--r--", size: 0 }),
    mkFile("console", "/dev", { permissions: "rw-------", size: 0 }),
  ]);

  return {
    name: "/",
    path: "/",
    type: "directory",
    permissions: "rwxr-xr-x",
    owner: "root",
    group: "wheel",
    size: 512,
    modified: new Date("2026-04-15T10:30:00"),
    children: [binDir, devDir, etcDir, homeDir, rootHome, sbinDir, tmpDir, usrDir, varDir],
  };
}

export class VirtualFS {
  private root: FSNode;

  constructor() {
    this.root = buildDefaultFS();
  }

  getRoot(): FSNode {
    return this.root;
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

    // Create in parent directory
    const lastSlash = abs.lastIndexOf("/");
    const parentPath = abs.slice(0, lastSlash) || "/";
    const fileName = abs.slice(lastSlash + 1);
    const parent = this.resolve(parentPath, "/");
    if (!parent || parent.type !== "directory") return false;
    if (!parent.children) parent.children = [];
    parent.children.push(mkFile(fileName, parentPath, { content, owner: "user", group: "user" }));
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
    parent.children.push(mkDir(dirName, parentPath, [], { owner: "user", group: "user" }));
    return true;
  }

  /** Remove a file or directory (non-empty dirs return false) */
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

  /** List children of a directory */
  list(path: string, cwd: string): FSNode[] {
    const node = this.resolve(path, cwd);
    if (!node || node.type !== "directory") return [];
    return node.children ?? [];
  }

  /** Delegate to resolve(path, "/") for backward compat */
  getNode(path: string): FSNode | null {
    return this.resolve(path, "/");
  }

  listDirectory(path: string): FSNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== "directory") return [];
    return node.children ?? [];
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== "file") return null;
    return node.content ?? "";
  }

  getAllDirectories(node?: FSNode): FSNode[] {
    const root = node ?? this.root;
    const dirs: FSNode[] = [];

    if (root.type === "directory") {
      dirs.push(root);
      for (const child of root.children ?? []) {
        dirs.push(...this.getAllDirectories(child));
      }
    }

    return dirs;
  }
}

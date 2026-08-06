import { VirtualFS } from "@/features/virtual-fs";

const PUFFY_ASCII = `
                 _____
             ,--'     \`--,
           ,'    .----.   \`,
          /   ,-'      \`-,  \\
         /   /   .----,   \\  \\
        |   /   /      \\   |  |
        |  |   | (O)(O) |  |  |
        |  |   |  \\  /  |  |  |
        |   \\   \\  \\/  /   |  |
         \\   \\   \`----'   /  /
          \\   \`-,      ,-'  /
           \`,   \`----'   ,'
             \`--,_____,--'
                  Puffy`;

const FASTFETCH_TEMPLATE = (cwd: string) => {
  const now = new Date();
  return `${PUFFY_ASCII}

  user@openbsd.local
  ------------------
  OS:       OpenBSD 7.5 GENERIC.MP amd64
  Host:     Web Desktop 1.0
  Kernel:   OpenBSD 7.5
  Uptime:   ${Math.floor(Math.random() * 24)} hours, ${Math.floor(Math.random() * 60)} mins
  Packages: 42 (pkg_info)
  Shell:    ksh 5.2.14
  Terminal: xterm-256color
  CPU:      Virtual CPU @ 3.00GHz
  Memory:   128MiB / 2048MiB
  Disk:     420MiB / 8192MiB (5%)
  Local IP: 10.0.0.2
  CWD:      ${cwd}`;
};

const MAN_PAGES: Record<string, string> = {
  ls: `LS(1)                     General Commands Manual                    LS(1)

NAME
     ls - list directory contents

SYNOPSIS
     ls [-la] [file ...]

DESCRIPTION
     For each operand that names a file, ls displays its name. For each
     operand that names a directory, ls displays the names of files
     contained in that directory.

     -l      List in long format.
     -a      Include hidden files (entries starting with '.').`,

  cd: `CD(1)                     General Commands Manual                    CD(1)

NAME
     cd - change working directory

SYNOPSIS
     cd [directory]

DESCRIPTION
     Change the current directory to directory. The default is HOME.`,

  cat: `CAT(1)                    General Commands Manual                   CAT(1)

NAME
     cat - concatenate and print files

SYNOPSIS
     cat [file ...]

DESCRIPTION
     The cat utility reads files sequentially, writing them to stdout.`,

  pwd: `PWD(1)                    General Commands Manual                   PWD(1)

NAME
     pwd - return working directory name

SYNOPSIS
     pwd

DESCRIPTION
     The pwd utility writes the absolute pathname of the current
     working directory to the standard output.`,

  echo: `ECHO(1)                   General Commands Manual                  ECHO(1)

NAME
     echo - write arguments to standard output

SYNOPSIS
     echo [string ...]

DESCRIPTION
     The echo utility writes any specified operands, separated by
     single blank characters, to the standard output.`,

  reboot: `REBOOT(8)                 System Manager's Manual                 REBOOT(8)

NAME
     reboot - stopping and restarting the system

SYNOPSIS
     reboot

DESCRIPTION
     The reboot utility restarts the system.`,

  shutdown: `SHUTDOWN(8)               System Manager's Manual               SHUTDOWN(8)

NAME
     shutdown - close down the system at a given time

SYNOPSIS
     shutdown

DESCRIPTION
     The shutdown command terminates all processes and shuts down the system.`,

  exit: `EXIT(1)                   General Commands Manual                    EXIT(1)

NAME
     exit - exit the shell

SYNOPSIS
     exit

DESCRIPTION
     The exit utility terminates the current shell or terminal window.`,

  uname: `UNAME(1)                  General Commands Manual                 UNAME(1)

NAME
     uname - print operating system name

SYNOPSIS
     uname [-a]

DESCRIPTION
     The uname utility writes the name of the operating system to
     stdout. The -a flag prints all system information.`,

  whoami: `WHOAMI(1)                 General Commands Manual                WHOAMI(1)

NAME
     whoami - display effective user id

SYNOPSIS
     whoami

DESCRIPTION
     The whoami utility displays the login name associated with the
     current effective user ID.`,

  hostname: `HOSTNAME(1)               General Commands Manual              HOSTNAME(1)

NAME
     hostname - set or print name of current host system

SYNOPSIS
     hostname

DESCRIPTION
     The hostname utility prints the name of the current host.`,

  date: `DATE(1)                   General Commands Manual                  DATE(1)

NAME
     date - display or set date and time

SYNOPSIS
     date

DESCRIPTION
     When invoked without arguments, the date utility displays the
     current date and time.`,

  clear: `CLEAR(1)                  General Commands Manual                 CLEAR(1)

NAME
     clear - clear the terminal screen

SYNOPSIS
     clear

DESCRIPTION
     Clear the terminal screen.`,

  help: `HELP(1)                   General Commands Manual                  HELP(1)

NAME
     help - list available commands

SYNOPSIS
     help

DESCRIPTION
     Display a list of all available built-in commands.`,

  man: `MAN(1)                    General Commands Manual                   MAN(1)

NAME
     man - display manual pages

SYNOPSIS
     man command

DESCRIPTION
     The man utility displays the manual pages for the given command.`,
};

function formatPermissions(node: { type: string; permissions: string }): string {
  const prefix = node.type === "directory" ? "d" : node.type === "symlink" ? "l" : "-";
  return prefix + node.permissions;
}

function formatLsLong(node: { type: string; permissions: string; owner: string; group: string; size: number; modified: Date; name: string }): string {
  const perms = formatPermissions(node);
  const links = node.type === "directory" ? " 2" : " 1";
  const owner = node.owner.padEnd(6);
  const group = node.group.padEnd(6);
  const size = String(node.size).padStart(6);
  const date = node.modified;
  const month = date.toLocaleString("en", { month: "short" });
  const day = String(date.getDate()).padStart(2);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const suffix = node.type === "directory" ? "/" : "";
  return `${perms}${links} ${owner} ${group} ${size} ${month} ${day} ${time} ${node.name}${suffix}`;
}

export class CommandInterpreter {
  private fs: VirtualFS;
  private cwd: string;
  private env: Record<string, string>;
  private history: string[];
  private startTime = Date.now();

  constructor(fs: VirtualFS) {
    this.fs = fs;
    this.cwd = "/home/user";
    this.env = {
      HOME: "/home/user",
      USER: "user",
      SHELL: "/bin/ksh",
      PATH: "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin",
      TERM: "xterm-256color",
      HOSTNAME: "openbsd.local",
    };
    this.history = [];
  }

  getCwd(): string {
    return this.cwd;
  }

  getPrompt(): string {
    let display = this.cwd;
    const home = this.env.HOME;
    if (this.cwd === home) {
      display = "~";
    } else if (this.cwd.startsWith(home + "/")) {
      display = "~" + this.cwd.slice(home.length);
    }
    return `user@openbsd:${display}$ `;
  }

  execute(input: string): string | Promise<string> {
    const trimmed = input.trim();
    if (!trimmed) return "";
    this.history.push(trimmed);

    // Parse into tokens (basic shell-style)
    const tokens = this.tokenize(trimmed);
    if (tokens.length === 0) return "";

    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case "ls": return this.cmdLs(args);
      case "cd": return this.cmdCd(args);
      case "pwd": return this.cwd;
      case "cat": return this.cmdCat(args);
      case "echo": return args.join(" ");
      case "clear": return "\x1BCLEAR";
      case "whoami": return "user";
      case "hostname": return "openbsd.local";
      case "uname": return this.cmdUname(args);
      case "date": return new Date().toString();
      case "help": return this.cmdHelp();
      case "fastfetch":
      case "screenfetch": return FASTFETCH_TEMPLATE(this.cwd);
      case "man": return this.cmdMan(args);
      case "env":
      case "printenv": return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join("\n");
      case "export": return this.cmdExport(args);
      case "id": return "uid=1000(user) gid=1000(user) groups=1000(user), 0(wheel)";
      case "uptime": {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const h = Math.floor(elapsed / 3600);
        const m = Math.floor((elapsed % 3600) / 60);
        const upStr = `${h}:${String(m).padStart(2, "0")}`;
        return ` ${new Date().toLocaleTimeString()}  up ${upStr}, 1 user, load averages: 0.12 0.08 0.06`;
      }
      case "curl": return this.cmdCurl(args);
      case "touch": return this.cmdTouch(args);
      case "mkdir": return this.cmdMkdir(args);
      case "rm": return this.cmdRm(args);
      case "history": return this.history.map((c, i) => `${String(i + 1).padStart(4)} ${c}`).join("\n");
      case "grep": return this.cmdGrep(args);
      case "wc": return this.cmdWc(args);
      case "head": return this.cmdHead(args);
      case "tail": return this.cmdHead(args, true);
      default:
        return `ksh: ${cmd}: not found`;
    }
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle;
      } else if (ch === '"' && !inSingle) {
        inDouble = !inDouble;
      } else if (ch === " " && !inSingle && !inDouble) {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  private cmdLs(args: string[]): string {
    let showAll = false;
    let showLong = false;
    let target = ".";

    for (const a of args) {
      if (a.startsWith("-")) {
        if (a.includes("l")) showLong = true;
        if (a.includes("a")) showAll = true;
      } else {
        target = a;
      }
    }

    const node = this.fs.resolve(target === "." ? this.cwd : target, this.cwd);
    if (!node) return `ls: ${target}: No such file or directory`;
    if (node.type !== "directory") {
      return showLong ? formatLsLong(node) : node.name;
    }

    let entries = node.children ?? [];
    if (!showAll) {
      entries = entries.filter((e) => !e.name.startsWith("."));
    }

    // Sort directories first, then alphabetically
    entries = [...entries].sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });

    if (showLong) {
      const lines = [`total ${entries.length}`];
      for (const e of entries) {
        lines.push(formatLsLong(e));
      }
      return lines.join("\n");
    }

    return entries
      .map((e) => (e.type === "directory" ? e.name + "/" : e.name))
      .join("  ");
  }

  private cmdCd(args: string[]): string {
    const target = args[0] ?? this.env.HOME;
    const abs = this.fs.normalizePath(target, this.cwd);
    const node = this.fs.resolve(abs, "/");

    if (!node) return `ksh: cd: ${target}: no such file or directory`;
    if (node.type !== "directory") return `ksh: cd: ${target}: not a directory`;

    this.cwd = abs;
    return "";
  }

  private cmdCat(args: string[]): string {
    if (args.length === 0) return "usage: cat [file ...]";
    const results: string[] = [];
    for (const a of args) {
      const content = this.fs.read(a, this.cwd);
      if (content === null) {
        results.push(`cat: ${a}: No such file or directory`);
      } else {
        results.push(content);
      }
    }
    return results.join("\n");
  }

  private cmdUname(args: string[]): string {
    if (args.includes("-a")) {
      return "OpenBSD openbsd.local 7.5 GENERIC.MP#1 amd64";
    }
    return "OpenBSD";
  }

  private cmdHelp(): string {
    return `Available commands:
  ls [-la]           List directory contents
  cd <dir>           Change directory
  pwd                Print working directory
  cat <file>         Print file contents
  echo <text>        Print text
  clear              Clear screen
  whoami             Print current user
  hostname           Print hostname
  uname [-a]         Print system information
  date               Print current date/time
  reboot             Reboot the system
  shutdown           Shutdown the system
  man <cmd>          Manual page
  fastfetch          System information
  curl <url>         Fetch a URL
  touch <file>       Create or update file
  mkdir <dir>        Create directory
  rm [-r] <path>     Remove file or directory
  history            Show command history
  grep <pat> <file>  Search file for pattern
  wc <file>          Count lines/words/chars
  head/tail <file>   First/last lines of file
  help               This help message`;
  }

  private cmdMan(args: string[]): string {
    if (args.length === 0) return "What manual page do you want?\nFor example, try 'man man'.";
    const page = MAN_PAGES[args[0]];
    if (!page) return `man: no entry for ${args[0]} in the manual.`;
    return page;
  }

  private cmdExport(args: string[]): string {
    for (const a of args) {
      const eq = a.indexOf("=");
      if (eq > 0) {
        this.env[a.slice(0, eq)] = a.slice(eq + 1);
      }
    }
    return "";
  }

  private async cmdCurl(args: string[]): Promise<string> {
    if (args.length === 0) return "usage: curl <url>";
    let url = args[0];
    if (!url.startsWith("http")) url = "https://" + url;
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (!res.ok) return `curl: (22) The requested URL returned error: ${res.status}`;
      const text = await res.text();
      const body = text.slice(0, 4000);
      const len = body.length;
      return `  % Total    % Received\n  100  ${len}  100  ${len}\n\n${body}`;
    } catch {
      try {
        const hostname = new URL(url).hostname;
        return `curl: (6) Could not resolve host: ${hostname}`;
      } catch {
        return `curl: (6) Could not resolve host: ${url}`;
      }
    }
  }

  private cmdTouch(args: string[]): string {
    if (args.length === 0) return "usage: touch <file> ...";
    for (const a of args) {
      const ok = this.fs.write(a, this.cwd, this.fs.read(a, this.cwd) ?? "");
      if (!ok) return `touch: ${a}: cannot create file`;
    }
    return "";
  }

  private cmdMkdir(args: string[]): string {
    if (args.length === 0) return "usage: mkdir <dir> ...";
    for (const a of args) {
      const ok = this.fs.mkdir(a, this.cwd);
      if (!ok) return `mkdir: ${a}: File exists`;
    }
    return "";
  }

  private cmdRm(args: string[]): string {
    if (args.length === 0) return "usage: rm [-r] <path> ...";
    const targets = args.filter((a) => !a.startsWith("-"));
    for (const t of targets) {
      const ok = this.fs.remove(t, this.cwd);
      if (!ok) return `rm: ${t}: No such file or directory`;
    }
    return "";
  }

  private cmdGrep(args: string[]): string {
    if (args.length < 2) return "usage: grep <pattern> <file>";
    const [pattern, filePath] = args;
    const content = this.fs.read(filePath, this.cwd);
    if (content === null) return `grep: ${filePath}: No such file or directory`;
    try {
      const regex = new RegExp(pattern);
      return content.split("\n").filter((l) => regex.test(l)).join("\n");
    } catch {
      return `grep: invalid regex: ${pattern}`;
    }
  }

  private cmdWc(args: string[]): string {
    if (args.length === 0) return "usage: wc <file>";
    const results: string[] = [];
    for (const a of args) {
      const content = this.fs.read(a, this.cwd);
      if (content === null) {
        results.push(`wc: ${a}: No such file or directory`);
        continue;
      }
      const lines = content.split("\n").length;
      const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
      const chars = content.length;
      results.push(`${String(lines).padStart(4)} ${String(words).padStart(4)} ${String(chars).padStart(4)} ${a}`);
    }
    return results.join("\n");
  }

  private cmdHead(args: string[], fromEnd = false): string {
    let n = 10;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        n = parseInt(args[++i]) || 10;
      } else if (args[i].startsWith("-") && /^\d+$/.test(args[i].slice(1))) {
        n = parseInt(args[i].slice(1));
      } else {
        files.push(args[i]);
      }
    }
    const cmd = fromEnd ? "tail" : "head";
    if (files.length === 0) return `usage: ${cmd} [-n N] <file>`;
    const results: string[] = [];
    for (const f of files) {
      const content = this.fs.read(f, this.cwd);
      if (content === null) {
        results.push(`${cmd}: ${f}: No such file or directory`);
        continue;
      }
      const lines = content.split("\n");
      const slice = fromEnd ? lines.slice(-n) : lines.slice(0, n);
      if (files.length > 1) results.push(`==> ${f} <==`);
      results.push(slice.join("\n"));
    }
    return results.join("\n");
  }
}

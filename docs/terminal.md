# Terminal & Command Interpreter Guide

Documentation for the `kitty`-styled terminal emulator (`src/components/apps/terminal.tsx`) and the built-in shell engine (`src/features/command-interpreter.ts`).

---

## 1. Overview

The terminal provides an authentic OpenBSD `ksh` shell experience running on top of the browser's `VirtualFS`. It features:
* Prompt displaying current working directory (`atulpahal@openbsd:~$ `).
* Scrollable history with up to 500 lines of output.
* Command history navigation via `ArrowUp` and `ArrowDown`.
* Full ANSI SGR escape sequence parser supporting 16-color Pywal terminal palettes.

---

## 2. Command Reference

| Command | Usage | Description |
|---|---|---|
| `help` | `help` | Lists all available shell commands |
| `ls` | `ls [-l] [-a] [path]` | Lists directory files with permissions, byte sizes, and timestamps |
| `cd` | `cd [dir]` | Changes current working directory (supports `~`, `.`, `..`) |
| `cat` | `cat <file> ...` | Prints contents of one or more text files |
| `pwd` | `pwd` | Prints the absolute path of the current working directory |
| `mkdir` | `mkdir <dir> ...` | Creates directories in the virtual filesystem |
| `rm` | `rm <file> ...` | Removes files from the filesystem |
| `grep` | `grep <pattern> <file>` | Searches for text patterns or regular expressions in a file |
| `wc` | `wc <file> ...` | Counts lines, words, and UTF-8 bytes |
| `head` | `head [-n N] <file>` | Displays first $N$ lines of a file (defaults to 10; `-n 0` outputs nothing) |
| `tail` | `tail [-n N] <file>` | Displays last $N$ lines of a file |
| `clear` | `clear` | Clears terminal screen history |
| `fastfetch` | `fastfetch` | Renders ASCII Puffy mascot and system hardware telemetry |
| `portfolio` | `portfolio` | Displays developer resume summary and project highlights |
| `resume` | `resume` | Prints technical skills and contact info |
| `github` | `github [user]` | Queries live GitHub public profile and recent repositories via GitHub API |
| `ping` | `ping [host]` | Simulates ICMP echo packets with realistic millisecond latency |
| `sysctl` | `sysctl [var]` | Displays kernel variables (`hw.machine`, `hw.ncpu`, `hw.physmem`) |
| `man` | `man <command>` | Displays manual pages formatted like standard OpenBSD man pages |
| `exit` | `exit` | Closes terminal emulator window |

---

## 3. ANSI Escape Sequence Parser

The terminal uses a standards-compliant SGR escape sequence parser (`renderAnsiContent`) that maps terminal codes to semantic CSS custom properties:

```typescript
function renderAnsiContent(content: string): React.ReactNode;
```

* **Standard Colors (`\x1b[30m` – `\x1b[37m`)**: Mapped to `var(--color0)` through `var(--color7)`.
* **Bright Colors (`\x1b[90m` – `\x1b[97m`)**: Mapped to `var(--color8)` through `var(--color15)`.
* **Bold Formatting (`\x1b[1m`)**: Applies `fontWeight: 700`.
* **Reset Tokens (`\x1b[0m`)**: Resets text color, background, and font weight cleanly.

import { SYSTEM_CONFIG } from "./system-config";

export const PUFFY_ASCII = `
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

export const INITIAL_MOTD = `OpenBSD 7.5 (GENERIC.MP) #1: Sat Apr  6 12:00:00 MDT 2024

Welcome to OpenBSD: The proactively secure Unix-like operating system.

Please use the sendbug(1) utility to report bugs in the system.
Type 'help' for a list of available commands or 'fastfetch' for system info.
`;

export function buildFastfetch(cwd: string, elapsedSeconds = 0): string {
  const elapsed = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  return `${PUFFY_ASCII}

  ${SYSTEM_CONFIG.username}@${SYSTEM_CONFIG.hostname}
  ------------------
  OS:       ${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} GENERIC.MP ${SYSTEM_CONFIG.architecture}
  Host:     Web Desktop 1.0
  Kernel:   ${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion}
  Uptime:   ${hours} hours, ${minutes} mins
  Packages: 42 (pkg_info)
  Shell:    ksh 5.2.14
  Terminal: ${SYSTEM_CONFIG.terminal}
  CPU:      Virtual CPU @ 3.00GHz
  Memory:   128MiB / 2048MiB
  Disk:     420MiB / 8192MiB (5%)
  Local IP: ${SYSTEM_CONFIG.localIp}
  CWD:      ${cwd}`;
}

export const MAN_PAGES: Record<string, string> = {
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

import { SYSTEM_CONFIG } from "./system-config";
import { getRealHardwareInfo } from "./hardware-info";

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

export const INITIAL_MOTD = `${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} (GENERIC.MP)
Welcome to ${SYSTEM_CONFIG.name}: Proactively secure web portfolio environment.
Type 'help' for available commands or 'fastfetch' for system info.
`;

export function buildFastfetch(cwd: string, elapsedSeconds = 0): string {
  const elapsed = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const uptime = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`;

  const hw = getRealHardwareInfo();

  return `${PUFFY_ASCII}

 \x1b[38;5;220m${SYSTEM_CONFIG.username}\x1b[0m@\x1b[38;5;81m${SYSTEM_CONFIG.hostname.split('.')[0]}\x1b[0m
 \x1b[38;5;240m${'─'.repeat(28)}\x1b[0m
 \x1b[1;38;5;220mOS:\x1b[0m          ${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} (${SYSTEM_CONFIG.architecture})
 \x1b[1;38;5;220mHost:\x1b[0m        ${SYSTEM_CONFIG.userFullName} Portfolio OS
 \x1b[1;38;5;220mKernel:\x1b[0m      ${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} GENERIC.MP#1
 \x1b[1;38;5;220mUptime:\x1b[0m      ${uptime}
 \x1b[1;38;5;220mShell:\x1b[0m       ${SYSTEM_CONFIG.shell.split('/').pop()} ${SYSTEM_CONFIG.desktopVersion}
 \x1b[1;38;5;220mTerminal:\x1b[0m    kitty (${SYSTEM_CONFIG.terminal})
 \x1b[1;38;5;220mCPU:\x1b[0m         ${hw.cpuCores} Cores (${hw.platform})
 \x1b[1;38;5;220mMemory:\x1b[0m      ${hw.memoryGb} GB RAM
 \x1b[1;38;5;220mDisplay:\x1b[0m     ${hw.screenResolution} @ ${hw.pixelRatio}x
 \x1b[1;38;5;220mNetwork:\x1b[0m     ${hw.networkType} (${hw.downlinkMbps} Mbps)
 \x1b[1;38;5;220mGitHub:\x1b[0m      ${SYSTEM_CONFIG.website}
 \x1b[1;38;5;220mCWD:\x1b[0m         ${cwd}`;
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
     contained in that directory.`,

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

  github: `GITHUB(1)                 General Commands Manual                 GITHUB(1)

NAME
     github - inspect live GitHub profile and repositories

SYNOPSIS
     github [username]

DESCRIPTION
     Fetches live user profile data, public repository count, follower
     metrics, and latest public repositories from GitHub API.`,

  ping: `PING(8)                   System Manager's Manual                 PING(8)

NAME
     ping - send ICMP ECHO_REQUEST packets to network hosts

SYNOPSIS
     ping host

DESCRIPTION
     The ping utility uses the ICMP protocol's mandatory ECHO_REQUEST
     datagram to elicit an ICMP ECHO_RESPONSE from a host or gateway.`,

  sysctl: `SYSCTL(8)                 System Manager's Manual                 SYSCTL(8)

NAME
     sysctl - get or set kernel state

SYNOPSIS
     sysctl [name ...]

DESCRIPTION
     The sysctl utility retrieves kernel state and allows processes
     with appropriate privilege to set kernel state.`,

  pkg_add: `PKG_ADD(1)                General Commands Manual                PKG_ADD(1)

NAME
     pkg_add - install and update packages

SYNOPSIS
     pkg_add [-v] pkgname ...

DESCRIPTION
     The pkg_add command is used to install packages or upgrade to
     newer versions.`,

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

  banner: `BANNER(1)                 General Commands Manual                 BANNER(1)

NAME
     banner - display a message in a text banner

SYNOPSIS
     banner text

DESCRIPTION
     The banner utility prints text surrounded by a box of asterisks.`,

  neofetch: `NEOFETCH(1)               General Commands Manual               NEOFETCH(1)

NAME
     neofetch - display system information with ASCII art

SYNOPSIS
     neofetch

DESCRIPTION
     The neofetch utility prints system information including OS,
     hostname, kernel version, uptime, shell, and terminal details.
     An alias for the fastfetch command.`,

  man: `MAN(1)                    General Commands Manual                   MAN(1)

NAME
     man - display manual pages

SYNOPSIS
     man command

DESCRIPTION
     The man utility displays the manual pages for the given command.`,

  resume: `RESUME(1)                  General Commands Manual                 RESUME(1)

NAME
     resume - print contact info and project summary

SYNOPSIS
     resume

DESCRIPTION
     Displays a plain-text summary of the portfolio owner's contact
     information, technical skills, and project highlights. A formatted
     PDF resume is available at /resume.pdf and can be opened via the
     "Resume" application in the desktop.`,

  portfolio: `PORTFOLIO(1)                General Commands Manual              PORTFOLIO(1)

NAME
     portfolio - print projects, education, and certifications summary

SYNOPSIS
     portfolio

DESCRIPTION
     Displays a plain-text summary of the portfolio owner's projects,
     education history, and certifications. A detailed interactive view
     is available via the "Portfolio" application in the desktop.`,
};

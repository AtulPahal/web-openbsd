import type { FSNode } from "@/types";
import { SYSTEM_CONFIG, SYSTEM_PATHS } from "@/lib/system-config";

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

const MOTD = `${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} (GENERIC.MP) #1: Sat Apr  6 12:00:00 MDT 2024

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

const HOSTNAME_EM0 = `inet ${SYSTEM_CONFIG.localIp} 255.255.255.0 10.0.0.255
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
      makeFile("hosts", "/etc/hosts", `127.0.0.1\tlocalhost\n::1\t\tlocalhost\n${SYSTEM_CONFIG.localIp}\t${SYSTEM_CONFIG.hostname}\n`),
      makeFile("myname", "/etc/myname", `${SYSTEM_CONFIG.hostname}\n`),
    ]),
    makeDir("home", "/home", "root", "wheel", [
      makeDir(SYSTEM_CONFIG.username, SYSTEM_CONFIG.home, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, [
        makeFile(".profile", `${SYSTEM_PATHS.home}/.profile`, PROFILE, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username),
        makeFile(".kshrc", `${SYSTEM_PATHS.home}/.kshrc`, "# ksh configuration\nset -o emacs\nalias ll='ls -la'\n", SYSTEM_CONFIG.username, SYSTEM_CONFIG.username),
        makeDir("Documents", SYSTEM_PATHS.documents, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, [
          makeFile("readme.txt", `${SYSTEM_PATHS.documents}/readme.txt`,
            "Welcome to OpenBSD.\n\nThis is a virtual filesystem running in your browser.\nFeel free to explore!\n", SYSTEM_CONFIG.username, SYSTEM_CONFIG.username),
          makeFile("resume.txt", `${SYSTEM_PATHS.documents}/resume.txt`,
            `${SYSTEM_CONFIG.userFullName} — ${SYSTEM_CONFIG.productDescription}\n\n` +
            `Location: ${SYSTEM_CONFIG.userLocation}\n` +
            `Email: ${SYSTEM_CONFIG.userEmail}\n` +
            `Phone: ${SYSTEM_CONFIG.userPhone}\n\n` +
            `Technical Skills:\n` +
            `  Languages: Python (Expert), JavaScript, HTML, CSS, C, Rust\n` +
            `  ML: TensorFlow, PyTorch, Scikit-learn, ONNX, Pandas, NumPy\n` +
            `  Web: ReactJS, NextJS, FastAPI, Langchain, Vite\n` +
            `  Tools: Neovim, Git/GitHub, Docker, Bun, VS Code, Linux\n\n` +
            `Projects:\n` +
            `  Oculus Vision — Real-time Object Detection (YOLOv5, ONNX Runtime Web)\n` +
            `  Crop Health Monitoring — Random Forest, 92% accuracy\n` +
            `  Movie Recommender — React, Vite, TMDB API\n` +
            `  Breast Cancer Diagnostic — KNN, 94.74% accuracy\n\n` +
            `Run 'resume' or 'portfolio' in the terminal for more, or open the\n` +
            `"Portfolio" and "Resume" apps from the desktop.\n`,
            SYSTEM_CONFIG.username, SYSTEM_CONFIG.username),
        ]),
        makeDir("Downloads", SYSTEM_PATHS.downloads, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username),
        makeDir("Music", SYSTEM_PATHS.music, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, [
          makeFile("SoundHelix_Song_1.mp3", `${SYSTEM_PATHS.music}/SoundHelix_Song_1.mp3`, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, "rw-r--r--"),
          makeFile("SoundHelix_Song_2.mp3", `${SYSTEM_PATHS.music}/SoundHelix_Song_2.mp3`, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, "rw-r--r--"),
        ]),
        makeDir("Videos", SYSTEM_PATHS.videos, SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, [
          makeFile("bad_apple.mp4", `${SYSTEM_PATHS.videos}/bad_apple.mp4`, "/bad_apple.mp4", SYSTEM_CONFIG.username, SYSTEM_CONFIG.username, "rw-r--r--"),
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
        makeFile("messages", "/var/log/messages", `Jan  1 00:00:00 ${SYSTEM_CONFIG.hostname.split(".")[0]} syslogd: start\n`),
        makeFile("authlog", "/var/log/authlog", ""),
      ]),
      makeDir("run", "/var/run"),
      makeDir("tmp", "/var/tmp"),
    ]),
    makeDir("tmp", "/tmp", "root", "wheel"),
  ]);
}

export function buildVirtualFileSystem(): FSNode {
  return buildDefaultFS();
}

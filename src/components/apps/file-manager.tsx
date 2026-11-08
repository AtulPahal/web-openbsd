"use client";

import {
  Home,
  HardDrive,
  Download,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  Folder,
  File,
  FileText,
  FileCode,
  Music,
  Film,
} from "lucide-react";
import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { Separator } from "@/components/ui/separator";
import { VirtualFS, subscribeFileSystem, getFileSystemRevision } from "@/features/virtual-fs";
import type { FSNode } from "@/types";
import { SYSTEM_PATHS } from "@/lib/system-config";
import { getFileAssociation } from "@/lib/file-associations";

type SortKey = "name" | "size" | "permissions" | "modified";
type SortDir = "asc" | "desc";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} K`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} M`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} G`;
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const mon = d.toLocaleString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, " ");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${mon} ${day} ${hours}:${mins}`;
}

function getFileIcon(node: FSNode) {
  if (node.type === "directory") return Folder;
  const ext = node.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "c":
    case "h":
    case "py":
    case "js":
    case "ts":
    case "tsx":
    case "jsx":
    case "rs":
    case "go":
      return FileCode;
    case "txt":
    case "md":
    case "conf":
    case "cfg":
    case "log":
      return FileText;
    case "mp3":
    case "wav":
    case "ogg":
      return Music;
    case "mp4":
    case "webm":
    case "mov":
      return Film;
    default:
      return File;
  }
}

const PLACES = [
  { name: "Home", path: SYSTEM_PATHS.home, icon: Home },
  { name: "Documents", path: SYSTEM_PATHS.documents, icon: FileText },
  { name: "Downloads", path: SYSTEM_PATHS.downloads, icon: Download },
  { name: "Music", path: SYSTEM_PATHS.music, icon: Music },
  { name: "Videos", path: SYSTEM_PATHS.videos, icon: Film },
  { name: "Root", path: SYSTEM_PATHS.root, icon: HardDrive },
];

// --- Places Sidebar Item ---

function PlaceItem({
  name,
  path,
  icon: Icon,
  isSelected,
  onClick,
}: {
  name: string;
  path: string;
  icon: React.ElementType;
  isSelected: boolean;
  onClick: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors cursor-pointer ${
        isSelected
          ? "bg-primary/15 text-primary font-medium"
          : "text-foreground/80 hover:bg-accent/20 hover:text-foreground"
      }`}
    >
      <Icon className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
      <span>{name}</span>
    </button>
  );
}

interface SortIndicatorProps {
  column: SortKey;
  currentKey: SortKey;
  direction: SortDir;
}

function SortIndicator({ column, currentKey, direction }: SortIndicatorProps) {
  if (currentKey !== column) return null;
  return (
    <span className="ml-0.5 text-primary">
      {direction === "asc" ? "▲" : "▼"}
    </span>
  );
}

export function FileManager({ windowId }: { windowId: string }) {
  const fs = useMemo(() => new VirtualFS(), []);
  useSyncExternalStore(subscribeFileSystem, getFileSystemRevision, () => 0);

  const [currentPath, setCurrentPath] = useState<string>(SYSTEM_PATHS.home);
  const [history, setHistory] = useState<string[]>([SYSTEM_PATHS.home]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Determine the single best-matching Place in sidebar
  const activePlacePath = useMemo(() => {
    const matches = PLACES.filter((p) => {
      if (p.path === "/") return currentPath === "/";
      return currentPath === p.path || currentPath.startsWith(p.path + "/");
    });
    if (matches.length === 0) return "/";
    matches.sort((a, b) => b.path.length - a.path.length);
    return matches[0].path;
  }, [currentPath]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedPath(null);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedPath(null);
    }
  }, [history, historyIndex]);

  const navigateTo = useCallback(
    (path: string) => {
      const node = fs.getNode(path);
      if (node?.type === "directory") {
        setCurrentPath(path);
        setSelectedPath(null);
        setHistory((prev) => {
          const next = prev.slice(0, historyIndex + 1);
          next.push(path);
          return next;
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [fs, historyIndex]
  );

  const currentContents = (() => {
    const items = fs.listDirectory(currentPath);
    const sorted = [...items].sort((a, b) => {
      let cmp = 0;
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;

      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "size":
          cmp = a.size - b.size;
          break;
        case "permissions":
          cmp = a.permissions.localeCompare(b.permissions);
          break;
        case "modified":
          cmp =
            new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  })();

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const handleDoubleClick = useCallback(
    (node: FSNode) => {
      if (node.type === "directory") {
        navigateTo(node.path);
      } else {
        const targetAppId = getFileAssociation(node.name);

        window.dispatchEvent(
          new CustomEvent("open-app", {
            detail: { appId: targetAppId, appState: { path: node.path } },
          })
        );
      }
    },
    [navigateTo]
  );

  const pathSegments = useMemo(() => {
    const parts = currentPath.split("/").filter(Boolean);
    const segments: { name: string; path: string }[] = [
      { name: "/", path: "/" },
    ];
    let built = "";
    for (const part of parts) {
      built += `/${part}`;
      segments.push({ name: part, path: built });
    }
    return segments;
  }, [currentPath]);

  const parentPath = useMemo(() => {
    if (currentPath === "/") return null;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    return parts.length === 0 ? "/" : `/${parts.join("/")}`;
  }, [currentPath]);

  return (
    <div className="@container relative flex h-full flex-col bg-background text-sm" data-window-id={windowId}>
      {/* Top Toolbar (Dolphin Style) */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            aria-label="Back"
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Forward"
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Parent directory"
            onClick={() => parentPath && navigateTo(parentPath)}
            disabled={!parentPath}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-background/50 border border-border rounded px-2 h-7 overflow-x-auto scrollbar-none ml-1">
          {pathSegments.map((seg, i) => (
            <span key={seg.path} className="flex items-center shrink-0">
              {i > 0 && (
                <ChevronRight className="mx-0.5 size-3 text-muted-foreground/60" />
              )}
              <button
                type="button"
                onClick={() => navigateTo(seg.path)}
                className="rounded px-1.5 py-0.5 font-mono text-xs text-foreground/80 hover:bg-accent/40 hover:text-primary cursor-pointer"
              >
                {seg.name === "/" ? "root" : seg.name}
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — Places */}
        <div className="w-40 shrink-0 border-r border-border bg-muted/10 hidden @min-[560px]:flex flex-col py-2">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Places
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto">
            {PLACES.map((place) => (
              <PlaceItem
                key={place.path}
                name={place.name}
                path={place.path}
                icon={place.icon}
                isSelected={activePlacePath === place.path}
                onClick={navigateTo}
              />
            ))}
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* Right pane — file listing */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
            <button
              type="button"
              onClick={() => handleSort("name")}
              className="flex flex-1 items-center px-2 py-1 text-left hover:text-foreground cursor-pointer"
            >
              Name <SortIndicator column="name" currentKey={sortKey} direction={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => handleSort("size")}
              className="flex w-16 sm:w-20 items-center justify-end px-2 py-1 text-right hover:text-foreground cursor-pointer"
            >
              Size <SortIndicator column="size" currentKey={sortKey} direction={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => handleSort("permissions")}
              className="hidden @min-[640px]:flex w-24 items-center px-2 py-1 text-left hover:text-foreground cursor-pointer"
            >
              Perms <SortIndicator column="permissions" currentKey={sortKey} direction={sortDir} />
            </button>
            <button
              type="button"
              onClick={() => handleSort("modified")}
              className="hidden @min-[760px]:flex w-32 items-center px-2 py-1 text-left hover:text-foreground cursor-pointer"
            >
              Modified <SortIndicator column="modified" currentKey={sortKey} direction={sortDir} />
            </button>
          </div>

          {/* File list */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <div className="min-w-0">
              {/* Go up entry */}
              {parentPath !== null && (
                <button
                  type="button"
                  className="flex w-full items-center border-b border-border/30 px-2 py-1.5 text-left text-xs hover:bg-accent/20 cursor-pointer"
                  onClick={() => navigateTo(parentPath)}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <ArrowUp className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono">..</span>
                  </div>
                  <div className="w-16 sm:w-20 shrink-0" />
                  <div className="hidden @min-[640px]:block w-24 shrink-0" />
                  <div className="hidden @min-[760px]:block w-32 shrink-0" />
                </button>
              )}

              {currentContents.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  (empty directory)
                </div>
              )}

              {currentContents.map((node) => {
                const Icon = getFileIcon(node);
                const isSelected = selectedPath === node.path;
                const isDir = node.type === "directory";

                return (
                  <button
                    key={node.path}
                    type="button"
                    className={`flex w-full items-center border-b border-border/20 px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 text-foreground"
                        : "hover:bg-accent/20"
                    }`}
                    onClick={() => setSelectedPath(node.path)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") { event.preventDefault(); handleDoubleClick(node); }
                    }}
                    title={`Double-click or press Enter to open ${node.name}`}
                    onDoubleClick={() => handleDoubleClick(node)}
                  >
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <Icon
                        className={`size-3.5 shrink-0 ${
                          isDir
                            ? "text-primary/80"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`truncate ${
                          isDir ? "text-primary font-semibold" : "text-foreground/80"
                        }`}
                      >
                        {node.name}
                      </span>
                    </div>
                    <div className="w-16 sm:w-20 shrink-0 text-right font-mono text-muted-foreground text-[11px]">
                      {isDir ? "-" : formatSize(node.size)}
                    </div>
                    <div className="hidden @min-[640px]:block w-24 shrink-0 px-2 font-mono text-muted-foreground text-[11px]">
                      {node.permissions}
                    </div>
                    <div className="hidden @min-[760px]:block w-32 shrink-0 font-mono text-muted-foreground text-[11px]">
                      {formatDate(node.modified)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
            <span>
              {currentContents.length} item
              {currentContents.length !== 1 ? "s" : ""}
            </span>
            {selectedPath && (
              <span className="font-mono truncate ml-2">{selectedPath}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Home, HardDrive, Monitor, Download, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { useState, useRef, useCallback, useMemo } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { VirtualFS } from "@/features/virtual-fs";
import type { FSNode } from "@/types";

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
    default:
      return File;
  }
}

// --- Places Sidebar Item ---

function PlaceItem({
  name,
  path,
  icon: Icon,
  currentPath,
  onClick,
}: {
  name: string;
  path: string;
  icon: React.ElementType;
  currentPath: string;
  onClick: (path: string) => void;
}) {
  const isSelected = currentPath === path || currentPath.startsWith(path + "/");
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
        isSelected
          ? "bg-amber-400/15 text-amber-400 font-medium"
          : "text-foreground/80 hover:bg-accent/20 hover:text-foreground"
      }`}
    >
      <Icon className={`size-4 ${isSelected ? "text-amber-400" : "text-muted-foreground"}`} />
      <span>{name}</span>
    </button>
  );
}

const PLACES = [
  { name: "Home", path: "/home/user", icon: Home },
  { name: "Documents", path: "/home/user/Documents", icon: FileText },
  { name: "Downloads", path: "/home/user/Downloads", icon: Download },
  { name: "Root", path: "/", icon: HardDrive },
];

export function FileManager({ windowId }: { windowId: string }) {
  const fsRef = useRef(new VirtualFS());
  const fs = fsRef.current;

  const [currentPath, setCurrentPath] = useState("/home/user");
  const [history, setHistory] = useState<string[]>(["/home/user"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  const currentContents = useMemo(() => {
    const items = fs.listDirectory(currentPath);
    const sorted = [...items].sort((a, b) => {
      let cmp = 0;
      // directories always first
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
  }, [currentPath, sortKey, sortDir, fs]);

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
        const lowerName = node.name.toLowerCase();
        let targetAppId = "text-editor";
        
        if (lowerName.endsWith(".mp3") || lowerName.endsWith(".wav") || lowerName.endsWith(".ogg")) {
          targetAppId = "music";
        } else if (lowerName.endsWith(".mp4") || lowerName.endsWith(".webm") || lowerName.endsWith(".mov")) {
          targetAppId = "video";
        }

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

  const rootNode = fs.getRoot();

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return (
      <span className="ml-0.5 text-amber-400">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="relative flex h-full flex-col bg-background text-sm" data-window-id={windowId}>
      {/* Top Toolbar (Dolphin Style) */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => parentPath && navigateTo(parentPath)}
            disabled={!parentPath}
            className="p-1 rounded text-muted-foreground hover:bg-accent/30 hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-background/50 border border-border rounded px-2 h-7 overflow-hidden ml-1">
          {pathSegments.map((seg, i) => (
            <span key={seg.path} className="flex items-center">
              {i > 0 && (
                <ChevronRight className="mx-0.5 size-3 text-muted-foreground/60" />
              )}
              <button
                type="button"
                onClick={() => navigateTo(seg.path)}
                className="rounded px-1.5 py-0.5 font-mono text-xs text-foreground/80 hover:bg-accent/40 hover:text-amber-400"
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
        <div className="w-40 shrink-0 border-r border-border bg-muted/10 flex flex-col py-2">
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
                currentPath={currentPath}
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
              className="flex flex-1 items-center px-2 py-1 text-left hover:text-foreground"
            >
              Name <SortIndicator column="name" />
            </button>
            <button
              type="button"
              onClick={() => handleSort("size")}
              className="flex w-20 items-center justify-end px-2 py-1 text-right hover:text-foreground"
            >
              Size <SortIndicator column="size" />
            </button>
            <button
              type="button"
              onClick={() => handleSort("permissions")}
              className="flex w-24 items-center px-2 py-1 text-left hover:text-foreground"
            >
              Perms <SortIndicator column="permissions" />
            </button>
            <button
              type="button"
              onClick={() => handleSort("modified")}
              className="flex w-32 items-center px-2 py-1 text-left hover:text-foreground"
            >
              Modified <SortIndicator column="modified" />
            </button>
          </div>

          {/* File list */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="min-w-0">
              {/* Go up entry */}
              {parentPath !== null && (
                <button
                  type="button"
                  className="flex w-full items-center border-b border-border/30 px-2 py-1 text-left text-xs hover:bg-accent/20"
                  onDoubleClick={() => navigateTo(parentPath)}
                  onClick={() => setSelectedPath(null)}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <ArrowUp className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">..</span>
                  </div>
                  <div className="w-20" />
                  <div className="w-24" />
                  <div className="w-32" />
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
                    className={`flex w-full items-center border-b border-border/20 px-2 py-1 text-left text-xs ${
                      isSelected
                        ? "bg-amber-400/15 text-foreground"
                        : "hover:bg-accent/20"
                    }`}
                    onClick={() => setSelectedPath(node.path)}
                    onDoubleClick={() => handleDoubleClick(node)}
                  >
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <Icon
                        className={`size-3.5 shrink-0 ${
                          isDir
                            ? "text-amber-400/80"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`truncate ${
                          isDir ? "text-amber-400/90" : "text-foreground/80"
                        }`}
                      >
                        {node.name}
                      </span>
                    </div>
                    <div className="w-20 shrink-0 text-right font-mono text-muted-foreground">
                      {isDir ? "-" : formatSize(node.size)}
                    </div>
                    <div className="w-24 shrink-0 px-2 font-mono text-muted-foreground">
                      {node.permissions}
                    </div>
                    <div className="w-32 shrink-0 font-mono text-muted-foreground">
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
              <span className="font-mono">{selectedPath}</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

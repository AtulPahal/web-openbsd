"use client";

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

// --- Directory tree sidebar item ---

function TreeNode({
  node,
  currentPath,
  expandedPaths,
  onToggle,
  onNavigate,
  depth,
}: {
  node: FSNode;
  currentPath: string;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onNavigate: (path: string) => void;
  depth: number;
}) {
  if (node.type !== "directory") return null;

  const isExpanded = expandedPaths.has(node.path);
  const isActive = currentPath === node.path;
  const dirs = (node.children ?? []).filter((c) => c.type === "directory");

  return (
    <div>
      <button
        type="button"
        className={`flex w-full items-center gap-1 px-1 py-0.5 text-left text-xs hover:bg-accent/30 ${
          isActive ? "bg-accent/20 text-amber-400" : "text-foreground/80"
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => {
          onNavigate(node.path);
          if (!isExpanded) onToggle(node.path);
        }}
      >
        {dirs.length > 0 ? (
          <span
            className="shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.path);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </span>
        ) : (
          <span className="size-3 shrink-0" />
        )}
        {isExpanded ? (
          <FolderOpen className="size-3.5 shrink-0 text-amber-400/80" />
        ) : (
          <Folder className="size-3.5 shrink-0 text-amber-400/80" />
        )}
        <span className="truncate">{node.name === "/" ? "/" : node.name}</span>
      </button>
      {isExpanded &&
        dirs
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              currentPath={currentPath}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
    </div>
  );
}

// --- File content viewer ---

function FileViewer({
  node,
  onClose,
}: {
  node: FSNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <div className="flex items-center gap-2 text-xs">
          <FileText className="size-3.5 text-amber-400/80" />
          <span className="font-mono text-foreground/90">{node.path}</span>
          <span className="text-muted-foreground">
            ({formatSize(node.size)})
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent/30 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <pre className="p-3 font-mono text-xs leading-relaxed text-foreground/90">
          {node.content || "(empty file)"}
        </pre>
      </div>
      <div className="border-t border-border px-3 py-1 text-xs text-muted-foreground">
        {node.permissions} · {node.owner}:{node.group} · Modified{" "}
        {formatDate(node.modified)}
      </div>
    </div>
  );
}

// --- Main File Manager ---

export function FileManager({ windowId }: { windowId: string }) {
  const fsRef = useRef(new VirtualFS());
  const fs = fsRef.current;

  const [currentPath, setCurrentPath] = useState("/home/user");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(["/", "/home", "/home/user"])
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<FSNode | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleExpanded = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      const node = fs.getNode(path);
      if (node?.type === "directory") {
        setCurrentPath(path);
        setSelectedPath(null);
        // Expand all ancestors
        const parts = path.split("/").filter(Boolean);
        setExpandedPaths((prev) => {
          const next = new Set(prev);
          next.add("/");
          let built = "";
          for (const part of parts) {
            built += `/${part}`;
            next.add(built);
          }
          return next;
        });
      }
    },
    [fs]
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
        setViewingFile(node);
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
      {/* Breadcrumb / Path bar */}
      <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-2 py-1">
        <span className="mr-1 text-xs text-muted-foreground">Path:</span>
        {pathSegments.map((seg, i) => (
          <span key={seg.path} className="flex items-center">
            {i > 0 && (
              <ChevronRight className="mx-0.5 size-3 text-muted-foreground/60" />
            )}
            <button
              type="button"
              onClick={() => navigateTo(seg.path)}
              className="rounded px-1 py-0.5 font-mono text-xs text-foreground/80 hover:bg-accent/30 hover:text-amber-400"
            >
              {seg.name}
            </button>
          </span>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — directory tree */}
        <div className="w-48 shrink-0 border-r border-border bg-muted/20">
          <div className="border-b border-border bg-muted/30 px-2 py-1 text-xs font-semibold text-muted-foreground">
            Directories
          </div>
          <div className="h-[calc(100%-24px)] overflow-y-auto">
            <TreeNode
              node={rootNode}
              currentPath={currentPath}
              expandedPaths={expandedPaths}
              onToggle={toggleExpanded}
              onNavigate={navigateTo}
              depth={0}
            />
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

      {/* File viewer overlay */}
      {viewingFile && (
        <FileViewer
          node={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
}

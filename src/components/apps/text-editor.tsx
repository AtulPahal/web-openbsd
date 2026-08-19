"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FileText, WrapText } from "lucide-react";
import { VirtualFS } from "@/features/virtual-fs";

const SAMPLE_TEXT = `# Welcome to OpenBSD Web Desktop
#
# This is a simple text editor.
# Use it to view and edit files.
#
# Keyboard shortcuts:
#   Ctrl+A  Select all
#   Tab     Insert 4 spaces`;

interface CursorPos {
  line: number;
  col: number;
}

export function TextEditor({ windowId, path }: { windowId: string; path?: string }) {
  // Stable VirtualFS instance — useMemo avoids react-hooks/refs lint errors
  const fs = useMemo(() => new VirtualFS(), []);
  const [content, setContent] = useState(() => {
    if (path) {
      const fileContent = fs.read(path, "/");
      return fileContent ?? "";
    }
    return SAMPLE_TEXT;
  });
  const [fileName] = useState(() => {
    if (path) {
      return path.split("/").pop() || "untitled";
    }
    return "untitled";
  });
  const [isModified, setIsModified] = useState(false);
  const [cursor, setCursor] = useState<CursorPos>({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = content.split("\n");
  const lineCount = lines.length;
  const charCount = content.length;

  const updateCursorPos = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = content.slice(0, pos);
    const line = (textBefore.match(/\n/g) || []).length + 1;
    const lastNewline = textBefore.lastIndexOf("\n");
    const col = pos - lastNewline;
    setCursor({ line, col });
  }, [content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (!isModified) setIsModified(true);
    },
    [isModified]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+X — close the window (comes first to avoid conflict with save)
      if ((e.ctrlKey || e.metaKey) && e.key === "x") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("close-window", { detail: windowId }));
        return;
      }

      // Ctrl+K — cut (delete) the current line
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const pos = ta.selectionStart;
        const currentLines = content.split("\n");
        let offset = 0;
        let lineIdx = 0;
        for (let i = 0; i < currentLines.length; i++) {
          const lineEnd =
            offset +
            currentLines[i].length +
            (i < currentLines.length - 1 ? 1 : 0);
          if (pos <= lineEnd) {
            lineIdx = i;
            break;
          }
          offset = lineEnd;
        }
        const newLines = currentLines.filter((_, i) => i !== lineIdx);
        const newContent = newLines.join("\n");
        setContent(newContent);
        if (!isModified) setIsModified(true);
        requestAnimationFrame(() => {
          if (ta) {
            const newPos = Math.min(offset, newContent.length);
            ta.selectionStart = newPos;
            ta.selectionEnd = newPos;
          }
        });
        return;
      }

      // Ctrl+S / Ctrl+O — save
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "o")) {
        e.preventDefault();
        if (path) {
          fs.write(path, "/", content);
          setIsModified(false);
        }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = content.slice(0, start);
        const after = content.slice(end);
        const newContent = before + "    " + after;
        setContent(newContent);
        if (!isModified) setIsModified(true);
        // Set cursor after inserted spaces
        requestAnimationFrame(() => {
          ta.selectionStart = start + 4;
          ta.selectionEnd = start + 4;
        });
      }
    },
    [content, isModified, path, windowId, fs]
  );

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (ta && gutter) {
      gutter.scrollTop = ta.scrollTop;
    }
  }, []);

  // Update cursor position on various events
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const handler = () => updateCursorPos();
    ta.addEventListener("click", handler);
    ta.addEventListener("keyup", handler);
    ta.addEventListener("select", handler);
    return () => {
      ta.removeEventListener("click", handler);
      ta.removeEventListener("keyup", handler);
      ta.removeEventListener("select", handler);
    };
  }, [updateCursorPos]);

  // Initial cursor position
  useEffect(() => {
    updateCursorPos();
  }, [updateCursorPos]);

  return (
    <div
      className="flex flex-col h-full w-full bg-background font-mono text-sm"
      data-window-id={windowId}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border-b border-border text-foreground">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          {fileName}
          {isModified && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground ml-1">
          — Text Editor
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWordWrap((w) => !w)}
            className={`flex items-center gap-1 px-1.5 py-0.5 text-xs transition-colors ${
              wordWrap
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle word wrap"
          >
            <WrapText className="h-3 w-3" />
            <span>Wrap</span>
          </button>
        </div>
      </div>

      {/* Editor area with line numbers */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Line number gutter */}
        <div
          ref={gutterRef}
          className="flex flex-col py-2 pr-2 pl-2 bg-card border-r border-border text-muted-foreground text-right select-none overflow-hidden shrink-0"
          aria-hidden
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={`leading-5 text-xs px-1 ${
                cursor.line === i + 1 ? "text-foreground" : ""
              }`}
              style={{ minWidth: `${String(lineCount).length + 1}ch` }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          className={`flex-1 bg-background text-foreground p-2 leading-5 text-base sm:text-xs resize-none focus:outline-none ${
            wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
          }`}
          style={{
            overflowWrap: wordWrap ? "break-word" : undefined,
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center px-3 py-1 bg-muted border-t border-border text-xs text-muted-foreground gap-4">
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span>{charCount} chars</span>
        <span>{lineCount} lines</span>
        <span>UTF-8</span>
        <span className="ml-auto">
          {wordWrap ? "Wrap: On" : "Wrap: Off"}
        </span>
      </div>

      {/* Shortcut hints — nano style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-card border-t border-border text-[11px] sm:text-xs">
        {[
          ["^O", "Save"],
          ["^X", "Close"],
          ["^K", "Cut Line"],
          ["^G", "Help"],
        ].map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-center gap-1 py-1 border-r border-b sm:border-b-0 border-border last:border-r-0"
          >
            <span
              className="font-bold text-primary"
            >
              {key}
            </span>
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

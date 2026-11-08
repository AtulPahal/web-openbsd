"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { FileText, WrapText, Check } from "lucide-react";
import { VirtualFS } from "@/features/virtual-fs";
import { showNotification } from "@/lib/utils";
import { SYSTEM_PATHS } from "@/lib/system-config";

const SAMPLE_TEXT = `# Welcome to OpenBSD Web Desktop
#
# This is a simple text editor.
# Use it to view and edit files.
#
# Keyboard shortcuts:
#   Ctrl+S / Ctrl+O  Save file
#   Ctrl+K           Cut current line
#   Ctrl+G           Toggle help
#   Ctrl+X           Close editor
#   Tab              Insert 4 spaces`;

interface CursorPos {
  line: number;
  col: number;
}

export function TextEditor({ windowId, path }: { windowId: string; path?: string }) {
  const fs = useMemo(() => new VirtualFS(), []);
  const [content, setContent] = useState(() => {
    if (path) {
      const fileContent = fs.read(path, "/");
      return fileContent ?? "";
    }
    return SAMPLE_TEXT;
  });
  const [fileName] = useState(() => path?.split("/").pop() || `untitled-${windowId.slice(0, 8)}.txt`);
  const [isModified, setIsModified] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

  const handleSave = useCallback(() => {
    const targetPath = path || `${SYSTEM_PATHS.documents}/${fileName}`;
    try {
      if (!fs.write(targetPath, "/", content)) {
        showNotification(`Could not save ${fileName}: destination is unavailable`);
        return;
      }
      setIsModified(false);
      setJustSaved(true);
      showNotification(`Saved ${fileName} (${new TextEncoder().encode(content).length} bytes)`);
      setTimeout(() => setJustSaved(false), 1800);
    } catch {
      showNotification(`Could not persist ${fileName}: browser storage is unavailable`);
    }
  }, [path, fileName, fs, content]);

  useEffect(() => {
    const guard = (event: Event) => {
      const closeEvent = event as CustomEvent<string>;
      if (closeEvent.detail === windowId && isModified && !window.confirm("Discard unsaved changes?")) event.preventDefault();
    };
    window.addEventListener("before-close-window", guard);
    return () => window.removeEventListener("before-close-window", guard);
  }, [windowId, isModified]);

  const handleClose = useCallback(() => {
    window.dispatchEvent(new CustomEvent("close-window", { detail: windowId }));
  }, [windowId]);

  const handleCutLine = useCallback(() => {
    const ta = textareaRef.current;
    const pos = ta ? ta.selectionStart : 0;
    const currentLines = content.split("\n");
    let offset = 0;
    let lineIdx = 0;
    for (let i = 0; i < currentLines.length; i++) {
      const lineEnd =
        offset +
        currentLines[i].length +
        (i < currentLines.length - 1 ? 1 : 0);
      if (pos < lineEnd || i === currentLines.length - 1) {
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
        ta.focus();
      }
    });
  }, [content, isModified]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (!isModified) setIsModified(true);
    },
    [isModified]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        handleClose();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleCutLine();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "o")) {
        e.preventDefault();
        handleSave();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
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
        requestAnimationFrame(() => {
          ta.selectionStart = start + 4;
          ta.selectionEnd = start + 4;
        });
      }
    },
    [content, isModified, handleClose, handleCutLine, handleSave]
  );

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (ta && gutter) {
      gutter.scrollTop = ta.scrollTop;
    }
  }, []);

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

  useEffect(() => {
    updateCursorPos();
  }, [updateCursorPos]);

  return (
    <div
      className="flex flex-col h-full w-full bg-background font-mono text-sm relative"
      data-window-id={windowId}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border-b border-border text-foreground">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="min-w-0 truncate text-xs font-medium">
          {fileName}
          {isModified && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </span>
        {justSaved && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold ml-1">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
          — Text Editor
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWordWrap((w) => !w)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
              wordWrap
                ? "text-primary-foreground bg-primary font-semibold"
                : "text-muted-foreground hover:text-foreground bg-card/50"
            }`}
            title="Toggle word wrap"
          >
            <WrapText className="h-3 w-3" />
            <span>Wrap</span>
          </button>
        </div>
      </div>

      {/* Help Banner Overlay */}
      {showHelp && (
        <div className="px-3 py-2 bg-card border-b border-border text-xs text-muted-foreground flex items-center justify-between gap-2">
          <div>
            <span className="text-primary font-bold">Shortcuts:</span>{" "}
            <span>Ctrl+O / Ctrl+S Save</span> • <span>Ctrl+K Cut Line</span> •{" "}
            <span>Ctrl+X Close</span> • <span>Tab 4 Spaces</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor area with line numbers */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Line number gutter */}
        <div
          ref={gutterRef}
          className={`flex flex-col py-2 pr-2 pl-2 bg-card border-r border-border text-muted-foreground text-right select-none overflow-hidden shrink-0 ${wordWrap ? "hidden" : ""}`}
          aria-hidden
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={`leading-5 text-xs px-1 ${
                cursor.line === i + 1 ? "text-primary font-bold" : ""
              }`}
              style={{ minWidth: `${String(lineCount).length + 1}ch` }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea (consistent text-xs leading-5 matching gutter) */}
        <textarea
          ref={textareaRef}
          aria-label={`Edit ${fileName}`}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          className={`min-w-0 flex-1 bg-background text-foreground p-2 leading-5 text-xs resize-none focus:outline-none ${
            wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
          }`}
          style={{
            overflowWrap: wordWrap ? "break-word" : undefined,
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center px-3 py-1 bg-muted border-t border-border text-xs text-muted-foreground gap-x-4 gap-y-1">
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

      {/* Interactive Shortcut buttons — nano style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 bg-card border-t border-border text-[11px] sm:text-xs">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 py-1.5 border-r border-b sm:border-b-0 border-border hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <span className="font-bold text-primary">^O</span>
          <span className="text-muted-foreground">Save</span>
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center gap-1.5 py-1.5 border-b sm:border-b-0 sm:border-r border-border hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <span className="font-bold text-primary">^X</span>
          <span className="text-muted-foreground">Close</span>
        </button>
        <button
          type="button"
          onClick={handleCutLine}
          className="flex items-center justify-center gap-1.5 py-1.5 border-r border-border hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <span className="font-bold text-primary">^K</span>
          <span className="text-muted-foreground">Cut Line</span>
        </button>
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-primary/15 transition-colors cursor-pointer"
        >
          <span className="font-bold text-primary">^G</span>
          <span className="text-muted-foreground">Help</span>
        </button>
      </div>
    </div>
  );
}

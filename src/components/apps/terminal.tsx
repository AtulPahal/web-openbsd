"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { INITIAL_MOTD } from "@/lib/command-data";
import { VirtualFS } from "@/features/virtual-fs";
import { CommandInterpreter } from "@/features/command-interpreter";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "pending";
  content: string;
}

const MAX_LINES = 500;

/** Render SGR tokens without interpreting output as HTML. */
function renderAnsiContent(content: string): React.ReactNode {
  if (!content.includes("\x1b[")) return content;
  const parts = content.split(/(\x1b\[[0-9;]*m)/g);
  let color: string | undefined;
  let backgroundColor: string | undefined;
  let bold = false;
  return parts.map((part, index) => {
    if (/^\x1b\[[0-9;]*m$/.test(part)) {
      const codes = part.slice(2, -1).split(";").map(Number);
      for (let position = 0; position < codes.length; position++) {
        const code = codes[position];
        if (code === 0) { color = undefined; backgroundColor = undefined; bold = false; }
        else if (code === 1) bold = true;
        else if (code === 22) bold = false;
        else if (code === 39) color = undefined;
        else if (code === 49) backgroundColor = undefined;
        else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) color = `var(--color${code >= 90 ? code - 90 + 8 : code - 30})`;
        else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) backgroundColor = `var(--color${code >= 100 ? code - 100 + 8 : code - 40})`;
        else if ((code === 38 || code === 48) && codes[position + 1] === 5) {
          const slot = codes[position + 2];
          const value = slot < 16 ? `var(--color${slot})` : slot === 220 ? "var(--primary)" : slot === 81 ? "var(--accent-secondary)" : slot >= 232 ? `rgb(${8 + (slot - 232) * 10} ${8 + (slot - 232) * 10} ${8 + (slot - 232) * 10})` : `rgb(${[Math.floor((slot - 16) / 36), Math.floor((slot - 16) / 6) % 6, (slot - 16) % 6].map((channel) => channel === 0 ? 0 : 55 + channel * 40).join(" ")})`;
          if (code === 38) color = value; else backgroundColor = value;
          position += 2;
        } else if ((code === 38 || code === 48) && codes[position + 1] === 2 && codes.length > position + 4) {
          const value = `rgb(${codes.slice(position + 2, position + 5).join(" ")})`;
          if (code === 38) color = value; else backgroundColor = value;
          position += 4;
        }
      }
      return null;
    }
    return <span key={index} style={{ color, backgroundColor, fontWeight: bold ? 700 : undefined }}>{part}</span>;
  });
}

export function Terminal({ windowId }: { windowId: string }) {
  // Stable instances
  const fs = useMemo(() => new VirtualFS(), []);
  const interpreter = useMemo(() => new CommandInterpreter(fs), [fs]);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "motd",
      type: "system",
      content: INITIAL_MOTD,
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [prompt, setPrompt] = useState(() => interpreter.getPrompt());

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const appendLines = useCallback((newLines: TerminalLine[]) => {
    setLines((prev) => {
      const combined = [...prev, ...newLines];
      return combined.length > MAX_LINES
        ? combined.slice(combined.length - MAX_LINES)
        : combined;
    });
  }, []);

  const runCommand = useCallback(
    (rawCmd: string) => {
      const trimmed = rawCmd.trim();
      if (!trimmed) return;

      if (trimmed === "clear") {
        setLines([]);
        setInputVal("");
        setHistoryIndex(null);
        return;
      }

      if (trimmed === "exit") {
        window.dispatchEvent(new CustomEvent("close-window", { detail: windowId }));
        return;
      }
      if (trimmed === "reboot") {
        window.location.reload();
        return;
      }
      if (trimmed === "shutdown") {
        window.dispatchEvent(new CustomEvent("system-shutdown"));
        return;
      }

      const currentPrompt = interpreter.getPrompt();
      setCommandHistory((prev) => [...prev, trimmed]);

      const result = interpreter.execute(trimmed);

      if (result === "\x1BCLEAR") {
        setLines([]);
        setInputVal("");
        setHistoryIndex(null);
        return;
      }

      if (typeof result === "string") {
        appendLines([
          {
            id: `in-${Date.now()}-${Math.random()}`,
            type: "input" as const,
            content: `${currentPrompt}${trimmed}`,
          },
          ...(result
            ? [
                {
                  id: `out-${Date.now()}-${Math.random()}`,
                  type: "output" as const,
                  content: result,
                },
              ]
            : []),
        ]);
      } else {
        const pendingId = `pending-${Date.now()}-${Math.random()}`;
        appendLines([
          {
            id: `in-${Date.now()}-${Math.random()}`,
            type: "input" as const,
            content: `${currentPrompt}${trimmed}`,
          },
          { id: pendingId, type: "pending" as const, content: "Fetching..." },
        ]);
        result
          .then((output) => {
            setLines((prev) =>
              prev.map((l) =>
                l.id === pendingId
                  ? { ...l, type: "output", content: output || "(empty response)" }
                  : l
              )
            );
          })
          .catch((err) => {
            setLines((prev) =>
              prev.map((l) =>
                l.id === pendingId
                  ? { ...l, type: "output", content: `Error: ${String(err)}` }
                  : l
              )
            );
          });
      }

      setInputVal("");
      setHistoryIndex(null);
      setPrompt(interpreter.getPrompt());
    },
    [interpreter, windowId, appendLines]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;

      const newIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(newIndex);
      setInputVal(commandHistory[newIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;

      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInputVal("");
      } else {
        setHistoryIndex(newIndex);
        setInputVal(commandHistory[newIndex]);
      }
    }
  };

  return (
    <div
      className="h-full w-full bg-background text-foreground font-mono text-sm flex flex-col select-text p-2.5 sm:p-3 overflow-hidden"
      onClick={handleTerminalClick}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 pb-2 scrollbar-thin">
        <div className="space-y-0.5">
          {lines.map((line) => (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-words leading-relaxed text-xs ${
                line.type === "input"
                  ? "text-primary font-semibold"
                  : line.type === "pending"
                  ? "text-muted-foreground italic animate-pulse"
                  : "text-foreground/85"
              }`}
            >
              {renderAnsiContent(line.content)}
            </pre>
          ))}

          {/* Current Active Input Line */}
          <div className="flex items-center gap-2 pt-1">
            <span className="max-w-[65%] truncate text-primary font-semibold shrink-0 text-xs sm:text-sm" title={prompt}>
              {prompt}
            </span>
            <input
              ref={inputRef}
              aria-label="Terminal command"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ caretColor: "var(--primary)" }}
              className="min-w-0 flex-1 bg-transparent outline-none border-none text-foreground font-mono text-xs sm:text-sm p-0 m-0 focus:ring-0"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

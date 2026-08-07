"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { INITIAL_MOTD } from "@/lib/command-data";
import { VirtualFS } from "@/features/virtual-fs";
import { CommandInterpreter } from "@/features/command-interpreter";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system" | "pending";
  content: string;
}


export function Terminal({ windowId }: { windowId: string }) {
  const fsRef = useRef(new VirtualFS());
  const interpreterRef = useRef(new CommandInterpreter(fsRef.current));

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
  const [prompt, setPrompt] = useState(() =>
    interpreterRef.current.getPrompt()
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Focus input when clicking anywhere inside the terminal area
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputVal.trim();

      if (trimmed === "clear") {
        setLines([]);
        setInputVal("");
        setHistoryIndex(null);
        return;
      }

      if (trimmed === "exit") {
        window.dispatchEvent(new CustomEvent('close-window', { detail: windowId }));
        return;
      }
      if (trimmed === "reboot") {
        window.location.reload();
        return;
      }

      if (trimmed === "shutdown") {
        window.close();
        return;
      }

      const currentPrompt = interpreterRef.current.getPrompt();

      // Execute command — may return string or Promise<string>
      const result = interpreterRef.current.execute(inputVal);

      // Add to command history if not empty
      if (trimmed) {
        setCommandHistory((prev) => [...prev, trimmed]);
      }

      if (typeof result === "string") {
        // Synchronous result — append immediately
        setLines((prev) => [
          ...prev,
          {
            id: `in-${Date.now()}-${Math.random()}`,
            type: "input" as const,
            content: `${currentPrompt}${inputVal}`,
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
        // Async result — show pending line, replace when resolved
        const pendingId = `pending-${Date.now()}-${Math.random()}`;
        setLines((prev) => [
          ...prev,
          {
            id: `in-${Date.now()}-${Math.random()}`,
            type: "input" as const,
            content: `${currentPrompt}${inputVal}`,
          },
          { id: pendingId, type: "pending" as const, content: "Fetching..." },
        ]);
        result
          .then((output) => {
            setLines((prev) =>
              prev.map((l) =>
                l.id === pendingId
                  ? { ...l, type: "output" as const, content: output || "(empty response)" }
                  : l
              )
            );
          })
          .catch((err) => {
            setLines((prev) =>
              prev.map((l) =>
                l.id === pendingId
                  ? { ...l, type: "output" as const, content: `Error: ${String(err)}` }
                  : l
              )
            );
          });
      }

      setInputVal("");
      setHistoryIndex(null);
      setPrompt(interpreterRef.current.getPrompt());
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
      className="h-full w-full bg-[#0a0a0a] text-primary font-mono text-sm flex flex-col select-text p-3 overflow-hidden"
      onClick={handleTerminalClick}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-3 pb-2 scrollbar-thin">
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line.id} className="whitespace-pre-wrap leading-relaxed">
              {line.type === "input" ? (
                <span className="text-amber-400 font-semibold">
                  {line.content}
                </span>
              ) : line.type === "pending" ? (
                <span className="text-muted-foreground italic animate-pulse">
                  {line.content}
                </span>
              ) : (
                <span className="text-foreground/90">{line.content}</span>
              )}
            </div>
          ))}

          {/* Current Active Input Line */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-amber-400 font-semibold shrink-0">
              {prompt}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none border-none text-foreground caret-amber-400 font-mono text-sm p-0 m-0 focus:ring-0"
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

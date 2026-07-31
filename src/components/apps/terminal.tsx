"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VirtualFS } from "@/features/virtual-fs";
import { CommandInterpreter } from "@/features/command-interpreter";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "system";
  content: string;
}

const INITIAL_MOTD = `OpenBSD 7.5 (GENERIC.MP) #1: Sat Apr  6 12:00:00 MDT 2024

Welcome to OpenBSD: The proactively secure Unix-like operating system.

Please use the sendbug(1) utility to report bugs in the system.
Type 'help' for a list of available commands or 'neofetch' for system info.
`;

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

      const currentPrompt = interpreterRef.current.getPrompt();

      // Execute command
      const output = interpreterRef.current.execute(inputVal);

      // Add to command history if not empty
      if (trimmed) {
        setCommandHistory((prev) => [...prev, trimmed]);
      }

      setLines((prev) => [
        ...prev,
        {
          id: `in-${Date.now()}-${Math.random()}`,
          type: "input",
          content: `${currentPrompt}${inputVal}`,
        },
        ...(output
          ? [
              {
                id: `out-${Date.now()}-${Math.random()}`,
                type: "output" as const,
                content: output,
              },
            ]
          : []),
      ]);

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
      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line.id} className="whitespace-pre-wrap leading-relaxed">
              {line.type === "input" ? (
                <span className="text-amber-400 font-semibold">
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
      </ScrollArea>
    </div>
  );
}

"use client";

import { useCallback, useRef } from "react";
import type { WindowState, Position, Size } from "@/types";

interface WindowFrameProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (position: Position) => void;
  onResize: (size: Size) => void;
  children: React.ReactNode;
}

type ResizeDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export function WindowFrame({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  children,
}: WindowFrameProps) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const resizeRef = useRef<{
    direction: ResizeDirection;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originW: number;
    originH: number;
  } | null>(null);

  // --- Title bar drag ---
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return;
      e.preventDefault();
      onFocus();

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        onMove({
          x: dragRef.current.originX + dx,
          y: Math.max(0, dragRef.current.originY + dy),
        });
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [win.isMaximized, win.position.x, win.position.y, onFocus, onMove]
  );

  const handleTitleDoubleClick = useCallback(() => {
    onMaximize();
  }, [onMaximize]);

  // --- Resize handles ---
  const handleResizeMouseDown = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      if (win.isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus();

      resizeRef.current = {
        direction,
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
        originW: win.size.width,
        originH: win.size.height,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const r = resizeRef.current;
        const dx = ev.clientX - r.startX;
        const dy = ev.clientY - r.startY;

        let newX = r.originX;
        let newY = r.originY;
        let newW = r.originW;
        let newH = r.originH;

        if (r.direction.includes("e")) {
          newW = r.originW + dx;
        }
        if (r.direction.includes("w")) {
          newW = r.originW - dx;
          newX = r.originX + dx;
        }
        if (r.direction.includes("s")) {
          newH = r.originH + dy;
        }
        if (r.direction.includes("n")) {
          newH = r.originH - dy;
          newY = r.originY + dy;
        }

        // Enforce min size
        const clampedW = Math.max(newW, win.minSize.width);
        const clampedH = Math.max(newH, win.minSize.height);

        // Adjust position if clamping prevented resize from left/top
        if (r.direction.includes("w") && clampedW !== newW) {
          newX = r.originX + r.originW - clampedW;
        }
        if (r.direction.includes("n") && clampedH !== newH) {
          newY = r.originY + r.originH - clampedH;
        }

        onResize({ width: clampedW, height: clampedH });
        onMove({ x: newX, y: Math.max(0, newY) });
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [
      win.isMaximized,
      win.position.x,
      win.position.y,
      win.size.width,
      win.size.height,
      win.minSize.width,
      win.minSize.height,
      onFocus,
      onMove,
      onResize,
    ]
  );

  if (win.isMinimized) return null;

  const HANDLE_SIZE = 5;

  return (
    <div
      className="absolute flex flex-col border border-border"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className={`flex items-center justify-between px-2 h-8 shrink-0 select-none font-mono text-sm ${
          win.isFocused
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleTitleDoubleClick}
      >
        <span className="truncate pr-2">{win.title}</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            aria-label="Minimize"
          >
            -
          </button>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors text-[10px]"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            aria-label="Maximize"
          >
            □
          </button>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-hidden bg-card text-card-foreground">
        {children}
      </div>

      {/* Resize handles - 8 directions */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-0 right-0 cursor-n-resize"
            style={{ height: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("n")}
          />
          <div
            className="absolute bottom-0 left-0 right-0 cursor-s-resize"
            style={{ height: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("s")}
          />
          <div
            className="absolute top-0 left-0 bottom-0 cursor-w-resize"
            style={{ width: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("w")}
          />
          <div
            className="absolute top-0 right-0 bottom-0 cursor-e-resize"
            style={{ width: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("e")}
          />
          {/* Corners */}
          <div
            className="absolute top-0 left-0 cursor-nw-resize"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("nw")}
          />
          <div
            className="absolute top-0 right-0 cursor-ne-resize"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("ne")}
          />
          <div
            className="absolute bottom-0 left-0 cursor-sw-resize"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("sw")}
          />
          <div
            className="absolute bottom-0 right-0 cursor-se-resize"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("se")}
          />
        </>
      )}
    </div>
  );
}

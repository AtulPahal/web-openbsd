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

  // --- Title bar drag (Mouse + Touch with RAF smooth throttling) ---
  const handleTitleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (win.isMaximized) return;
      onFocus();

      dragRef.current = {
        startX: clientX,
        startY: clientY,
        originX: win.position.x,
        originY: win.position.y,
      };

      let rafId: number | null = null;

      const handleMove = (evX: number, evY: number) => {
        if (!dragRef.current) return;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (!dragRef.current) return;
          const dx = evX - dragRef.current.startX;
          const dy = evY - dragRef.current.startY;
          onMove({
            x: dragRef.current.originX + dx,
            y: Math.max(0, dragRef.current.originY + dy),
          });
        });
      };

      const handleMouseMove = (ev: MouseEvent) => handleMove(ev.clientX, ev.clientY);
      const handleTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length > 0) {
          handleMove(ev.touches[0].clientX, ev.touches[0].clientY);
        }
      };

      const handleEnd = () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    },
    [win.isMaximized, win.position.x, win.position.y, onFocus, onMove]
  );

  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleTitleStart(e.clientX, e.clientY);
    },
    [handleTitleStart]
  );

  const handleTitleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleTitleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleTitleStart]
  );

  const handleTitleDoubleClick = useCallback(() => {
    onMaximize();
  }, [onMaximize]);

  // --- Resize handles (Mouse + Touch with RAF smooth throttling) ---
  const handleResizeStart = useCallback(
    (direction: ResizeDirection, clientX: number, clientY: number) => {
      if (win.isMaximized) return;
      onFocus();

      resizeRef.current = {
        direction,
        startX: clientX,
        startY: clientY,
        originX: win.position.x,
        originY: win.position.y,
        originW: win.size.width,
        originH: win.size.height,
      };

      let resizeRafId: number | null = null;

      const handleResizeMove = (evX: number, evY: number) => {
        if (!resizeRef.current) return;
        if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
          if (!resizeRef.current) return;
          const r = resizeRef.current;
          const dx = evX - r.startX;
          const dy = evY - r.startY;

          let newX = r.originX;
          let newY = r.originY;
          let newW = r.originW;
          let newH = r.originH;

          if (r.direction.includes("e")) newW = r.originW + dx;
          if (r.direction.includes("w")) {
            newW = r.originW - dx;
            newX = r.originX + dx;
          }
          if (r.direction.includes("s")) newH = r.originH + dy;
          if (r.direction.includes("n")) {
            newH = r.originH - dy;
            newY = r.originY + dy;
          }

          const clampedW = Math.max(newW, win.minSize.width);
          const clampedH = Math.max(newH, win.minSize.height);

          if (r.direction.includes("w") && clampedW !== newW) {
            newX = r.originX + r.originW - clampedW;
          }
          if (r.direction.includes("n") && clampedH !== newH) {
            newY = r.originY + r.originH - clampedH;
          }

          onResize({ width: clampedW, height: clampedH });
          onMove({ x: newX, y: Math.max(0, newY) });
        });
      };

      const handleMouseMove = (ev: MouseEvent) => handleResizeMove(ev.clientX, ev.clientY);
      const handleTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length > 0) {
          handleResizeMove(ev.touches[0].clientX, ev.touches[0].clientY);
        }
      };

      const handleEnd = () => {
        if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
        resizeRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
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

  const handleResizeMouseDown = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleResizeStart(direction, e.clientX, e.clientY);
    },
    [handleResizeStart]
  );

  const handleResizeTouchStart = useCallback(
    (direction: ResizeDirection) => (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        e.stopPropagation();
        handleResizeStart(direction, e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleResizeStart]
  );

  if (win.isMinimized) return null;

  const HANDLE_SIZE = 8;

  return (
    <div
      className={`absolute flex flex-col overflow-hidden transition-shadow duration-150 ${
        win.isMaximized
          ? "border-b border-border shadow-none rounded-none inset-0"
          : "border rounded-t-lg"
      } ${
        win.isFocused
          ? "border-primary/60 shadow-xl shadow-black/10 dark:shadow-black/50"
          : "border-border/80 shadow-md shadow-black/5"
      }`}
      style={
        win.isMaximized
          ? {
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              zIndex: win.zIndex,
            }
          : {
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              zIndex: win.zIndex,
            }
      }
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      {/* Title bar */}
      <div
        className={`flex items-center justify-between px-2.5 h-8 shrink-0 select-none font-mono text-xs font-semibold tracking-wide border-b transition-colors duration-150 cursor-grab active:cursor-grabbing touch-none ${
          win.isFocused
            ? "bg-card text-foreground font-bold border-primary/50 shadow-sm"
            : "bg-muted/70 text-muted-foreground border-border/60"
        }`}
        onMouseDown={handleTitleMouseDown}
        onTouchStart={handleTitleTouchStart}
        onDoubleClick={handleTitleDoubleClick}
      >
        <div className="flex items-center gap-2 truncate pr-2 pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
              win.isFocused ? "bg-primary shadow-sm shadow-primary/50" : "bg-muted-foreground/30"
            }`}
          />
          <span className="truncate">{win.title}</span>
        </div>

        {/* Window Traffic Light Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            aria-label="Minimize"
            title="Minimize"
            className="w-6 h-6 rounded flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-sm leading-none">—</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            aria-label={win.isMaximized ? "Restore" : "Maximize"}
            title={win.isMaximized ? "Restore" : "Maximize"}
            className="w-6 h-6 rounded flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-xs leading-none">□</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            title="Close"
            className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-xs font-bold leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-hidden bg-card text-card-foreground">
        {children}
      </div>

      {/* Resize handles - 8 directions (active only when not maximized) */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-0 right-0 cursor-n-resize touch-none"
            style={{ height: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("n")}
            onTouchStart={handleResizeTouchStart("n")}
          />
          <div
            className="absolute bottom-0 left-0 right-0 cursor-s-resize touch-none"
            style={{ height: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("s")}
            onTouchStart={handleResizeTouchStart("s")}
          />
          <div
            className="absolute top-0 left-0 bottom-0 cursor-w-resize touch-none"
            style={{ width: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("w")}
            onTouchStart={handleResizeTouchStart("w")}
          />
          <div
            className="absolute top-0 right-0 bottom-0 cursor-e-resize touch-none"
            style={{ width: HANDLE_SIZE }}
            onMouseDown={handleResizeMouseDown("e")}
            onTouchStart={handleResizeTouchStart("e")}
          />
          {/* Corners */}
          <div
            className="absolute top-0 left-0 cursor-nw-resize touch-none"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("nw")}
            onTouchStart={handleResizeTouchStart("nw")}
          />
          <div
            className="absolute top-0 right-0 cursor-ne-resize touch-none"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("ne")}
            onTouchStart={handleResizeTouchStart("ne")}
          />
          <div
            className="absolute bottom-0 left-0 cursor-sw-resize touch-none"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("sw")}
            onTouchStart={handleResizeTouchStart("sw")}
          />
          <div
            className="absolute bottom-0 right-0 cursor-se-resize touch-none"
            style={{ width: HANDLE_SIZE * 2, height: HANDLE_SIZE * 2 }}
            onMouseDown={handleResizeMouseDown("se")}
            onTouchStart={handleResizeTouchStart("se")}
          />
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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

  // --- Title bar drag (Mouse + Touch) ---
  const handleTitleStart = useCallback(
    (clientX: number, clientY: number) => {
      onFocus();

      if (win.isMaximized) {
        onMaximize();
        const estimatedW = win.size.width || 680;
        const newOriginX = Math.max(0, clientX - estimatedW / 2);
        dragRef.current = {
          startX: clientX,
          startY: clientY,
          originX: newOriginX,
          originY: Math.max(0, clientY - 18),
        };
      } else {
        dragRef.current = {
          startX: clientX,
          startY: clientY,
          originX: win.position.x,
          originY: win.position.y,
        };
      }

      setIsDragging(true);

      const handleMove = (evX: number, evY: number) => {
        if (!dragRef.current) return;
        const dx = evX - dragRef.current.startX;
        const dy = evY - dragRef.current.startY;
        onMove({
          x: Math.round(dragRef.current.originX + dx),
          y: Math.max(0, Math.round(dragRef.current.originY + dy)),
        });
      };

      const handleMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        handleMove(ev.clientX, ev.clientY);
      };

      const handleTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length > 0) {
          ev.preventDefault();
          handleMove(ev.touches[0].clientX, ev.touches[0].clientY);
        }
      };

      const handleEnd = () => {
        dragRef.current = null;
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
      document.addEventListener("touchcancel", handleEnd);
    },
    [win.isMaximized, win.position.x, win.position.y, win.size.width, onFocus, onMaximize, onMove]
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

  // --- Resize handles (Mouse + Touch) ---
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

      setIsResizing(true);

      const handleResizeMove = (evX: number, evY: number) => {
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
      };

      const handleMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        handleResizeMove(ev.clientX, ev.clientY);
      };

      const handleTouchMove = (ev: TouchEvent) => {
        if (ev.touches.length > 0) {
          ev.preventDefault();
          handleResizeMove(ev.touches[0].clientX, ev.touches[0].clientY);
        }
      };

      const handleEnd = () => {
        resizeRef.current = null;
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
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
      className={`absolute flex flex-col overflow-hidden liquid-window ${
        isDragging || isResizing
          ? "select-none pointer-events-auto"
          : "transition-[box-shadow,border-color] duration-200"
      } ${
        win.isMaximized
          ? "border-b border-border shadow-none rounded-none inset-0"
          : "border rounded-3xl"
      } ${
        win.isFocused
          ? "border-primary/60 ring-2 ring-primary/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_var(--accent-glow)]"
          : "border-border/70 shadow-xl shadow-black/20"
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
      {/* Liquid Glass Title Bar */}
      <div
        className={`group/titlebar flex items-center justify-between px-3.5 h-9 shrink-0 select-none font-sans text-xs border-b transition-colors duration-150 cursor-grab active:cursor-grabbing touch-none ${
          win.isMaximized ? "rounded-none" : "rounded-t-3xl"
        } ${
          win.isFocused
            ? "bg-card/90 backdrop-blur-2xl text-foreground font-semibold border-primary/30"
            : "bg-muted/80 backdrop-blur-lg text-muted-foreground border-border/50"
        }`}
        onMouseDown={handleTitleMouseDown}
        onTouchStart={handleTitleTouchStart}
        onDoubleClick={handleTitleDoubleClick}
      >
        {/* Left: macOS Liquid Jewel Traffic Light Buttons */}
        <div className="flex items-center gap-2 shrink-0 group/lights">
          {/* Close: Red */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            title="Close"
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover/lights:text-black/75 text-transparent font-bold text-[8px] leading-none select-none active:scale-90"
          >
            ✕
          </button>

          {/* Minimize: Yellow/Amber */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            aria-label="Minimize"
            title="Minimize"
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover/lights:text-black/75 text-transparent font-bold text-[8px] leading-none select-none active:scale-90"
          >
            —
          </button>

          {/* Maximize: Green */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            aria-label={win.isMaximized ? "Restore" : "Maximize"}
            title={win.isMaximized ? "Restore" : "Maximize"}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-110 flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover/lights:text-black/75 text-transparent font-bold text-[7px] leading-none select-none active:scale-90"
          >
            +
          </button>
        </div>

        {/* Center: Window Title */}
        <div className="flex-1 text-center truncate px-2 font-medium text-foreground/90 tracking-wide pointer-events-none text-[11px]">
          {win.title}
        </div>

        {/* Right: Balance Spacer */}
        <div className="w-12 shrink-0" />
      </div>

      {/* Window Content */}
      <div
        className={`flex-1 overflow-hidden bg-card/95 backdrop-blur-2xl text-card-foreground ${
          win.isMaximized ? "rounded-none" : "rounded-b-3xl"
        }`}
      >
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

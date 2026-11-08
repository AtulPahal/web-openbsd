"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Power, Lock, RotateCw, LogOut, Moon } from "lucide-react";

interface PowerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLock: () => void;
  onRestart: () => void;
  onShutdown: () => void;
  onSleep: () => void;
}

export function PowerMenu({ isOpen, onClose, onLock, onRestart, onShutdown, onSleep }: PowerMenuProps) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.querySelector<HTMLButtonElement>("[data-power-trigger]");
    const place = () => {
      const rect = trigger?.closest("header")?.getBoundingClientRect();
      if (rect) setPosition({ left: Math.max(8, rect.left), top: rect.bottom + 8 });
    };
    place();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target) && !trigger?.contains(event.target)) closeRef.current();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        trigger?.focus();
      }
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? []);
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }
      if (event.key === "Tab") closeRef.current();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", place);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && position) menuRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
  }, [isOpen, position]);

  if (!isOpen || !position) return null;
  const actions = [
    { label: "Shutdown", icon: Power, action: onShutdown },
    { label: "Lock", icon: Lock, action: onLock },
    { label: "Restart", icon: RotateCw, action: onRestart },
    { label: "Sleep", icon: Moon, action: onSleep },
    { label: "Logout", icon: LogOut, action: onLock },
  ];

  return createPortal(
    <div ref={menuRef} id="power-menu" role="menu" aria-label="Session and power options" style={position} className="power-panel dock-liquid-glass fixed z-[80] flex w-60 max-w-[calc(100vw-1rem)] flex-col gap-1 rounded-2xl font-sans text-sm">
      {actions.map(({ label, icon: Icon, action }, index) => (
        <button key={label} type="button" role="menuitem" onClick={() => { onClose(); action(); }} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground ${index > 1 ? "border-t border-border" : ""}`}>
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className={index === 0 ? "font-semibold" : "font-medium"}>{label}</span>
        </button>
      ))}
    </div>, document.body
  );
}

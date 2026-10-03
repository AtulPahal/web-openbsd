"use client";

import { useState, useEffect, useRef } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { WindowFrame } from "@/components/window/window-frame";
import { Dock } from "@/components/desktop/dock";
import { TopMenuBar } from "@/components/desktop/top-menu-bar";
import { NotificationCenter } from "@/components/desktop/notification-center";
import { Terminal } from "@/components/apps/terminal";
import { FileManager } from "@/components/apps/file-manager";
import { TextEditor } from "@/components/apps/text-editor";
import { Firefox } from "@/components/apps/firefox";
import { MusicApp } from "@/components/apps/music";
import { VideoApp } from "@/components/apps/video";
import { Portfolio } from "@/components/apps/portfolio";
import { Resume } from "@/components/apps/resume";
import { SystemMonitor } from "@/components/apps/system-monitor";
import { CalendarApp } from "@/components/apps/calendar";
import { SystemSettings } from "@/components/apps/system-settings";
import { AIStudio } from "@/components/apps/ai-studio";
import type { AppId, AppState, DesktopNotification } from "@/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { Eye, Home } from "lucide-react";
interface Toast {
  id: string;
  message: string;
}

export function Desktop() {
  const {
    windows,
    camera,
    panCamera,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    centerWindow,
    goHome,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager();

  const [brightness, setBrightness] = useState(100);
  const [wallpaper, setWallpaper] = useState<string>(SYSTEM_CONFIG.wallpaper);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [dockMagnification, setDockMagnification] = useState(true);
  const [masterVolume, setMasterVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isDndOn, setIsDndOn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<DesktopNotification[]>([
    {
      id: "init-1",
      title: "System Active",
      message: `${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} (driftwm infinite canvas active).`,
      timestamp: "Just now",
    },
    {
      id: "init-2",
      title: "PF Firewall",
      message: "Proactively secure rules loaded.",
      timestamp: "Just now",
    },
  ]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const nextIdRef = useRef(0);

  // Canvas Pan State
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const addNotification = (title: string, message: string, appId?: AppId, duration = 2500) => {
    const id = `notif-${nextIdRef.current++}`;
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const item: DesktopNotification = {
      id,
      title,
      message,
      timestamp,
      appId,
    };

    setNotificationHistory((prev) => [item, ...prev]);

    if (!isDndOn) {
      const toast: Toast = { id, message };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const handleOpenApp = (appId: AppId, appState?: AppState) => {
    openWindow(appId, appState, 1);
  };

  const handleVolumeChange = (newLevel: number, muted = isMuted) => {
    setMasterVolume(newLevel);
    setIsMuted(muted);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("master-volume-change", {
          detail: { volume: muted ? 0 : newLevel / 100, isMuted: muted, level: newLevel },
        })
      );
    }
  };

  // Canvas Panning Handler (on background drag)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking on the background canvas
    const target = e.target as HTMLElement;
    if (target.closest("[data-window-id]") || target.closest("button") || target.closest("input")) {
      return;
    }

    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = ev.clientX - panStartRef.current.x;
      const dy = ev.clientY - panStartRef.current.y;
      panStartRef.current = { x: ev.clientX, y: ev.clientY };
      panCamera(dx, dy);
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Canvas Zoom / 2D Scroll
  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    } else {
      panCamera(-e.deltaX, -e.deltaY);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode]);

  // Global Event Listeners & driftwm Keybindings
  useEffect(() => {
    const handleClose = (e: CustomEvent<string>) => closeWindow(e.detail);
    const handleOpen = (e: CustomEvent<{ appId: AppId; appState?: AppState }>) => {
      handleOpenApp(e.detail.appId, e.detail.appState);
    };
    const handleNotify = (e: CustomEvent<{ message: string; title?: string; duration?: number }>) => {
      addNotification(
        e.detail.title || "Notification",
        e.detail.message,
        undefined,
        e.detail.duration
      );
    };
    const handleMasterVol = (e: Event) => {
      const customEvent = e as CustomEvent<{ volume: number; isMuted: boolean; level: number }>;
      if (typeof customEvent.detail?.level === "number") {
        setMasterVolume(customEvent.detail.level);
      }
      if (typeof customEvent.detail?.isMuted === "boolean") {
        setIsMuted(customEvent.detail.isMuted);
      }
    };
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      if (typeof customEvent.detail?.isDark === "boolean") {
        setIsDarkMode(customEvent.detail.isDark);
      }
    };
    const handleDockMagnify = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (typeof customEvent.detail?.enabled === "boolean") {
        setDockMagnification(customEvent.detail.enabled);
      }
    };
    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ wallpaper: string }>;
      if (customEvent.detail?.wallpaper) {
        setWallpaper(customEvent.detail.wallpaper);
      }
    };
    const handleBrightnessEvt = (e: Event) => {
      const customEvent = e as CustomEvent<{ brightness: number }>;
      if (typeof customEvent.detail?.brightness === "number") {
        setBrightness(customEvent.detail.brightness);
      }
    };

    // driftwm official keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAltOrSuper = e.altKey || e.metaKey;

      if (isAltOrSuper && e.key.toLowerCase() === "w") {
        // Mod+W: Zoom to Fit (Overview)
        e.preventDefault();
        zoomToFit();
      } else if (isAltOrSuper && e.key.toLowerCase() === "c") {
        // Mod+C: Center focused window
        e.preventDefault();
        const focused = windows.find((w) => w.isFocused);
        if (focused) centerWindow(focused.id);
      } else if (isAltOrSuper && e.key.toLowerCase() === "a") {
        // Mod+A: Home (Jump to origin)
        e.preventDefault();
        goHome();
      } else if (isAltOrSuper && (e.key === "=" || e.key === "+")) {
        // Mod+=: Zoom In
        e.preventDefault();
        zoomIn();
      } else if (isAltOrSuper && (e.key === "-" || e.key === "_")) {
        // Mod+-: Zoom Out
        e.preventDefault();
        zoomOut();
      } else if (isAltOrSuper && e.key === "0") {
        // Mod+0: Reset Zoom
        e.preventDefault();
        resetZoom();
      } else if (isAltOrSuper && e.key === "Enter") {
        // Mod+Return: Launch Terminal
        e.preventDefault();
        handleOpenApp("terminal");
      } else if (isAltOrSuper && e.key.toLowerCase() === "q") {
        // Mod+Q: Close focused window
        e.preventDefault();
        const focused = windows.find((w) => w.isFocused);
        if (focused) closeWindow(focused.id);
      }
    };

    window.addEventListener("close-window", handleClose as EventListener);
    window.addEventListener("open-app", handleOpen as EventListener);
    window.addEventListener("show-notification", handleNotify as EventListener);
    window.addEventListener("master-volume-change", handleMasterVol);
    window.addEventListener("theme-change", handleThemeChange);
    window.addEventListener("dock-magnification-change", handleDockMagnify);
    window.addEventListener("wallpaper-change", handleWallpaperChange);
    window.addEventListener("brightness-change", handleBrightnessEvt);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("close-window", handleClose as EventListener);
      window.removeEventListener("open-app", handleOpen as EventListener);
      window.removeEventListener("show-notification", handleNotify as EventListener);
      window.removeEventListener("master-volume-change", handleMasterVol);
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("dock-magnification-change", handleDockMagnify);
      window.removeEventListener("wallpaper-change", handleWallpaperChange);
      window.removeEventListener("brightness-change", handleBrightnessEvt);
    };
  }, [
    closeWindow,
    zoomToFit,
    centerWindow,
    goHome,
    zoomIn,
    zoomOut,
    resetZoom,
    windows,
  ]);

  const renderAppContent = (appId: AppId, windowId: string, appState?: AppState) => {
    switch (appId) {
      case "terminal":
        return <Terminal windowId={windowId} />;
      case "file-manager":
        return <FileManager windowId={windowId} />;
      case "text-editor":
        return <TextEditor windowId={windowId} path={appState?.path} />;
      case "system-monitor":
        return <SystemMonitor windowId={windowId} />;
      case "firefox":
        return <Firefox windowId={windowId} />;
      case "music":
        return <MusicApp windowId={windowId} path={appState?.path} />;
      case "video":
        return <VideoApp windowId={windowId} path={appState?.path} />;
      case "portfolio":
        return <Portfolio windowId={windowId} />;
      case "resume":
        return <Resume windowId={windowId} />;
      case "calendar":
        return <CalendarApp windowId={windowId} />;
      case "settings":
        return <SystemSettings windowId={windowId} />;
      case "ai-studio":
        return <AIStudio windowId={windowId} />;
      default:
        return (
          <div className="p-4 font-mono text-sm text-foreground">
            Unknown application: {appId}
          </div>
        );
    }
  };

  const focusedWindow = windows.find((w) => w.isFocused);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">
        {/* Desktop Container Wrapper */}
        <div className="h-full min-h-[100dvh] w-full bg-background flex flex-col overflow-hidden relative select-none">
          {/* driftwm Top Bar with Camera HUD */}
          <TopMenuBar
            onOpenApp={handleOpenApp}
            windows={windows}
            camera={camera}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onZoomToFit={zoomToFit}
            onCenterWindow={() => {
              if (focusedWindow) centerWindow(focusedWindow.id);
            }}
            onGoHome={goHome}
            onToggleNotificationCenter={() => setIsNotificationCenterOpen((prev) => !prev)}
            unreadCount={notificationHistory.length}
            volume={masterVolume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
          />

          {/* driftwm Infinite 2D Canvas Viewport */}
          <div
            className="flex-1 relative overflow-hidden pl-0 pr-9 sm:pr-11 md:pr-14 cursor-crosshair active:cursor-grabbing"
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleCanvasWheel}
          >
            {/* Infinite Wallpaper & Dot Grid Canvas Background */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-100"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0), url('${wallpaper}')`,
                backgroundSize: `${28 * camera.zoom}px ${28 * camera.zoom}px, cover`,
                backgroundPosition: `${camera.x}px ${camera.y}px, center`,
              }}
            />

            {/* Transformable Canvas Surface */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
                transformOrigin: "0 0",
                willChange: "transform",
                transition: isPanningRef.current ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                {windows.map((win) => (
                  <WindowFrame
                    key={win.id}
                    window={win}
                    onClose={() => closeWindow(win.id)}
                    onMinimize={() => minimizeWindow(win.id)}
                    onMaximize={() => maximizeWindow(win.id)}
                    onFocus={() => focusWindow(win.id)}
                    onMove={(pos) => moveWindow(win.id, pos)}
                    onResize={(size) => resizeWindow(win.id, size)}
                  >
                    {renderAppContent(win.appId, win.id, win.appState)}
                  </WindowFrame>
                ))}
              </div>
            </div>
          </div>

          {/* OpenBSD Right-Side Dock */}
          <Dock
            windows={windows}
            onFocusWindow={(id) => {
              focusWindow(id);
              centerWindow(id);
            }}
            onMinimizeWindow={(id) => minimizeWindow(id)}
            onOpenApp={(appId) => handleOpenApp(appId)}
            dockMagnification={dockMagnification}
          />

          {/* Toast Notification Toasts */}
          <div className="fixed top-9 right-4 z-40 flex flex-col gap-1.5 pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="w-64 px-3 py-2 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl text-xs font-mono text-foreground animate-in slide-in-from-top-2 fade-in-0"
              >
                {toast.message}
              </div>
            ))}
          </div>

          {/* Brightness Dimming Overlay */}
          {brightness < 100 && (
            <div
              className="fixed inset-0 pointer-events-none z-[45] bg-black transition-opacity duration-100"
              style={{ opacity: ((100 - brightness) / 100) * 0.75 }}
            />
          )}

          {/* Notification Center Drawer */}
          <NotificationCenter
            isOpen={isNotificationCenterOpen}
            onClose={() => setIsNotificationCenterOpen(false)}
            notifications={notificationHistory}
            onClearAll={() => setNotificationHistory([])}
            onRemoveNotification={(id) =>
              setNotificationHistory((prev) => prev.filter((n) => n.id !== id))
            }
            brightness={brightness}
            onBrightnessChange={(b) => setBrightness(b)}
            onOpenCalendar={() => {
              setIsNotificationCenterOpen(false);
              handleOpenApp("calendar");
            }}
            isDndOn={isDndOn}
            onToggleDnd={() => setIsDndOn((prev) => !prev)}
            volume={masterVolume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      </ContextMenuTrigger>

      {/* Desktop Context Menu */}
      <ContextMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-border/80 font-mono text-xs rounded-2xl p-1.5 shadow-2xl">
        <div className="px-2 py-1 text-[10px] text-primary font-bold tracking-wider">
          {SYSTEM_CONFIG.name.toUpperCase()} (DRIFTWM)
        </div>
        <ContextMenuSeparator className="bg-border/60" />
        <ContextMenuItem
          onClick={zoomToFit}
          className="gap-2.5 px-2 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-xl"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Zoom to Fit (Overview)</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={goHome}
          className="gap-2.5 px-2 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-xl"
        >
          <Home className="w-4 h-4 text-primary" />
          <span>Return to Origin (0,0)</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border/60" />
        {Object.values(APP_REGISTRY).map((app) => {
          const IconComp = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          return (
            <ContextMenuItem
              key={app.id}
              onClick={() => handleOpenApp(app.id)}
              className="gap-2.5 px-2 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-xl"
            >
              <IconComp className="w-4 h-4 text-primary" />
              <span>Open {app.name}</span>
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}

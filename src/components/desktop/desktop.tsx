"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { WindowFrame } from "@/components/window/window-frame";
import { Dock } from "@/components/desktop/dock";
import { TopMenuBar } from "@/components/desktop/top-menu-bar";
import { NotificationCenter } from "@/components/desktop/notification-center";
import { DesktopHud } from "@/components/desktop/desktop-hud";
import { WallpaperCarousel } from "@/components/desktop/wallpaper-carousel";
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
import { DEFAULT_RICE_THEME, RICE_THEMES } from "@/lib/rice-theme-config";
import type { RiceTheme } from "@/lib/rice-theme-config";
import { extractPywalFromImage, applyPywalTheme, getSavedWallpaper, getSavedDarkMode, getSavedPywalTheme } from "@/lib/pywal";
import { ImageIcon, Eye } from "lucide-react";

interface Toast {
  id: string;
  message: string;
}

interface DesktopProps {
  onLock?: () => void;
  onShutdown?: () => void;
}

export function Desktop({ onLock, onShutdown }: DesktopProps = {}) {
  const canvasRef = useRef<HTMLElement>(null);
  const {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager(canvasRef);

  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [riceTheme, setRiceTheme] = useState<RiceTheme>(() => Object.values(RICE_THEMES).find((theme) => theme.wallpaper === getSavedWallpaper()) ?? DEFAULT_RICE_THEME);
  const [wallpaper, setWallpaper] = useState(getSavedWallpaper);
  const [isDarkMode, setIsDarkMode] = useState(getSavedDarkMode);
  const [dockMagnification, setDockMagnification] = useState(true);
  const [masterVolume, setMasterVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isDndOn, setIsDndOn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Aesthetic Rice Overlays
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isWallpaperCarouselOpen, setIsWallpaperCarouselOpen] = useState(false);
  const [showDesktopHud, setShowDesktopHud] = useState(true);

  const [notificationHistory, setNotificationHistory] = useState<DesktopNotification[]>([]);
  const nextIdRef = useRef(0);
  const themeRequest = useRef(0);

  const addNotification = useCallback(
    (title: string, message: string, appId?: AppId, duration = 2500) => {
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
    },
    [isDndOn]
  );

  const handleOpenApp = useCallback(
    (appId: AppId, appState?: AppState) => {
      const existing = windows.find((w) => w.appId === appId && (!appState?.path || w.appState?.path === appState.path));
      if (existing) {
        if (existing.workspace && existing.workspace !== activeWorkspace) {
          setActiveWorkspace(existing.workspace);
        }
        focusWindow(existing.id);
      } else {
        openWindow(appId, appState, activeWorkspace);
      }
    },
    [windows, activeWorkspace, focusWindow, openWindow]
  );

  const requestClose = useCallback((id: string) => {
    const event = new CustomEvent("before-close-window", { detail: id, cancelable: true });
    if (window.dispatchEvent(event)) closeWindow(id);
  }, [closeWindow]);

  const handleVolumeChange = useCallback(
    (newLevel: number, muted = isMuted) => {
      setMasterVolume(newLevel);
      setIsMuted(muted);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("master-volume-change", {
            detail: { volume: muted ? 0 : newLevel / 100, isMuted: muted, level: newLevel },
          })
        );
      }
    },
    [isMuted]
  );

  const applyRiceTheme = useCallback(async (newTheme: RiceTheme) => {
    const request = ++themeRequest.current;
    try {
      const palette = await extractPywalFromImage(newTheme.wallpaper);
      if (request !== themeRequest.current) return;
      const dark = newTheme.mode === "dark";
      applyPywalTheme(palette, dark);
      setRiceTheme({ ...newTheme, accent: palette.special.accent, accentSecondary: palette.special.accentSecondary, textColor: "var(--foreground)", textMuted: "var(--muted-foreground)" });
      setWallpaper(newTheme.wallpaper);
      setIsDarkMode(dark);
      window.dispatchEvent(new CustomEvent("theme-change", { detail: { isDark: dark } }));
      window.dispatchEvent(new CustomEvent("wallpaper-change", { detail: { wallpaper: newTheme.wallpaper, fromTheme: true } }));
    } catch {
      addNotification("Wallpaper unavailable", "Could not extract this wallpaper's colors; the previous theme was kept.");
    }
  }, [addNotification]);

  useEffect(() => {
    const saved = getSavedPywalTheme();
    if (saved && saved.wallpaper === getSavedWallpaper()) applyPywalTheme(saved, getSavedDarkMode());
    else extractPywalFromImage(getSavedWallpaper()).then((palette) => applyPywalTheme(palette, getSavedDarkMode())).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClose = (e: CustomEvent<string>) => requestClose(e.detail);
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
        const nextDark = customEvent.detail.isDark;
        setIsDarkMode(nextDark);
        const palette = getSavedPywalTheme();
        if (palette) applyPywalTheme(palette, nextDark);
        setRiceTheme((prev) => ({
          ...prev,
          mode: nextDark ? "dark" : "light",
        }));
      }
    };
    const handleDockMagnify = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (typeof customEvent.detail?.enabled === "boolean") {
        setDockMagnification(customEvent.detail.enabled);
      }
    };
    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ wallpaper: string; fromTheme?: boolean }>;
      if (customEvent.detail?.wallpaper && !customEvent.detail.fromTheme) {
        const foundTheme = Object.values(RICE_THEMES).find(
          (t) => t.wallpaper === customEvent.detail.wallpaper
        );
        if (foundTheme) {
          applyRiceTheme(foundTheme);
        } else {
          applyRiceTheme({ ...DEFAULT_RICE_THEME, id: "custom", name: "Custom Wallpaper", wallpaper: customEvent.detail.wallpaper, thumb: customEvent.detail.wallpaper, mode: getSavedDarkMode() ? "dark" : "light" });
        }
      }
    };
    const handleBrightnessEvt = (e: Event) => {
      const customEvent = e as CustomEvent<{ brightness: number }>;
      if (typeof customEvent.detail?.brightness === "number") {
        setBrightness(customEvent.detail.brightness);
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

    return () => {
      window.removeEventListener("close-window", handleClose as EventListener);
      window.removeEventListener("open-app", handleOpen as EventListener);
      window.removeEventListener("show-notification", handleNotify as EventListener);
      window.removeEventListener("master-volume-change", handleMasterVol);
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("dock-magnification-change", handleDockMagnify);
      window.removeEventListener("wallpaper-change", handleWallpaperChange);
      window.removeEventListener("brightness-change", handleBrightnessEvt);
    };
  }, [requestClose, handleOpenApp, addNotification, applyRiceTheme]);


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
        return <MusicApp windowId={windowId} path={appState?.path} masterVolume={masterVolume / 100} masterMuted={isMuted} />;
      case "video":
        return <VideoApp windowId={windowId} path={appState?.path} masterVolume={masterVolume / 100} masterMuted={isMuted} />;
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

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">
        {/* Desktop Container Wrapper */}
        <div className="h-full min-h-[100dvh] w-full bg-background flex flex-col overflow-hidden relative select-none">
          {/* Aesthetic Floating Pill Top Menu Bar */}
          <TopMenuBar
            onOpenApp={handleOpenApp}
            activeWorkspace={activeWorkspace}
            onSelectWorkspace={(ws) => setActiveWorkspace(ws)}
            windows={windows}
            onToggleNotificationCenter={() => setIsNotificationCenterOpen((prev) => !prev)}
            isNotificationCenterOpen={isNotificationCenterOpen}
            unreadCount={notificationHistory.length}
            onLock={onLock}
            onShutdown={onShutdown}
          />
          {/* Desktop Wallpaper */}
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center transition-all duration-500 ease-out"
            style={{
              backgroundImage: `url('${wallpaper}')`,
            }}
          />

          {/* Desktop Aesthetic Time & Date Widget */}
          {showDesktopHud && <DesktopHud />}

          {/* Window Canvas (Semantic <main>) */}
          <main ref={canvasRef} role="main" aria-label="Desktop workspace" className="flex-1 min-h-0 relative overflow-hidden z-20 mb-20 mx-2 sm:mx-4 mt-2">
            {windows.map((win) => (
              <WindowFrame
                key={win.id}
                window={win}
                isVisible={(win.workspace ?? 1) === activeWorkspace && !win.isMinimized}
                onClose={() => requestClose(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onMaximize={() => maximizeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
                onMove={(pos) => moveWindow(win.id, pos)}
                onResize={(size) => resizeWindow(win.id, size)}
              >
                {renderAppContent(win.appId, win.id, win.appState)}
              </WindowFrame>
            ))}
          </main>

          {/* 3D Wallpaper Coverflow Carousel */}
          <WallpaperCarousel
            isOpen={isWallpaperCarouselOpen}
            onClose={() => setIsWallpaperCarouselOpen(false)}
            currentTheme={riceTheme}
            onSelectTheme={applyRiceTheme}
          />

          {/* OpenBSD Bottom Dock */}
          <Dock
            windows={windows}
            onFocusWindow={(id) => {
              const targetWin = windows.find((w) => w.id === id);
              if (targetWin && targetWin.workspace && targetWin.workspace !== activeWorkspace) {
                setActiveWorkspace(targetWin.workspace);
              }
              focusWindow(id);
            }}
            onMinimizeWindow={(id) => minimizeWindow(id)}
            onOpenApp={(appId) => handleOpenApp(appId)}
            dockMagnification={dockMagnification}
          />

          {/* Toast Notification Toasts */}
          <div role="status" aria-live="polite" className="fixed top-16 right-4 z-[65] flex max-w-[calc(100vw-2rem)] flex-col gap-1.5 pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="w-64 px-3.5 py-2.5 rounded-lg bg-card/90 backdrop-blur-2xl border border-border shadow-2xl text-xs font-sans text-foreground animate-in slide-in-from-top-2 fade-in-0"
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

          {/* Notification & Quick Settings Center Drawer */}
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
            theme={riceTheme}
            isDarkMode={isDarkMode}
          />
        </div>
      </ContextMenuTrigger>

      {/* Desktop Context Menu */}
      <ContextMenuContent className="w-64 bg-card/95 backdrop-blur-2xl border-border/80 font-sans text-xs rounded-lg p-1.5 shadow-2xl">
        <div className="px-2.5 py-1 text-[10px] text-primary font-bold tracking-wider uppercase">
          {riceTheme.name.toUpperCase()} DESKTOP
        </div>
        <ContextMenuSeparator className="bg-border/60 my-1" />
        <ContextMenuItem
          onClick={() => setIsWallpaperCarouselOpen(true)}
          className="gap-2.5 px-2.5 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-md font-medium"
        >
          <ImageIcon className="w-4 h-4 text-primary" />
          <span>Switch Wallpaper & Theme</span>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => setShowDesktopHud((v) => !v)}
          className="gap-2.5 px-2.5 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-md font-medium"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>{showDesktopHud ? "Hide Time Widget" : "Show Time Widget"}</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border/60 my-1" />
        {Object.values(APP_REGISTRY).map((app) => {
          const IconComp = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          return (
            <ContextMenuItem
              key={app.id}
              onClick={() => handleOpenApp(app.id)}
              className="gap-2.5 px-2.5 py-1.5 cursor-pointer focus:bg-primary/20 focus:text-primary rounded-md font-medium"
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

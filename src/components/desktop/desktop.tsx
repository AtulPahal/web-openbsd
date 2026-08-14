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
import { About } from "@/components/apps/about";
import { Firefox } from "@/components/apps/firefox";
import { MusicApp } from "@/components/apps/music";
import { VideoApp } from "@/components/apps/video";
import { Portfolio } from "@/components/apps/portfolio";
import { Resume } from "@/components/apps/resume";
import { SystemMonitor } from "@/components/apps/system-monitor";
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

interface Toast {
  id: string;
  message: string;
}

export function Desktop() {
  const {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager();

  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<DesktopNotification[]>([
    {
      id: "init-1",
      title: "System Active",
      message: `${SYSTEM_CONFIG.name} ${SYSTEM_CONFIG.osVersion} booted successfully.`,
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

    // Show temporary floating toast
    const toast: Toast = { id, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const handleOpenApp = (appId: AppId, appState?: AppState) => {
    openWindow(appId, appState, activeWorkspace);
    const app = APP_REGISTRY[appId];
    if (app) {
      addNotification(app.name, `Opened ${app.name}`, appId);
    }
  };

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

    window.addEventListener("close-window", handleClose as EventListener);
    window.addEventListener("open-app", handleOpen as EventListener);
    window.addEventListener("show-notification", handleNotify as EventListener);

    return () => {
      window.removeEventListener("close-window", handleClose as EventListener);
      window.removeEventListener("open-app", handleOpen as EventListener);
      window.removeEventListener("show-notification", handleNotify as EventListener);
    };
  }, [closeWindow, activeWorkspace]);

  // Filter windows by current workspace
  const visibleWindows = windows.filter(
    (w) => (w.workspace ?? 1) === activeWorkspace
  );

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
      case "about":
        return <About windowId={windowId} />;
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
        <div className="h-screen w-screen bg-background flex flex-col overflow-hidden relative select-none">
          {/* Top Menu Bar */}
          <TopMenuBar
            onOpenApp={handleOpenApp}
            activeWorkspace={activeWorkspace}
            onSelectWorkspace={(ws) => setActiveWorkspace(ws)}
            windows={windows}
            onToggleNotificationCenter={() => setIsNotificationCenterOpen((prev) => !prev)}
            unreadCount={notificationHistory.length}
          />

          {/* Desktop Wallpaper */}
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url('${SYSTEM_CONFIG.wallpaper}')`,
            }}
          />

          {/* Window Canvas */}
          <div className="flex-1 relative overflow-hidden pr-14">
            {visibleWindows.map((win) => (
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

          {/* GNOME-style left dock */}
          <Dock
            windows={windows}
            onFocusWindow={(id) => {
              const targetWin = windows.find((w) => w.id === id);
              if (targetWin && targetWin.workspace && targetWin.workspace !== activeWorkspace) {
                setActiveWorkspace(targetWin.workspace);
              }
              focusWindow(id);
            }}
            onOpenApp={(appId) => handleOpenApp(appId)}
          />

          {/* Toast Notification Toasts — Top Right corner */}
          <div className="fixed top-9 right-4 z-40 flex flex-col gap-1.5 pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="w-64 px-3 py-2 rounded-lg bg-card/90 backdrop-blur border border-border shadow-xl text-xs font-mono text-foreground animate-in slide-in-from-top-2 fade-in-0"
              >
                {toast.message}
              </div>
            ))}
          </div>

          {/* macOS-style Notification Center Drawer */}
          <NotificationCenter
            isOpen={isNotificationCenterOpen}
            onClose={() => setIsNotificationCenterOpen(false)}
            notifications={notificationHistory}
            onClearAll={() => setNotificationHistory([])}
            onRemoveNotification={(id) =>
              setNotificationHistory((prev) => prev.filter((n) => n.id !== id))
            }
          />
        </div>
      </ContextMenuTrigger>

      {/* Desktop Context Menu */}
      <ContextMenuContent className="w-52 bg-card border-border font-mono text-xs rounded-none p-1 shadow-2xl">
        <div className="px-2 py-1 text-[10px] text-amber-400 font-bold tracking-wider">
          {SYSTEM_CONFIG.name.toUpperCase()} DESKTOP
        </div>
        <ContextMenuSeparator className="bg-border/60" />
        {Object.values(APP_REGISTRY).map((app) => {
          const IconComp = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
          return (
            <ContextMenuItem
              key={app.id}
              onClick={() => handleOpenApp(app.id)}
              className="gap-2.5 px-2 py-1.5 cursor-pointer focus:bg-amber-500/20 focus:text-amber-300 rounded-none"
            >
              <IconComp className="w-4 h-4 text-amber-400" />
              <span>Open {app.name}</span>
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}

"use client";

import { useWindowManager } from "@/hooks/use-window-manager";
import { WindowFrame } from "@/components/window/window-frame";
import { Panel } from "@/components/desktop/panel";
import { Terminal } from "@/components/apps/terminal";
import { FileManager } from "@/components/apps/file-manager";
import { TextEditor } from "@/components/apps/text-editor";
import { SystemMonitor } from "@/components/apps/system-monitor";
import { About } from "@/components/apps/about";
import { Firefox } from "@/components/apps/firefox";
import type { AppId } from "@/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { APP_REGISTRY } from "@/lib/app-registry";
import { Terminal as TerminalIcon, Folder, FileText, Activity, Info, RefreshCw, Globe } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal: TerminalIcon,
  Folder,
  FileText,
  Activity,
  Info,
  Globe,
};

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

  const renderAppContent = (appId: AppId, windowId: string) => {
    switch (appId) {
      case "terminal":
        return <Terminal windowId={windowId} />;
      case "file-manager":
        return <FileManager windowId={windowId} />;
      case "text-editor":
        return <TextEditor windowId={windowId} />;
      case "system-monitor":
        return <SystemMonitor windowId={windowId} />;
      case "about":
        return <About windowId={windowId} />;
      case "firefox":
        return <Firefox windowId={windowId} />;
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
        <div className="h-screen w-screen bg-[#090d16] flex flex-col overflow-hidden relative select-none">
          {/* Desktop Wallpaper */}
          <div
            className="absolute inset-0 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url('/wallpaper.jpg')`,
            }}
          />

          {/* OpenBSD Logo Watermark */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-5">
            <div className="font-mono text-9xl font-extrabold text-amber-400 tracking-tighter">
              OpenBSD
            </div>
            <div className="font-mono text-xl text-amber-300 mt-2">
              7.6-web (amd64)
            </div>
          </div>

          {/* Window Canvas */}
          <div className="flex-1 relative overflow-hidden">
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
                {renderAppContent(win.appId, win.id)}
              </WindowFrame>
            ))}
          </div>

          {/* Bottom Taskbar / Panel */}
          <Panel
            windows={windows}
            onFocusWindow={focusWindow}
            onOpenApp={openWindow}
          />
        </div>
      </ContextMenuTrigger>

      {/* Desktop Context Menu */}
      <ContextMenuContent className="w-52 bg-[#181818] border-border font-mono text-xs rounded-none p-1 shadow-2xl">
        <div className="px-2 py-1 text-[10px] text-amber-400 font-bold tracking-wider">
          OPENBSD DESKTOP
        </div>
        <ContextMenuSeparator className="bg-border/60" />
        {Object.values(APP_REGISTRY).map((app) => {
          const IconComp = ICON_MAP[app.icon] ?? TerminalIcon;
          return (
            <ContextMenuItem
              key={app.id}
              onClick={() => openWindow(app.id)}
              className="gap-2.5 px-2 py-1.5 cursor-pointer focus:bg-amber-500/20 focus:text-amber-300 rounded-none"
            >
              <IconComp className="w-4 h-4 text-amber-400" />
              <span>Open {app.name}</span>
            </ContextMenuItem>
          );
        })}
        <ContextMenuSeparator className="bg-border/60" />
        <ContextMenuItem
          onClick={() => window.location.reload()}
          className="gap-2.5 px-2 py-1.5 cursor-pointer text-muted-foreground focus:bg-amber-500/20 focus:text-amber-300 rounded-none"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Session</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

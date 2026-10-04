"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppId } from "@/types";
import { APP_REGISTRY } from "@/lib/app-registry";
import { APP_ICON_MAP } from "@/lib/app-icons";
import { SYSTEM_CONFIG } from "@/lib/system-config";
import { Sparkles, Compass } from "lucide-react";

interface AppLauncherProps {
  onOpenApp: (appId: AppId) => void;
}

export function AppLauncher({ onOpenApp }: AppLauncherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="w-6 h-6 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 outline-none"
        title="OpenBSD App Launcher"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-60 bg-card/95 backdrop-blur-2xl border-border/80 text-foreground font-sans rounded-2xl p-1.5 shadow-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-primary font-bold px-2.5 py-1.5 flex items-center justify-between">
            <span>{SYSTEM_CONFIG.name.toUpperCase()} APPS</span>
            <span className="text-[10px] text-muted-foreground font-normal">v{SYSTEM_CONFIG.desktopVersion}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60 my-1" />
          <div className="space-y-0.5">
            {Object.values(APP_REGISTRY).map((app) => {
              const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
              return (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => onOpenApp(app.id)}
                  className="cursor-pointer gap-2.5 px-2.5 py-2 text-xs focus:bg-primary/15 focus:text-primary rounded-xl transition-colors font-medium"
                >
                  <IconComponent className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{app.name}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

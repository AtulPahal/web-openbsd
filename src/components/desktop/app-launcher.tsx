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
import { Shield } from "lucide-react";

interface AppLauncherProps {
  onOpenApp: (appId: AppId) => void;
}

export function AppLauncher({ onOpenApp }: AppLauncherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-5 px-2 gap-1.5 border border-primary/50 bg-primary/15 text-primary hover:bg-primary/30 font-mono font-bold text-[11px] shadow-none inline-flex items-center justify-center cursor-pointer transition-all duration-200 outline-none focus:ring-1 focus:ring-primary rounded-none">
        <Shield className="w-3.5 h-3.5 text-primary fill-primary/20" />
        <span>{SYSTEM_CONFIG.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 bg-card border-border text-foreground font-mono rounded-none p-1 shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-primary font-bold px-2 py-1.5 flex items-center justify-between">
            <span>APPLICATIONS</span>
            <span className="text-[10px] text-muted-foreground font-normal">v{SYSTEM_CONFIG.desktopVersion}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          {Object.values(APP_REGISTRY).map((app) => {
            const IconComponent = APP_ICON_MAP[app.icon] ?? APP_ICON_MAP.Terminal;
            return (
              <DropdownMenuItem
                key={app.id}
                onClick={() => onOpenApp(app.id)}
                className="cursor-pointer gap-2.5 px-2 py-1.5 text-xs focus:bg-primary/20 focus:text-primary rounded-none transition-colors"
              >
                <IconComponent className="w-4 h-4 text-primary" />
                <span className="font-medium">{app.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

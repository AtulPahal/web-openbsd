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
      <DropdownMenuTrigger className="h-8 px-2.5 gap-2 border border-amber-500/40 bg-amber-950/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 font-mono font-bold text-xs shadow-none inline-flex items-center justify-center cursor-pointer transition-colors outline-none focus:ring-1 focus:ring-amber-400">
        <Shield className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        <span>OpenBSD</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 bg-[#181818] border-border text-foreground font-mono rounded-none p-1 shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-amber-400 font-bold px-2 py-1.5 flex items-center justify-between">
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
                className="cursor-pointer gap-2.5 px-2 py-1.5 text-xs focus:bg-amber-500/20 focus:text-amber-300 rounded-none transition-colors"
              >
                <IconComponent className="w-4 h-4 text-amber-400" />
                <span className="font-medium">{app.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

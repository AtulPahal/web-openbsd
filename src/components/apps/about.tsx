"use client";

import { SYSTEM_CONFIG } from "@/lib/system-config";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";
import { Mail, Phone, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/lib/social-icons";

const PUFFY_ASCII = `
     _____
    /     \
   | () () |
    \  ^  /
     |||||
     |||||
`;

const ICON_MAP: Record<string, React.ElementType> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: Mail,
};

export function About({ windowId }: { windowId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center font-mono text-foreground" data-window-id={windowId}>
      {/* Puffy ASCII art */}
      <pre className="text-amber-400 text-sm leading-tight">{PUFFY_ASCII}</pre>

      {/* Name / Title */}
      <h1 className="text-xl font-bold tracking-wide text-foreground">
        {PORTFOLIO_DATA.name}
      </h1>
      <p className="text-sm text-amber-400/80">{PORTFOLIO_DATA.title}</p>

      {/* Contact info */}
      <div className="flex flex-col gap-1 text-xs text-foreground/80">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-3 w-3 text-amber-400" />
          <span>{SYSTEM_CONFIG.userLocation}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Mail className="h-3 w-3 text-amber-400" />
          <span>{SYSTEM_CONFIG.userEmail}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Phone className="h-3 w-3 text-amber-400" />
          <span>{SYSTEM_CONFIG.userPhone}</span>
        </div>
      </div>

      {/* Social links */}
      <div className="flex gap-3 pt-1">
        {PORTFOLIO_DATA.social.map((s) => {
          const Icon = ICON_MAP[s.icon] ?? Mail;
          return (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors"
              title={s.label}
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
      </div>

      {/* Version */}
      <p className="text-xs text-amber-400/60">
        Portfolio v{SYSTEM_CONFIG.desktopVersion}
      </p>

      {/* Copyright */}
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {PORTFOLIO_DATA.name}. All rights reserved.
      </p>

      {/* Built with */}
      <div className="mt-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>Built with</p>
        <p className="mt-1 text-foreground/70">Next.js 16 &middot; React 19 &middot; TypeScript</p>
        <p className="mt-0.5 text-foreground/70">Tailwind CSS v4 &middot; shadcn/ui &middot; Bun</p>
      </div>
    </div>
  );
}

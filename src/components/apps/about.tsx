"use client";

const PUFFY_ASCII = `
     _____
    /     \\
   | () () |
    \\  ^  /
     |||||
     |||||
`;

export function About({ windowId }: { windowId: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center font-mono text-foreground">
      {/* Puffy ASCII art */}
      <pre className="text-amber-400 text-sm leading-tight">{PUFFY_ASCII}</pre>

      {/* Title */}
      <h1 className="text-lg font-bold tracking-wide text-foreground">
        OpenBSD Web Desktop
      </h1>

      {/* Version */}
      <p className="text-sm text-amber-400/80">Version 7.6-web</p>

      {/* Copyright */}
      <p className="text-xs text-muted-foreground">
        Copyright (c) 1996-2024 The OpenBSD Project
      </p>

      {/* Description */}
      <div className="max-w-xs space-y-1 text-xs text-muted-foreground">
        <p>This is a web-based tribute to OpenBSD.</p>
        <p>Not affiliated with the OpenBSD project.</p>
      </div>

      {/* Link */}
      <a
        href="https://www.openbsd.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300"
      >
        openbsd.org
      </a>

      {/* Built with */}
      <div className="mt-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>Built with</p>
        <p className="mt-1 text-foreground/70">Next.js · React · Tailwind CSS</p>
      </div>
    </div>
  );
}

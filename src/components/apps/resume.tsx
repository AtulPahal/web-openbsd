"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, MapPin, Mail, Phone } from "lucide-react";
import { PORTFOLIO_DATA } from "@/lib/portfolio-data";
import type { Project, SkillCategory } from "@/lib/portfolio-data";

function ResumeText() {
  const { name, title, location, email, phone } = PORTFOLIO_DATA;

  return (
    <div className="flex h-full w-full flex-col bg-background font-mono text-xs p-4 sm:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-amber-400">{name}</h1>
        <p className="text-xs sm:text-sm text-foreground/70">{title}</p>
      </div>

      {/* Contact */}
      <div className="mb-5 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-foreground/90">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/90">
          <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/90">
          <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{phone}</span>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-5">
        <h2 className="text-xs font-bold tracking-wider text-amber-400 uppercase mb-2">
          Technical Skills
        </h2>
        {PORTFOLIO_DATA.skillCategories.map((cat: SkillCategory) => (
          <div key={cat.label} className="mb-1.5">
            <span className="text-foreground/70">{cat.label}:</span>{" "}
            <span className="text-foreground/90">{cat.items.join(", ")}</span>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-5">
        <h2 className="text-xs font-bold tracking-wider text-amber-400 uppercase mb-2">
          Projects
        </h2>
        {PORTFOLIO_DATA.projects.map((p: Project) => (
          <div key={p.id} className="mb-3">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-foreground">{p.title}</span>
              <span className="text-[10px] text-muted-foreground">[{p.date}]</span>
            </div>
            <p className="mt-0.5 text-foreground/80">{p.description}</p>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              Stack: {p.stack.join(", ")}
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-5">
        <h2 className="text-xs font-bold tracking-wider text-amber-400 uppercase mb-2">
          Education
        </h2>
        {PORTFOLIO_DATA.education.map((edu, i) => (
          <div key={i} className="mb-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-medium text-foreground">{edu.degree}</span>
              <span className="text-[10px] text-muted-foreground">{edu.period}</span>
            </div>
            <div className="text-foreground/70 text-[10px]">
              {edu.institution}, {edu.location}
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div>
        <h2 className="text-xs font-bold tracking-wider text-amber-400 uppercase mb-2">
          Certifications
        </h2>
        {PORTFOLIO_DATA.certifications.map((c, i) => (
          <div key={i} className="mb-1 text-[10px]">
            <span className="text-foreground/70">
              &mdash; {c.name} ({c.issuer})
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border text-[10px] text-muted-foreground">
        <p>Full interactive resume available via the PDF viewer.</p>
      </div>
    </div>
  );
}

export function Resume({ windowId }: { windowId: string }) {
  const [view, setView] = useState<"pdf" | "text">("pdf");
  const resumeUrl = "/resume.pdf";

  return (
    <div
      className="flex h-full w-full flex-col bg-background font-mono text-sm"
      data-window-id={windowId}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border bg-muted text-foreground overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 truncate">
          <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-medium truncate">resume.pdf</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            &mdash; {PORTFOLIO_DATA.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center gap-1 border border-border">
            <button
              type="button"
              onClick={() => setView("pdf")}
              className={`px-2 py-0.5 text-[10px] transition-colors cursor-pointer ${
                view === "pdf"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => setView("text")}
              className={`px-2 py-0.5 text-[10px] transition-colors cursor-pointer ${
                view === "text"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Text
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <a
              href={resumeUrl}
              download="atulpahal-resume.pdf"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] border border-border text-foreground/70 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
              title="Download resume (PDF)"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] border border-border text-foreground/70 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Pop-out</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === "pdf" ? (
          <iframe
            src={resumeUrl}
            title="Resume PDF"
            className="h-full w-full border-none"
          />
        ) : (
          <ResumeText />
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-muted/50 px-3 py-1 text-[10px] text-muted-foreground flex flex-wrap items-center gap-x-2">
        <span>{PORTFOLIO_DATA.title}</span>
        <span className="hidden sm:inline">|</span>
        <span className="truncate">{PORTFOLIO_DATA.email}</span>
      </div>
    </div>
  );
}

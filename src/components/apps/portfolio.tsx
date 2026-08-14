"use client";

import {
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Coffee,
  Award,
  GraduationCap,
  GitBranch,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PORTFOLIO_DATA, ALL_TECH_TAGS } from "@/lib/portfolio-data";
import type { Project, SkillCategory, Education, Certification } from "@/lib/portfolio-data";

function SocialLink({ label, href, icon }: { label: string; href: string; icon: string }) {
  const iconMap: Record<string, React.ElementType> = {
    mail: Mail,
    github: GitBranch,
    linkedin: GitBranch,
  };
  const Icon = iconMap[icon] ?? ExternalLink;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-foreground/80 hover:text-amber-400 hover:translate-x-0.5 transition-all"
    >
      <Icon className="h-3.5 w-3.5 text-amber-400" />
      <span>{label}</span>
    </a>
  );
}

function AboutTab() {
  return (
    <div className="p-6 space-y-5 text-xs">
      {/* Contact */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Contact Information
        </h3>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          <span>{PORTFOLIO_DATA.location}</span>
          <Mail className="h-3.5 w-3.5 text-amber-400" />
          <span>{PORTFOLIO_DATA.email}</span>
          <Phone className="h-3.5 w-3.5 text-amber-400" />
          <span>{PORTFOLIO_DATA.phone}</span>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Bio */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Bio
        </h3>
        <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
          {PORTFOLIO_DATA.bio}
        </p>
      </div>

      <Separator className="bg-border" />

      {/* Social */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Connect
        </h3>
        <div className="flex flex-col gap-1.5">
          {PORTFOLIO_DATA.social.map((s) => (
            <SocialLink key={s.label} label={s.label} href={s.href} icon={s.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsTab() {
  return (
    <div className="p-6 space-y-5 text-xs">
      {PORTFOLIO_DATA.skillCategories.map((cat: SkillCategory) => (
        <div key={cat.label} className="space-y-2">
          <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
            {cat.label}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 text-[10px] border border-border text-foreground/70 hover:border-amber-500/40 hover:text-amber-300 transition-all"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Tech Cloud */}
      <div className="space-y-2 pt-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          All Technologies
        </h3>
        <div className="flex flex-wrap gap-1">
          {ALL_TECH_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[9px] border border-amber-500/20 text-amber-400/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border border-border p-3 text-xs hover:border-amber-500/30 hover:bg-amber-500/5 transition-all">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-bold text-amber-400">{project.title}</h4>
        <span className="text-[10px] text-muted-foreground">[{project.date}]</span>
      </div>
      <p className="mt-1.5 text-foreground/80 whitespace-pre-line">
        {project.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="px-1.5 py-0.5 text-[10px] border border-border text-foreground/60"
          >
            {tech}
          </span>
        ))}
      </div>
      {project.links && project.links.length > 0 && (
        <div className="mt-2 flex gap-3">
          {project.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="p-6 space-y-4 text-xs">
      {PORTFOLIO_DATA.projects.map((p: Project) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function EducationTab() {
  return (
    <div className="p-6 space-y-5 text-xs">
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Education
        </h3>
        {PORTFOLIO_DATA.education.map((edu: Education, i: number) => (
          <div key={i} className="border-l border-border pl-3 space-y-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium text-foreground">{edu.degree}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {edu.period}
              </span>
            </div>
            <div className="text-foreground/80 pl-[22px]">{edu.institution}</div>
            <div className="text-[10px] text-muted-foreground pl-[22px]">
              {edu.location}
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-border" />

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Certifications
        </h3>
        {PORTFOLIO_DATA.certifications.map((c: Certification, i: number) => (
          <div key={i} className="border-l border-border pl-3">
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium text-foreground">{c.name}</span>
            </div>
            <div className="text-[10px] text-muted-foreground pl-[22px]">
              &mdash; {c.issuer}
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Interests
        </h3>
        {PORTFOLIO_DATA.interests.map((interest, i) => (
          <div
            key={i}
            className="flex items-start gap-1.5 text-xs text-foreground/80"
          >
            <Coffee className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="whitespace-pre-line">{interest}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Portfolio({ windowId }: { windowId: string }) {
  return (
    <div
      className="flex h-full w-full flex-col bg-background font-mono text-sm"
      data-window-id={windowId}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted text-foreground">
        <User className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-medium">
          {PORTFOLIO_DATA.name}
        </span>
        <span className="text-xs text-muted-foreground">
          &mdash; {PORTFOLIO_DATA.title}
        </span>
      </div>

      <Tabs defaultValue="about" className="flex flex-1 flex-col">
        <TabsList className="shrink-0 rounded-none border-b border-border bg-muted/50">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="flex-1 overflow-auto">
          <AboutTab />
        </TabsContent>
        <TabsContent value="skills" className="flex-1 overflow-auto">
          <SkillsTab />
        </TabsContent>
        <TabsContent value="projects" className="flex-1 overflow-auto">
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="education" className="flex-1 overflow-auto">
          <EducationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

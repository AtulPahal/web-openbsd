"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Coffee,
  Award,
  GraduationCap,
  Sparkles,
  Briefcase,
  Code,
  Download,
  CheckCircle2,
  Cpu,
  Layers,
  Star,
  GitFork,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PORTFOLIO_DATA, ALL_TECH_TAGS } from "@/lib/portfolio-data";
import type { Project, SkillCategory, Education, Certification } from "@/lib/portfolio-data";
import { GitHubIcon, LinkedInIcon, EmailIcon } from "@/lib/social-icons";
import { fetchGitHubUser, fetchGitHubRepos, type GitHubUser, type GitHubRepo } from "@/lib/github-api";

const ICON_MAP: Record<string, React.ElementType> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  mail: EmailIcon,
};

function HeroHeader() {
  return (
    <div className="p-3 sm:p-4 bg-gradient-to-r from-card via-card/80 to-card border-b border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        {/* Avatar Ring */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-foreground tracking-wide">
              {PORTFOLIO_DATA.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Available for AI/ML Roles
            </span>
          </div>
          <p className="text-xs text-amber-400/90 font-medium mt-0.5">
            {PORTFOLIO_DATA.title}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{PORTFOLIO_DATA.location}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded font-semibold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Resume (PDF)</span>
        </a>
        <a
          href={`mailto:${PORTFOLIO_DATA.email}`}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-card hover:bg-muted border border-border/80 text-foreground rounded transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Contact</span>
        </a>
      </div>
    </div>
  );
}

function AboutTab({ ghUser }: { ghUser: GitHubUser | null }) {
  return (
    <div className="p-4 space-y-4 text-xs font-mono">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-card/40 border border-border/60 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
            <span>PUBLIC REPOS</span>
            <GitHubIcon className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2">
            {ghUser ? `${ghUser.public_repos}+ Repos` : "12+ Repos"}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">Live GitHub Projects</div>
        </div>

        <div className="p-3 bg-card/40 border border-border/60 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
            <span>ACCURACY</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-2">94.7%</div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">Diagnostic KNN Model</div>
        </div>

        <div className="p-3 bg-card/40 border border-border/60 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
            <span>INFERENCE</span>
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-400 mt-2">100% Web</div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">ONNX Runtime Local</div>
        </div>

        <div className="p-3 bg-card/40 border border-border/60 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground text-[10px]">
            <span>CERTS</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-2">2 Specialized</div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">IIT Hyderabad & HARTRON</div>
        </div>
      </div>

      {/* Bio Card */}
      <div className="p-3.5 bg-card/30 border border-border/60 rounded-lg space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Professional Summary</span>
        </h3>
        <p className="text-foreground/90 whitespace-pre-line leading-relaxed text-xs">
          {PORTFOLIO_DATA.bio}
        </p>
      </div>

      {/* Interactive Contact & Social Cards Grid */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Connect & Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <a
            href={`mailto:${PORTFOLIO_DATA.email}`}
            className="p-3 bg-card/40 hover:bg-amber-500/10 border border-border/60 hover:border-amber-500/50 rounded-lg flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-muted-foreground">Email</div>
              <div className="text-xs font-semibold text-foreground truncate">{PORTFOLIO_DATA.email}</div>
            </div>
          </a>

          <a
            href={`tel:${PORTFOLIO_DATA.phone}`}
            className="p-3 bg-card/40 hover:bg-amber-500/10 border border-border/60 hover:border-amber-500/50 rounded-lg flex items-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-muted-foreground">Phone</div>
              <div className="text-xs font-semibold text-foreground truncate">{PORTFOLIO_DATA.phone}</div>
            </div>
          </a>

          <div className="p-3 bg-card/40 border border-border/60 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-muted-foreground">Location</div>
              <div className="text-xs font-semibold text-foreground truncate">{PORTFOLIO_DATA.location}</div>
            </div>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="flex items-center gap-2 pt-1">
          {PORTFOLIO_DATA.social.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? ExternalLink;
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 p-2.5 bg-card/40 hover:bg-amber-500/10 border border-border/60 hover:border-amber-500/50 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-foreground hover:text-amber-300 transition-all"
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{s.label}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SkillsTab() {
  const skillLevels: Record<string, number> = {
    "Python (Expert)": 95,
    JavaScript: 90,
    "HTML/CSS": 85,
    C: 75,
    Rust: 70,
    TensorFlow: 90,
    PyTorch: 88,
    "Scikit-learn": 92,
    ONNX: 85,
    Pandas: 90,
    NumPy: 90,
    FastAPI: 88,
    ReactJS: 92,
    NextJS: 90,
    Langchain: 85,
  };

  return (
    <div className="p-4 space-y-4 text-xs font-mono">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PORTFOLIO_DATA.skillCategories.map((cat: SkillCategory) => (
          <div key={cat.label} className="p-3 bg-card/40 border border-border/60 rounded-lg space-y-2.5">
            <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center justify-between">
              <span>{cat.label}</span>
              <Layers className="w-3.5 h-3.5 opacity-60" />
            </h3>
            <div className="space-y-2">
              {cat.items.map((skill) => {
                const level = skillLevels[skill] || 80;
                return (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-foreground/90">{skill}</span>
                      <span className="text-[10px] text-muted-foreground">{level}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* All Tech Tag Cloud */}
      <div className="p-3 bg-card/30 border border-border/60 rounded-lg space-y-2">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
          Technology & Tooling Cloud ({ALL_TECH_TAGS.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TECH_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded font-semibold hover:bg-amber-500/20 transition-colors cursor-default"
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
    <div className="p-3.5 bg-card/40 hover:bg-card/70 border border-border/60 hover:border-amber-500/50 rounded-lg space-y-2.5 transition-all shadow-sm group">
      <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2">
        <div>
          <h4 className="font-bold text-sm text-foreground group-hover:text-amber-400 transition-colors">
            {project.title}
          </h4>
          <span className="text-[10px] text-muted-foreground/80">Completed {project.date}</span>
        </div>
        {project.links && project.links.length > 0 && (
          <div className="flex gap-1.5 shrink-0">
            {project.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition-colors"
              >
                <GitHubIcon className="w-3 h-3" />
                <span>{l.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-foreground/85 whitespace-pre-line leading-relaxed">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[10px] bg-muted/60 border border-border/60 text-muted-foreground font-semibold rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="p-4 space-y-3 font-mono text-xs">
      {PORTFOLIO_DATA.projects.map((p: Project) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function EducationTab() {
  return (
    <div className="p-4 space-y-4 font-mono text-xs">
      {/* Education Timeline */}
      <div className="p-3.5 bg-card/40 border border-border/60 rounded-lg space-y-3">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Education History</span>
        </h3>
        <div className="space-y-3 border-l-2 border-amber-500/40 ml-2 pl-4">
          {PORTFOLIO_DATA.education.map((edu: Education, i: number) => (
            <div key={i} className="relative space-y-0.5">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-background" />
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-foreground text-xs">{edu.degree}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {edu.period}
                </span>
              </div>
              <div className="text-xs text-foreground/80 font-medium">{edu.institution}</div>
              <div className="text-[10px] text-muted-foreground">{edu.location}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications Card */}
      <div className="p-3.5 bg-card/40 border border-border/60 rounded-lg space-y-3">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Professional Certifications</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PORTFOLIO_DATA.certifications.map((c: Certification, i: number) => (
            <div key={i} className="p-2.5 bg-background/50 border border-border/50 rounded flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-foreground text-xs leading-snug">{c.name}</div>
                <div className="text-[10px] text-amber-400/80 font-semibold mt-0.5">{c.issuer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Interests */}
      <div className="p-3.5 bg-card/40 border border-border/60 rounded-lg space-y-2.5">
        <h3 className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
          <Coffee className="w-4 h-4 text-amber-400" />
          <span>Technical Interests & Passions</span>
        </h3>
        <div className="space-y-2">
          {PORTFOLIO_DATA.interests.map((interest, i) => (
            <div key={i} className="p-2 bg-background/40 border border-border/40 rounded flex items-start gap-2 text-xs text-foreground/90">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{interest}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Portfolio({ windowId }: { windowId: string }) {
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null);

  useEffect(() => {
    fetchGitHubUser("AtulPahal").then(setGhUser).catch(() => {});
  }, []);

  return (
    <div
      className="flex h-full w-full flex-col bg-background font-mono text-sm select-none"
      data-window-id={windowId}
    >
      {/* Profile Hero Header */}
      <HeroHeader />

      <Tabs defaultValue="about" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="flex w-full shrink-0 rounded-none border-b border-border/60 bg-muted/40 overflow-x-auto justify-start sm:justify-center scrollbar-none">
          <TabsTrigger value="about" className="gap-1.5 shrink-0 px-3.5 py-2 text-xs">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>About</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5 shrink-0 px-3.5 py-2 text-xs">
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5 shrink-0 px-3.5 py-2 text-xs">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-1.5 shrink-0 px-3.5 py-2 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Education</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="flex-1 overflow-auto">
          <AboutTab ghUser={ghUser} />
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

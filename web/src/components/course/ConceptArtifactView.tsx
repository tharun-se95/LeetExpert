"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, SidebarSimple, Sparkle } from "@phosphor-icons/react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { ArtifactFrame } from "@/components/course/ArtifactFrame";
import { useSidebarOptional } from "@/components/layout/SidebarContext";
import type { LessonArtifact } from "@/lib/course/lessonArtifacts";
import { cn } from "@/lib/utils";

interface NeighborLink {
  href: string;
  title: string;
  module?: string;
}

interface ConceptArtifactViewProps {
  artifact: LessonArtifact;
  title: string;
  eyebrow: string;
  breadcrumbs: Crumb[];
  prev: NeighborLink | null;
  next: NeighborLink | null;
  jsonLd?: ReactNode;
  notesView?: ReactNode;
}

export function ConceptArtifactView({
  artifact,
  title,
  eyebrow,
  breadcrumbs,
  prev,
  next,
  jsonLd,
  notesView,
}: ConceptArtifactViewProps) {
  const [mode, setMode] = useState<"interactive" | "notes">("interactive");
  const sidebar = useSidebarOptional();

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-background">
      {jsonLd}

      {/* Integrated Course Toolbar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/50 px-4 py-2 sm:px-6 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          {sidebar ? (
            <button
              type="button"
              onClick={sidebar.toggle}
              aria-expanded={sidebar.open}
              aria-label={sidebar.open ? "Close curriculum drawer" : "Open curriculum drawer"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-medium shadow-elevation transition-all duration-[var(--dur-fast)]",
                sidebar.open
                  ? "border-accent/40 bg-accent/10 text-accent font-bold"
                  : "border-border/80 bg-elevated text-muted hover:border-accent/30 hover:text-foreground",
              )}
            >
              <SidebarSimple weight={sidebar.open ? "fill" : "regular"} className="h-3.5 w-3.5 text-accent" />
              <span>Curriculum</span>
            </button>
          ) : null}

          <Breadcrumbs items={breadcrumbs} className="mb-0" />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex rounded-full border border-border/80 bg-elevated px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent shadow-elevation">
            {eyebrow}
          </span>

          {notesView ? (
            <div
              role="tablist"
              aria-label="Lesson presentation mode"
              className="inline-flex items-center rounded-full border border-border/80 bg-surface/80 p-0.5 shadow-elevation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "interactive"}
                onClick={() => setMode("interactive")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-all duration-[var(--dur-fast)]",
                  mode === "interactive"
                    ? "border border-accent/30 bg-elevated font-bold text-accent shadow-elevation"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Sparkle weight="bold" className="h-3 w-3 text-accent" />
                <span>Interactive</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "notes"}
                onClick={() => setMode("notes")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs transition-all duration-[var(--dur-fast)]",
                  mode === "notes"
                    ? "border border-border/80 bg-elevated font-bold text-foreground shadow-elevation"
                    : "text-muted hover:text-foreground",
                )}
              >
                <BookOpen className="h-3 w-3 text-muted" />
                <span>Notes</span>
              </button>
            </div>
          ) : (
            <span className="rounded-full border border-border/80 bg-elevated px-2.5 py-0.5 font-mono text-[11px] text-muted shadow-elevation">
              Interactive Concept
            </span>
          )}
        </div>
      </header>

      {/* Screen-reader accessible heading */}
      <h1 className="sr-only">{title}</h1>

      {/* Main Presentation Pane: Seamless edge-to-edge, NO container box */}
      {mode === "interactive" ? (
        <div className="min-h-0 flex-1 w-full bg-background overflow-hidden">
          <ArtifactFrame src={artifact.src} title={artifact.title} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 lg:px-8">
          {notesView}
        </div>
      )}

      {/* Integrated Course Navigation Footer */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border/70 bg-surface/50 px-4 py-2 sm:px-6 backdrop-blur-sm z-10">
        {prev ? (
          <Link
            href={prev.href}
            className="group inline-flex items-center gap-2 rounded-[length:var(--radius-md)] border border-border/80 bg-elevated px-3 py-1.5 text-xs font-medium text-muted shadow-elevation transition hover:border-accent/40 hover:text-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/80 bg-surface/60 group-hover:border-accent/50 group-hover:text-accent">
              <ArrowLeft weight="bold" className="h-3 w-3" />
            </span>
            <span className="truncate max-w-[160px] sm:max-w-[280px]">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group inline-flex items-center gap-2 rounded-[length:var(--radius-md)] border border-border/80 bg-elevated px-3 py-1.5 text-xs font-medium text-foreground shadow-elevation transition hover:border-accent/40"
          >
            <span className="truncate max-w-[160px] sm:max-w-[280px]">
              {next.title}
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/80 bg-accent text-on-pop group-hover:opacity-90">
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </Link>
        ) : (
          <div />
        )}
      </footer>
    </div>
  );
}

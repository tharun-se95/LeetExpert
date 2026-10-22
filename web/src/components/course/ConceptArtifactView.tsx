"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Sparkle } from "@phosphor-icons/react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { ArtifactFrame } from "@/components/course/ArtifactFrame";
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

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-4 pt-3 pb-3 lg:px-8">
      {jsonLd}

      {/* Cockpit Toolbar: Breadcrumbs, Eyebrow, and Mode Switcher */}
      <header className="mb-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-2.5">
        <Breadcrumbs items={breadcrumbs} className="mb-0" />

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

      {/* Main Presentation Pane */}
      {mode === "interactive" ? (
        <div className="min-h-0 flex-1 overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation">
          <ArtifactFrame src={artifact.src} title={artifact.title} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {notesView}
        </div>
      )}

      {/* Bottom Navigation Row */}
      <footer className="mt-2.5 flex items-center justify-between border-t border-border/80 pt-2.5">
        {prev ? (
          <Link
            href={prev.href}
            className="group inline-flex items-center gap-2 rounded-[length:var(--radius-md)] border border-border/80 bg-elevated px-3 py-1.5 text-xs font-medium text-muted shadow-elevation transition hover:border-accent/40 hover:text-foreground"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/80 bg-surface/60 group-hover:border-accent/50 group-hover:text-accent">
              <ArrowLeft weight="bold" className="h-3 w-3" />
            </span>
            <span className="truncate max-w-[160px] sm:max-w-[260px]">
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
            <span className="truncate max-w-[160px] sm:max-w-[260px]">
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

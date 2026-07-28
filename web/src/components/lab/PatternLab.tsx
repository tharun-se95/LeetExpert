"use client";

import type { CSSProperties, ReactNode } from "react";
import { AnalogyCard } from "@/components/illustrations/AnalogyCard";
import { DemoPlayer } from "@/components/lab/primitives/DemoPlayer";
import { cn } from "@/lib/utils";
import { getAnalogy } from "@/lib/visual/analogies";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import type { PatternDemoModule } from "@/lib/visual/types";

export interface PatternLabProps {
  familyId: string;
  patternTitle: string;
  demo: PatternDemoModule;
  /** Optional pattern slug to look up museum analogy art */
  patternSlug?: string;
  /** Override left-rail content (defaults to AnalogyCard or 140×140 placeholder) */
  analogy?: ReactNode;
  className?: string;
}

export function PatternLab({
  familyId,
  patternTitle,
  demo,
  patternSlug,
  analogy,
  className,
}: PatternLabProps) {
  const theme = getFamilyTheme(familyId);
  const accent = theme.accent;
  const analogyDef =
    patternSlug != null ? getAnalogy(familyId, patternSlug) : undefined;

  const leftRail =
    analogy ??
    (analogyDef ? (
      <AnalogyCard
        motif={theme.motif}
        accent={accent}
        title={analogyDef.title}
        caption={analogyDef.caption}
      />
    ) : (
      <div
        className="flex h-[140px] w-[140px] items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 text-center text-xs text-muted"
        aria-hidden
      >
        Analogy
        <br />
        coming soon
      </div>
    ));

  return (
    <section
      data-family={familyId}
      style={
        {
          ...familyCssVars(familyId),
        } as CSSProperties
      }
      className={cn("lab-stage lab-mesh relative", className)}
      aria-label={`${patternTitle} pattern laboratory`}
    >
      <header className="relative z-[1] mb-4 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
          style={{ borderColor: accent, color: accent }}
        >
          {theme.label}
        </span>
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          {patternTitle}
        </h2>
        <span className="text-sm text-muted">·</span>
        <span className="text-sm font-medium" style={{ color: accent }}>
          Watch the idea
        </span>
      </header>

      <div className="relative z-[1] grid gap-5 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
        <aside className="flex justify-center md:justify-start">
          {leftRail}
        </aside>
        <div className="min-w-0">
          <DemoPlayer demo={demo} accent={accent} />
        </div>
      </div>
    </section>
  );
}

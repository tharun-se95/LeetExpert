"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MotifMark } from "@/components/illustrations/MotifMark";
import { FAMILIES, type FamilyId, type PatternMeta } from "@/lib/content/manifest";
import { getDemo } from "@/lib/visual/demoRegistry";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

function parseHeadings(markdown?: string): string[] {
  if (!markdown) return [];
  const out: string[] = [];
  for (const line of markdown.split("\n")) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (m) {
      const title = m[2].replace(/[#*`]/g, "").trim();
      if (title && !/^table of contents/i.test(title)) out.push(title);
    }
  }
  return out;
}

export function PosterGrid({
  familyId,
  markdown,
}: {
  familyId: FamilyId | string;
  markdown?: string;
}) {
  const family = FAMILIES.find((f) => f.id === familyId);
  const theme = getFamilyTheme(familyId);
  const reduceMotion = useReducedMotion();
  const [focus, setFocus] = useState<PatternMeta | null>(null);

  const posters = useMemo(() => {
    const patterns = family?.patterns ?? [];
    const headings = parseHeadings(markdown);
    return patterns.map((p, i) => {
      const headingMatch = headings.find(
        (h) =>
          h.toLowerCase() === p.title.toLowerCase() ||
          h.toLowerCase() === p.heading.toLowerCase() ||
          h.toLowerCase().includes(p.title.toLowerCase()),
      );
      return {
        pattern: p,
        title: headingMatch ?? p.title,
        demo: getDemo(familyId, p.slug),
        index: i,
      };
    });
  }, [family, familyId, markdown]);

  if (!family) return null;

  return (
    <div
      data-family={familyId}
      style={familyCssVars(familyId)}
      className="print:hidden"
    >
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Wall of posters
        </p>
        <p className="mt-1 text-sm text-muted">
          Each card is a one-glance cheat — open the lab for the full walkthrough.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {posters.map(({ pattern, title, demo, index }) => {
          const StaticFrame = demo?.StaticFrame;
          return (
            <motion.div
              key={pattern.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background text-left transition",
                "hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_12px_36px_rgb(0,0,0,0.06)]",
              )}
            >
              <div className="poster-roof" />
              <button
                type="button"
                onClick={() => setFocus(pattern)}
                className="relative w-full p-4 text-left"
              >
                <MotifMark
                  motif={theme.motif}
                  accent={theme.accent}
                  className="pointer-events-none absolute -right-2 top-2 h-24 w-24 opacity-[0.07]"
                />
                <div className="relative z-[1] flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: theme.accent }}
                    >
                      {theme.label}
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight">
                      {title}
                    </h3>
                  </div>
                  <span className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] tabular-nums text-muted">
                    #{index + 1}
                  </span>
                </div>

                <div className="relative z-[1] mt-4 flex min-h-[120px] items-center justify-center rounded-xl border border-border/70 bg-surface/80 p-3">
                  {StaticFrame ? (
                    <StaticFrame accent={theme.accent} />
                  ) : (
                    <MotifMark
                      motif={theme.motif}
                      accent={theme.accent}
                      className="h-20 w-20 opacity-40"
                    />
                  )}
                </div>
                <p className="relative z-[1] mt-3 text-xs text-muted">
                  Click card to focus
                </p>
              </button>
              <div className="relative z-[1] flex items-center justify-end border-t border-border/70 px-4 py-2.5">
                <Link
                  href={`/patterns/${familyId}/${pattern.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: theme.accent }}
                >
                  Open lab
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {focus ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFocus(null)}
          >
            <motion.div
              role="dialog"
              aria-modal
              aria-label={focus.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-border bg-background shadow-2xl"
              style={familyCssVars(familyId)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="poster-roof" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: theme.accent }}
                    >
                      {theme.label} · poster
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">
                      {focus.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocus(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative mt-5 flex min-h-[160px] items-center justify-center rounded-xl border border-border bg-surface p-4">
                  <MotifMark
                    motif={theme.motif}
                    accent={theme.accent}
                    className="pointer-events-none absolute right-2 top-2 h-20 w-20 opacity-[0.08]"
                  />
                  {(() => {
                    const demo = getDemo(familyId, focus.slug);
                    const Frame = demo?.StaticFrame;
                    return Frame ? (
                      <Frame accent={theme.accent} />
                    ) : (
                      <p className="text-sm text-muted">Static frame unavailable</p>
                    );
                  })()}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/patterns/${familyId}/${focus.slug}`}
                    className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white"
                    style={{ background: theme.accent }}
                  >
                    Open pattern lab
                  </Link>
                  <button
                    type="button"
                    onClick={() => setFocus(null)}
                    className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm text-muted"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

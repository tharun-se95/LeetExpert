"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { MotifMark } from "@/components/illustrations/MotifMark";
import { useProgress } from "@/components/providers/ProgressProvider";
import { FAMILIES } from "@/lib/content/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

function patternVisitId(familyId: string, slug: string) {
  return `pattern-${familyId}-${slug}`;
}

export function FamilyCards() {
  const { visited } = useProgress();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FAMILIES.map((family, i) => {
        const theme = getFamilyTheme(family.id);
        const done = family.patterns.filter((p) =>
          visited.has(patternVisitId(family.id, p.slug)),
        ).length;
        const pct =
          family.patterns.length === 0
            ? 0
            : Math.round((done / family.patterns.length) * 100);

        return (
          <motion.div
            key={family.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
          >
            <Link
              href={`/patterns/${family.id}`}
              data-family={family.id}
              style={familyCssVars(family.id)}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background p-5 transition duration-200",
                "hover:-translate-y-0.5 hover:border-foreground/20",
                "hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)]",
              )}
            >
              {/* Accent wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 90% 70% at 100% 0%, color-mix(in oklab, ${theme.accent} 16%, transparent), transparent 60%)`,
                }}
              />

              {/* Motif watermark */}
              <MotifMark
                motif={theme.motif}
                accent={theme.accent}
                className="pointer-events-none absolute -right-4 -top-2 h-36 w-36 opacity-[0.06]"
              />

              <div className="relative z-[1] mb-3 flex items-center justify-between">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold tabular-nums text-white"
                  style={{ background: theme.accent }}
                >
                  {family.number}
                </span>
                <span className="text-[11px] tabular-nums text-muted">
                  {done}/{family.patterns.length} visited
                </span>
              </div>

              <h3 className="relative z-[1] text-base font-semibold tracking-tight">
                {family.title}
              </h3>
              <p className="relative z-[1] mt-2 flex-1 text-sm leading-relaxed text-muted">
                {family.description}
              </p>

              {/* Progress bar */}
              <div className="relative z-[1] mt-4">
                <div className="mb-1.5 flex justify-between text-[10px] text-muted">
                  <span>Pattern progress</span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border/80">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: theme.accent,
                    }}
                  />
                </div>
              </div>

              <ul className="relative z-[1] mt-4 flex flex-wrap gap-1.5">
                {family.patterns.slice(0, 4).map((p) => (
                  <li
                    key={p.slug}
                    className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] text-muted"
                  >
                    {p.title}
                  </li>
                ))}
                {family.patterns.length > 4 ? (
                  <li className="rounded-md px-1.5 py-0.5 text-[11px] text-muted">
                    +{family.patterns.length - 4}
                  </li>
                ) : null}
              </ul>

              <span
                className="relative z-[1] mt-5 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-1.5"
                style={{ color: theme.accent }}
              >
                Enter lab
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

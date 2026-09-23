import {
  MagnifyingGlass,
  SquaresFour,
  Target,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { SpaceCell, TimeCell } from "@/components/cheatsheet/ComplexityStrip";
import { PatternCard } from "@/components/cheatsheet/PatternCard";
import { SmellCues } from "@/components/cheatsheet/SmellCues";
import { TrapList } from "@/components/cheatsheet/TrapList";
import type { ModuleCheatsheet } from "@/lib/course/cheatsheets/types";

/** How much of each section the excerpt shows; the rest is counted in its footer. */
export const PREVIEW = { smells: 4, complexity: 3, patterns: 2, traps: 1 } as const;

function Head({ icon: Glyph, children }: { icon: Icon; children: string }) {
  return (
    <h4 className="mb-2 flex items-center gap-1.5 font-display text-xs font-bold tracking-wide text-muted uppercase">
      <Glyph className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </h4>
  );
}

/**
 * Recall's window on the landing (owner, 2026-09-24: "fix the double scroll
 * and design a well structured cheatsheet as an example. remove scroll"). The
 * full module sheet ran long enough to need its own scroller inside a page
 * that already scrolls. This is an excerpt laid out to be read whole: the
 * first cues beside the complexity targets, two pattern cards, one trap, and
 * a footer naming what the full sheet adds. Every entry is the real sheet's,
 * through the lesson page's own parts, so the two never drift; nothing is
 * typed in here. Two columns only when its own box is wide enough
 * (container query), since the landing column's width, not the viewport's,
 * decides whether they fit.
 */
export function CheatsheetPreview({ sheet, moduleTitle }: { sheet: ModuleCheatsheet; moduleTitle: string }) {
  const smells = sheet.smells.slice(0, PREVIEW.smells);
  const complexity = sheet.complexity.slice(0, PREVIEW.complexity);
  const patterns = sheet.patterns.slice(0, PREVIEW.patterns);
  const traps = sheet.traps.slice(0, PREVIEW.traps);
  const more = [
    [sheet.patterns.length, "patterns"],
    [sheet.smells.length, "cues"],
    [sheet.complexity.length, "targets"],
    [sheet.traps.length, "traps"],
  ] as const;

  return (
    <section aria-label={`${moduleTitle} cheatsheet, excerpt`} className="@container">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
        {/* Not a heading: the feature row's own h3 ("Recall") names this window. */}
        <p className="font-display text-lg font-bold text-foreground">
          {moduleTitle} <span className="text-muted">cheatsheet</span>
        </p>
        <p className="text-sm text-muted">{sheet.tagline}</p>
      </header>

      <div className="mt-4 grid gap-5 @xl:grid-cols-[1.35fr_1fr]">
        <div className="[&_li]:py-1.5">
          <Head icon={MagnifyingGlass}>Smell → pattern</Head>
          <SmellCues smells={smells} />
        </div>
        <div>
          <Head icon={Target}>Complexity targets</Head>
          <dl className="divide-y divide-border rounded-[length:var(--radius-md)] border border-border">
            {complexity.map((row) => (
              <div key={row.label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
                <dt className="text-sm text-foreground">{row.label}</dt>
                <dd className="flex gap-3">
                  <span className="sr-only">time</span>
                  <TimeCell value={row.time} />
                  <span className="sr-only">space</span>
                  <SpaceCell value={row.space} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-5">
        <Head icon={SquaresFour}>Patterns</Head>
        <div className="grid gap-3 @lg:grid-cols-2">
          {patterns.map((card) => (
            <PatternCard key={card.title} card={card} />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <Head icon={WarningCircle}>Trap</Head>
        <TrapList traps={traps} />
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted tabular-nums">
        The full sheet: {more.map(([n, what]) => `${n} ${what}`).join(" · ")}
      </p>
    </section>
  );
}

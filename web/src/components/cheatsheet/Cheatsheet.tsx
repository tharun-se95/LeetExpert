import {
  MagnifyingGlass,
  SquaresFour,
  Target,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
// Type-only, so it is erased at build and never pulls the client entry into
// this server component — the ssr subpath does not re-export the type.
import type { Icon } from "@phosphor-icons/react";
import { ComplexityStrip } from "@/components/cheatsheet/ComplexityStrip";
import { PatternCard } from "@/components/cheatsheet/PatternCard";
import { SmellCues } from "@/components/cheatsheet/SmellCues";
import { TrapList } from "@/components/cheatsheet/TrapList";
import type { ModuleCheatsheet } from "@/lib/course/cheatsheets/types";

/**
 * The four sections are otherwise identical uppercase muted heads, and the
 * sheet is a scanning surface — you come back to it mid-problem looking for
 * one of them, not to read it top to bottom. A leading mark gives each
 * section a shape to find. Decorative only: the words still carry the
 * meaning, so the icons stay aria-hidden.
 */
function SectionHead({ icon: Glyph, children }: { icon: Icon; children: string }) {
  return (
    <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold tracking-wide text-muted uppercase">
      <Glyph className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </h3>
  );
}

export function Cheatsheet({
  sheet,
  moduleTitle,
}: {
  sheet: ModuleCheatsheet;
  moduleTitle: string;
}) {
  return (
    <section
      className="my-10"
      aria-labelledby="cheatsheet"
      data-cheatsheet-tier={sheet.tier}
    >
      {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
      <span
        aria-hidden
        className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
      />
      <h2
        id="cheatsheet"
        className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground"
      >
        Cheatsheet
      </h2>
      <p className="mt-1 text-sm text-muted">
        <span className="font-medium text-foreground">{moduleTitle}</span>
        {" — "}
        {sheet.tagline}
      </p>

      <div className="mt-6 space-y-6 sm:space-y-8">
        <div>
          <SectionHead icon={MagnifyingGlass}>Smell → pattern</SectionHead>
          <SmellCues smells={sheet.smells} />
        </div>

        <div>
          <SectionHead icon={SquaresFour}>Patterns</SectionHead>
          {/*
            auto-fit + minmax, not a fixed column count: a fixed 3-col grid
            leaves a lone trailing card stranded in an otherwise-empty row
            whenever the pattern count isn't a multiple of the column count
            (5 patterns -> 3 + 2, gap where the 6th slot would be). auto-fit
            instead reflows to fill each row, so a trailing lone card
            stretches to the full row width.
          */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-3">
            {sheet.patterns.map((card) => (
              <PatternCard key={card.title} card={card} />
            ))}
          </div>
        </div>

        <div>
          <SectionHead icon={Target}>Complexity targets</SectionHead>
          <ComplexityStrip rows={sheet.complexity} />
        </div>

        <div>
          <SectionHead icon={WarningCircle}>Traps</SectionHead>
          <TrapList traps={sheet.traps} />
        </div>
      </div>
    </section>
  );
}

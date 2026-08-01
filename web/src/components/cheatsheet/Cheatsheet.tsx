import { ModuleGlyph } from "@/components/course/ModuleGlyph";
import { ComplexityStrip } from "@/components/cheatsheet/ComplexityStrip";
import { PatternCard } from "@/components/cheatsheet/PatternCard";
import { SmellCues } from "@/components/cheatsheet/SmellCues";
import { TrapList } from "@/components/cheatsheet/TrapList";
import type { ModuleCheatsheet } from "@/lib/course/cheatsheets/types";
import { cn } from "@/lib/utils";

export function Cheatsheet({
  sheet,
  moduleTitle,
}: {
  sheet: ModuleCheatsheet;
  moduleTitle: string;
}) {
  const diagramCount = sheet.patterns.filter((p) => p.diagram).length;

  return (
    <section
      className="my-10"
      aria-labelledby="cheatsheet"
      data-cheatsheet-tier={sheet.tier}
    >
      <div className="overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated">
        <header className="relative flex flex-col gap-4 border-b border-border bg-accent/[0.06] px-4 py-5 sm:flex-row sm:items-center sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(var(--halftone)_1px,transparent_1.2px)] [background-size:12px_12px]"
          />
          <div className="relative flex h-14 w-24 shrink-0 items-center justify-center sm:h-[4.5rem] sm:w-36">
            <ModuleGlyph slug={sheet.moduleSlug} />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                Pattern memory
              </p>
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                  sheet.tier === "gold"
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-surface text-muted",
                )}
              >
                {sheet.tier === "gold" ? "Gold" : "Core"}
              </span>
            </div>
            <h2
              id="cheatsheet"
              className="mt-1 font-display text-xl font-bold tracking-tight text-balance uppercase sm:text-2xl"
            >
              Cheatsheet
            </h2>
            <p className="mt-1 text-sm text-muted">
              <span className="font-medium text-foreground">{moduleTitle}</span>
              {" — "}
              {sheet.tagline}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-wide text-muted uppercase">
              {sheet.patterns.length} patterns · {diagramCount} diagrams ·{" "}
              {sheet.traps.length} traps
            </p>
          </div>
        </header>

        <div className="space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-6">
          <div>
            <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-muted uppercase">
              Smell → pattern
            </h3>
            <SmellCues smells={sheet.smells} />
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-muted uppercase">
              Patterns
            </h3>
            <div
              className={cn(
                "grid gap-3",
                sheet.patterns.length > 3
                  ? "sm:grid-cols-2 xl:grid-cols-3"
                  : "sm:grid-cols-2",
              )}
            >
              {sheet.patterns.map((card) => (
                <PatternCard key={card.title} card={card} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-muted uppercase">
              Complexity targets
            </h3>
            <ComplexityStrip rows={sheet.complexity} />
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold tracking-wide text-muted uppercase">
              Traps
            </h3>
            <TrapList traps={sheet.traps} />
          </div>
        </div>
      </div>
    </section>
  );
}

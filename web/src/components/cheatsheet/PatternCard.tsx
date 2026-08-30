import type {
  CueTone,
  PatternCard as PatternCardData,
} from "@/lib/course/cheatsheets/types";
import { CheatsheetDiagram } from "@/components/cheatsheet/diagrams";
import { TONE_CHIP, TONE_HOVER_BG, TONE_TEXT } from "@/components/cheatsheet/tone";
import { cn } from "@/lib/utils";

const TONE_LABEL: Record<CueTone, string> = {
  accent: "Core",
  good: "Safe",
  warn: "Careful",
  bad: "Avoid",
  muted: "Extra",
  mark: "Reach",
  insight: "Insight",
};

export function PatternCard({ card }: { card: PatternCardData }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated shadow-elevation p-3.5 transition-[transform,border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] hover:-translate-y-0.5 hover:border-accent/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4",
        TONE_HOVER_BG[card.tone],
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          {card.title}
        </h3>
        <span
          className={cn(
            "rounded-[length:var(--radius-xs)] border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
            TONE_CHIP[card.tone],
          )}
        >
          {TONE_LABEL[card.tone]}
        </span>
      </div>
      {card.smell ? (
        <p className={cn("text-xs font-medium", TONE_TEXT[card.tone])}>
          Smell: <span className="font-normal text-foreground/90">{card.smell}</span>
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-foreground/90">{card.summary}</p>
      {card.diagram ? (
        <CheatsheetDiagram id={card.diagram} className="mt-auto" />
      ) : null}
    </article>
  );
}

import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { SmellCue } from "@/lib/course/cheatsheets/types";

export function SmellCues({ smells }: { smells: SmellCue[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {smells.map((cue) => (
        <li
          key={`${cue.smell}-${cue.pattern}`}
          className="flex items-start gap-2 rounded-[length:var(--radius-sm)] border border-border bg-surface/80 px-3 py-2.5 text-sm transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent/35 hover:bg-accent/[0.04] motion-reduce:transition-none"
        >
          <span className="min-w-0 flex-1">
            <span className="mb-0.5 block font-mono text-[10px] tracking-wide text-muted uppercase">
              Smell
            </span>
            <span className="text-foreground/90">{cue.smell}</span>
          </span>
          <ArrowRight
            weight="bold"
            className="mt-4 h-4 w-4 shrink-0 text-accent"
            aria-hidden
          />
          <span className="min-w-0 flex-1 text-right sm:text-left">
            <span className="mb-0.5 block font-mono text-[10px] tracking-wide text-muted uppercase">
              Pattern
            </span>
            <span className="font-medium text-accent">{cue.pattern}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

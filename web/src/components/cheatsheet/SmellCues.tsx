import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { SmellCue } from "@/lib/course/cheatsheets/types";

export function SmellCues({ smells }: { smells: SmellCue[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {smells.map((cue) => (
        <li
          key={`${cue.smell}-${cue.pattern}`}
          className="flex flex-col gap-2 rounded-[length:var(--radius-sm)] border border-border bg-surface/80 px-3 py-3 text-sm transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent/35 hover:bg-accent/[0.04] motion-reduce:transition-none sm:flex-row sm:items-start sm:gap-2 sm:py-2.5"
        >
          <span className="min-w-0 flex-1">
            <span className="mb-0.5 block font-mono text-[10px] tracking-wide text-muted uppercase">
              Smell
            </span>
            <span className="text-foreground/90">{cue.smell}</span>
          </span>
          <ArrowDown
            weight="bold"
            className="mx-auto h-4 w-4 shrink-0 text-accent sm:hidden"
            aria-hidden
          />
          <ArrowRight
            weight="bold"
            className="mt-4 hidden h-4 w-4 shrink-0 text-accent sm:block"
            aria-hidden
          />
          <span className="min-w-0 flex-1 sm:text-left">
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

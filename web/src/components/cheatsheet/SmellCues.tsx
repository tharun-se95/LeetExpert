import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { SmellCue } from "@/lib/course/cheatsheets/types";
import { cn } from "@/lib/utils";

/**
 * A flowing "if you notice X, reach for Y" list. The section heading already
 * says "Smell → pattern", so each row doesn't repeat SMELL/PATTERN captions —
 * it just reads left to right, smell in body ink, pattern in accent ink.
 */
export function SmellCues({ smells }: { smells: SmellCue[] }) {
  return (
    <ul>
      {smells.map((cue, i) => (
        <li
          key={`${cue.smell}-${cue.pattern}`}
          className={cn(
            "flex flex-wrap items-baseline gap-x-2.5 gap-y-1 py-2.5 text-sm",
            i < smells.length - 1 && "border-b border-border",
          )}
        >
          <span className="text-foreground/90">{cue.smell}</span>
          <ArrowRight
            weight="bold"
            className="h-3.5 w-3.5 shrink-0 self-center text-accent"
            aria-hidden
          />
          <span className="font-medium text-mark">{cue.pattern}</span>
        </li>
      ))}
    </ul>
  );
}

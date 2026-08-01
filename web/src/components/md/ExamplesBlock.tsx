import type { ExampleRow } from "@/lib/content/parseExamples";
import { cn } from "@/lib/utils";

/**
 * Compact example rows — one quiet list, not a stack of tall cards.
 */
export function ExamplesBlock({
  rows,
  className,
}: {
  rows: ExampleRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-4 overflow-hidden rounded-md border border-border bg-elevated",
        className,
      )}
      role="list"
      aria-label="Examples"
    >
      {rows.map((row, i) => (
        <div
          key={`${row.input}-${i}`}
          role="listitem"
          className={cn(
            "grid grid-cols-[1.25rem_minmax(0,1fr)_auto_minmax(0,0.7fr)] items-baseline gap-x-2 px-2.5 py-1.5 font-mono text-[0.78rem] leading-snug",
            i > 0 && "border-t border-border",
          )}
        >
          <span className="tabular-nums text-[0.65rem] text-muted" aria-hidden>
            {i + 1}
          </span>
          <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap text-foreground">
            <span className="sr-only">Input: </span>
            {row.input}
          </pre>
          <span className="text-accent" aria-hidden>
            →
          </span>
          <div className="min-w-0 text-good">
            <pre className="overflow-x-auto whitespace-pre-wrap">
              <span className="sr-only">Expected: </span>
              {row.output}
            </pre>
            {row.note ? (
              <p className="mt-0.5 truncate text-[0.65rem] text-muted">
                {row.note}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

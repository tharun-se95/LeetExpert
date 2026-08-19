import type { ExampleRow } from "@/lib/content/parseExamples";
import { cn } from "@/lib/utils";

function isBooleanOutput(output: string): "true" | "false" | null {
  const v = output.trim().toLowerCase();
  if (v === "true") return "true";
  if (v === "false") return "false";
  return null;
}

function OutputValue({ output }: { output: string }) {
  const bool = isBooleanOutput(output);
  if (bool === "true") {
    return (
      <span className="inline-flex rounded-md border border-good/40 bg-good/10 px-2 py-0.5 font-mono text-[0.8rem] font-semibold text-good">
        {output.trim()}
      </span>
    );
  }
  if (bool === "false") {
    return (
      <span className="inline-flex rounded-md border border-bad/40 bg-bad/10 px-2 py-0.5 font-mono text-[0.8rem] font-semibold text-bad">
        {output.trim()}
      </span>
    );
  }
  return (
    <span className="whitespace-pre-wrap font-mono text-[0.8rem] font-semibold text-foreground">
      {output}
    </span>
  );
}

/**
 * Input / Output on one row (reference-matched), an explanation line below
 * when present. Output is only pilled green/coral for a literal true/false;
 * most course examples return arrays or numbers and stay plain text.
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
        "my-5 overflow-hidden rounded-xl border border-border bg-surface/50",
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
            "px-3.5 py-3 sm:px-4",
            i > 0 && "border-t border-border/80",
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
              Example {i + 1}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
            <div className="min-w-0">
              <p className="mb-0.5 text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
                Input
              </p>
              <p className="font-mono text-[0.8rem] leading-snug break-words text-foreground">
                {row.input}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="mb-0.5 text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
                Output
              </p>
              <OutputValue output={row.output} />
            </div>
          </div>
          {row.note ? (
            <p className="mt-2 border-t border-border/60 pt-2 text-[0.75rem] leading-snug text-muted">
              <span className="font-medium text-foreground/80">Explanation. </span>
              {row.note}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

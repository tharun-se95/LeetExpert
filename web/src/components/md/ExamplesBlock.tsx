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
      <span className="inline-flex rounded-full border border-good/40 bg-good/10 px-1.5 py-px font-mono text-[0.75rem] text-good">
        {output.trim()}
      </span>
    );
  }
  if (bool === "false") {
    return (
      <span className="inline-flex rounded-full border border-bad/40 bg-bad/10 px-1.5 py-px font-mono text-[0.75rem] text-bad">
        {output.trim()}
      </span>
    );
  }
  return (
    <span className="whitespace-pre-wrap font-mono text-[0.75rem] text-foreground">
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
        "my-3 rounded-md border border-border bg-surface/40 px-2.5 py-1.5",
        className,
      )}
      role="list"
      aria-label="Examples"
    >
      {rows.map((row, i) => (
        <div
          key={`${row.input}-${i}`}
          role="listitem"
          className={cn(i > 0 && "mt-1 border-t border-border/80 pt-1")}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0">
            <p className="min-w-0 font-mono text-[0.75rem] leading-tight text-foreground">
              <span className="text-muted">Input: </span>
              {row.input}
            </p>
            <p className="flex shrink-0 items-baseline gap-1 font-mono text-[0.75rem] leading-tight">
              <span className="text-muted">Output:</span>
              <OutputValue output={row.output} />
            </p>
          </div>
          {row.note ? (
            <p className="mt-0.5 text-[0.7rem] leading-tight text-muted">
              <span className="font-medium">Explanation: </span>
              {row.note}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

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
      <span className="inline-flex rounded-full border border-good/40 bg-good/10 px-2 py-0.5 font-mono text-[0.78rem] text-good">
        {output.trim()}
      </span>
    );
  }
  if (bool === "false") {
    return (
      <span className="inline-flex rounded-full border border-bad/40 bg-bad/10 px-2 py-0.5 font-mono text-[0.78rem] text-bad">
        {output.trim()}
      </span>
    );
  }
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.78rem] text-foreground">
      {output}
    </pre>
  );
}

/**
 * One card per example — Input / Output rows, an optional explanation line.
 * Output is only pilled green/coral when it's a literal true/false; most
 * course examples return arrays or numbers and stay plain text.
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
      className={cn("my-4 grid gap-2", className)}
      role="list"
      aria-label="Examples"
    >
      {rows.map((row, i) => (
        <div
          key={`${row.input}-${i}`}
          role="listitem"
          className="rounded-lg border border-border bg-elevated px-3.5 py-2.5"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[0.65rem] text-muted uppercase tracking-wide">
              Input
            </span>
            <pre className="min-w-0 overflow-x-auto whitespace-pre-wrap font-mono text-[0.78rem] text-foreground">
              <span className="sr-only">: </span>
              {row.input}
            </pre>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[0.65rem] text-muted uppercase tracking-wide">
              Output
            </span>
            <OutputValue output={row.output} />
          </div>
          {row.note ? (
            <p className="mt-1 text-[0.72rem] text-muted">{row.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

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
      <span className="inline-flex rounded-[length:var(--radius-xs)] border border-good/40 bg-good/10 px-2 py-0.5 font-mono text-[0.8rem] font-semibold text-good">
        {output.trim()}
      </span>
    );
  }
  if (bool === "false") {
    return (
      <span className="inline-flex rounded-[length:var(--radius-xs)] border border-bad/40 bg-bad/10 px-2 py-0.5 font-mono text-[0.8rem] font-semibold text-bad">
        {output.trim()}
      </span>
    );
  }
  return (
    <code className="block overflow-x-auto font-mono text-[0.8rem] leading-snug font-semibold break-normal whitespace-pre-wrap text-foreground">
      {output}
    </code>
  );
}

/**
 * Input and Output are stacked, each on its own full-width line with a
 * label in a shared left column.
 *
 * They used to sit side by side as `[minmax(0,1fr) auto]`, which was a
 * losing fight: both are variable-length code strings, and an `auto`
 * output column sizes to its content, so a long output starved the input
 * column to a few characters. `break-words` then wrapped the survivor
 * mid-token — `[0,0,1,1,1,2,2,3,3,4]` came out as six lines broken
 * between digits. Stacking removes the competition entirely and is also
 * shorter: two lines per example instead of four.
 *
 * Values wrap at spaces but never inside a token (`break-normal`), and a
 * token too wide to fit scrolls in its own container rather than being
 * shattered — the same rule the rest of the app uses for wide content.
 *
 * Output is only pilled green/coral for a literal true/false; most course
 * examples return arrays or numbers and stay plain text.
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
        // No padding here: each row owns its own, so the divider between
        // examples runs the full width instead of floating inside a gutter.
        "my-3 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-surface/40",
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
          <p className="mb-2 font-mono text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
            Example {i + 1}
          </p>
          {/*
            `auto` sizes the label column to the wider of the two words, so
            both values start on the same left edge and read as a block.
          */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
              Input
            </span>
            <code className="block overflow-x-auto font-mono text-[0.8rem] leading-snug break-normal whitespace-pre-wrap text-foreground">
              {row.input}
            </code>
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted uppercase">
              Output
            </span>
            <OutputValue output={row.output} />
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

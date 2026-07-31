import type { ComplexityRow } from "@/lib/course/cheatsheets/types";
import { cn } from "@/lib/utils";

/** Highlight interview-target big-O (linear / constant / log / linearish). */
function isTargetBigO(value: string): boolean {
  const v = value.replace(/\s/g, "").toLowerCase();
  // Exact / near-exact targets — avoid painting O(n!) or O(n·T) as "good".
  if (
    v === "o(n)" ||
    v === "o(1)" ||
    v === "o(1)*" ||
    v === "o(logn)" ||
    v === "o(n+m)" ||
    v === "o(v+e)" ||
    v === "o(m·n)" ||
    v === "o(m*n)" ||
    v === "o(n+r)" ||
    v === "≈o(eα(v))" ||
    v.startsWith("≈o(e")
  ) {
    return true;
  }
  // O(n)* style output footnotes
  return /^o\(n\)\*?$/.test(v) || /^o\(h\)/.test(v) || /^o\(w\)/.test(v) || /^o\(k\)/.test(v);
}

export function ComplexityStrip({ rows }: { rows: ComplexityRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[length:var(--radius-md)] border border-border">
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <caption className="sr-only">Typical complexity targets for this module</caption>
        <thead>
          <tr className="border-b border-border bg-surface text-left">
            <th scope="col" className="px-3 py-2 font-medium">
              Move
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Time
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Space
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-border last:border-b-0 even:bg-surface/40"
            >
              <th scope="row" className="px-3 py-2 text-left font-medium text-foreground">
                {row.label}
              </th>
              <td
                className={cn(
                  "px-3 py-2 font-mono text-xs",
                  isTargetBigO(row.time) ? "text-good" : "text-accent",
                )}
              >
                {row.time}
              </td>
              <td
                className={cn(
                  "px-3 py-2 font-mono text-xs",
                  isTargetBigO(row.space) ? "text-good" : "text-mark",
                )}
              >
                {row.space}
              </td>
              <td className="px-3 py-2 text-xs text-muted">{row.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

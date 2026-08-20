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

function TimeCell({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "font-mono text-xs",
        isTargetBigO(value) ? "text-good" : "text-info",
      )}
    >
      {value}
    </span>
  );
}

function SpaceCell({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "font-mono text-xs",
        isTargetBigO(value) ? "text-good" : "text-info",
      )}
    >
      {value}
    </span>
  );
}

export function ComplexityStrip({ rows }: { rows: ComplexityRow[] }) {
  return (
    <>
      {/* Mobile: stacked cards — notes wrap fully, no sideways scroll. */}
      <ul className="grid gap-2 sm:hidden" aria-label="Typical complexity targets for this module">
        {rows.map((row) => (
          <li
            key={row.label}
            className="rounded-[length:var(--radius-md)] border border-border bg-surface/40 px-3.5 py-3"
          >
            <p className="font-medium text-foreground">{row.label}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <div>
                <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">
                  Time
                </dt>
                <dd className="mt-0.5">
                  <TimeCell value={row.time} />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">
                  Space
                </dt>
                <dd className="mt-0.5">
                  <SpaceCell value={row.space} />
                </dd>
              </div>
              {row.note ? (
                <div className="col-span-2">
                  <dt className="font-mono text-[10px] tracking-wide text-muted uppercase">
                    Note
                  </dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    {row.note}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-[length:var(--radius-md)] border border-border sm:block">
        <table className="w-full min-w-[20rem] border-collapse text-sm">
          <caption className="sr-only">
            Typical complexity targets for this module
          </caption>
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
                <th
                  scope="row"
                  className="px-3 py-2 text-left font-medium text-foreground"
                >
                  {row.label}
                </th>
                <td className="px-3 py-2">
                  <TimeCell value={row.time} />
                </td>
                <td className="px-3 py-2">
                  <SpaceCell value={row.space} />
                </td>
                <td className="px-3 py-2 text-xs text-muted">
                  {row.note ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

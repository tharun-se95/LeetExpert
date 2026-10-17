import { Clock as Clock3, Database } from "@phosphor-icons/react/dist/ssr";

interface OperationRow {
  name: string;
  time: string;
  why?: string;
}

interface ComplexitySpec {
  time?: string;
  space?: string;
  why?: string;
  operations?: OperationRow[];
}

function parseSpec(source: string): ComplexitySpec | null {
  try {
    return JSON.parse(source) as ComplexitySpec;
  } catch {
    return null;
  }
}

export function Complexity({ source }: { source: string }) {
  const spec = parseSpec(source);
  if (!spec) {
    return (
      <div className="rounded-[length:var(--radius-md)] border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
        Invalid complexity block.
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-[length:var(--radius-lg)] border border-border/70 bg-surface/20 shadow-elevation">
      <div className="flex items-center justify-between border-b border-border/60 bg-surface/40 px-4 py-2.5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-mark">
          Complexity
        </p>
      </div>
      <div className="grid gap-3.5 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-3">
          {spec.time ? (
            <div className="inline-flex items-center gap-2 rounded-[length:var(--radius-sm)] border border-border/60 bg-surface/50 px-2.5 py-1 text-xs">
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="font-mono font-semibold text-foreground">{spec.time}</span>
              <span className="text-muted">time</span>
            </div>
          ) : null}
          {spec.space ? (
            <div className="inline-flex items-center gap-2 rounded-[length:var(--radius-sm)] border border-border/60 bg-surface/50 px-2.5 py-1 text-xs">
              <Database weight="bold" className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="font-mono font-semibold text-foreground">{spec.space}</span>
              <span className="text-muted">space</span>
            </div>
          ) : null}
        </div>
        {spec.why ? (
          <p className="text-sm leading-relaxed text-muted">{spec.why}</p>
        ) : null}
        {spec.operations?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-border/60 py-2 pr-3 text-left font-mono text-xs uppercase tracking-wider text-muted font-medium">
                    Operation
                  </th>
                  <th className="border-b border-border/60 py-2 pr-3 text-left font-mono text-xs uppercase tracking-wider text-muted font-medium">
                    Cost
                  </th>
                  <th className="border-b border-border/60 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted font-medium">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {spec.operations.map((op) => (
                  <tr key={op.name}>
                    <td className="border-b border-border/30 py-2 pr-3 align-top font-mono text-[0.85em]">
                      {op.name}
                    </td>
                    <td className="border-b border-border/30 py-2 pr-3 align-top font-mono text-[0.85em] font-medium text-foreground">
                      {op.time}
                    </td>
                    <td className="border-b border-border/30 py-2 align-top text-muted text-xs leading-relaxed">
                      {op.why ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

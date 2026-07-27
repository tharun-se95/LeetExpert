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
      <div className="rounded-lg border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
        Invalid complexity block.
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-accent/30">
      <div className="border-b border-accent/20 bg-accent/5 px-4 py-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Complexity
        </p>
      </div>
      <div className="grid gap-3 px-4 py-3">
        {spec.time ? (
          <div className="flex items-start gap-2.5">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm">
              <span className="font-mono font-medium">{spec.time}</span>
              <span className="ml-2 text-muted">time</span>
            </p>
          </div>
        ) : null}
        {spec.space ? (
          <div className="flex items-start gap-2.5">
            <Database weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm">
              <span className="font-mono font-medium">{spec.space}</span>
              <span className="ml-2 text-muted">space</span>
            </p>
          </div>
        ) : null}
        {spec.why ? (
          <p className="text-sm leading-relaxed text-muted">{spec.why}</p>
        ) : null}
        {spec.operations?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-border py-1.5 pr-3 text-left font-medium">
                    Operation
                  </th>
                  <th className="border-b border-border py-1.5 pr-3 text-left font-medium">
                    Cost
                  </th>
                  <th className="border-b border-border py-1.5 text-left font-medium">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {spec.operations.map((op) => (
                  <tr key={op.name}>
                    <td className="border-b border-border/60 py-1.5 pr-3 align-top font-mono text-[0.85em]">
                      {op.name}
                    </td>
                    <td className="border-b border-border/60 py-1.5 pr-3 align-top font-mono text-[0.85em]">
                      {op.time}
                    </td>
                    <td className="border-b border-border/60 py-1.5 align-top text-muted">
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

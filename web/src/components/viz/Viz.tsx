"use client";

import { useMemo } from "react";
import { VIZ_REGISTRY } from "@/components/viz/registry";
import { VizChromeContext } from "@/components/viz/vizChrome";

function parseSpec(source: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(source);
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-[length:var(--radius-md)] border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
      {message}
    </div>
  );
}

/** Entry point for the `viz` markdown fence: JSON body, `id` picks the tracer. */
export function Viz({
  source,
  embedded = false,
  code = true,
}: {
  source: string;
  /** Drop the player's outer card when already inside a parent surface. */
  embedded?: boolean;
  /** Show the code panel beside the stage (the fullscreen view always does). */
  code?: boolean;
}) {
  const spec = useMemo(() => parseSpec(source), [source]);
  const chrome = useMemo(() => ({ embedded, code }), [embedded, code]);

  if (!spec || typeof spec.id !== "string") {
    return <ErrorCard message="Invalid viz block." />;
  }
  const Component = VIZ_REGISTRY[spec.id];
  if (!Component) {
    return <ErrorCard message={`Unknown viz id "${spec.id}".`} />;
  }
  const props = { ...spec };
  delete props.id;
  return (
    <VizChromeContext.Provider value={chrome}>
      <Component {...props} />
    </VizChromeContext.Provider>
  );
}

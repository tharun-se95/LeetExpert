"use client";

import { useMemo } from "react";
import { VIZ_REGISTRY } from "@/components/viz/registry";

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
    <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3 text-sm text-muted">
      {message}
    </div>
  );
}

/** Entry point for the `viz` markdown fence: JSON body, `id` picks the tracer. */
export function Viz({ source }: { source: string }) {
  const spec = useMemo(() => parseSpec(source), [source]);

  if (!spec || typeof spec.id !== "string") {
    return <ErrorCard message="Invalid viz block." />;
  }
  const Component = VIZ_REGISTRY[spec.id];
  if (!Component) {
    return <ErrorCard message={`Unknown viz id "${spec.id}".`} />;
  }
  const props = { ...spec };
  delete props.id;
  return <Component {...props} />;
}

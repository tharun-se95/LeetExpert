"use client";

import { useMemo } from "react";
import { DIAGRAM_REGISTRY } from "@/components/md/diagrams/registry";

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

/**
 * Entry point for the `diagram` markdown fence: JSON body, `id` picks a
 * static illustrative SVG from the registry. Unlike `viz`, these are not
 * step-through tracers — just a themed, precise picture.
 */
export function Diagram({ source }: { source: string }) {
  const spec = useMemo(() => parseSpec(source), [source]);

  if (!spec || typeof spec.id !== "string") {
    return <ErrorCard message="Invalid diagram block." />;
  }
  const Component = DIAGRAM_REGISTRY[spec.id];
  if (!Component) {
    return <ErrorCard message={`Unknown diagram id "${spec.id}".`} />;
  }
  const props = { ...spec };
  delete props.id;
  return (
    <div className="my-6 flex justify-center rounded-xl border border-border bg-surface/40 px-4 py-6">
      <Component {...props} />
    </div>
  );
}

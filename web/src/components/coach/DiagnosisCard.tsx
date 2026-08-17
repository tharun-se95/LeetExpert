import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/coach/types";

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const tone =
    diagnosis.status === "all-passed"
      ? "text-good"
      : diagnosis.status === "errored"
        ? "text-bad"
        : "text-bad";
  const label =
    diagnosis.status === "all-passed"
      ? "All cases passed"
      : diagnosis.status === "errored"
        ? "Runner error"
        : "Case failed";

  return (
    <article className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className={cn("text-[0.7rem] font-medium uppercase tracking-wide", tone)}>
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{diagnosis.prose}</p>
    </article>
  );
}

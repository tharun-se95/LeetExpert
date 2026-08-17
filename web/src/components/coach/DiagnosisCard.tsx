import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/coach/types";

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const passed = diagnosis.status === "all-passed";
  const tone = passed ? "text-good" : "text-bad";
  const label = passed
    ? "All cases passed"
    : diagnosis.status === "errored"
      ? "Runner error"
      : "Case failed";
  const Icon = passed ? CheckCircle : XCircle;

  return (
    <article
      className={cn(
        "flex gap-2.5 rounded-lg border-y border-r border-l-[3px] border-border bg-surface px-3 py-2.5",
        passed ? "border-l-good" : "border-l-bad",
      )}
    >
      <Icon size={16} weight="fill" className={cn("mt-0.5 shrink-0", tone)} aria-hidden />
      <div className="min-w-0">
        <p className={cn("text-[0.7rem] font-semibold uppercase tracking-wide", tone)}>
          {label}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{diagnosis.prose}</p>
      </div>
    </article>
  );
}

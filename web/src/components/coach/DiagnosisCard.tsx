import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/coach/types";

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const passed = diagnosis.status === "all-passed";
  const label = passed
    ? "All cases passed"
    : diagnosis.status === "errored"
      ? "Runner error"
      : "Case failed";

  return (
    <article
      className={cn(
        // A run result is context for the conversation, not an alert competing
        // with it. The coach's own replies are undecorated prose, so a boxed,
        // filled-icon, coloured-caps treatment made the machine note louder
        // than the teaching — one rule carries the tone instead. The label
        // still names the status in words, so nothing here rides on colour.
        "border-l-2 py-0.5 pl-3",
        passed ? "border-l-good" : "border-l-bad",
      )}
    >
      <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">
        {diagnosis.prose}
      </p>
    </article>
  );
}

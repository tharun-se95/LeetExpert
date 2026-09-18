"use client";

import { Dialog } from "@/components/ui/Dialog";
import type { AnonymousSummary } from "@/lib/progress/localStore";

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Esc, the backdrop and "Decide later" all call `onDismiss`, which is not a
 * choice: nothing is uploaded or discarded, sync:owner stays unwritten, so the
 * device is still nobody's and the prompt returns on the next load. A dialog
 * that swallowed Esc would trap keyboard users; one that treated Esc as
 * "Don't add" would delete progress on a stray keypress.
 */
export function MergePromptDialog({
  summary,
  busy,
  error,
  onChoose,
  onDismiss,
}: {
  summary: AnonymousSummary | null;
  busy: boolean;
  error: string | null;
  onChoose: (choice: "add" | "discard") => void;
  onDismiss: () => void;
}) {
  return (
    <Dialog open={summary !== null} onClose={onDismiss} label="Progress on this device">
      {summary ? (
        <>
          <h2 className="font-display text-lg font-bold">This device has progress from before you signed in.</h2>
          <p className="mt-3 text-sm text-muted">
            {plural(summary.visited, "lesson visited", "lessons visited")} ·{" "}
            {plural(summary.solved, "problem solved", "problems solved")} ·{" "}
            {plural(summary.drafts, "draft", "drafts")}
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-bad">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => onChoose("add")}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:opacity-90 disabled:opacity-60"
            >
              Add to my account
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onChoose("discard")}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface disabled:opacity-60"
            >
              Don&apos;t add
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDismiss}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] px-3 text-sm text-muted transition hover:text-foreground disabled:opacity-60"
            >
              Decide later
            </button>
          </div>
        </>
      ) : null}
    </Dialog>
  );
}

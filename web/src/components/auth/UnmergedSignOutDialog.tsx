"use client";

import { summaryLine } from "@/components/auth/summaryLine";
import { Dialog } from "@/components/ui/Dialog";
import type { AnonymousSummary } from "@/lib/progress/localStore";

/**
 * Shown when the learner signs out while this device holds progress that was
 * never added to the account (the merge prompt was dismissed, or sign-in never
 * finished). It is not recoverable once the device is cleared, so this asks
 * before doing it. "Review it first" reloads: the merge prompt returns on the
 * next load because sync:owner is still unwritten.
 */
export function UnmergedSignOutDialog({
  summary,
  busy,
  onReview,
  onDiscard,
  onCancel,
}: {
  summary: AnonymousSummary | null;
  busy: boolean;
  onReview: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={summary !== null} onClose={onCancel} label="Progress that is not on your account">
      {summary ? (
        <>
          <h2 className="font-display text-lg font-bold">This device has progress that isn&apos;t on your account.</h2>
          <p className="mt-3 text-sm text-muted">{summaryLine(summary)}</p>
          <p className="mt-2 text-sm text-muted">
            It was never added to your account, so signing out deletes it from this device for good. Reload the
            page to be asked again whether to add it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] px-3 text-sm text-muted transition hover:text-foreground disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onReview}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:opacity-90 disabled:opacity-60"
            >
              Reload and review it
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDiscard}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-bad-line px-4 text-sm font-semibold text-bad transition hover:bg-bad-surface disabled:opacity-50"
            >
              Sign out and delete it
            </button>
          </div>
        </>
      ) : null}
    </Dialog>
  );
}

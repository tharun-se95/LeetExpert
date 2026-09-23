"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";

export function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} label="Delete account">
      <DeleteBody onClose={onClose} onConfirm={onConfirm} busy={busy} />
    </Dialog>
  );
}

// Its own component so the typed word is dropped with the dialog: a reopened
// dialog must not arrive with "delete" already typed.
function DeleteBody({ onClose, onConfirm, busy }: { onClose: () => void; onConfirm: () => void; busy: boolean }) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  return (
    <>
      <h2 className="font-display text-lg font-bold">Delete your account?</h2>
      <p className="mt-3 text-sm text-muted">
        This permanently erases your account, every lesson and problem you have marked, and all your saved
        sandbox code, on every device. It cannot be undone.
      </p>
      <label htmlFor={inputId} className="mt-4 block text-sm">
        Type <strong>delete</strong> to confirm
      </label>
      <input
        id={inputId}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        className="mt-2 h-10 w-full rounded-[length:var(--radius-md)] border border-border bg-background px-3 text-sm"
      />
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={typed !== "delete" || busy}
          onClick={onConfirm}
          className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-bad-line px-4 text-sm font-semibold text-bad transition hover:bg-bad-surface disabled:opacity-50"
        >
          Delete account
        </button>
      </div>
    </>
  );
}

"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Stop } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";

export function CoachComposer() {
  const { send, pending, error, retryable, configured, remaining, resetAt, retry, stop } =
    useCoach();
  const [value, setValue] = useState("");

  const locked = configured === false || remaining === 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (locked || pending) return;
    const text = value;
    setValue("");
    void send(text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (locked || pending) return;
      const text = value;
      setValue("");
      void send(text);
    }
  };

  const quota =
    remaining === null
      ? "Turns remaining update after you ask."
      : `${remaining} chat turn${remaining === 1 ? "" : "s"} left today`;

  // Falls back to the quota line so this row is never empty — one footer
  // strip doing both jobs instead of a permanent second one underneath it.
  let helper = quota;
  if (configured === false) {
    helper = "Chat isn’t available on this deployment. Diagnosis still works.";
  } else if (remaining === 0) {
    helper = resetAt
      ? `Daily coach limit reached. Resets ${new Date(resetAt).toUTCString()}.`
      : "Daily coach limit reached.";
  } else if (error) {
    helper = error;
  }

  return (
    <form onSubmit={onSubmit} className="shrink-0 border-t border-border bg-elevated p-2">
      <label className="sr-only" htmlFor="coach-input">
        Ask the coach
      </label>
      <div className="flex items-end gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-code px-2 py-1.5">
        <textarea
          id="coach-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={locked}
          rows={1}
          maxLength={2000}
          placeholder={locked ? "Chat unavailable" : "Ask a question — I will not write the code."}
          className="min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-foreground placeholder:text-muted disabled:opacity-60"
        />
        {pending ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Stop size={15} weight="fill" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={locked || !value.trim()}
            aria-label="Ask the coach"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pop text-on-pop transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowUp size={16} weight="bold" aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-muted" role={error ? "alert" : undefined}>
          {helper}
        </p>
        {error && retryable ? (
          <button
            type="button"
            onClick={() => void retry()}
            className="shrink-0 rounded-[length:var(--radius-md)] border border-border px-2 py-1 text-xs text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Retry
          </button>
        ) : null}
      </div>
    </form>
  );
}

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
      {/* A full pill echoes the floating panel's own softer corners — a sharp
          12px rectangle inside a 20px-radius card reads as unfinished. */}
      {/*
        The focus ring lives on the pill, not the textarea. globals.css gives
        every :focus-visible a 2px-radius outline, which inside a fully round
        container paints a squared-off rectangle in a circle — so the textarea
        suppresses its own and the pill lights up instead, matching the shape
        the learner actually reads as "the input".
      */}
      <div className="flex items-end gap-1.5 rounded-full border border-border bg-code p-1.5 transition-shadow has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-accent motion-reduce:transition-none">
        <textarea
          id="coach-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={locked}
          rows={1}
          maxLength={2000}
          placeholder={locked ? "Chat unavailable" : "Ask a question — I will not write the code."}
          data-focus-ring="none"
          className="min-h-9 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted disabled:opacity-60"
        />
        {pending ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
          >
            <Stop size={15} weight="fill" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={locked || !value.trim()}
            aria-label="Ask the coach"
            // Empty state is a quiet surface chip, not the accent at low
            // opacity: fading --pop muddies it into an indeterminate grey that
            // reads as a rendering fault rather than a deliberate off state.
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pop text-on-pop transition-colors disabled:bg-surface disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
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

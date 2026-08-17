"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useCoach } from "./CoachProvider";

export function CoachComposer() {
  const { send, pending, error, configured, remaining, resetAt, retry, stop } = useCoach();
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

  let helper = "";
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
    <form onSubmit={onSubmit} className="shrink-0 border-t border-border bg-elevated p-3">
      <label className="sr-only" htmlFor="coach-input">
        Ask the coach
      </label>
      <textarea
        id="coach-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={locked}
        rows={2}
        maxLength={2000}
        placeholder={locked ? "Chat unavailable" : "Ask a question — I will not write the code."}
        className="min-h-11 w-full resize-none rounded-md border border-border bg-code px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-muted" role={error ? "alert" : undefined}>
          {helper}
        </p>
        <div className="flex shrink-0 gap-2">
          {error ? (
            <button
              type="button"
              onClick={() => void retry()}
              className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Retry
            </button>
          ) : null}
          {pending ? (
            <button
              type="button"
              onClick={stop}
              className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={locked || !value.trim()}
              className="min-h-11 rounded-md bg-pop px-3 text-sm font-medium text-on-pop disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Ask
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

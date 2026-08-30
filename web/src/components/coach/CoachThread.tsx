"use client";

import { ChatCircle } from "@phosphor-icons/react";
import { CoachMarkdown } from "./CoachMarkdown";
import { useCoach } from "./CoachProvider";
import { DiagnosisCard } from "./DiagnosisCard";

/**
 * Deliberately the masthead mark at small size — same shape, same fill — so
 * every reply is visibly from the thing named at the top of the panel. A
 * washed accent chip read as generic decoration and, on --elevated, sat under
 * the 3:1 floor besides.
 */
function CoachAvatar() {
  return (
    <span
      aria-hidden
      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
    >
      <ChatCircle size={13} weight="fill" />
    </span>
  );
}

/** A row of breathing dots reads as "typing" without claiming to be text. */
function ThinkingDots() {
  return (
    <span className="mt-2.5 flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted motion-safe:animate-pulse motion-reduce:opacity-60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export function CoachThread() {
  const { thread, pending } = useCoach();
  const isEmpty = thread.length === 0 && !pending;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop">
            <ChatCircle size={24} weight="fill" aria-hidden />
          </span>
          <p className="font-display text-base font-bold tracking-tight text-foreground">
            Ask about this problem
          </p>
          <p className="text-xs leading-relaxed text-muted">
            I’ll nudge you toward the idea, not hand you the code.
          </p>
        </div>
      ) : null}
      {thread.map((item) => {
        if (item.kind === "diagnosis") {
          return <DiagnosisCard key={item.id} diagnosis={item.diagnosis} />;
        }
        if (item.kind === "user") {
          return (
            <p
              key={item.id}
              // bg-surface, not bg-elevated: the rail itself is elevated, so
              // the old fill was the same ink as its own ground and the bubble
              // survived on its border alone. A real step down the ladder is
              // what makes the learner's turn readable as a separate object.
              className="ml-8 rounded-[length:var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm leading-relaxed text-foreground"
            >
              {item.content}
            </p>
          );
        }
        return (
          <div key={item.id} className="flex gap-2">
            <CoachAvatar />
            <div className="min-w-0 flex-1 pt-0.5">
              <CoachMarkdown source={item.content} />
            </div>
          </div>
        );
      })}
      {pending ? (
        <div className="flex gap-2" aria-live="polite">
          <CoachAvatar />
          <ThinkingDots />
          <span className="sr-only">Coach is thinking…</span>
        </div>
      ) : null}
    </div>
  );
}

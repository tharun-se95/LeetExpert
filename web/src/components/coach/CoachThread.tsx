"use client";

import { ChatCircle } from "@phosphor-icons/react";
import { CoachMarkdown } from "./CoachMarkdown";
import { useCoach } from "./CoachProvider";
import { DiagnosisCard } from "./DiagnosisCard";

function CoachAvatar() {
  return (
    <span
      aria-hidden
      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
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
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <ChatCircle size={20} weight="fill" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">Ask about this problem</p>
          <p className="text-xs text-muted">
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
              className="ml-8 rounded-lg border border-border bg-elevated px-3.5 py-2 text-sm leading-relaxed text-foreground"
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

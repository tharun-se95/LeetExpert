"use client";

import { Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Diagnosis } from "@/lib/coach/types";
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
      <Sparkle size={13} weight="fill" />
    </span>
  );
}

/**
 * Names the work instead of miming a person at a keyboard. The three
 * pulsing dots this replaces are the messaging-app "someone is typing"
 * convention — the wrong metaphor for something that is reading a file, not
 * composing a sentence. One honest label rather than a cycle of invented
 * steps: the request sends the code and then waits, so the phases a
 * step-cycle would narrate are not actually observable from here.
 */
function WorkingState() {
  return (
    <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted">
      <Sparkle
        size={12}
        weight="fill"
        className="motion-safe:animate-pulse"
        aria-hidden
      />
      Reading your code…
    </span>
  );
}

/**
 * Openings drawn from the run the learner just had, so the first tap is
 * about their actual failure rather than a generic prompt. A blank composer
 * next to a coach that refuses to write code leaves people unsure what it
 * is even for; these show the shape of a useful question.
 */
function starterPrompts(diagnosis: Diagnosis | null): string[] {
  if (diagnosis?.status === "failed" || diagnosis?.status === "errored") {
    const ordinal =
      diagnosis.firstFailIndex !== null
        ? `case ${diagnosis.firstFailIndex + 1}`
        : "that case";
    // caseName is the whole call — great when it is short, unreadable as a
    // chip when the args are a matrix or a long op sequence. Fall back to
    // the ordinal past the point where it would wrap to a third line.
    const name = diagnosis.caseName;
    const label = name && name.length <= 28 ? name : ordinal;
    return [`Why does ${label} fail?`, "Am I on the right track?"];
  }
  if (diagnosis?.status === "all-passed") {
    return ["Can this be faster?", "What is the key idea here?"];
  }
  return ["Where should I start?", "What should I watch out for?"];
}

/**
 * Rendered until the learner has actually said something — NOT only when
 * the thread is empty. reportRun pushes a diagnosis card on every run, so
 * an empty-thread-only condition would retire these the instant a run
 * happened, which is precisely when the failure-derived prompt above is
 * worth offering.
 */
function StarterPrompts({ centered }: { centered?: boolean }) {
  const { diagnosis, send, configured, remaining } = useCoach();
  if (configured === false || remaining === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        centered ? "mt-2 justify-center" : "ml-8",
      )}
    >
      {starterPrompts(diagnosis).map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => void send(prompt)}
          className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-foreground transition-colors hover:border-accent/50 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop">
        <Sparkle size={24} weight="fill" aria-hidden />
      </span>
      <p className="font-display text-base font-bold tracking-tight text-foreground">
        Ask about this problem
      </p>
      <p className="text-xs leading-relaxed text-muted">
        I’ll nudge you toward the idea, not hand you the code.
      </p>
      <StarterPrompts centered />
    </div>
  );
}

export function CoachThread() {
  const { thread, pending } = useCoach();
  const isEmpty = thread.length === 0 && !pending;
  // Diagnosis cards are the coach talking to itself; the prompts stay up
  // until the learner has actually taken a turn.
  const hasConversation = thread.some(
    (i) => i.kind === "user" || i.kind === "assistant",
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      {isEmpty ? <EmptyState /> : null}
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
      {!isEmpty && !hasConversation && !pending ? <StarterPrompts /> : null}
      {pending ? (
        <div className="flex gap-2" aria-live="polite">
          <CoachAvatar />
          <WorkingState />
          <span className="sr-only">Coach is reading your code…</span>
        </div>
      ) : null}
    </div>
  );
}

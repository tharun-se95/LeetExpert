"use client";

import { coachSuggestions } from "@/lib/coach/suggestions";
import { CoachMarkdown } from "./CoachMarkdown";
import { useCoach } from "./CoachProvider";
import { DiagnosisCard } from "./DiagnosisCard";

export function CoachThread() {
  const { thread, send, pending, configured, diagnosis } = useCoach();
  const hasChat = thread.some((i) => i.kind === "user" || i.kind === "assistant");
  const suggestions = coachSuggestions({ hasChat, diagnosis });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      {thread.map((item) => {
        if (item.kind === "diagnosis") {
          return <DiagnosisCard key={item.id} diagnosis={item.diagnosis} />;
        }
        if (item.kind === "user") {
          return (
            <p
              key={item.id}
              className="ml-6 rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-foreground"
            >
              {item.content}
            </p>
          );
        }
        return (
          <div
            key={item.id}
            className="mr-4 rounded-lg border border-border bg-info-surface px-3 py-2"
          >
            <CoachMarkdown source={item.content} />
          </div>
        );
      })}
      {pending ? (
        <p
          className="mr-4 rounded-lg border border-border bg-info-surface px-3 py-2 text-sm text-muted"
          aria-live="polite"
        >
          Thinking…
        </p>
      ) : null}
      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">
            {hasChat ? "Or pick one:" : "Ask a small question, or pick one:"}
          </p>
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={pending || configured === false}
              onClick={() => void send(prompt)}
              className="min-h-11 rounded-md border border-border bg-elevated px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  /** Index into options */
  answer: number;
  explanation?: string;
}

interface QuizSpec {
  questions: QuizQuestion[];
}

const STORAGE_KEY = "dsa-course-quiz";

/** Render `code` spans inside plain quiz strings. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded-[length:var(--radius-sm)] border border-border bg-background px-1.5 py-0.5 font-mono text-[0.85em]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function questionKey(q: QuizQuestion): string {
  // Stable id from the question text — survives reordering.
  let hash = 0;
  for (let i = 0; i < q.question.length; i++) {
    hash = (hash * 31 + q.question.charCodeAt(i)) | 0;
  }
  return `q${hash}`;
}

function parseSpec(source: string): QuizSpec | null {
  try {
    const data = JSON.parse(source);
    const questions: QuizQuestion[] = Array.isArray(data)
      ? data
      : Array.isArray(data.questions)
        ? data.questions
        : [data];
    if (
      questions.every(
        (q) =>
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          typeof q.answer === "number",
      )
    ) {
      return { questions };
    }
    return null;
  } catch {
    return null;
  }
}

function QuestionBlock({
  question,
  index,
  total,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
}) {
  const key = questionKey(question);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, number>;
        if (typeof saved[key] === "number") setSelected(saved[key]);
      }
    } catch {
      /* ignore */
    }
  }, [key]);

  const choose = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      saved[key] = optionIndex;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  };

  const answered = selected !== null;
  const correct = selected === question.answer;

  return (
    <div
      className={cn("py-5", index < total - 1 && "border-b border-border")}
    >
      {/*
        handbook-prose styles `p { margin: 0.85rem 0 }`, which would push the
        question down past the number. Keep number + question on one baseline.
      */}
      <div className="flex items-baseline gap-3">
        <span className="inline-flex h-6 w-6 shrink-0 translate-y-px items-center justify-center rounded-full bg-accent/12 font-mono text-[11px] font-bold tabular-nums text-mark">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="!m-0 min-w-0 flex-1 text-base leading-snug font-semibold text-foreground">
          <InlineText text={question.question} />
        </p>
      </div>

      <div
        className="mt-3.5 ml-9 grid gap-2"
        role="group"
        aria-label={`Question ${index + 1} options`}
      >
        {question.options.map((option, i) => {
          const isAnswer = i === question.answer;
          const isSelected = i === selected;

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              aria-pressed={isSelected}
              className={cn(
                "group/opt flex w-full items-center gap-3 rounded-[length:var(--radius-md)] border px-3 py-2.5 text-left text-sm leading-relaxed transition",
                !answered &&
                  "border-border bg-elevated hover:border-accent/40 hover:bg-accent/[0.06]",
                answered &&
                  isAnswer &&
                  "border-good/50 bg-good/10 text-foreground",
                answered &&
                  isSelected &&
                  !isAnswer &&
                  "border-bad/50 bg-bad/10 text-foreground",
                answered &&
                  !isSelected &&
                  !isAnswer &&
                  "border-border/60 bg-elevated/50 text-muted",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
                  !answered &&
                    "border-border group-hover/opt:border-accent/50",
                  answered && isAnswer && "border-good bg-good text-on-pop",
                  answered &&
                    isSelected &&
                    !isAnswer &&
                    "border-bad bg-bad text-on-pop",
                  answered &&
                    !isSelected &&
                    !isAnswer &&
                    "border-border/40",
                )}
                aria-hidden
              >
                {answered && isAnswer ? (
                  <Check weight="bold" className="h-2.5 w-2.5" />
                ) : answered && isSelected && !isAnswer ? (
                  <X weight="bold" className="h-2.5 w-2.5" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <InlineText text={option} />
              </span>
            </button>
          );
        })}
      </div>

      {answered && question.explanation ? (
        <p
          className={cn(
            "mt-4 ml-9 !mb-0 border-l-2 pl-3 text-sm leading-relaxed",
            correct
              ? "border-good text-foreground"
              : "border-accent text-foreground",
          )}
        >
          <span className="font-semibold text-mark">
            {correct ? "Correct. " : "Not quite. "}
          </span>
          <span className="text-muted">
            <InlineText text={question.explanation} />
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function Quiz({ source }: { source: string }) {
  const spec = useMemo(() => parseSpec(source), [source]);

  if (!spec) {
    return (
      <div className="rounded-[length:var(--radius-md)] border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
        Invalid quiz block.
      </div>
    );
  }

  return (
    <section className="my-8">
      <header className="mb-2 flex items-end justify-between gap-3">
        <div>
          {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
          <span
            aria-hidden
            className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
          />
          <p className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground">
            Check yourself
          </p>
        </div>
        <p className="mb-1 shrink-0 font-mono text-[10px] tabular-nums text-muted">
          {spec.questions.length}{" "}
          {spec.questions.length === 1 ? "question" : "questions"}
        </p>
      </header>
      <div>
        {spec.questions.map((q, i) => (
          <QuestionBlock
            key={questionKey(q)}
            question={q}
            index={i}
            total={spec.questions.length}
          />
        ))}
      </div>
    </section>
  );
}

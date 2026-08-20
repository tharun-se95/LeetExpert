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
      className={cn(
        "px-4 py-5 sm:px-5",
        index < total - 1 && "border-b border-border",
      )}
    >
      {/*
        handbook-prose styles `p { margin: 0.85rem 0 }`, which would push the
        question down past the number. Keep number + question on one baseline.
      */}
      <div className="flex items-baseline gap-3">
        <span className="w-6 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-mark">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="!m-0 min-w-0 flex-1 text-[0.95rem] leading-snug font-medium text-foreground">
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
          const letter = String.fromCharCode(65 + i);

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
                  "border-border bg-background hover:border-accent/40 hover:bg-accent/[0.06]",
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
                  "border-border/60 bg-background/50 text-muted",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums transition",
                  !answered &&
                    "border border-border bg-elevated text-muted group-hover/opt:border-accent/45 group-hover/opt:text-mark",
                  answered &&
                    isAnswer &&
                    "border border-good/50 bg-good/15 text-good",
                  answered &&
                    isSelected &&
                    !isAnswer &&
                    "border border-bad/50 bg-bad/15 text-bad",
                  answered &&
                    !isSelected &&
                    !isAnswer &&
                    "border border-border bg-transparent text-muted",
                )}
                aria-hidden
              >
                {answered && isAnswer ? (
                  <Check weight="bold" className="h-3.5 w-3.5" />
                ) : answered && isSelected && !isAnswer ? (
                  <X weight="bold" className="h-3.5 w-3.5" />
                ) : (
                  letter
                )}
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
    <section className="my-8 overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-accent/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-pop"
          />
          <p className="text-[11px] font-semibold tracking-[0.16em] text-mark uppercase">
            Check yourself
          </p>
        </div>
        <p className="font-mono text-[10px] tabular-nums text-muted">
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle as CheckCircle2, XCircle } from "@phosphor-icons/react";
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
            className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.85em]"
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

function QuestionCard({ question }: { question: QuizQuestion }) {
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

  const choose = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      saved[key] = index;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  };

  const answered = selected !== null;
  const correct = selected === question.answer;

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-sm font-medium">
        <InlineText text={question.question} />
      </p>
      <div className="mt-3 grid gap-2">
        {question.options.map((option, i) => {
          const isAnswer = i === question.answer;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition",
                !answered &&
                  "border-border hover:border-foreground/25 hover:bg-surface",
                answered && isAnswer && "border-green-500/60 bg-green-500/10",
                answered &&
                  isSelected &&
                  !isAnswer &&
                  "border-bad/60 bg-bad/10",
                answered && !isSelected && !isAnswer && "border-border opacity-60",
              )}
            >
              {answered && isAnswer ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : answered && isSelected && !isAnswer ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
              ) : (
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-muted">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span className="min-w-0">
                <InlineText text={option} />
              </span>
            </button>
          );
        })}
      </div>
      {answered && question.explanation ? (
        <p
          className={cn(
            "mt-3 rounded-lg border px-3 py-2 text-sm leading-relaxed",
            correct
              ? "border-green-500/40 bg-green-500/5 text-foreground"
              : "border-border bg-surface text-foreground",
          )}
        >
          <span className="font-medium">
            {correct ? "Correct. " : "Not quite. "}
          </span>
          <InlineText text={question.explanation} />
        </p>
      ) : null}
    </div>
  );
}

export function Quiz({ source }: { source: string }) {
  const spec = useMemo(() => parseSpec(source), [source]);

  if (!spec) {
    return (
      <div className="rounded-lg border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
        Invalid quiz block.
      </div>
    );
  }

  return (
    <div className="my-6 grid gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
        Check yourself
      </p>
      {spec.questions.map((q) => (
        <QuestionCard key={questionKey(q)} question={q} />
      ))}
    </div>
  );
}

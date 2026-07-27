"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Check, Play, ArrowCounterClockwise as RotateCcw, Terminal as TerminalSquare, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useRunner } from "@/components/sandbox/useRunner";
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";
import { LANG_LABEL, type CaseResult, type SandboxLang } from "@/components/sandbox/types";

const LANGS: SandboxLang[] = ["python", "javascript"];

/**
 * CodeMirror is pulled in only where a sandbox actually renders — the ~185
 * lessons without one never download it. `ssr: false` because CodeMirror
 * measures the DOM on construction and has nothing to render server-side.
 */
const CodeEditor = dynamic(
  () => import("@/components/sandbox/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse border-t border-border bg-code" />
    ),
  },
);

function draftKey(id: string, lang: SandboxLang): string {
  return `dsa:sandbox:${id}:${lang}`;
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="my-6 rounded-lg border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
      {message}
    </div>
  );
}

export function Sandbox({ source }: { source: string }) {
  const spec = useMemo(() => parseSandboxSpec(source), [source]);
  if (!spec) return <ErrorCard message="Invalid sandbox block." />;
  return <SandboxBody spec={spec} />;
}

function SandboxBody({
  spec,
}: {
  spec: NonNullable<ReturnType<typeof parseSandboxSpec>>;
}) {
  const [lang, setLang] = useState<SandboxLang>("python");
  const [drafts, setDrafts] = useState<Record<SandboxLang, string>>({
    python: spec.starter.python,
    javascript: spec.starter.javascript,
  });
  const { state, run, reset } = useRunner(spec);

  // Restore saved drafts once mounted. Reading localStorage during render
  // would desync server and client HTML, so it happens in an effect.
  useEffect(() => {
    setDrafts((current) => {
      const restored = { ...current };
      for (const l of LANGS) {
        const saved = window.localStorage.getItem(draftKey(spec.id, l));
        if (saved !== null) restored[l] = saved;
      }
      return restored;
    });
  }, [spec.id]);

  const setDraft = useCallback(
    (next: string) => {
      setDrafts((current) => ({ ...current, [lang]: next }));
      try {
        window.localStorage.setItem(draftKey(spec.id, lang), next);
      } catch {
        // Private mode or a full quota — losing the draft is survivable.
      }
    },
    [lang, spec.id],
  );

  const restoreStarter = useCallback(() => {
    setDrafts((current) => ({ ...current, [lang]: spec.starter[lang] }));
    try {
      window.localStorage.removeItem(draftKey(spec.id, lang));
    } catch {
      /* nothing to clean up */
    }
    reset();
  }, [lang, reset, spec.id, spec.starter]);

  const busy = state.status === "running" || state.status === "booting";
  const results = state.status === "done" ? state.results : null;
  const passed = results?.filter((r) => r.passed).length ?? 0;
  const total = spec.cases.length;
  const allPassed = results !== null && passed === total;

  return (
    <div
      className={cn(
        "print:hidden my-7 overflow-hidden rounded-xl border bg-surface/30 transition-colors",
        allPassed ? "border-good/40" : "border-border",
      )}
    >
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          <TerminalSquare size={13} aria-hidden />
          Your turn
        </span>

        <div className="inline-flex rounded-lg bg-code p-0.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLang(l);
                reset();
              }}
              aria-pressed={lang === l}
              className={cn(
                "rounded-[6px] px-2.5 py-1 font-mono text-[0.7rem] transition-colors",
                lang === l
                  ? "bg-pop text-on-pop shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={restoreStarter}
            title="Restore the starter code"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.7rem] text-muted transition-colors hover:bg-code hover:text-foreground"
          >
            <RotateCcw size={12} aria-hidden />
            Reset
          </button>
          <button
            type="button"
            onClick={() => run(lang, drafts[lang])}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-pop px-3 py-1.5 text-[0.72rem] font-semibold text-on-pop transition-opacity hover:opacity-90 disabled:opacity-55"
          >
            <Play size={12} aria-hidden />
            {state.status === "booting"
              ? "Starting Python…"
              : state.status === "running"
                ? "Running…"
                : "Run tests"}
          </button>
        </div>
      </div>

      {/* editor — flush inside the panel, divided rather than double-bordered */}
      <div className="border-y border-border bg-code">
        <CodeEditor
          value={drafts[lang]}
          onChange={setDraft}
          lang={lang}
          ariaLabel={`${LANG_LABEL[lang]} solution editor`}
        />
      </div>

      <div aria-live="polite">
        {state.status === "idle" ? (
          <p className="px-3.5 py-2.5 text-[0.72rem] text-muted">
            {total} test {total === 1 ? "case" : "cases"} are waiting. Keep the
            given function name — they call it directly.
          </p>
        ) : null}

        {state.status === "booting" && lang === "python" ? (
          <p className="px-3.5 py-2.5 text-[0.72rem] text-muted">
            Downloading the Python runtime (~10 MB). Cached after this.
          </p>
        ) : null}

        {state.status === "failed" ? (
          <div className="border-l-2 border-bad/70 bg-bad/5 px-3.5 py-2.5">
            <p className="mb-0.5 text-[0.7rem] font-semibold tracking-wide text-bad uppercase">
              Could not run
            </p>
            <pre className="overflow-x-auto font-mono text-[0.72rem] leading-relaxed whitespace-pre-wrap text-foreground/85">
              {state.message}
            </pre>
          </div>
        ) : null}

        {results ? <Results results={results} passed={passed} total={total} /> : null}
      </div>
    </div>
  );
}

function Results({
  results,
  passed,
  total,
}: {
  results: CaseResult[];
  passed: number;
  total: number;
}) {
  const allPassed = passed === total;
  return (
    <div>
      {/* summary strip: a glanceable count plus one pip per case */}
      <div
        className={cn(
          // Halftone stays on raised panels only — a printed receipt, not a
          // page-wide texture. That containment is what made the quieted
          // version readable.
          "riso-halftone flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5",
          allPassed ? "bg-good/8" : "bg-surface/50",
        )}
      >
        {/* The stamp lands on the real moment — every case green, nothing less. */}
        {allPassed ? <span className="riso-stamp mr-1">Solved</span> : null}
        <span
          className={cn(
            "font-mono text-[0.75rem] font-semibold",
            allPassed
              ? "text-good"
              : "text-foreground",
          )}
        >
          {allPassed ? `All ${total} passed` : `${passed} / ${total} passed`}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          {results.map((r) => (
            <span
              key={r.index}
              className={cn(
                "h-1.5 w-5 rounded-full",
                r.passed ? "bg-good/80" : "bg-bad/80",
              )}
            />
          ))}
        </span>
        {allPassed ? (
          <span className="text-[0.72rem] text-muted">
            Now compare yours against the solution below.
          </span>
        ) : null}
      </div>

      {/*
        Deliberately divs with list roles rather than <ul>/<li>. This renders
        inside `.handbook-prose`, where `.handbook-prose ul` (specificity
        0,1,1) beats any single utility class, so disc markers and indent
        padding would win over `list-none`. The other embedded widgets here
        sidestep the prose styles the same way; ARIA keeps the semantics.
      */}
      <div
        role="list"
        className="divide-y divide-border/60 border-t border-border/60"
      >
        {results.map((result) => (
          <div role="listitem" key={result.index} className="px-3.5 py-2">
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  result.passed
                    ? "bg-good/15 text-good"
                    : "bg-bad/15 text-bad",
                )}
              >
                {result.passed ? (
                  <Check size={10} strokeWidth={3} aria-hidden />
                ) : (
                  <X size={10} strokeWidth={3} aria-hidden />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <code
                  className={cn(
                    "block overflow-x-auto font-mono text-[0.72rem] whitespace-pre",
                    result.passed ? "text-muted" : "text-foreground",
                  )}
                >
                  {result.name}
                </code>

                {result.error ? (
                  <p className="mt-1 font-mono text-[0.72rem] break-words text-bad">
                    {result.error}
                  </p>
                ) : result.passed ? null : (
                  <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 font-mono text-[0.72rem]">
                    <dt className="text-muted">expected</dt>
                    <dd className="overflow-x-auto whitespace-pre text-good">
                      {result.expected}
                    </dd>
                    <dt className="text-muted">got</dt>
                    <dd className="overflow-x-auto whitespace-pre text-bad">
                      {result.got ?? "—"}
                    </dd>
                  </dl>
                )}

                {result.logs.length > 0 ? (
                  <pre className="mt-1.5 overflow-x-auto rounded-md bg-code px-2 py-1.5 font-mono text-[0.7rem] leading-relaxed text-muted">
                    {result.logs.join("\n")}
                  </pre>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

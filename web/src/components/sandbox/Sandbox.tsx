"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  Check,
  Play,
  ArrowCounterClockwise as RotateCcw,
  Terminal as TerminalSquare,
  X,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useRunner } from "@/components/sandbox/useRunner";
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";
import {
  LANG_LABEL,
  type CaseResult,
  type SandboxCase,
  type SandboxLang,
  type SandboxSpec,
} from "@/components/sandbox/types";
import { pretty } from "@/lib/sandbox/compare";
import { InsightPanel } from "@/components/insight/InsightPanel";
import { resolveInsight } from "@/lib/insight/resolveInsight";
import type { ExtractedComplexity } from "@/lib/insight/extractComplexity";
import { useCoachOptional } from "@/components/coach/CoachProvider";

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
      <div className="h-full min-h-40 animate-pulse border-t border-border bg-code" />
    ),
  },
);

function draftKey(id: string, lang: SandboxLang): string {
  return `dsa:sandbox:${id}:${lang}`;
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="my-6 rounded-[length:var(--radius-md)] border border-bad/40 bg-bad/5 p-3 text-sm text-muted">
      {message}
    </div>
  );
}

export function Sandbox({
  source,
  onSolved,
  variant = "card",
  moduleSlug,
  extractedComplexity = null,
}: {
  source: string;
  onSolved?: () => void;
  /** `card` is the course-lesson embed; `ide` fills the `/problems` workspace. */
  variant?: "card" | "ide";
  /** Module for cheatsheet pattern / complexity fallbacks (IDE Insight). */
  moduleSlug?: string;
  extractedComplexity?: ExtractedComplexity | null;
}) {
  const spec = useMemo(() => parseSandboxSpec(source), [source]);
  if (!spec) return <ErrorCard message="Invalid sandbox block." />;
  return (
    <SandboxBody
      spec={spec}
      onSolved={onSolved}
      variant={variant}
      moduleSlug={moduleSlug}
      extractedComplexity={extractedComplexity}
    />
  );
}

function SandboxBody({
  spec,
  onSolved,
  variant,
  moduleSlug,
  extractedComplexity,
}: {
  spec: SandboxSpec;
  onSolved?: () => void;
  variant: "card" | "ide";
  moduleSlug?: string;
  extractedComplexity: ExtractedComplexity | null;
}) {
  const [lang, setLang] = useState<SandboxLang>("python");
  const [drafts, setDrafts] = useState<Record<SandboxLang, string>>({
    python: spec.starter.python,
    javascript: spec.starter.javascript,
  });
  const { state, run, reset } = useRunner(spec);
  const coach = useCoachOptional();
  const lastRunSig = useRef("");

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

  // A side effect synchronized to derived state, not a write during
  // render — the standard React idiom for "call this once when a value
  // transitions," and safe under Strict Mode's dev-only double-invoke.
  useEffect(() => {
    if (allPassed) onSolved?.();
  }, [allPassed, onSolved]);

  useEffect(() => {
    coach?.setSource(lang, drafts[lang]);
  }, [coach, lang, drafts]);

  useEffect(() => {
    if (!coach) return;
    if (state.status === "done") {
      const sig = `done:${state.results.map((r) => `${r.passed}:${r.got}`).join("|")}`;
      if (sig === lastRunSig.current) return;
      lastRunSig.current = sig;
      coach.reportRun({
        results: state.results,
        fatal: null,
        property: Boolean(spec.property),
      });
    } else if (state.status === "failed") {
      const sig = `failed:${state.message}`;
      if (sig === lastRunSig.current) return;
      lastRunSig.current = sig;
      coach.reportRun({
        results: null,
        fatal: state.message,
        property: Boolean(spec.property),
      });
    }
  }, [coach, state, spec.property]);

  const toolbar = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 px-3 py-2",
        variant === "ide" ? "border-b border-border bg-code" : "",
      )}
    >
      {variant === "card" ? (
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          <TerminalSquare size={13} aria-hidden />
          Your turn
        </span>
      ) : null}

      <div className="code-surface-tabs inline-flex">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => {
              setLang(l);
              reset();
            }}
            aria-pressed={lang === l}
            data-active={lang === l ? "true" : "false"}
            className="code-tab font-mono"
          >
            {LANG_LABEL[l]}
          </button>
        ))}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={restoreStarter}
          title="Restore the starter code"
          className="inline-flex h-11 items-center gap-1.5 rounded-[length:var(--radius-md)] px-2 text-[0.7rem] text-muted transition-colors hover:bg-code hover:text-foreground"
        >
          <RotateCcw size={12} aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={() => run(lang, drafts[lang])}
          disabled={busy}
          className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-[length:var(--radius-md)] bg-pop px-3 text-[0.72rem] font-semibold text-on-pop transition-opacity hover:opacity-90 disabled:opacity-55"
        >
          <Play size={12} aria-hidden />
          {state.status === "booting"
            ? "Starting Python…"
            : state.status === "running"
              ? "Running…"
              : "Run"}
        </button>
      </div>
    </div>
  );

  const statusBanner = (
    <div aria-live="polite">
      {state.status === "booting" && lang === "python" ? (
        <p className="px-3.5 py-2 text-[0.72rem] text-muted">
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
    </div>
  );

  if (variant === "ide") {
    return (
      <IdeWorkspace
        toolbar={toolbar}
        statusBanner={statusBanner}
        drafts={drafts}
        lang={lang}
        setDraft={setDraft}
        spec={spec}
        results={results}
        passed={passed}
        total={total}
        busy={busy}
        failed={state.status === "failed"}
        allPassed={allPassed}
        moduleSlug={moduleSlug}
        extractedComplexity={extractedComplexity}
      />
    );
  }

  return (
    <div
      className={cn(
        "print:hidden my-7 overflow-hidden rounded-[length:var(--radius-lg)] border bg-surface/30 shadow-elevation transition-colors",
        allPassed ? "border-good/40" : "border-border",
      )}
    >
      {toolbar}

      <div className="border-y border-border bg-code">
        <div className="code-body p-0">
          <CodeEditor
            value={drafts[lang]}
            onChange={setDraft}
            lang={lang}
            ariaLabel={`${LANG_LABEL[lang]} solution editor`}
          />
        </div>
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

        {results ? (
          <CardResults results={results} passed={passed} total={total} />
        ) : null}
      </div>
    </div>
  );
}

const RESULTS_OPEN_KEY = "dsa:ide:results-open";
const RESULTS_TAB_KEY = "dsa:ide:results-tab";

type ResultsTab = "insight" | "tests" | "console";

const RESULTS_TABS: ResultsTab[] = ["insight", "tests", "console"];

function IdeWorkspace({
  toolbar,
  statusBanner,
  drafts,
  lang,
  setDraft,
  spec,
  results,
  passed,
  total,
  busy,
  failed,
  allPassed,
  moduleSlug,
  extractedComplexity,
}: {
  toolbar: ReactNode;
  statusBanner: ReactNode;
  drafts: Record<SandboxLang, string>;
  lang: SandboxLang;
  setDraft: (next: string) => void;
  spec: SandboxSpec;
  results: CaseResult[] | null;
  passed: number;
  total: number;
  busy: boolean;
  failed: boolean;
  allPassed: boolean;
  moduleSlug?: string;
  extractedComplexity: ExtractedComplexity | null;
}) {
  const [activeCase, setActiveCase] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsTab, setResultsTab] = useState<ResultsTab>("tests");
  const resultsPanelId = useId();
  const testCase = spec.cases[activeCase];
  const caseResult = results?.[activeCase] ?? null;

  useEffect(() => {
    try {
      setResultsOpen(window.localStorage.getItem(RESULTS_OPEN_KEY) === "1");
      const tab = window.localStorage.getItem(RESULTS_TAB_KEY);
      if (tab === "insight" || tab === "tests" || tab === "console") {
        setResultsTab(tab);
      }
    } catch {
      /* private mode */
    }
  }, []);

  const persistResultsOpen = useCallback((open: boolean) => {
    setResultsOpen(open);
    try {
      window.localStorage.setItem(RESULTS_OPEN_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const persistResultsTab = useCallback((tab: ResultsTab) => {
    setResultsTab(tab);
    try {
      window.localStorage.setItem(RESULTS_TAB_KEY, tab);
    } catch {
      /* ignore */
    }
  }, []);

  const selectResultsTab = useCallback(
    (tab: ResultsTab) => {
      if (resultsOpen && resultsTab === tab) {
        persistResultsOpen(false);
        return;
      }
      persistResultsTab(tab);
      persistResultsOpen(true);
    },
    [persistResultsOpen, persistResultsTab, resultsOpen, resultsTab],
  );

  useEffect(() => {
    if (results === null && !failed) return;
    persistResultsTab("tests");
  }, [failed, persistResultsTab, results]);

  useEffect(() => {
    if (!results) return;
    const firstFail = results.findIndex((r) => !r.passed);
    if (firstFail >= 0) setActiveCase(firstFail);
  }, [results]);

  const logCount = useMemo(
    () => results?.reduce((sum, r) => sum + r.logs.length, 0) ?? 0,
    [results],
  );

  const insight = useMemo(
    () =>
      resolveInsight({
        spec,
        moduleSlug: moduleSlug ?? "",
        extractedComplexity,
        testCase,
        caseIndex: activeCase,
        result: caseResult,
      }),
    [spec, moduleSlug, extractedComplexity, testCase, activeCase, caseResult],
  );

  const editor = (
    <div className="flex h-full min-h-0 flex-col bg-code">
      <div className="code-body min-h-0 flex-1 overflow-hidden p-0">
        <CodeEditor
          value={drafts[lang]}
          onChange={setDraft}
          lang={lang}
          height="100%"
          ariaLabel={`${LANG_LABEL[lang]} solution editor`}
        />
      </div>
    </div>
  );

  const resultsBody = (
    // bg-elevated, not bg-surface: the result card inside is already
    // bg-elevated, so the recessed panel behind it read as two unrelated
    // greys stacked with a visible seam. Same tone now — the card's own
    // border is what separates it, not a colour step.
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      {statusBanner}
      <CoachFailBanner />
      <div
        role="tabpanel"
        id={`${resultsPanelId}-insight`}
        aria-labelledby={`${resultsPanelId}-tab-insight`}
        hidden={resultsTab !== "insight"}
        className={cn(
          "min-h-0 flex-1",
          resultsTab === "insight" ? "flex flex-col" : "hidden",
        )}
      >
        <InsightPanel insight={insight} embedded />
      </div>
      <div
        role="tabpanel"
        id={`${resultsPanelId}-tests`}
        aria-labelledby={`${resultsPanelId}-tab-tests`}
        hidden={resultsTab !== "tests"}
        className={cn(
          "min-h-0 flex-1",
          resultsTab === "tests" ? "flex flex-col" : "hidden",
        )}
      >
        <IdeTestcases
          spec={spec}
          results={results}
          active={activeCase}
          onActiveChange={setActiveCase}
        />
      </div>
      <div
        role="tabpanel"
        id={`${resultsPanelId}-console`}
        aria-labelledby={`${resultsPanelId}-tab-console`}
        hidden={resultsTab !== "console"}
        className={cn(
          "min-h-0 flex-1",
          resultsTab === "console" ? "flex flex-col" : "hidden",
        )}
      >
        <IdeConsole results={results} />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "print:hidden flex h-full min-h-0 flex-col bg-background",
        allPassed ? "ring-1 ring-inset ring-good/40" : "",
      )}
    >
      {toolbar}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">{editor}</div>
        <div
          id={resultsPanelId}
          hidden={!resultsOpen}
          className={cn(
            "min-h-0 shrink-0 overflow-hidden border-t border-border",
            // max-h, not h: a two-line "Case failed" result was being force-
            // stretched to fill a fixed 38vh/22rem panel regardless of how
            // little content it held, which is the cavernous-empty-space
            // look this replaces. Content now sizes itself and only reaches
            // (then scrolls at) the old cap once it's actually that tall —
            // Console output or a long Insight writeup, not a short result.
            resultsOpen ? "flex max-h-[min(38vh,22rem)] flex-col" : "hidden",
          )}
        >
          {resultsBody}
        </div>
      </div>
      <ResultsRail
        resultsPanelId={resultsPanelId}
        resultsOpen={resultsOpen}
        resultsTab={resultsTab}
        onSelectTab={selectResultsTab}
        onToggle={() => persistResultsOpen(!resultsOpen)}
        busy={busy}
        failed={failed}
        passed={passed}
        total={total}
        allPassed={allPassed}
        ran={results !== null}
        logCount={logCount}
      />
    </div>
  );
}

function railStatus(
  busy: boolean,
  failed: boolean,
  ran: boolean,
  passed: number,
  total: number,
  allPassed: boolean,
): { text: string; tone: "good" | "bad" | "muted" } {
  if (busy) return { text: "Running…", tone: "muted" };
  if (failed) return { text: "Could not run", tone: "bad" };
  if (!ran) return { text: `${total} tests waiting`, tone: "muted" };
  if (allPassed) return { text: `All ${total} tests passed`, tone: "good" };
  return { text: `${passed} of ${total} tests passed`, tone: "bad" };
}

function ResultsRail({
  resultsPanelId,
  resultsOpen,
  resultsTab,
  onSelectTab,
  onToggle,
  busy,
  failed,
  passed,
  total,
  allPassed,
  ran,
  logCount,
}: {
  resultsPanelId: string;
  resultsOpen: boolean;
  resultsTab: ResultsTab;
  onSelectTab: (tab: ResultsTab) => void;
  onToggle: () => void;
  busy: boolean;
  failed: boolean;
  passed: number;
  total: number;
  allPassed: boolean;
  ran: boolean;
  logCount: number;
}) {
  const status = railStatus(busy, failed, ran, passed, total, allPassed);

  return (
    <div className="flex min-h-11 shrink-0 items-stretch border-t border-border bg-elevated">
      <div
        role="tablist"
        aria-label="Insight, tests, and console"
        className="flex items-stretch"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const i = RESULTS_TABS.indexOf(resultsTab);
          const delta = e.key === "ArrowRight" ? 1 : -1;
          onSelectTab(
            RESULTS_TABS[(i + delta + RESULTS_TABS.length) % RESULTS_TABS.length],
          );
        }}
      >
        {(
          [
            ["insight", "Insight"],
            ["tests", "Tests"],
            ["console", "Console"],
          ] as const
        ).map(([id, label]) => {
          const selected = resultsOpen && resultsTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${resultsPanelId}-tab-${id}`}
              aria-selected={selected}
              aria-controls={`${resultsPanelId}-${id}`}
              tabIndex={
                selected || (!resultsOpen && id === resultsTab) ? 0 : -1
              }
              onClick={() => onSelectTab(id)}
              className={cn(
                // Underline indicator on the TOP edge, not the bottom: this
                // bar sits below the content it controls (editor, then
                // results, then this tab strip), so the indicator points up
                // toward what it owns instead of down into nothing — the
                // mirror image of TabList's bottom rule, for the same reason.
                "relative inline-flex min-h-11 items-center gap-1.5 px-3.5 text-[0.75rem] font-medium transition-colors motion-reduce:transition-none",
                "after:absolute after:inset-x-2 after:-top-px after:h-[2px] after:rounded-full after:transition-colors after:duration-[var(--dur-fast)] after:content-['']",
                selected
                  ? "text-foreground after:bg-pop"
                  : "text-muted after:bg-transparent hover:text-foreground hover:after:bg-border",
              )}
            >
              {label}
              {id === "tests" ? (
                <span
                  className={cn(
                    "rounded-[length:var(--radius-xs)] px-1.5 font-mono text-[0.65rem] font-semibold",
                    // Real pass/fail colour regardless of selection now —
                    // there's no more filled tab background to contrast
                    // against, so the count reads its own status colour on
                    // the shared bg-elevated surface in both states.
                    ran && allPassed
                      ? "text-good"
                      : ran
                        ? "text-bad"
                        : "text-muted",
                  )}
                >
                  {ran ? `${passed}/${total}` : total}
                </span>
              ) : null}
              {id === "console" && logCount > 0 ? (
                <span className="rounded-[length:var(--radius-xs)] px-1.5 font-mono text-[0.65rem] font-semibold text-muted">
                  {logCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p
        className={cn(
          "flex min-w-0 flex-1 items-center px-3 text-[0.75rem]",
          status.tone === "good"
            ? "text-good"
            : status.tone === "bad"
              ? "text-bad"
              : "text-muted",
        )}
      >
        {status.text}
      </p>
      <button
        type="button"
        aria-expanded={resultsOpen}
        aria-controls={resultsPanelId}
        aria-label={resultsOpen ? "Collapse panel" : "Expand panel"}
        onClick={onToggle}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        {resultsOpen ? (
          <CaretDown size={14} weight="bold" aria-hidden />
        ) : (
          <CaretUp size={14} weight="bold" aria-hidden />
        )}
      </button>
    </div>
  );
}

function CoachFailBanner() {
  const coach = useCoachOptional();
  if (!coach?.diagnosis || coach.diagnosis.status === "all-passed") return null;
  const caseLabel =
    coach.diagnosis.caseName ??
    (coach.diagnosis.firstFailIndex !== null
      ? `Case ${coach.diagnosis.firstFailIndex + 1}`
      : "A case");
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border bg-info-surface px-3 py-2",
        // Redundant once the coach panel is already floating over this
        // workspace — the diagnosis is already on screen. Only at lg: though:
        // `open` is a desktop-panel concept and can be stale from a past
        // session, but on mobile the coach lives behind its own tab, so this
        // banner is still the only thing telling a mobile learner it exists.
        coach.open && "lg:hidden",
      )}
    >
      <p className="min-w-0 text-xs text-info">
        {caseLabel} failed — Coach has a diagnosis.
      </p>
      <button
        type="button"
        onClick={coach.openCoach}
        className="min-h-11 shrink-0 rounded-[length:var(--radius-md)] px-2 text-xs font-medium text-mark hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Open coach
      </button>
    </div>
  );
}

function caseInputLabel(testCase: SandboxCase): string {
  if (testCase.name) return testCase.name;
  if (testCase.construct !== undefined) {
    return `construct=${pretty(testCase.construct, 120)}`;
  }
  return pretty(testCase.args, 160);
}

function caseExpectedLabel(spec: SandboxSpec, testCase: SandboxCase): string {
  if (spec.property) return spec.property;
  if (testCase.ops) {
    return `${testCase.ops.length} operations`;
  }
  return pretty(testCase.expect, 160);
}

function IdeTestcases({
  spec,
  results,
  active,
  onActiveChange,
}: {
  spec: SandboxSpec;
  results: CaseResult[] | null;
  active: number;
  onActiveChange: (index: number) => void;
}) {
  const testCase = spec.cases[active];
  const result = results?.[active] ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Test cases"
        className="flex flex-wrap gap-1.5 border-b border-border/60 px-3 py-2"
      >
        {spec.cases.map((_, i) => {
          const r = results?.[i];
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => onActiveChange(i)}
              className={cn(
                // Fill reflects pass/fail — always, selected or not. It used
                // to be bg-pop (the family accent) whenever selected, which
                // for a green/teal family made a FAILING selected case look
                // identical to a passing one; ring, not fill, now marks
                // "this is the one you're viewing", so status stays legible
                // regardless of which case is open.
                "rounded-[length:var(--radius-md)] px-2.5 py-1 font-mono text-[0.7rem] font-medium transition-colors",
                r
                  ? r.passed
                    ? "bg-good/15 text-good"
                    : "bg-bad/15 text-bad"
                  : "text-muted hover:bg-surface hover:text-foreground",
                active === i ? "ring-2 ring-inset ring-pop" : "",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {r ? (
                  r.passed ? (
                    <Check
                      size={10}
                      weight="bold"
                      className="text-good"
                      aria-hidden
                    />
                  ) : (
                    <X
                      size={10}
                      weight="bold"
                      className="text-bad"
                      aria-hidden
                    />
                  )
                ) : null}
                Case {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {!testCase ? null : (
          // No card/border here on purpose: this panel and the card used to
          // be different surfaces (bg-surface vs bg-elevated), so the box
          // was what showed the result sitting on top of the panel. They're
          // the same surface now — a border enclosing content that's
          // identical to its background draws a box around nothing.
          <div>
            {result ? (
              <p
                className={cn(
                  "mb-3 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide uppercase",
                  result.passed ? "text-good" : "text-bad",
                )}
              >
                {result.passed ? (
                  <Check size={12} weight="bold" aria-hidden />
                ) : (
                  <X size={12} weight="bold" aria-hidden />
                )}
                {result.passed ? "Passed" : "Failed"}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 font-mono text-[0.75rem]">
              <div>
                <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-muted uppercase">
                  Input
                </p>
                <p className="overflow-x-auto whitespace-pre text-foreground">
                  {caseInputLabel(testCase)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-muted uppercase">
                  Expected
                </p>
                <p className="overflow-x-auto whitespace-pre text-good">
                  {result?.expected ?? caseExpectedLabel(spec, testCase)}
                </p>
              </div>
              {result ? (
                <div>
                  <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-muted uppercase">
                    Your output
                  </p>
                  <p
                    className={cn(
                      "overflow-x-auto whitespace-pre",
                      result.passed ? "text-good" : "text-bad",
                    )}
                  >
                    {result.error ?? result.got ?? "—"}
                  </p>
                </div>
              ) : null}
            </div>

            {result?.logs.length ? (
              <pre className="mt-3 overflow-x-auto rounded-[length:var(--radius-sm)] bg-code px-2 py-1.5 font-mono text-[0.7rem] leading-relaxed text-muted">
                {result.logs.join("\n")}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * All print()/console.log() output from the last run, in case order. Each
 * case already carries its own `.logs` (shown inline under that case in
 * Tests) — this just gives the whole run's output one continuous place to
 * read, so output from a passing case isn't buried behind a click.
 */
function IdeConsole({ results }: { results: CaseResult[] | null }) {
  const withLogs = (results ?? []).filter((r) => r.logs.length > 0);

  if (withLogs.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center">
        <p className="text-[0.75rem] text-muted">
          {results === null
            ? "Run your code to see print()/console.log() output here."
            : "No output. Add a print() or console.log() to see it here."}
        </p>
      </div>
    );
  }

  // A case label only earns its place when there's more than one source to
  // tell apart — one case's output doesn't need "Case 1" repeated above it.
  const labelCases = withLogs.length > 1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      <div className="flex flex-col gap-3 font-mono text-[0.75rem] leading-relaxed">
        {withLogs.map((r) => (
          <div key={r.index}>
            {labelCases ? (
              <p className="mb-1 text-muted">Case {r.index + 1}</p>
            ) : null}
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-foreground">
              {r.logs.join("\n")}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardResults({
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
      <div
        className={cn(
          // Halftone stays on raised panels only — a printed receipt, not a
          // page-wide texture. That containment is what made the quieted
          // version readable.
          "press-halftone flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5",
          allPassed ? "bg-good/8" : "bg-surface/50",
        )}
      >
        {allPassed ? <span className="press-stamp mr-1">Solved</span> : null}
        <span
          className={cn(
            "font-mono text-[0.75rem] font-semibold",
            allPassed ? "text-good" : "text-foreground",
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
                  result.passed ? "bg-good/15 text-good" : "bg-bad/15 text-bad",
                )}
              >
                {result.passed ? (
                  <Check size={10} weight="bold" aria-hidden />
                ) : (
                  <X size={10} weight="bold" aria-hidden />
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
                  <pre className="mt-1.5 overflow-x-auto rounded-[length:var(--radius-sm)] bg-code px-2 py-1.5 font-mono text-[0.7rem] leading-relaxed text-muted">
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

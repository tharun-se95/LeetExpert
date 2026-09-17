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
  Lightbulb,
  ListChecks,
  Play,
  ArrowCounterClockwise as RotateCcw,
  Terminal as TerminalSquare,
  X,
  CaretUp,
  CaretDown,
  type Icon,
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
import { LanguageMark } from "@/components/kit/languageMarks";
import { sandboxLangFor, useCodeLang } from "@/lib/codeLang";

const LANGS: SandboxLang[] = ["python", "javascript"];

/**
 * CodeMirror is pulled in only where a sandbox actually renders — the ~185
 * lessons without one never download it. `ssr: false` because CodeMirror
 * measures the DOM on construction and has nothing to render server-side.
 */
const CodeEditor = dynamic(
  () => import("@/components/kit/CodeEditor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-40 animate-pulse border-t border-border bg-code-editor" />
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
  embedded = false,
}: {
  source: string;
  onSolved?: () => void;
  /** `card` is the course-lesson embed; `ide` fills the `/problems` workspace. */
  variant?: "card" | "ide";
  /** Module for cheatsheet pattern / complexity fallbacks (IDE Insight). */
  moduleSlug?: string;
  extractedComplexity?: ExtractedComplexity | null;
  /** `card` variant only: drop the outer margin/border/rounding/shadow —
   *  for a caller that's already inside its own surface (same convention
   *  as `Viz`'s `embedded` prop). */
  embedded?: boolean;
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
      embedded={embedded}
    />
  );
}

function SandboxBody({
  spec,
  onSolved,
  variant,
  moduleSlug,
  extractedComplexity,
  embedded = false,
}: {
  spec: SandboxSpec;
  onSolved?: () => void;
  variant: "card" | "ide";
  moduleSlug?: string;
  extractedComplexity: ExtractedComplexity | null;
  embedded?: boolean;
}) {
  // The header's global switch picks the language (lib/codeLang.ts).
  const [codeLang] = useCodeLang();
  const lang = sandboxLangFor(codeLang);
  const [drafts, setDrafts] = useState<Record<SandboxLang, string>>({
    python: spec.starter.python,
    javascript: spec.starter.javascript,
  });
  const { state, run, reset } = useRunner(spec);
  // A switch mid-run cancels the run and clears results for the old
  // language, exactly as the per-sandbox tab used to. Drafts are stored per
  // language, so nothing typed is lost.
  const shownLang = useRef(lang);
  useEffect(() => {
    if (shownLang.current === lang) return;
    shownLang.current = lang;
    reset();
  }, [lang, reset]);
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
        "flex flex-wrap items-center gap-3 px-3",
        // Chrome, not canvas. The toolbar used to be bg-code — the same
        // surface as the editor below it — so the tabs and Run floated on
        // the very slab you type into, separated only by a hairline. An
        // elevated strip over the recessed code well is the distinction
        // every desktop editor draws, and shadow-edge-bottom is how a
        // one-sided lift is spelled here.
        variant === "ide"
          ? "shadow-edge-bottom border-b border-border bg-elevated"
          : "py-2",
      )}
    >
      {variant === "card" ? (
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-muted uppercase">
          <TerminalSquare size={13} aria-hidden />
          Your turn
        </span>
      ) : null}

      {/*
        The header's global switch picks the language; this only says which
        one the editor holds, so nobody runs code wondering. It sits on the
        toolbar's own paper, not the code canvas, so --muted is the right ink.
      */}
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] font-semibold text-muted">
        <LanguageMark language={lang} />
        {LANG_LABEL[lang]}
      </span>

      {/*
        Full toolbar height (self-stretch on the wrapper, no fixed h-11 on the
        buttons) and -mr-3 to reach the bar's true right edge. Reset and Run
        used to float as separate soft-cornered pills at a slightly shorter
        height than the bar itself — the one part of this toolbar that read
        as bolted-on UI rather than chrome. Square corners here are not an
        oversight: a soft-cornered pill flush against the bar's straight
        top/bottom edges would notch its own corners against them, which is
        what "resize it properly" was actually pointing at more than the
        literal button dimensions.
      */}
      <div
        className={cn(
          "ml-auto flex shrink-0",
          variant === "ide"
            ? "-mr-3 self-stretch items-stretch gap-0"
            : "items-center gap-1",
        )}
      >
        <button
          type="button"
          onClick={restoreStarter}
          title="Restore the starter code"
          className={cn(
            "inline-flex items-center gap-1.5 text-muted transition-colors hover:bg-code hover:text-foreground",
            variant === "ide"
              ? "px-3 text-[0.75rem]"
              : "h-11 rounded-[length:var(--radius-md)] px-2 text-[0.7rem]",
          )}
        >
          <RotateCcw size={variant === "ide" ? 14 : 12} aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={() => run(lang, drafts[lang])}
          disabled={busy}
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap bg-pop font-semibold text-on-pop transition-opacity hover:opacity-90 disabled:opacity-55",
            variant === "ide"
              ? "px-4 text-[0.78rem]"
              : "h-11 rounded-[length:var(--radius-md)] px-3 text-[0.72rem]",
          )}
        >
          <Play size={variant === "ide" ? 14 : 12} aria-hidden />
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
        "print:hidden overflow-hidden bg-surface/30 transition-colors",
        embedded
          ? "border-t border-border"
          : "my-7 rounded-[length:var(--radius-lg)] border shadow-elevation",
        !embedded && (allPassed ? "border-good/40" : "border-border"),
      )}
    >
      {toolbar}

      <div className="border-y border-code-editor-border bg-code-editor">
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

/**
 * Lightbulb for Insight even though "tip" callouts elsewhere use the same
 * glyph — the two never share a surface (one is inline lesson prose, this
 * is the results rail), and "a flash of understanding" is the plain-English
 * reading of "insight" either way. ListChecks/Terminal both reuse an icon
 * this file already shows elsewhere for the identical idea (Tests' pass
 * marks, the console's own empty-state mark) rather than inventing a
 * second symbol for the same thing.
 */
const RESULTS_TAB_ICON: Record<ResultsTab, Icon> = {
  insight: Lightbulb,
  tests: ListChecks,
  console: TerminalSquare,
};

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
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
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
    <div className="flex h-full min-h-0 flex-col bg-code-editor">
      <div className="code-body min-h-0 flex-1 overflow-hidden p-0">
        <CodeEditor
          value={drafts[lang]}
          onChange={setDraft}
          lang={lang}
          height="100%"
          ariaLabel={`${LANG_LABEL[lang]} solution editor`}
          onCursorChange={setCursor}
        />
      </div>
      {/*
        The strip every desktop editor puts under the buffer. Indent width
        is not filler here: this course teaches Python, where mixing 4 and 2
        spaces is a bug rather than a style nit, and the editor silently
        switches indentUnit with the language.
      */}
      <div className="flex shrink-0 items-center gap-3 border-t border-code-editor-border bg-code-editor px-3 py-1 font-mono text-[0.65rem] text-[color:var(--tok-comment)]">
        <span className="tabular-nums">
          Ln {cursor.line}, Col {cursor.col}
        </span>
        <span className="ml-auto">{LANG_LABEL[lang]}</span>
        <span className="tabular-nums">
          Spaces: {lang === "python" ? 4 : 2}
        </span>
      </div>
    </div>
  );

  const resultsBody = (
    // bg-code-editor, matching the editor pane above it: Insight, Tests, and
    // Console are all reading/reasoning about the code you just wrote, not
    // page chrome, so they share the code well's (theme-inverted) surface
    // and --tok-* ink rather than page tokens, which don't have guaranteed
    // contrast against it (same reasoning as .code-lang-label in globals.css).
    <div className="flex h-full min-h-0 flex-col bg-code-editor">
      {statusBanner}
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
        <IdeConsole
          results={results}
          active={activeCase}
          onActiveChange={setActiveCase}
        />
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
            "min-h-0 shrink-0 overflow-hidden border-t border-code-editor-border",
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
    <div className="flex min-h-11 shrink-0 items-stretch border-t border-code-editor-border bg-code-editor">
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
          const RailIcon = RESULTS_TAB_ICON[id];
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
                // --tok-keyword/--tok-name, not --pop/--foreground: a
                // family/site accent isn't guaranteed visible against a well
                // whose brightness doesn't track the page theme (same
                // reasoning as the CodeMirror caret in editorTheme.ts).
                selected
                  ? "text-[color:var(--tok-name)] after:bg-[var(--tok-keyword)]"
                  : "text-[color:var(--tok-comment)] after:bg-transparent hover:text-[color:var(--tok-name)] hover:after:bg-code-editor-border",
              )}
            >
              <RailIcon
                className="h-3.5 w-3.5 shrink-0"
                weight={selected ? "fill" : undefined}
                aria-hidden
              />
              {label}
              {id === "tests" ? (
                <span
                  className={cn(
                    "rounded-[length:var(--radius-xs)] px-1.5 font-mono text-[0.65rem] font-semibold",
                    // Real pass/fail colour regardless of selection now —
                    // there's no more filled tab background to contrast
                    // against, so the count reads its own status colour on
                    // the shared bg-code-editor surface in both states.
                    ran && allPassed
                      ? "text-[color:var(--tok-string)]"
                      : ran
                        ? "text-[color:var(--tok-invalid)]"
                        : "text-[color:var(--tok-comment)]",
                  )}
                >
                  {ran ? `${passed}/${total}` : total}
                </span>
              ) : null}
              {id === "console" && logCount > 0 ? (
                <span className="rounded-[length:var(--radius-xs)] px-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--tok-comment)]">
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
            ? "text-[color:var(--tok-string)]"
            : status.tone === "bad"
              ? "text-[color:var(--tok-invalid)]"
              : "text-[color:var(--tok-comment)]",
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
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[color:var(--tok-comment)] hover:bg-[var(--editor-active-line)] hover:text-[color:var(--tok-name)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--tok-keyword)]"
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
        className="flex flex-wrap gap-1.5 border-b border-code-editor-border px-3 py-2"
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
                    ? "bg-[color:var(--tok-string)]/15 text-[color:var(--tok-string)]"
                    : "bg-[color:var(--tok-invalid)]/15 text-[color:var(--tok-invalid)]"
                  : "text-[color:var(--tok-comment)] hover:bg-[var(--editor-active-line)] hover:text-[color:var(--tok-name)]",
                // ring-[--tok-keyword], not ring-pop: a family/site accent
                // isn't guaranteed visible against a well whose brightness
                // doesn't track the page theme (same reasoning as the
                // CodeMirror caret in editorTheme.ts).
                active === i
                  ? "ring-2 ring-inset ring-[color:var(--tok-keyword)]"
                  : "",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {r ? (
                  r.passed ? (
                    <Check
                      size={10}
                      weight="bold"
                      className="text-[color:var(--tok-string)]"
                      aria-hidden
                    />
                  ) : (
                    <X
                      size={10}
                      weight="bold"
                      className="text-[color:var(--tok-invalid)]"
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
                  result.passed
                    ? "text-[color:var(--tok-string)]"
                    : "text-[color:var(--tok-invalid)]",
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
                <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-[color:var(--tok-comment)] uppercase">
                  Input
                </p>
                <p className="overflow-x-auto whitespace-pre text-[color:var(--tok-name)]">
                  {caseInputLabel(testCase)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-[color:var(--tok-comment)] uppercase">
                  Expected
                </p>
                <p className="overflow-x-auto whitespace-pre text-[color:var(--tok-string)]">
                  {result?.expected ?? caseExpectedLabel(spec, testCase)}
                </p>
              </div>
              {result ? (
                <div>
                  <p className="mb-1 text-[0.65rem] font-medium tracking-wide text-[color:var(--tok-comment)] uppercase">
                    Your output
                  </p>
                  <p
                    className={cn(
                      "overflow-x-auto whitespace-pre",
                      result.passed
                        ? "text-[color:var(--tok-string)]"
                        : "text-[color:var(--tok-invalid)]",
                    )}
                  >
                    {result.error ?? result.got ?? "—"}
                  </p>
                </div>
              ) : null}
            </div>

            {result?.logs.length ? (
              <pre className="mt-3 overflow-x-auto rounded-[length:var(--radius-sm)] bg-code-editor px-2 py-1.5 font-mono text-[0.7rem] leading-relaxed text-[color:var(--tok-comment)]">
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
 * print()/console.log() output for ONE case at a time.
 *
 * Concatenating every case was unusable the moment a learner put a print
 * inside their main loop: cases mostly run the same path, so the wall was
 * near-identical output repeated per case, and reaching the failing case's
 * trace meant scrolling past all the passing ones.
 *
 * The selector shares `activeCase` with the Tests tab rather than keeping
 * its own: the panel then has ONE notion of "the case you're looking at",
 * so picking a case in Tests and flipping to Console lands on that case's
 * output instead of resetting.
 */
function IdeConsole({
  results,
  active,
  onActiveChange,
}: {
  results: CaseResult[] | null;
  active: number;
  onActiveChange: (index: number) => void;
}) {
  const withLogs = (results ?? []).filter((r) => r.logs.length > 0);

  if (withLogs.length === 0) {
    const neverRan = results === null;
    return (
      // The min-height belongs to the empty state, not the shared results
      // wrapper: that wrapper is deliberately content-sized so a two-line
      // test result no longer gets stretched into a cavernous panel. Only
      // this branch has nothing to size itself by, so only it asks for room.
      <div className="flex min-h-[9rem] flex-1 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--editor-active-line)] text-[color:var(--tok-comment)]"
        >
          <TerminalSquare size={16} />
        </span>
        <p className="text-[0.8rem] font-medium text-[color:var(--tok-name)]">
          {neverRan ? "No output yet" : "Nothing printed"}
        </p>
        <p className="max-w-[24rem] text-[0.75rem] leading-relaxed text-[color:var(--tok-comment)]">
          {neverRan
            ? "Run your code — anything you print() or console.log() lands here, grouped by case."
            : "Your code ran without printing anything. Add a print() or console.log() to trace what it is doing."}
        </p>
      </div>
    );
  }

  const all = results ?? [];
  const current = all[active] ?? all[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/*
        Only worth a selector when there's more than one case to choose
        between — a single-case run should just show its output.
      */}
      {all.length > 1 ? (
        <div
          role="tablist"
          aria-label="Console output by case"
          className="flex shrink-0 flex-wrap gap-1.5 border-b border-code-editor-border px-3 py-2"
        >
          {all.map((r, i) => (
            <button
              key={r.index}
              type="button"
              role="tab"
              aria-selected={active === i}
              onClick={() => onActiveChange(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] px-2.5 py-1 font-mono text-[0.7rem] font-medium transition-colors",
                active === i
                  ? "bg-[var(--editor-active-line)] text-[color:var(--tok-name)] ring-2 ring-inset ring-[color:var(--tok-keyword)]"
                  : "text-[color:var(--tok-comment)] hover:bg-[var(--editor-active-line)] hover:text-[color:var(--tok-name)]",
              )}
            >
              {/*
                A dot, not the Tests pills' full fill: pass/fail is that tab's
                job, and repeating its exact treatment here would suggest these
                chips do the same thing. This only needs to help you find the
                case worth reading.
              */}
              {!r.passed ? (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[color:var(--tok-invalid)]"
                  aria-hidden
                />
              ) : null}
              Case {r.index + 1}
              <span className="text-[color:var(--tok-comment)] tabular-nums">
                {r.logs.length}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {current && current.logs.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <pre className="overflow-x-auto font-mono text-[0.75rem] leading-relaxed whitespace-pre-wrap break-words text-[color:var(--tok-name)]">
            {current.logs.join("\n")}
          </pre>
          {current.logsDropped > 0 ? (
            <p className="mt-3 border-t border-code-editor-border pt-2 text-[0.7rem] text-[color:var(--tok-invalid)]">
              Output stopped after {current.logs.length} lines —{" "}
              {current.logsDropped.toLocaleString()} more were not captured.
              Narrow what you print, or print only on the case you care about.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-[6rem] flex-1 items-center justify-center px-6 text-center">
          <p className="text-[0.75rem] text-[color:var(--tok-comment)]">
            Case {(current?.index ?? 0) + 1} printed nothing.
          </p>
        </div>
      )}
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
                  <pre className="mt-1.5 overflow-x-auto rounded-[length:var(--radius-sm)] bg-code-editor px-2 py-1.5 font-mono text-[0.7rem] leading-relaxed text-[color:var(--tok-comment)]">
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

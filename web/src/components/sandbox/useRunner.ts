"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { matches, pretty, formatCall, canonical } from "@/lib/sandbox/compare";
import type {
  CaseOutcome,
  CaseResult,
  SandboxCase,
  SequenceOp,
  RunnerResponse,
  SandboxLang,
  SandboxSpec,
} from "@/components/sandbox/types";

const WORKER_URL: Record<SandboxLang, string> = {
  javascript: "/sandbox/js-runner.js",
  python: "/sandbox/py-runner.js",
};

/**
 * An op whose expected value is `null` is a command, not a question — `push`
 * and `pop` are called for their effect. Its return is deliberately NOT
 * compared: a `pop` that returns the popped value is a perfectly correct
 * implementation, and failing it would fail correct learners.
 */
function isChecked(op: SequenceOp): boolean {
  return op[2] !== null;
}

/** Only the ops that actually assert something take part in the comparison. */
function checkedReturns(
  ops: SequenceOp[],
  results: unknown[],
): { actual: unknown[]; expected: unknown[] } {
  const actual: unknown[] = [];
  const expected: unknown[] = [];
  ops.forEach((op, i) => {
    if (!isChecked(op)) return;
    actual.push(results[i]);
    expected.push(op[2]);
  });
  return { actual, expected };
}

/**
 * Labels a sequence case by the FIRST asserting operation whose return
 * diverged, so a learner is pointed at the exact call rather than a script.
 */
function sequenceLabel(
  clsName: string,
  testCase: SandboxCase,
  outcome: CaseOutcome,
): string {
  const ops = testCase.ops ?? [];
  const got = outcome.opResults ?? [];
  for (let i = 0; i < ops.length; i++) {
    const [method, args, want] = ops[i];
    if (!isChecked(ops[i])) continue;
    if (canonical(got[i]) !== canonical(want)) {
      return `${clsName}: op ${i + 1} — ${method}(${args.map((a) => canonical(a)).join(", ")})`;
    }
  }
  return `${clsName}: ${ops.filter(isChecked).length} assertions`;
}

export type RunState =
  | { status: "idle" }
  | { status: "booting" }
  | { status: "running" }
  | { status: "done"; results: CaseResult[] }
  | { status: "failed"; message: string };

/**
 * Owns one worker per language, its timeout, and the translation from raw
 * worker outcomes into pass/fail.
 *
 * The worker is recreated for every run. That is deliberate: a run that
 * times out is killed mid-execution, so its worker is left in an unknown
 * state and must not be reused. Recreating also guarantees no state leaks
 * between runs, which would otherwise let a global set on run 1 change the
 * result of run 2.
 */
export function useRunner(spec: SandboxSpec) {
  const [state, setState] = useState<RunState>({ status: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  const toResults = useCallback(
    (outcomes: CaseOutcome[], lang: SandboxLang): CaseResult[] =>
      outcomes.map((outcome) => {
        const testCase = spec.cases[outcome.index];

        let actual: unknown;
        let want: unknown = testCase.expect;
        if (spec.check === "sequence") {
          // Only the asserting ops are compared; see checkedReturns.
          const pair = checkedReturns(testCase.ops ?? [], outcome.opResults ?? []);
          actual = pair.actual;
          want = pair.expected;
        } else if (spec.check === "mutate") {
          actual = outcome.argAfter;
        } else if (spec.check === "prefix") {
          const k = typeof outcome.ret === "number" ? outcome.ret : NaN;
          actual = Array.isArray(outcome.argAfter)
            ? outcome.argAfter.slice(0, Number.isFinite(k) ? k : 0)
            : outcome.argAfter;
        } else {
          actual = outcome.ret;
        }

        return {
          index: outcome.index,
          name:
            testCase.name ??
            (spec.check === "sequence"
              ? sequenceLabel(spec.cls?.[lang] ?? "", testCase, outcome)
              : formatCall(spec.fn[lang], testCase.args)),
          passed: outcome.error === null && matches(actual, want, spec.compare),
          got: outcome.error === null ? pretty(actual) : null,
          expected: pretty(want),
          error: outcome.error,
          logs: outcome.logs,
        };
      }),
    [spec],
  );

  const run = useCallback(
    (lang: SandboxLang, source: string) => {
      teardown();
      setState({ status: lang === "python" ? "booting" : "running" });

      let worker: Worker;
      try {
        // Pyodide refuses to boot in a classic worker, so the Python runner
        // is an ES module worker. The JS runner stays classic — it has no
        // imports and gains nothing from module semantics.
        worker =
          lang === "python"
            ? new Worker(WORKER_URL[lang], { type: "module" })
            : new Worker(WORKER_URL[lang]);
      } catch (err) {
        setState({
          status: "failed",
          message: `Could not start the ${lang} runner: ${err instanceof Error ? err.message : String(err)}`,
        });
        return;
      }
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<RunnerResponse>) => {
        const data = event.data;
        if (data.kind === "ready") {
          // Python finished booting; the run itself is still in flight.
          setState((prev) =>
            prev.status === "booting" ? { status: "running" } : prev,
          );
          return;
        }
        teardown();
        if (data.kind === "fatal") {
          setState({ status: "failed", message: data.message });
          return;
        }
        setState({ status: "done", results: toResults(data.outcomes, lang) });
      };

      worker.onerror = (event) => {
        teardown();
        setState({
          status: "failed",
          message: event.message || "The runner crashed.",
        });
      };

      // The only reliable way to stop `while (true)`. Python gets extra
      // headroom because a cold Pyodide boot is genuinely slow.
      const budget = lang === "python" ? spec.timeoutMs + 20000 : spec.timeoutMs;
      timerRef.current = setTimeout(() => {
        teardown();
        setState({
          status: "failed",
          message: `Timed out after ${(budget / 1000).toFixed(0)}s — likely an infinite loop. The run was stopped.`,
        });
      }, budget);

      // Rewrite each op to the language's own method spelling, so the
      // worker never has to know about naming conventions.
      const cases =
        spec.check === "sequence"
          ? spec.cases.map((c) => ({
              ...c,
              ops: (c.ops ?? []).map(
                ([m, a, e]) =>
                  [spec.methods[m]?.[lang] ?? m, a, e] as SequenceOp,
              ),
            }))
          : spec.cases;

      worker.postMessage({
        source,
        roundtrip: spec.roundtrip?.[lang],
        fnName: spec.fn[lang],
        cases,
        arg: spec.arg,
        check: spec.check,
        shape: spec.shape,
        returns: spec.returns,
        cls: spec.cls?.[lang] ?? null,
      });
    },
    [spec, teardown, toResults],
  );

  const reset = useCallback(() => {
    teardown();
    setState({ status: "idle" });
  }, [teardown]);

  return { state, run, reset };
}

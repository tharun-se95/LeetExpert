"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { matches, pretty, formatCall, canonical } from "@/lib/sandbox/compare";
import { checkProperty } from "@/lib/sandbox/properties";
import {
  runnerBudgetMs,
  runnerTimeoutMessage,
  type RunnerTimeoutPhase,
} from "@/lib/sandbox/runnerTimeout";

/** What the "expected" column says when a property, not a value, is the bar. */
const PROPERTY_LABEL: Record<string, string> = {
  "bst-minus-key": "a valid BST without the key",
  "balanced-bst-of-nums": "a height-balanced BST with that inorder",
  "topological-order": "any order satisfying every prerequisite",
};
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

function bindWorker(
  worker: Worker,
  onMessage: (event: MessageEvent<RunnerResponse>) => void,
  onError: (event: ErrorEvent) => void,
) {
  worker.onmessage = onMessage;
  worker.onerror = onError;
}

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
 * Owns the worker, its timeout, and the translation from raw worker
 * outcomes into pass/fail.
 *
 * A timed-out or crashed worker is killed and must not be reused — it was
 * stopped mid-execution. JavaScript is cheap to recreate, so every JS run
 * gets a fresh worker (no leaked globals). Python keeps a worker that
 * finished cleanly: a cold Pyodide boot is tens of seconds, and charging
 * that to the case budget is what produced the false 23s "infinite loop".
 * Each Python exec still uses a fresh namespace inside the worker.
 */
export function useRunner(spec: SandboxSpec) {
  const [state, setState] = useState<RunState>({ status: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const workerLangRef = useRef<SandboxLang | null>(null);
  const pythonReadyRef = useRef(false);
  const phaseRef = useRef<RunnerTimeoutPhase | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    phaseRef.current = null;
  }, []);

  const teardown = useCallback(() => {
    clearTimer();
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    workerLangRef.current = null;
    pythonReadyRef.current = false;
  }, [clearTimer]);

  useEffect(() => teardown, [teardown]);

  const toResults = useCallback(
    (outcomes: CaseOutcome[], lang: SandboxLang): CaseResult[] =>
      outcomes.map((outcome) => {
        const testCase = spec.cases[outcome.index];

        let actual: unknown;
        let want: unknown = testCase.expect;
        if (spec.check === "sequence") {
          // Only the asserting ops are compared; see checkedReturns.
          const pair = checkedReturns(
            testCase.ops ?? [],
            outcome.opResults ?? [],
          );
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

        // A "deep copy" answer that reuses input nodes serialises exactly
        // like a correct one, so structural equality is necessary but not
        // sufficient — `aliased` is the worker's raw observation, judged here.
        const reusedInput =
          spec.returns === "graph" && outcome.aliased === true;

        // Problems with several correct answers are graded by a property of
        // the answer rather than by equality to one of them.
        const propertyFailure =
          spec.property && outcome.error === null
            ? checkProperty(spec.property, actual, testCase.args)
            : null;

        return {
          index: outcome.index,
          name:
            testCase.name ??
            (spec.check === "sequence"
              ? sequenceLabel(spec.cls?.[lang] ?? "", testCase, outcome)
              : formatCall(spec.fn[lang], testCase.args)),
          passed:
            outcome.error === null &&
            !reusedInput &&
            (spec.property
              ? propertyFailure === null
              : matches(actual, want, spec.compare)),
          got: outcome.error === null ? pretty(actual) : null,
          expected: spec.property
            ? (PROPERTY_LABEL[spec.property] ?? spec.property)
            : pretty(want),
          error:
            outcome.error ??
            propertyFailure ??
            (reusedInput
              ? "This returns the original graph, not a copy — the shape is right, but at least one node is the very same object."
              : null),
          logs: outcome.logs,
          logsDropped: outcome.logsDropped ?? 0,
        };
      }),
    [spec],
  );

  const armTimer = useCallback(
    (lang: SandboxLang, phase: RunnerTimeoutPhase) => {
      clearTimer();
      const budget = runnerBudgetMs(lang, spec.timeoutMs, phase);
      phaseRef.current = phase;
      timerRef.current = setTimeout(() => {
        const timedPhase = phaseRef.current ?? phase;
        teardown();
        setState({
          status: "failed",
          message: runnerTimeoutMessage(timedPhase, budget),
        });
      }, budget);
    },
    [clearTimer, spec.timeoutMs, teardown],
  );

  const run = useCallback(
    (lang: SandboxLang, source: string) => {
      const reusePython =
        lang === "python" &&
        workerRef.current !== null &&
        workerLangRef.current === "python";

      if (!reusePython) {
        teardown();
      } else {
        clearTimer();
      }

      const alreadyReady = reusePython && pythonReadyRef.current;
      setState({
        status: lang === "python" && !alreadyReady ? "booting" : "running",
      });

      let worker = reusePython ? workerRef.current : null;
      if (!worker) {
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
        workerLangRef.current = lang;
        pythonReadyRef.current = false;
      }

      bindWorker(
        worker,
        (event: MessageEvent<RunnerResponse>) => {
          const data = event.data;
          if (data.kind === "ready") {
            pythonReadyRef.current = true;
            // Boot is done; the case budget starts now, not when Run was clicked.
            if (phaseRef.current === "booting") {
              armTimer(lang, "running");
            }
            setState((prev) =>
              prev.status === "booting" ? { status: "running" } : prev,
            );
            return;
          }
          clearTimer();
          if (data.kind === "fatal") {
            teardown();
            setState({ status: "failed", message: data.message });
            return;
          }
          // JS is recreated next run. A clean Python finish keeps the runtime.
          if (lang !== "python") teardown();
          setState({ status: "done", results: toResults(data.outcomes, lang) });
        },
        (event) => {
          teardown();
          setState({
            status: "failed",
            message: event.message || "The runner crashed.",
          });
        },
      );

      armTimer(
        lang,
        lang === "python" && !alreadyReady ? "booting" : "running",
      );

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
    [armTimer, clearTimer, spec, teardown, toResults],
  );

  const reset = useCallback(() => {
    teardown();
    setState({ status: "idle" });
  }, [teardown]);

  return { state, run, reset };
}

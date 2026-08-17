import type { CaseResult } from "@/components/sandbox/types";
import type { Diagnosis, DiagnosisKind } from "./types";

export interface DiagnoseInput {
  results: CaseResult[] | null;
  fatal: string | null;
  hintCount: number;
  /** Failed runs this session, including the current one if it failed. */
  failCount: number;
  property: boolean;
}

const ALIASED = /original graph, not a copy/i;
const TIMEOUT = /timed out/i;

function nextHint(failCount: number, hintCount: number): number | null {
  if (hintCount <= 0 || failCount <= 0) return null;
  return Math.min(failCount, hintCount);
}

function hintClause(index: number | null): string {
  if (index === null) return "";
  return ` Open Hint ${index} on Explanation for the next authored nudge.`;
}

function classify(fail: CaseResult, property: boolean): DiagnosisKind {
  const err = fail.error ?? "";
  if (TIMEOUT.test(err)) return "timeout";
  if (ALIASED.test(err)) return "aliased";
  if (property) return "property";
  if (err) return "exception";
  return "wrong-value";
}

function failProse(fail: CaseResult, kind: DiagnosisKind, hint: number | null): string {
  const hintText = hintClause(hint);
  if (kind === "timeout") {
    return `${fail.name} timed out.${fail.error ? ` ${fail.error}` : ""}${hintText}`;
  }
  if (kind === "aliased" || kind === "exception" || kind === "property") {
    return `${fail.name} failed. ${fail.error ?? "The answer did not satisfy the property."}${hintText}`;
  }
  return `${fail.name} returned ${fail.got ?? "nothing"}; expected ${fail.expected}.${hintText}`;
}

export function diagnose(input: DiagnoseInput): Diagnosis {
  const hint = nextHint(input.failCount, input.hintCount);

  if (input.fatal) {
    return {
      status: "errored",
      kind: "fatal",
      firstFailIndex: null,
      caseName: null,
      got: null,
      expected: null,
      error: input.fatal,
      passed: 0,
      total: input.results?.length ?? 0,
      prose: `${input.fatal}${hintClause(hint)}`,
      nextHintIndex: hint,
    };
  }

  const results = input.results ?? [];
  if (results.length === 0) {
    return {
      status: "errored",
      kind: "fatal",
      firstFailIndex: null,
      caseName: null,
      got: null,
      expected: null,
      error: "The runner returned no case results.",
      passed: 0,
      total: 0,
      prose: `The runner returned no case results.${hintClause(hint)}`,
      nextHintIndex: hint,
    };
  }

  const firstFail = results.find((r) => !r.passed);
  const passed = results.filter((r) => r.passed).length;

  if (!firstFail) {
    return {
      status: "all-passed",
      kind: "all-passed",
      firstFailIndex: null,
      caseName: null,
      got: null,
      expected: null,
      error: null,
      passed,
      total: results.length,
      prose: `All ${results.length} cases passed. Ask about this lesson's bound or what to take from it — I still will not write the code.`,
      nextHintIndex: null,
    };
  }

  const kind = classify(firstFail, input.property);
  return {
    status: "failed",
    kind,
    firstFailIndex: firstFail.index,
    caseName: firstFail.name,
    got: firstFail.got,
    expected: firstFail.expected,
    error: firstFail.error,
    passed,
    total: results.length,
    prose: failProse(firstFail, kind, hint),
    nextHintIndex: hint,
  };
}

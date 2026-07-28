/** Shared contract between the sandbox UI and the two runner workers. */

import type { CompareMode } from "@/lib/sandbox/compare";

export type { CompareMode };

/**
 * The lessons *teach* in Python and TypeScript, but the sandbox *runs*
 * Python and JavaScript. TypeScript's type annotations are a syntax error
 * in a browser engine, and shipping a transpiler to strip them would cost
 * more than it teaches — the algorithm is the point, not the annotations.
 */
export type SandboxLang = "python" | "javascript";

export const LANG_LABEL: Record<SandboxLang, string> = {
  python: "Python",
  javascript: "JavaScript",
};

/**
 * How a case decides pass/fail.
 * - `return` — compare the function's return value to `expect`
 * - `mutate` — ignore the return value, compare args[arg] after the call
 * - `prefix` — call, take the returned length k, compare args[arg][:k]
 * - `roundtrip` — construct the class, call `decode(encode(args[0]))`, compare
 *   that to `expect`
 *
 * `prefix` exists for the "return the new length" family (Remove Duplicates,
 * Remove Element), where everything past k is explicitly undefined and
 * comparing the whole array would fail correct solutions. `roundtrip` exists
 * for Serialize/Deserialize, whose intermediate string is the learner's own
 * design — asserting on it would mandate one encoding, so the only honest
 * claim is that the two methods invert each other.
 */
export type CheckMode = "return" | "mutate" | "prefix" | "sequence" | "roundtrip";

/**
 * How an argument (or the return value) is materialised before the call.
 *
 * A linked list is objects pointing at each other, not JSON, so without
 * this the runner cannot hand a function its input at all. Cases stay
 * readable level-order JSON in the markdown; the worker builds the real
 * nodes and serialises whatever comes back.
 */
export type Shape = "value" | "list" | "tree" | "graph";

/**
 * Two shapes only an argument can have.
 *
 * `node` is written as a plain value and handed to the learner as the node
 * carrying it, out of the tree built for another argument — a result
 * serialises as a `tree`, so `returns: "node"` would mean nothing.
 * `list[]` is k linked lists, which Merge K Sorted Lists takes and no
 * problem returns.
 */
export type ArgShape = Shape | "node" | "list[]";

/** One call in a `sequence` case: method, arguments, expected return. */
export type SequenceOp = [string, unknown[], unknown];

export interface SandboxCase {
  args: unknown[];
  expect: unknown;
  /** Optional label; falls back to a rendering of args */
  name?: string;
  /** `sequence` cases only — constructor arguments */
  construct?: unknown[];
  /** `sequence` cases only — the ordered script of calls */
  ops?: SequenceOp[];
}

export interface SandboxSpec {
  /** Stable id — also the localStorage draft key */
  id: string;
  /** Entry point name per language (snake_case vs camelCase) */
  fn: Record<SandboxLang, string>;
  starter: Record<SandboxLang, string>;
  cases: SandboxCase[];
  check: CheckMode;
  /** Which argument `mutate`/`prefix` inspect */
  arg: number;
  timeoutMs: number;
  /** How equality is decided; see lib/sandbox/compare.ts */
  compare: CompareMode;
  /** Argument index -> structure to build. Absent entries stay plain JSON. */
  shape: Record<string, ArgShape>;
  /** How to serialise the return value back to JSON */
  returns: Shape;
  /** `sequence` mode only — the class to instantiate, per language */
  cls: Record<SandboxLang, string> | null;
  /**
   * `sequence` mode only — per-language method names, keyed by the name used
   * in the op script. Python and JavaScript disagree on casing exactly as
   * they do for function names (`get_min` vs `getMin`), so an op script that
   * assumed one spelling would fail every Python solution.
   * Names absent from this map are used as-is in both languages.
   */
  methods: Record<string, Record<SandboxLang, string>>;
  /**
   * `roundtrip` mode only — the encode/decode method pair, per language.
   * Ordered [encode, decode]; the runner calls decode(encode(input)).
   */
  roundtrip: Record<SandboxLang, string[]> | null;
}

/**
 * What a worker reports per case. Deliberately raw: the worker never
 * decides pass/fail, so the comparison rule lives in exactly one place
 * (lib/sandbox/compare.ts) instead of being reimplemented per runtime.
 */
export interface CaseOutcome {
  index: number;
  /** The function's return value, JSON-able */
  ret: unknown;
  /** args[arg] as it stood after the call */
  argAfter: unknown;
  logs: string[];
  error: string | null;
  /**
   * `sequence` mode only — what each op actually returned, so a failure can
   * name the operation index rather than just saying "wrong".
   */
  opResults?: unknown[];
  /**
   * `returns: "graph"` only — did the result reuse any node from the input?
   * A returned original serialises identically to a real clone, so this is
   * the only way to tell them apart. Raw observation; the main thread judges.
   */
  aliased?: boolean | null;
}

/** Derived on the main thread from a CaseOutcome. */
export interface CaseResult {
  index: number;
  name: string;
  passed: boolean;
  got: string | null;
  expected: string;
  error: string | null;
  logs: string[];
}

/** Worker → main. `ready` is only sent by the Python worker, after boot. */
export type RunnerResponse =
  | { kind: "ready" }
  | { kind: "outcomes"; outcomes: CaseOutcome[] }
  | { kind: "fatal"; message: string };

/** Main → worker. */
export interface RunnerRequest {
  source: string;
  fnName: string;
  cases: SandboxCase[];
  arg: number;
  check: CheckMode;
  shape: Record<string, ArgShape>;
  returns: Shape;
  cls: string | null;
  /** `roundtrip` mode only — [encode, decode] for the language being run. */
  roundtrip?: string[];
}

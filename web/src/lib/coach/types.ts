import type { SandboxLang } from "@/components/sandbox/types";

export type DiagnosisKind =
  | "wrong-value"
  | "exception"
  | "timeout"
  | "aliased"
  | "property"
  | "fatal"
  | "all-passed";

export interface Diagnosis {
  status: "all-passed" | "failed" | "errored";
  kind: DiagnosisKind;
  firstFailIndex: number | null;
  caseName: string | null;
  got: string | null;
  expected: string | null;
  error: string | null;
  passed: number;
  total: number;
  /** Templated locally — never hint body. */
  prose: string;
  /** 1-based; escalate per failed run. */
  nextHintIndex: number | null;
}

export interface CoachHint {
  index: number;
  label: string;
  body: string;
}

export interface CoachProblem {
  sandboxId: string;
  title: string;
  moduleSlug: string;
  statement: string;
  /** Explanation insight only. Empty when the lesson has no insight block. */
  thesis: string;
  hints: CoachHint[];
  fn: { python: string; javascript: string };
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachChatRequest {
  sandboxId: string;
  lang: SandboxLang;
  code: string;
  diagnosis: Diagnosis | null;
  messages: CoachMessage[];
}

export interface CoachQuotaResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

export const COACH_REFUSE =
  "I can nudge, not solve. Ask a smaller question, or open the next hint on Explanation.";

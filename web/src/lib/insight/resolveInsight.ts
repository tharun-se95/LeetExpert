import type {
  CaseResult,
  SandboxCase,
  SandboxSpec,
} from "@/components/sandbox/types";
import { pretty } from "@/lib/sandbox/compare";
import { getCheatsheet } from "@/lib/course/cheatsheets/registry";
import type { ModuleCheatsheet } from "@/lib/course/cheatsheets/types";
import { GOLD_INSIGHT } from "@/lib/insight/gold";
import type { ExtractedComplexity } from "@/lib/insight/extractComplexity";
import { parseCaseMemory } from "@/lib/insight/parseCaseMemory";
import type {
  InsightChecklistItem,
  InsightComplexity,
  InsightVariable,
  ResolvedInsight,
} from "@/lib/insight/types";

export interface ResolveInsightInput {
  spec: SandboxSpec;
  moduleSlug: string;
  /** From extractComplexityFromMarkdown(lesson.markdown). */
  extractedComplexity: ExtractedComplexity | null;
  testCase: SandboxCase | undefined;
  caseIndex: number;
  result: CaseResult | null;
}

function safeCheatsheet(moduleSlug: string): ModuleCheatsheet | null {
  try {
    return getCheatsheet(moduleSlug);
  } catch {
    return null;
  }
}

function resolveComplexity(
  extracted: ExtractedComplexity | null,
  sheet: ModuleCheatsheet | null,
): InsightComplexity | null {
  if (extracted?.time || extracted?.space) {
    return {
      time: extracted.time ?? "—",
      space: extracted.space ?? "—",
      why: extracted.why,
      source: "lesson",
    };
  }
  const row = sheet?.complexity[0];
  if (!row) return null;
  return {
    time: row.time,
    space: row.space,
    why: row.note,
    source: "module",
  };
}

function resolveChecklist(
  sandboxId: string,
  sheet: ModuleCheatsheet | null,
): InsightChecklistItem[] {
  const gold = GOLD_INSIGHT[sandboxId];
  if (gold?.checklist?.length) return gold.checklist.slice(0, 4);

  if (!sheet) return [];

  const preferred = gold?.preferPattern
    ? sheet.patterns.find((p) => p.title === gold.preferPattern)
    : undefined;
  const patterns = preferred
    ? [preferred, ...sheet.patterns.filter((p) => p !== preferred)]
    : sheet.patterns;

  return patterns.slice(0, 3).map((p) => ({
    label: p.smell ? `${p.title} — ${p.smell}` : p.title,
    tone: p.tone,
  }));
}

function resolveVariables(
  spec: SandboxSpec,
  testCase: SandboxCase | undefined,
  result: CaseResult | null,
): InsightVariable[] {
  if (!testCase) return [];
  const vars: InsightVariable[] = [];

  if (spec.check === "sequence") {
    if (testCase.construct !== undefined) {
      vars.push({
        name: "construct",
        value: pretty(testCase.construct, 80),
        provenance: "case",
      });
    }
    if (testCase.ops) {
      vars.push({
        name: "ops",
        value: `${testCase.ops.length} calls`,
        provenance: "case",
      });
    }
  } else {
    const args = testCase.args ?? [];
    args.forEach((arg, i) => {
      vars.push({
        name: args.length === 1 ? "input" : `arg${i}`,
        value: pretty(arg, 96),
        provenance: "case",
      });
    });
  }

  if (result) {
    vars.push({
      name: "expected",
      value: result.expected,
      provenance: "run",
    });
    vars.push({
      name: "output",
      value: result.error ?? result.got ?? "—",
      provenance: "run",
    });
    vars.push({
      name: "status",
      value: result.passed ? "passed" : "failed",
      provenance: "run",
    });
  } else if (testCase.expect !== undefined && !spec.property) {
    vars.push({
      name: "expected",
      value: pretty(testCase.expect, 96),
      provenance: "case",
    });
  } else if (spec.property) {
    vars.push({
      name: "property",
      value: spec.property,
      provenance: "case",
    });
  }

  return vars;
}

export function resolveInsight(input: ResolveInsightInput): ResolvedInsight {
  const sheet = safeCheatsheet(input.moduleSlug);
  const gold = GOLD_INSIGHT[input.spec.id];
  const memory = input.testCase
    ? parseCaseMemory(input.testCase, input.spec, gold?.markers ?? [])
    : null;

  return {
    complexity: resolveComplexity(input.extractedComplexity, sheet),
    checklist: resolveChecklist(input.spec.id, sheet),
    memory,
    variables: resolveVariables(input.spec, input.testCase, input.result),
  };
}

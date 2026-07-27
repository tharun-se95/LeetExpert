import type {
  CheckMode,
  CompareMode,
  SandboxCase,
  SandboxLang,
  SandboxSpec,
  SequenceOp,
  Shape,
} from "@/components/sandbox/types";

const SHAPES = ["value", "list", "tree", "graph"] as const;
const COMPARES = ["exact", "sorted", "set-of-sets"] as const;

/**
 * Validates a `sandbox` fence body into a SandboxSpec, or null.
 *
 * Authoring these by hand across 116 lessons means typos are inevitable, so
 * this rejects loudly on anything structurally wrong rather than rendering a
 * harness that silently tests nothing.
 */
export function parseSandboxSpec(source: string): SandboxSpec | null {
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const spec = raw as Record<string, unknown>;

  const id = typeof spec.id === "string" && spec.id ? spec.id : null;
  if (!id) return null;

  const fn = langRecord(spec.fn);
  const starter = langRecord(spec.starter);
  if (!fn || !starter) return null;

  const cases = parseCases(spec.cases);
  if (!cases) return null;

  const check: CheckMode =
    spec.check === "mutate" ||
    spec.check === "prefix" ||
    spec.check === "return" ||
    spec.check === "sequence"
      ? spec.check
      : "return";

  const compare: CompareMode = (COMPARES as readonly string[]).includes(
    spec.compare as string,
  )
    ? (spec.compare as CompareMode)
    : "exact";

  // Argument index -> structure. Unlisted arguments stay plain JSON.
  const shape: Record<string, Shape> = {};
  if (spec.shape && typeof spec.shape === "object") {
    for (const [k, v] of Object.entries(spec.shape as Record<string, unknown>)) {
      if ((SHAPES as readonly string[]).includes(v as string)) {
        shape[k] = v as Shape;
      }
    }
  }

  const returns: Shape = (SHAPES as readonly string[]).includes(
    spec.returns as string,
  )
    ? (spec.returns as Shape)
    : "value";

  // `sequence` cases construct a class instead of calling a function, so the
  // class name is required in that mode and meaningless otherwise.
  const cls =
    check === "sequence" ? langRecord(spec.class) : null;
  if (check === "sequence" && !cls) return null;

  const methods: Record<string, Record<SandboxLang, string>> = {};
  if (spec.methods && typeof spec.methods === "object") {
    for (const [k, v] of Object.entries(spec.methods as Record<string, unknown>)) {
      const rec = langRecord(v);
      if (!rec) return null;
      methods[k] = rec;
    }
  }

  const arg =
    typeof spec.arg === "number" && Number.isInteger(spec.arg) && spec.arg >= 0
      ? spec.arg
      : 0;

  const timeoutMs =
    typeof spec.timeoutMs === "number" && spec.timeoutMs >= 250
      ? Math.min(spec.timeoutMs, 15000)
      : 3000;

  if (check === "sequence" && cases.some((c) => !Array.isArray(c.ops))) {
    return null;
  }

  return {
    id, fn, starter, cases, check, arg, timeoutMs,
    compare, shape, returns, cls, methods,
  };
}

function langRecord(value: unknown): Record<SandboxLang, string> | null {
  if (typeof value !== "object" || value === null) return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.python !== "string" || typeof rec.javascript !== "string") {
    return null;
  }
  return { python: rec.python, javascript: rec.javascript };
}

function parseCases(value: unknown): SandboxCase[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const out: SandboxCase[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const c = entry as Record<string, unknown>;

    // A sequence case carries an op script instead of args/expect.
    if (Array.isArray(c.ops)) {
      const ops: SequenceOp[] = [];
      for (const raw of c.ops) {
        if (!Array.isArray(raw) || typeof raw[0] !== "string") return null;
        ops.push([raw[0], Array.isArray(raw[1]) ? raw[1] : [], raw[2]]);
      }
      out.push({
        args: [],
        expect: ops.map((o) => o[2]),
        construct: Array.isArray(c.construct) ? c.construct : [],
        ops,
        name: typeof c.name === "string" ? c.name : undefined,
      });
      continue;
    }

    if (!Array.isArray(c.args)) return null;
    if (!("expect" in c)) return null;
    out.push({
      args: c.args,
      expect: c.expect,
      name: typeof c.name === "string" ? c.name : undefined,
    });
  }
  return out;
}

import { filterCoachReply } from "./filter";
import { buildModelMessages } from "./prompt";
import type {
  CoachChatRequest,
  CoachMessage,
  CoachProblem,
  CoachQuotaResult,
} from "./types";
import type { CoachQuota } from "./quota";
import { resolveCoachBackend } from "./provider";

export const MAX_MESSAGE_CHARS = 2000;
export const MAX_CODE_CHARS = 8000;

export type CoachChatOk = {
  status: 200;
  reply: string;
  remaining: number;
  resetAt: string;
};

export type CoachChatErr = {
  status: 400 | 403 | 404 | 429 | 503;
  code: string;
  message: string;
  resetAt?: string;
};

export type CoachChatResult = CoachChatOk | CoachChatErr;

export interface CoachChatDeps {
  getProblem: (sandboxId: string) => CoachProblem | null;
  quota: CoachQuota;
  visitorId: string;
  configured: boolean;
  sameOrigin: boolean;
  complete: (system: string, messages: CoachMessage[]) => Promise<string>;
}

function isLang(value: unknown): value is "python" | "javascript" {
  return value === "python" || value === "javascript";
}

function isMessage(value: unknown): value is CoachMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as CoachMessage;
  return (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
}

export function parseCoachRequest(body: unknown): CoachChatRequest | { error: string } {
  if (!body || typeof body !== "object") return { error: "Expected a JSON object." };
  const raw = body as Record<string, unknown>;
  if (typeof raw.sandboxId !== "string" || !raw.sandboxId) {
    return { error: "sandboxId is required." };
  }
  if (!isLang(raw.lang)) return { error: "lang must be python or javascript." };
  if (typeof raw.code !== "string") return { error: "code is required." };
  if (raw.code.length > MAX_CODE_CHARS) {
    return { error: `code exceeds ${MAX_CODE_CHARS} characters.` };
  }
  if (!Array.isArray(raw.messages) || !raw.messages.every(isMessage)) {
    return { error: "messages must be an array of { role, content }." };
  }
  const last = raw.messages[raw.messages.length - 1];
  if (!last || last.role !== "user") {
    return { error: "The last message must be from the user." };
  }
  if (raw.messages.some((m) => (m as CoachMessage).content.length > MAX_MESSAGE_CHARS)) {
    return { error: `Each message must be at most ${MAX_MESSAGE_CHARS} characters.` };
  }
  return {
    sandboxId: raw.sandboxId,
    lang: raw.lang,
    code: raw.code,
    diagnosis:
      raw.diagnosis && typeof raw.diagnosis === "object"
        ? (raw.diagnosis as CoachChatRequest["diagnosis"])
        : null,
    messages: raw.messages as CoachMessage[],
  };
}

export function isCoachConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const hasModel = resolveCoachBackend(env) !== null;
  const hasQuota = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  const devMemory = env.COACH_QUOTA === "memory" || env.NODE_ENV !== "production";
  return hasModel && (hasQuota || devMemory);
}

export async function handleCoachChat(
  body: unknown,
  deps: CoachChatDeps,
): Promise<CoachChatResult> {
  if (!deps.sameOrigin) {
    return { status: 403, code: "coach_forbidden", message: "Same-origin requests only." };
  }
  if (!deps.configured) {
    return {
      status: 503,
      code: "coach_unconfigured",
      message: "Coach chat is not configured on this deployment.",
    };
  }

  const parsed = parseCoachRequest(body);
  if ("error" in parsed) {
    return { status: 400, code: "coach_bad_request", message: parsed.error };
  }

  const problem = deps.getProblem(parsed.sandboxId);
  if (!problem) {
    return { status: 404, code: "coach_unknown_problem", message: "Unknown sandbox." };
  }

  const quota: CoachQuotaResult = await deps.quota.consume(deps.visitorId);
  if (!quota.allowed) {
    return {
      status: 429,
      code: "coach_quota",
      message: "Daily coach limit reached.",
      resetAt: quota.resetAt,
    };
  }

  const packed = buildModelMessages(problem, parsed);
  let raw: string;
  try {
    raw = await deps.complete(packed.system, packed.messages);
  } catch {
    // A remote backend (Ollama over a tunnel, a cloud API blip) can fail the
    // network call itself. Without this, the throw reaches the client as an
    // unhandled 500 with no JSON body, which shows up as a raw parse error
    // instead of a message a learner can read.
    return {
      status: 503,
      code: "coach_unavailable",
      message: "Coach's model didn't respond. Try again in a moment.",
    };
  }
  const reply = filterCoachReply(raw, problem.fn);
  return {
    status: 200,
    reply,
    remaining: quota.remaining,
    resetAt: quota.resetAt,
  };
}

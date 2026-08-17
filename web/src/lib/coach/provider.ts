import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { CoachMessage } from "./types";

export type CoachBackend = "ollama" | "anthropic" | "openai";

export function resolveCoachBackend(
  env: NodeJS.ProcessEnv = process.env,
): CoachBackend | null {
  const provider = (env.COACH_PROVIDER ?? "").toLowerCase();
  if (
    provider === "ollama" ||
    Boolean(env.OLLAMA_HOST) ||
    Boolean(env.OLLAMA_API_KEY)
  ) {
    return "ollama";
  }
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.OPENAI_API_KEY) return "openai";
  return null;
}

export function defaultCoachModel(
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (env.COACH_MODEL) return env.COACH_MODEL;
  const backend = resolveCoachBackend(env);
  if (backend === "ollama") return "gemma4:cloud";
  if (backend === "openai") return "gpt-4o-mini";
  return "claude-sonnet-4-6";
}

export function ollamaHost(env: NodeJS.ProcessEnv = process.env): string {
  if (env.OLLAMA_HOST) return env.OLLAMA_HOST.replace(/\/$/, "");
  // gemma4:cloud (and any other :cloud tag) already runs on Ollama's own
  // infrastructure — an API key with no explicit host means "talk to that
  // directly," not "there's a local daemon to fall back to."
  if (env.OLLAMA_API_KEY) return "https://ollama.com";
  return "http://127.0.0.1:11434";
}

/**
 * https://ollama.com/api (Ollama Cloud) is a different product surface from
 * the local daemon: same /api/chat request/response shape, confirmed against
 * the live API, but it requires this header where a local or tunnelled host
 * requires none. Empty when no key is configured.
 */
export function ollamaAuthHeaders(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const key = env.OLLAMA_API_KEY;
  return key ? { Authorization: `Bearer ${key}` } : {};
}

/**
 * Ollama's own API has no auth. When OLLAMA_HOST points at a machine reached
 * over a Cloudflare Tunnel guarded by Access, these two headers are what let
 * the request through the edge — Access validates them before the request
 * ever reaches the tunnel, so the origin needs no auth logic of its own.
 * Both empty on a bare/local Ollama host, where they're meaningless.
 */
export function ollamaAccessHeaders(
  env: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const id = env.OLLAMA_ACCESS_CLIENT_ID;
  const secret = env.OLLAMA_ACCESS_CLIENT_SECRET;
  if (!id || !secret) return {};
  return { "CF-Access-Client-Id": id, "CF-Access-Client-Secret": secret };
}

// A tunnel to a machine that may be asleep or offline should fail fast and
// cleanly, not ride the full Vercel function budget (maxDuration = 30s in
// the route) before an abrupt kill.
const OLLAMA_TIMEOUT_MS = 25_000;

export async function completeCoach(
  system: string,
  messages: CoachMessage[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  const backend = resolveCoachBackend(env);
  if (backend === "ollama") return completeOllama(system, messages, env);
  if (backend === "anthropic") {
    const result = streamText({
      model: anthropic(defaultCoachModel(env)),
      system,
      messages,
    });
    return result.text;
  }
  if (backend === "openai") {
    const result = streamText({
      model: openai(defaultCoachModel(env)),
      system,
      messages,
    });
    return result.text;
  }
  throw new Error("Coach model is not configured.");
}

async function completeOllama(
  system: string,
  messages: CoachMessage[],
  env: NodeJS.ProcessEnv,
): Promise<string> {
  const res = await fetch(`${ollamaHost(env)}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...ollamaAccessHeaders(env),
      ...ollamaAuthHeaders(env),
    },
    body: JSON.stringify({
      model: defaultCoachModel(env),
      stream: false,
      think: false,
      messages: [{ role: "system", content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Ollama ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content ?? "";
}

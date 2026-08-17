import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { CoachMessage } from "./types";

export type CoachBackend = "ollama" | "anthropic" | "openai";

export function resolveCoachBackend(
  env: NodeJS.ProcessEnv = process.env,
): CoachBackend | null {
  const provider = (env.COACH_PROVIDER ?? "").toLowerCase();
  if (provider === "ollama" || Boolean(env.OLLAMA_HOST)) return "ollama";
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
  return (env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/, "");
}

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
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: defaultCoachModel(env),
      stream: false,
      think: false,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Ollama ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content ?? "";
}

import "server-only";
import { Redis } from "@upstash/redis";
import { getAuth, sessionUserId } from "@/lib/auth/server";
import { isSameOrigin } from "@/lib/coach/origin";
import { getDb } from "@/lib/db/client";
import type { HandlerResult, ProgressDeps } from "./handlers";
import { MemoryRateLimit, RedisRateLimit, WRITES_PER_MINUTE, type RateLimiter } from "./rateLimit";

// Module-level so the in-memory fallback counts across requests on one instance.
const memoryLimiter = new MemoryRateLimit(WRITES_PER_MINUTE);

function limiter(): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new RedisRateLimit(new Redis({ url, token }), WRITES_PER_MINUTE) : memoryLimiter;
}

export async function routeDeps(req: Request): Promise<ProgressDeps> {
  const auth = getAuth();
  const db = getDb();
  const configured = auth !== null && db !== null;
  return {
    configured,
    sameOrigin: isSameOrigin(req),
    userId: auth && configured ? await sessionUserId(auth, req.headers) : null,
    db,
    limiter: limiter(),
  };
}

export function toResponse(result: HandlerResult): Response {
  if (result.status === 204) return new Response(null, { status: 204 });
  return Response.json(result.body, {
    status: result.status,
    // Learner data: never cached by the browser or any intermediary.
    headers: { "cache-control": "private, no-store" },
  });
}

/** Unparseable JSON is a 400, the same answer as a schema failure. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

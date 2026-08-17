import { Redis } from "@upstash/redis";
import { getCoachProblem } from "@/lib/coach/getProblem";
import { handleCoachChat, isCoachConfigured } from "@/lib/coach/handleChat";
import { completeCoach } from "@/lib/coach/provider";
import { isSameOrigin } from "@/lib/coach/origin";
import {
  MemoryQuota,
  RedisQuota,
  dailyCap,
  type CoachQuota,
} from "@/lib/coach/quota";
import {
  VISITOR_COOKIE,
  newVisitorId,
  readVisitorId,
  visitorCookieHeader,
} from "@/lib/coach/visitor";

export const maxDuration = 30;

function quota(): CoachQuota {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new RedisQuota(new Redis({ url, token }), dailyCap());
  }
  return new MemoryQuota(dailyCap());
}

function visitorFrom(req: Request): { id: string; fresh: boolean } {
  const existing = readVisitorId(req.headers.get("cookie"));
  if (existing) return { id: existing, fresh: false };
  return { id: newVisitorId(), fresh: true };
}

function json(body: unknown, status: number, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...extra,
    },
  });
}

function withVisitorCookie(
  res: Response,
  id: string,
  fresh: boolean,
): Response {
  if (!fresh) return res;
  const secure = process.env.NODE_ENV === "production";
  res.headers.set("set-cookie", visitorCookieHeader(id, secure));
  return res;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ code: "coach_bad_request", message: "Invalid JSON." }, 400);
  }

  const visitor = visitorFrom(req);
  const result = await handleCoachChat(body, {
    getProblem: getCoachProblem,
    quota: quota(),
    visitorId: visitor.id,
    configured: isCoachConfigured(),
    sameOrigin: isSameOrigin(req),
    complete: completeCoach,
  });

  if (result.status !== 200) {
    return withVisitorCookie(
      json(
        {
          code: result.code,
          message: result.message,
          resetAt: result.resetAt,
        },
        result.status,
      ),
      visitor.id,
      visitor.fresh,
    );
  }

  return withVisitorCookie(
    json(
      {
        reply: result.reply,
        remaining: result.remaining,
        resetAt: result.resetAt,
      },
      200,
    ),
    visitor.id,
    visitor.fresh,
  );
}

export async function GET(req: Request): Promise<Response> {
  const visitor = visitorFrom(req);
  const configured = isCoachConfigured();
  if (!configured) {
    return withVisitorCookie(
      json({ configured: false, remaining: null, resetAt: null }, 200),
      visitor.id,
      visitor.fresh,
    );
  }
  const peeked = await quota().peek(visitor.id);
  return withVisitorCookie(
    json(
      {
        configured: true,
        remaining: peeked.remaining,
        resetAt: peeked.resetAt,
      },
      200,
    ),
    visitor.id,
    visitor.fresh,
  );
}

export { VISITOR_COOKIE };

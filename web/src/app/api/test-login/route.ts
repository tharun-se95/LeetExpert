import { eq } from "drizzle-orm";
import { z } from "zod";
import { createAuth } from "@/lib/auth/createAuth";
import { readAuthEnv } from "@/lib/auth/env";
import { getDb } from "@/lib/db/client";
import { user } from "@/lib/db/schema";

const body = z.object({ email: z.email(), name: z.string().min(1).max(80).optional() });

const notFound = () => new Response(null, { status: 404 });

/**
 * Real OAuth needs registered apps, so browser tests sign in here instead.
 * NODE_ENV is inlined at build time, so in a production build this handler
 * is `return notFound()`; e2e/test-login-prod.e2e.mjs proves that against a
 * real `next build`, because a backdoor must not rest on review alone.
 */
export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production" || process.env.AUTH_TEST_LOGIN !== "1") return notFound();
  const env = readAuthEnv();
  const db = getDb();
  if (!env || !db) return notFound();
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  const auth = createAuth(db, env, { testUtils: true });
  const test = (await auth.$context).test;
  const [existing] = await db.select().from(user).where(eq(user.email, parsed.data.email));
  const person =
    existing ??
    (await test.saveUser(
      test.createUser({ email: parsed.data.email, name: parsed.data.name ?? parsed.data.email, emailVerified: true }),
    ));
  const { cookies } = await test.login({ userId: person.id });

  const res = new Response(null, { status: 204 });
  for (const c of cookies) {
    // TestCookie.expires is in seconds (better-auth 1.7.5
    // plugins/test-utils/cookie-builder.mjs), Date wants milliseconds.
    const parts = [`${c.name}=${c.value}`, `Path=${c.path}`, `SameSite=${c.sameSite ?? "Lax"}`];
    if (c.httpOnly) parts.push("HttpOnly");
    if (c.secure) parts.push("Secure");
    if (c.expires) parts.push(`Expires=${new Date(c.expires * 1000).toUTCString()}`);
    res.headers.append("set-cookie", parts.join("; "));
  }
  return res;
}

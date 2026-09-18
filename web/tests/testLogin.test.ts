import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "./helpers/testDb";
import { createAuth, sessionUserId } from "../src/lib/auth/createAuth";
import { readAuthEnv, type AuthEnv } from "../src/lib/auth/env";
import { user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";

// The handler reads its database through getDb(); point that at PGlite so the
// route runs end to end without a Neon URL.
const holder: { db: Db | null } = { db: null };
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ getDb: () => holder.db }));

const FULL = {
  DATABASE_URL: "postgres://unused",
  BETTER_AUTH_SECRET: "s".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  GITHUB_CLIENT_ID: "gh-id",
  GITHUB_CLIENT_SECRET: "gh-secret",
  GOOGLE_CLIENT_ID: "g-id",
  GOOGLE_CLIENT_SECRET: "g-secret",
};

let close: () => Promise<void>;

beforeEach(async () => {
  const made = await createTestDb();
  holder.db = made.db;
  close = made.close;
  for (const [k, v] of Object.entries(FULL)) vi.stubEnv(k, v);
  vi.stubEnv("AUTH_TEST_LOGIN", "1");
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await close();
});

async function login(payload: unknown): Promise<Response> {
  const { POST } = await import("../src/app/api/test-login/route");
  return POST(
    new Request("http://localhost:3000/api/test-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );
}

/** What a browser would send back for the Set-Cookie headers. */
function cookieHeader(res: Response): Headers {
  const pairs = res.headers.getSetCookie().map((c) => c.split(";")[0]!);
  return new Headers({ cookie: pairs.join("; ") });
}

describe("POST /api/test-login", () => {
  it("is a 404 unless AUTH_TEST_LOGIN is exactly 1", async () => {
    for (const flag of [undefined, "", "0", "true"]) {
      vi.stubEnv("AUTH_TEST_LOGIN", flag);
      expect((await login({ email: "a@example.com" })).status, String(flag)).toBe(404);
    }
    expect(await holder.db!.select().from(user)).toHaveLength(0);
  });

  it("is a 404 in production even with the flag set, and creates nobody", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await login({ email: "a@example.com" })).status).toBe(404);
    expect(await holder.db!.select().from(user)).toHaveLength(0);
  });

  it("is a 404 when auth is not configured", async () => {
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect((await login({ email: "a@example.com" })).status).toBe(404);
  });

  it("is a 400 for a body that is not an email", async () => {
    expect((await login({ email: "not-an-email" })).status).toBe(400);
    expect((await login({})).status).toBe(400);
    expect((await login("{not json")).status).toBe(400);
    expect((await login({ email: "a@example.com", name: "" })).status).toBe(400);
  });

  it("signs in: a 204 whose cookie resolves to the user, expiring in about 30 days", async () => {
    const res = await login({ email: "ada@example.com", name: "Ada" });
    expect(res.status).toBe(204);

    const auth = createAuth(holder.db!, readAuthEnv() as AuthEnv);
    const [row] = await holder.db!.select().from(user);
    expect(row).toMatchObject({ email: "ada@example.com", name: "Ada", emailVerified: true });
    expect(await sessionUserId(auth, cookieHeader(res))).toBe(row!.id);

    // TestCookie.expires is in seconds; a wrong unit lands in 1970 or year
    // 50000 and tsc cannot see it.
    const set = res.headers.getSetCookie().find((c) => /session_token/.test(c))!;
    expect(set).toMatch(/HttpOnly/);
    expect(set).toMatch(/SameSite=Lax/);
    const expires = new Date(/Expires=([^;]+)/.exec(set)![1]!).getTime();
    const days = (expires - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThan(30.1);
  });

  it("signing in twice with one email is one user, so two devices share an account", async () => {
    const first = await login({ email: "ada@example.com" });
    const second = await login({ email: "ada@example.com" });
    expect([first.status, second.status]).toEqual([204, 204]);
    const rows = await holder.db!.select().from(user);
    expect(rows).toHaveLength(1);
    const auth = createAuth(holder.db!, readAuthEnv() as AuthEnv);
    expect(await sessionUserId(auth, cookieHeader(first))).toBe(rows[0]!.id);
    expect(await sessionUserId(auth, cookieHeader(second))).toBe(rows[0]!.id);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convertSetCookieToCookie } from "better-auth/test";
import { createTestDb } from "./helpers/testDb";
import { createAuth, sessionUserId } from "../src/lib/auth/createAuth";
import { isAuthConfigured, readAuthEnv, type AuthEnv } from "../src/lib/auth/env";
import type { Db } from "../src/lib/db/types";

const FULL = {
  DATABASE_URL: "postgres://x",
  BETTER_AUTH_SECRET: "s".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  GITHUB_CLIENT_ID: "gh-id",
  GITHUB_CLIENT_SECRET: "gh-secret",
  GOOGLE_CLIENT_ID: "g-id",
  GOOGLE_CLIENT_SECRET: "g-secret",
};

describe("auth configuration gate", () => {
  it("is configured only when every variable is present", () => {
    expect(isAuthConfigured(FULL)).toBe(true);
    for (const key of Object.keys(FULL)) {
      expect(isAuthConfigured({ ...FULL, [key]: undefined }), key).toBe(false);
      expect(isAuthConfigured({ ...FULL, [key]: "" }), key).toBe(false);
    }
  });

  it("marks production from NODE_ENV", () => {
    expect(readAuthEnv({ ...FULL, NODE_ENV: "production" })?.production).toBe(true);
    expect(readAuthEnv({ ...FULL, NODE_ENV: "development" })?.production).toBe(false);
  });
});

describe("sessions against real Postgres", () => {
  let db: Db;
  let close: () => Promise<void>;
  const env = readAuthEnv(FULL) as AuthEnv;

  beforeEach(async () => ({ db, close } = await createTestDb()));
  afterEach(async () => close());

  it("a logged-in session resolves to its user; no cookie resolves to null", async () => {
    const auth = createAuth(db, env, { testUtils: true });
    const test = (await auth.$context).test;
    const saved = await test.saveUser(test.createUser({ email: "ada@example.com", emailVerified: true }));
    const { headers } = await test.login({ userId: saved.id });
    expect(await sessionUserId(auth, headers)).toBe(saved.id);
    expect(await sessionUserId(auth, new Headers())).toBeNull();
  });

  it("revoking sessions takes effect at once for API reads", async () => {
    const auth = createAuth(db, env, { testUtils: true });
    const test = (await auth.$context).test;
    const saved = await test.saveUser(test.createUser({ email: "b@example.com", emailVerified: true }));
    const { headers } = await test.login({ userId: saved.id });

    // A real first request populates the 5-minute session_data cache cookie
    // (this is what a browser would send back on every request after).
    // Without a cache cookie in play, disabling the cache is a no-op and the
    // test can't tell a fixed sessionUserId from a broken one — so build the
    // merged headers a browser would actually hold, and prove they hold it.
    const { headers: responseHeaders } = await auth.api.getSession({ headers, returnHeaders: true });
    const merged = new Headers(headers);
    const setCookie = responseHeaders.get("set-cookie");
    if (setCookie) merged.append("set-cookie", setCookie);
    convertSetCookieToCookie(merged);
    expect(merged.get("cookie")).toContain("session_data");

    await auth.api.revokeSessions({ headers });
    // The cookie cache would still vouch for this cookie for 5 minutes;
    // sessionUserId must bypass it.
    expect(await sessionUserId(auth, merged)).toBeNull();
  });
});

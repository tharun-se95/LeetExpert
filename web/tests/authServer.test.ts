import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
    await auth.api.revokeSessions({ headers });
    // The cookie cache would still vouch for this cookie for 5 minutes;
    // sessionUserId must bypass it.
    expect(await sessionUserId(auth, headers)).toBeNull();
  });
});

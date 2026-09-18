import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import { authSchema } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import type { AuthEnv } from "./env";

const DAY = 60 * 60 * 24;

export function createAuth(db: Db, env: AuthEnv, opts: { testUtils?: boolean } = {}) {
  return betterAuth({
    baseURL: env.baseURL,
    secret: env.secret,
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    socialProviders: {
      // GitHub often hides the address; this scope lets Better Auth read the
      // primary verified one, which is what account linking keys on.
      github: { ...env.github, scope: ["user:email"] },
      google: env.google,
    },
    session: {
      expiresIn: 30 * DAY,
      updateAge: DAY,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    // No trustedProviders: listing a provider there links accounts even when
    // the provider has NOT verified the email, which would let anyone claim
    // an account by setting a matching address on the other provider.
    account: { accountLinking: { enabled: true } },
    advanced: { useSecureCookies: env.production },
    plugins: opts.testUtils ? [testUtils()] : [],
  });
}

export type Auth = ReturnType<typeof createAuth>;

/**
 * Reads the session from the database, not the 5-minute cookie cache, so
 * "Sign out everywhere" and account deletion stop writes immediately.
 */
export async function sessionUserId(auth: Auth, headers: Headers): Promise<string | null> {
  const session = await auth.api.getSession({ headers, query: { disableCookieCache: true } });
  return session?.user.id ?? null;
}

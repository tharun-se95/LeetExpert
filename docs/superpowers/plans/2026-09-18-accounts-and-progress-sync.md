# Accounts and Progress Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub/Google sign-in with Better Auth, and local-first sync of visited lessons, solved problems and sandbox drafts to Postgres, without changing anything for signed-out learners.

**Architecture:** `localStorage` stays the store the UI reads. A signed-in-only `SyncProvider` (a `next/dynamic` chunk) pulls from and pushes to `/api/progress*` through a persisted queue; merge rules live in a pure module. Better Auth and Drizzle run only in route handlers, so every page stays static.

**Tech Stack:** Next.js 16 route handlers, better-auth 1.7.5, drizzle-orm 0.45.2 + drizzle-kit 0.31.10, @neondatabase/serverless 1.1.0 (production), @electric-sql/pglite 0.5.8 (tests), zod 4, vitest 4 + jsdom, playwright-core.

**Spec:** `docs/superpowers/specs/2026-09-18-accounts-and-progress-sync-design.md` (cited below as "spec §N").

## Global Constraints

- All commands run from `web/` unless stated. Tests: `npm test -- <file>`.
- TypeScript strict; no `any`; no unchecked casts to silence the compiler (CLAUDE.md §5).
- Comments explain why, never what.
- All colour through tokens; no Tailwind palette values; shadows only via `.shadow-elevation` / `.shadow-edge-*`.
- Space Mono headings use regular or `font-bold`, never `font-semibold`.
- Modules imported by the root layout stay hook-free; `lib/db/*` and `lib/auth/server.ts` import `server-only`.
- Synced data: visited, solved, sandbox drafts only (spec §2). Course slug accepted by the API: `dsa` only.
- Draft limit 65536 bytes (UTF-8); mark batch ≤ 500; writes ≤ 120 per user per minute.
- Session: 30 days, `updateAge` 1 day, cookie cache 300 s. API routes read the session with the cookie cache **disabled**, so revocation applies to writes at once.
- Debounces: marks 2000 ms, drafts 1500 ms. Backoff 2000 ms doubling to 60000 ms. Sign-out flush cap 3000 ms. Warn dot after 5 min offline with pending writes.
- Every new suite is shown to fail once with a planted fault, then restored (CLAUDE.md §2). Each task says which fault.
- Commit after each task with the attribution line `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`. Stage only the task's files; the working tree has unrelated uncommitted work that must not be swept in.

## Deviations from the spec, decided while planning

1. **`BETTER_AUTH_URL` is also required** by `isAuthConfigured()`: Better Auth builds OAuth redirect URIs from it, and inferring it from the request is unsafe behind proxies.
2. **The sandbox registry is a generated id list** (`src/lib/sandbox/sandboxIds.generated.json`), written by the coach-corpus build. Sandbox ids are not always problem slugs (`find-min-rotated` is the sandbox of `find-minimum-in-rotated-sorted-array`, measured 2026-09-18), so slugs cannot stand in.
3. **Only problem sandboxes sync.** `ProblemWorkspace` passes `syncDraft`; the landing page's `landing-find-pair` sandbox keeps local-only drafts and is excluded from the merge count.
4. **The course hub has no progress count** today, so the signed-out sync hint goes under the hub's "modules live" line (spec §8 said "under the progress count").
5. **`GET /api/progress` also returns `hasDrafts`**, so the first-sign-in flow can tell an empty account from one with drafts only (spec §7).

## File map

| File | Responsibility |
| --- | --- |
| `web/drizzle.config.ts` | drizzle-kit config |
| `web/drizzle/*.sql` | Generated migrations |
| `web/src/lib/db/schema.ts` | Better Auth tables + `progress_mark` + `sandbox_draft` |
| `web/src/lib/db/types.ts` | `Db` type shared by Neon and PGlite |
| `web/src/lib/db/client.ts` | server-only Neon client |
| `web/tests/helpers/testDb.ts` | PGlite database with real migrations |
| `web/src/lib/auth/env.ts` | `readAuthEnv`, `isAuthConfigured` (hook-free) |
| `web/src/lib/auth/createAuth.ts` | Better Auth factory (testable with PGlite) |
| `web/src/lib/auth/server.ts` | server-only singleton, `sessionUserId` |
| `web/src/lib/auth/client.ts` | `authClient` |
| `web/src/lib/auth/redirect.ts` | `safeNext` |
| `web/src/app/api/auth/[...all]/route.ts` | Better Auth handler |
| `web/src/lib/progress/types.ts` | Shared types |
| `web/src/lib/progress/merge.ts` | Pure merge rules |
| `web/src/lib/progress/schemas.ts` | zod request schemas |
| `web/src/lib/progress/knownIds.ts` | Lesson and sandbox id registries |
| `web/src/lib/progress/store.ts` | SQL operations |
| `web/src/lib/progress/rateLimit.ts` | Per-user write limiter |
| `web/src/lib/progress/handlers.ts` | Request handlers with injected deps |
| `web/src/lib/progress/routeDeps.ts` | server-only: builds deps from a Request |
| `web/src/app/api/progress/route.ts` | GET/POST marks |
| `web/src/app/api/progress/drafts/[sandboxId]/route.ts` | GET/PUT drafts |
| `web/src/app/api/account/route.ts` | DELETE account |
| `web/src/app/api/account/export/route.ts` | GET export |
| `web/src/app/api/test-login/route.ts` | Dev-only test sign-in |
| `web/src/lib/progress/localStore.ts` | `localStorage` keys, clear, summary, sync record |
| `web/src/lib/progress/api.ts` | Client HTTP transport |
| `web/src/lib/progress/syncQueue.ts` | Persisted queue, debounce, backoff |
| `web/src/lib/progress/signInFlow.ts` | Owner cases + first-sign-in merge |
| `web/src/components/providers/SyncBridge.tsx` | Context: signed-out no-op, signed-in forwarding |
| `web/src/components/providers/SyncProvider.tsx` | Signed-in runtime (dynamic chunk) |
| `web/src/components/sandbox/useDraftSync.ts` | Draft pull/push/stash for one sandbox |
| `web/src/components/sandbox/DraftStashRow.tsx` | Stash row + compare dialog |
| `web/src/components/ui/Dialog.tsx` | Focus-trapped dialog shell |
| `web/src/components/auth/AccountControl.tsx` | Header control + account menu |
| `web/src/components/auth/DeleteAccountDialog.tsx` | Delete confirmation |
| `web/src/components/auth/MergePromptDialog.tsx` | First-sign-in prompt |
| `web/src/components/auth/SyncHint.tsx` | Hub line, signed out only |
| `web/src/app/sign-in/page.tsx`, `SignInButtons.tsx` | Sign-in page |
| `web/e2e/sync.e2e.mjs` | Two-device browser verification |

---
### Task 1: Database schema, migrations and the PGlite test harness

**Files:**
- Modify: `web/package.json` (deps + `db:generate`, `db:migrate` scripts)
- Create: `web/drizzle.config.ts`, `web/src/lib/db/schema.ts`, `web/src/lib/db/types.ts`, `web/src/lib/db/client.ts`, `web/tests/helpers/testDb.ts`, `web/drizzle/0000_*.sql` (generated)
- Test: `web/tests/dbSchema.test.ts`

**Interfaces:**
- Produces: `schema` tables `user`, `session`, `account`, `verification`, `progressMark`, `sandboxDraft`; `authSchema = { user, session, account, verification }`; `type Db`; `getDb(): Db | null`; `createTestDb(): Promise<{ db: Db; close(): Promise<void> }>`.

- [ ] **Step 0: Record the build baseline**

Before any change, run `npm run build 2>&1 | tee "$TMPDIR/build-before.txt"` and keep the route table (the lines starting `├` / `└` with `○`, `●` or `ƒ`). Task 14 compares against it: no existing route may change from static (`○`/`●`) to dynamic (`ƒ`).

- [ ] **Step 1: Install dependencies**

```bash
npm i better-auth@1.7.5 drizzle-orm@0.45.2 @neondatabase/serverless@1.1.0
npm i -D drizzle-kit@0.31.10 @electric-sql/pglite@0.5.8
```

Add to `scripts` in `web/package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 2: Write the failing test**

`web/tests/dbSchema.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { createTestDb } from "./helpers/testDb";
import { progressMark, sandboxDraft, user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";

let db: Db;
let close: () => Promise<void>;

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values({ id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true });
});
afterEach(async () => close());

describe("database schema", () => {
  it("progress_mark is a set: a repeated insert is a no-op", async () => {
    const row = { userId: "u1", courseSlug: "dsa", kind: "visited" as const, itemId: "arrays/intro" };
    await db.insert(progressMark).values(row).onConflictDoNothing();
    await db.insert(progressMark).values(row).onConflictDoNothing();
    const rows = await db.select().from(progressMark);
    expect(rows).toHaveLength(1);
  });

  it("rejects a mark kind outside visited/solved", async () => {
    await expect(
      db.execute(sql`insert into progress_mark (user_id, course_slug, kind, item_id) values ('u1','dsa','liked','x')`),
    ).rejects.toThrow();
  });

  it("rejects a draft over 64 KB", async () => {
    await expect(
      db.insert(sandboxDraft).values({
        userId: "u1", sandboxId: "two-sum", lang: "python",
        code: "x".repeat(65537), updatedAt: new Date(), rev: 1,
      }),
    ).rejects.toThrow();
  });

  it("deleting a user cascades to marks and drafts", async () => {
    await db.insert(progressMark).values({ userId: "u1", courseSlug: "dsa", kind: "solved", itemId: "hash-tables/two-sum" });
    await db.insert(sandboxDraft).values({
      userId: "u1", sandboxId: "two-sum", lang: "python", code: "pass", updatedAt: new Date(), rev: 1,
    });
    await db.delete(user).where(eq(user.id, "u1"));
    expect(await db.select().from(progressMark)).toHaveLength(0);
    expect(await db.select().from(sandboxDraft)).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- tests/dbSchema.test.ts`
Expected: FAIL, cannot resolve `./helpers/testDb` / `../src/lib/db/schema`.

- [ ] **Step 4: Write the schema**

`web/src/lib/db/schema.ts`:

```ts
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// Better Auth's core tables, in the field names its Drizzle adapter maps by.
// Task 2's session test proves the adapter can read and write them.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Insert-only: visited and solved never shrink, so merging devices is set
// union, and ON CONFLICT DO NOTHING makes that a property of the table.
export const progressMark = pgTable(
  "progress_mark",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    courseSlug: text("course_slug").notNull(),
    kind: text("kind", { enum: ["visited", "solved"] }).notNull(),
    itemId: text("item_id").notNull(),
    firstAt: timestamp("first_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.courseSlug, t.kind, t.itemId] }),
    check("progress_mark_kind", sql`${t.kind} in ('visited', 'solved')`),
  ],
);

// updated_at is the client's clock and only orders edits; rev is the server's
// counter and only detects a concurrent write. Client clocks drift, so they
// must never decide conflicts.
export const sandboxDraft = pgTable(
  "sandbox_draft",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    sandboxId: text("sandbox_id").notNull(),
    lang: text("lang", { enum: ["python", "javascript"] }).notNull(),
    code: text("code").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    rev: integer("rev").notNull(),
    // A reset is synced as a tombstone, or another device's pull revives it.
    deleted: boolean("deleted").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.sandboxId, t.lang] }),
    check("sandbox_draft_lang", sql`${t.lang} in ('python', 'javascript')`),
    check("sandbox_draft_size", sql`octet_length(${t.code}) <= 65536`),
  ],
);

export const authSchema = { user, session, account, verification };
```

`web/src/lib/db/types.ts`:

```ts
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/** Neon in production, PGlite in tests: both are Postgres dialect databases. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
```

`web/src/lib/db/client.ts`:

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { Db } from "./types";

let cached: Db | null = null;

/** Null when DATABASE_URL is unset: the app then runs anonymous-only. */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached ??= drizzle(neon(url), { schema });
  return cached;
}
```

`web/drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Only `migrate` connects; `generate` works from the schema alone.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
```

`web/tests/helpers/testDb.ts`:

```ts
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../../src/lib/db/schema";
import type { Db } from "../../src/lib/db/types";

const MIGRATIONS = fileURLToPath(new URL("../../drizzle", import.meta.url));

/**
 * Real Postgres (WASM, in-process) with the committed migrations applied.
 * The guarantees under test (ON CONFLICT, conditional UPDATE, CASCADE) are
 * Postgres behaviour; a mock would only test our assumptions about them.
 */
export async function createTestDb(): Promise<{ db: Db; close: () => Promise<void> }> {
  const client = new PGlite();
  const pglite = drizzle(client, { schema });
  await migrate(pglite, { migrationsFolder: MIGRATIONS });
  const db: Db = pglite;
  return { db, close: () => client.close() };
}
```

- [ ] **Step 5: Generate the migration**

Run: `npm run db:generate`
Expected: `web/drizzle/0000_<name>.sql` and `web/drizzle/meta/` created. Open the SQL and confirm it contains `ON DELETE cascade` on all four user foreign keys and the three `CHECK` constraints.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- tests/dbSchema.test.ts`
Expected: 4 passed.

- [ ] **Step 7: Prove it can fail**

Change `onDelete: "cascade"` on `progressMark.userId` to `onDelete: "no action"`, run `npm run db:generate`, rerun the test: the cascade test FAILS. Restore the schema, delete the extra migration file and its `meta` entry (`git status drizzle/` must show only `0000_*`), rerun: PASS.

- [ ] **Step 8: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors. (If `drizzle(neon(url), { schema })` is reported as not assignable to `Db`, the `PgQueryResultHKT` variance assumption is wrong: change `Db` to `NeonHttpDatabase<typeof schema> | PgliteDatabase<typeof schema>` and rerun.)

```bash
git add package.json package-lock.json drizzle.config.ts drizzle src/lib/db tests/helpers/testDb.ts tests/dbSchema.test.ts
git commit -m "feat(db): progress schema, migrations and PGlite test harness"
```

---

### Task 2: Better Auth server, configuration gate and auth route

**Files:**
- Create: `web/src/lib/auth/env.ts`, `web/src/lib/auth/createAuth.ts`, `web/src/lib/auth/server.ts`, `web/src/app/api/auth/[...all]/route.ts`
- Test: `web/tests/authServer.test.ts`

**Interfaces:**
- Consumes: `Db`, `authSchema`, `createTestDb` (Task 1).
- Produces:
  - `interface AuthEnv { baseURL: string; secret: string; github: OAuthPair; google: OAuthPair; production: boolean }`, `interface OAuthPair { clientId: string; clientSecret: string }`
  - `readAuthEnv(env?: Record<string, string | undefined>): AuthEnv | null`
  - `isAuthConfigured(env?): boolean`
  - `createAuth(db: Db, env: AuthEnv, opts?: { testUtils?: boolean })`, `type Auth = ReturnType<typeof createAuth>`
  - `getAuth(): Auth | null` (server-only singleton)
  - `sessionUserId(auth: Auth, headers: Headers): Promise<string | null>`

- [ ] **Step 1: Write the failing test**

`web/tests/authServer.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/authServer.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`web/src/lib/auth/env.ts`:

```ts
export interface OAuthPair {
  clientId: string;
  clientSecret: string;
}

export interface AuthEnv {
  baseURL: string;
  secret: string;
  github: OAuthPair;
  google: OAuthPair;
  production: boolean;
}

type Env = Record<string, string | undefined>;

/**
 * Null unless every variable is set. Local development without secrets and
 * Vercel previews (whose per-deploy URLs cannot be registered as OAuth
 * callbacks) land here and run anonymous-only, exactly as before accounts.
 * Hook-free and import-free on purpose: the root layout may reach it.
 */
export function readAuthEnv(env: Env = process.env): AuthEnv | null {
  const {
    DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  } = env;
  if (
    !DATABASE_URL || !BETTER_AUTH_SECRET || !BETTER_AUTH_URL ||
    !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET
  ) {
    return null;
  }
  return {
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    github: { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET },
    google: { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET },
    production: env.NODE_ENV === "production",
  };
}

export function isAuthConfigured(env: Env = process.env): boolean {
  return readAuthEnv(env) !== null;
}
```

`web/src/lib/auth/createAuth.ts`:

```ts
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
```

`web/src/lib/auth/server.ts`:

```ts
import "server-only";
import { getDb } from "@/lib/db/client";
import { createAuth, type Auth } from "./createAuth";
import { readAuthEnv } from "./env";

export { sessionUserId, type Auth } from "./createAuth";

let cached: Auth | null = null;

export function getAuth(): Auth | null {
  if (cached) return cached;
  const env = readAuthEnv();
  const db = getDb();
  if (!env || !db) return null;
  cached = createAuth(db, env);
  return cached;
}
```

`web/src/app/api/auth/[...all]/route.ts`:

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

function unavailable(): Response {
  return Response.json({ code: "auth_unavailable" }, { status: 503 });
}

export async function GET(req: Request): Promise<Response> {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).GET(req) : unavailable();
}

export async function POST(req: Request): Promise<Response> {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).POST(req) : unavailable();
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/authServer.test.ts`
Expected: 4 passed. If `$context.test` is untyped in 1.7.5, `tsc` in Step 6 reports it: import `type TestHelpers` from `better-auth/plugins` and narrow with a runtime check (`if (!("test" in ctx)) throw …`), not a cast.

- [ ] **Step 5: Prove it can fail**

Remove `query: { disableCookieCache: true }` from `sessionUserId`: the revocation test FAILS (the cookie cache still vouches). Restore: PASS.

- [ ] **Step 6: Typecheck and commit**

Run: `npx tsc --noEmit` → no errors.

```bash
git add src/lib/auth src/app/api/auth tests/authServer.test.ts
git commit -m "feat(auth): Better Auth with GitHub and Google behind a configuration gate"
```

---

### Task 3: Shared types and pure merge rules

**Files:**
- Create: `web/src/lib/progress/types.ts`, `web/src/lib/progress/merge.ts`
- Test: `web/tests/progressMerge.test.ts`

**Interfaces:**
- Produces (`types.ts`):

```ts
export type MarkKind = "visited" | "solved";
export type DraftLang = "python" | "javascript";
export const DRAFT_LANGS: readonly DraftLang[] = ["python", "javascript"];
export interface Mark { course: string; kind: MarkKind; id: string }
/** A draft as the server holds it. `updatedAt` is ISO 8601. */
export interface ServerDraft { code: string; updatedAt: string; rev: number; deleted: boolean }
export type ServerDrafts = Partial<Record<DraftLang, ServerDraft>>;
export interface MarksSnapshot { visited: string[]; solved: string[]; hasDrafts: boolean }
/** A version kept aside so a conflict never drops code. */
export interface Stash { code: string; updatedAt: string | null; deleted: boolean }
export interface LocalDraft { code: string; updatedAt: string | null; deleted: boolean }
/** Lives here, not in schemas.ts, so the client queue does not pull zod and the registries. */
export const MARK_BATCH_MAX = 500;
/** BroadcastChannel name; here so the header can post to it without importing the sync chunk. */
export const AUTH_CHANNEL = "leetexpert-auth";
```

- Produces (`merge.ts`):
  - `unionIds(a: Iterable<string>, b: Iterable<string>): string[]` (sorted)
  - `type MountResolution = "keep-local" | "take-server" | "adopt-rev" | "local-wins-stash-server" | "server-wins-stash-local"`
  - `resolveOnMount(local: LocalDraft | null, localDirty: boolean, server: ServerDraft | null, baseRev: number): MountResolution`
  - `resolveOn409(local: LocalDraft, server: ServerDraft): "adopt-rev" | "stash-server"`
  - `type OwnerAction = "merge" | "resume" | "replace"`; `ownerAction(owner: string | null, userId: string): OwnerAction`
  - `type MergeDecision = "pull-only" | "merge-silently" | "ask"`; `mergeDecision(localHasData: boolean, server: MarksSnapshot): MergeDecision`
  - `LEGACY_UPDATED_AT = "1970-01-01T00:00:00.000Z"`

- [ ] **Step 1: Write the failing test**

`web/tests/progressMerge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  mergeDecision, ownerAction, resolveOn409, resolveOnMount, unionIds,
} from "../src/lib/progress/merge";
import type { LocalDraft, ServerDraft } from "../src/lib/progress/types";

const server = (over: Partial<ServerDraft> = {}): ServerDraft => ({
  code: "server", updatedAt: "2026-09-18T10:00:00.000Z", rev: 3, deleted: false, ...over,
});
const local = (over: Partial<LocalDraft> = {}): LocalDraft => ({
  code: "local", updatedAt: "2026-09-18T11:00:00.000Z", deleted: false, ...over,
});

describe("unionIds", () => {
  it("is order-independent and deduplicated", () => {
    expect(unionIds(["b", "a"], ["c", "a"])).toEqual(["a", "b", "c"]);
    expect(unionIds(["c", "a"], ["b", "a"])).toEqual(unionIds(["b", "a"], ["c", "a"]));
  });
});

describe("resolveOnMount (spec §6.3)", () => {
  it("no server copy: keep local", () => {
    expect(resolveOnMount(local(), true, null, 0)).toBe("keep-local");
  });
  it("server unchanged since baseRev: keep local", () => {
    expect(resolveOnMount(local(), true, server({ rev: 3 }), 3)).toBe("keep-local");
  });
  it("server changed, local clean: take server", () => {
    expect(resolveOnMount(local(), false, server(), 2)).toBe("take-server");
    expect(resolveOnMount(null, false, server(), 0)).toBe("take-server");
  });
  it("both changed to identical code: adopt rev", () => {
    expect(resolveOnMount(local({ code: "same" }), true, server({ code: "same" }), 2)).toBe("adopt-rev");
  });
  it("both changed: newer updatedAt goes in the editor, the other is stashed", () => {
    expect(resolveOnMount(local(), true, server(), 2)).toBe("local-wins-stash-server");
    expect(
      resolveOnMount(local({ updatedAt: "2026-09-18T09:00:00.000Z" }), true, server(), 2),
    ).toBe("server-wins-stash-local");
  });
  it("a legacy draft without a timestamp loses to the server and is stashed", () => {
    expect(resolveOnMount(local({ updatedAt: null }), true, server(), 0)).toBe("server-wins-stash-local");
  });
});

describe("resolveOn409", () => {
  it("identical code adopts the rev; anything else stashes the server copy", () => {
    expect(resolveOn409(local({ code: "x" }), server({ code: "x" }))).toBe("adopt-rev");
    expect(resolveOn409(local(), server())).toBe("stash-server");
  });
});

describe("ownerAction (spec §7)", () => {
  it("covers the three cases", () => {
    expect(ownerAction(null, "u1")).toBe("merge");
    expect(ownerAction("u1", "u1")).toBe("resume");
    expect(ownerAction("u2", "u1")).toBe("replace");
  });
});

describe("mergeDecision (spec §7)", () => {
  const empty = { visited: [], solved: [], hasDrafts: false };
  it("nothing local: pull only", () => {
    expect(mergeDecision(false, { ...empty, visited: ["a/b"] })).toBe("pull-only");
  });
  it("empty account: merge silently", () => {
    expect(mergeDecision(true, empty)).toBe("merge-silently");
  });
  it("account with marks or only drafts: ask", () => {
    expect(mergeDecision(true, { ...empty, solved: ["a/b"] })).toBe("ask");
    expect(mergeDecision(true, { ...empty, hasDrafts: true })).toBe("ask");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/progressMerge.test.ts` → FAIL, module not found.

- [ ] **Step 3: Implement**

Write `web/src/lib/progress/types.ts` exactly as in **Interfaces** above.

`web/src/lib/progress/merge.ts`:

```ts
import type { LocalDraft, MarksSnapshot, ServerDraft } from "./types";

/** Drafts saved before sync shipped have no timestamp; they lose every tie-break. */
export const LEGACY_UPDATED_AT = "1970-01-01T00:00:00.000Z";

export function unionIds(a: Iterable<string>, b: Iterable<string>): string[] {
  return [...new Set([...a, ...b])].sort();
}

export type MountResolution =
  | "keep-local"
  | "take-server"
  | "adopt-rev"
  | "local-wins-stash-server"
  | "server-wins-stash-local";

function sameContent(a: LocalDraft, b: ServerDraft): boolean {
  return a.deleted === b.deleted && (a.deleted || a.code === b.code);
}

/**
 * `localDirty` = this device changed the draft since it last saw `baseRev`.
 * The rev says whether the server moved; only when both moved does the
 * client clock get a say, and then only to pick which copy goes in the
 * editor — the other is stashed, never dropped.
 */
export function resolveOnMount(
  local: LocalDraft | null,
  localDirty: boolean,
  server: ServerDraft | null,
  baseRev: number,
): MountResolution {
  if (!server || server.rev === baseRev) return "keep-local";
  if (!local || !localDirty) return "take-server";
  if (sameContent(local, server)) return "adopt-rev";
  const localAt = Date.parse(local.updatedAt ?? LEGACY_UPDATED_AT);
  const serverAt = Date.parse(server.updatedAt);
  return localAt >= serverAt ? "local-wins-stash-server" : "server-wins-stash-local";
}

/** Mid-edit, what is on screen always stays; only the server copy can move aside. */
export function resolveOn409(local: LocalDraft, server: ServerDraft): "adopt-rev" | "stash-server" {
  return sameContent(local, server) ? "adopt-rev" : "stash-server";
}

export type OwnerAction = "merge" | "resume" | "replace";

export function ownerAction(owner: string | null, userId: string): OwnerAction {
  if (owner === null) return "merge";
  return owner === userId ? "resume" : "replace";
}

export type MergeDecision = "pull-only" | "merge-silently" | "ask";

/**
 * A brand-new account is the one case where "this device's progress is
 * yours" is near-certain; an existing one may be signing in on someone
 * else's computer, so it is asked.
 */
export function mergeDecision(localHasData: boolean, server: MarksSnapshot): MergeDecision {
  if (!localHasData) return "pull-only";
  const serverHasData = server.visited.length > 0 || server.solved.length > 0 || server.hasDrafts;
  return serverHasData ? "ask" : "merge-silently";
}
```

- [ ] **Step 4: Run the tests** → 11 passed.

- [ ] **Step 5: Prove it can fail**

Change `localAt >= serverAt` to `localAt <= serverAt`: the "newer goes in the editor" and legacy tests FAIL. Restore: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/progress/types.ts src/lib/progress/merge.ts tests/progressMerge.test.ts
git commit -m "feat(progress): pure merge rules for marks, drafts and account owners"
```

---

### Task 4: Id registries, request schemas and the SQL store

**Files:**
- Modify: `web/src/lib/coach/buildCorpus.ts` (add `writeSandboxIds`), `web/scripts/build-coach-corpus.mjs` (call it)
- Create: `web/src/lib/sandbox/sandboxIds.generated.json` (generated), `web/src/lib/progress/knownIds.ts`, `web/src/lib/progress/schemas.ts`, `web/src/lib/progress/store.ts`
- Test: `web/tests/progressStore.test.ts`, `web/tests/progressIds.test.ts`

**Interfaces:**
- Consumes: `Db`, `progressMark`, `sandboxDraft`, `user` (Task 1); types (Task 3).
- Produces:
  - `isKnownLessonId(course: string, id: string): boolean`, `isKnownSandboxId(id: string): boolean`, `COURSE_SLUGS = ["dsa"] as const`
  - zod: `marksBatchSchema` → `{ course: "dsa"; marks: { kind: MarkKind; id: string }[] }`; `draftPutSchema` → `DraftPutBody = { lang: DraftLang; code: string; updatedAt: string; baseRev: number; deleted: boolean }`; `DRAFT_MAX_BYTES = 65536`; `MARK_BATCH_MAX = 500`
  - `getMarks(db, userId, course): Promise<MarksSnapshot>`
  - `addMarks(db, userId, course, marks: { kind: MarkKind; id: string }[]): Promise<void>`
  - `getDrafts(db, userId, sandboxId): Promise<ServerDrafts>`
  - `type PutDraftResult = { ok: true; rev: number } | { ok: false; server: ServerDraft }`
  - `putDraft(db, userId, sandboxId, body: DraftPutBody): Promise<PutDraftResult>`
  - `deleteAccount(db, userId): Promise<void>`
  - `exportAccount(db, userId): Promise<AccountExport>` with `AccountExport = { user: { name: string; email: string; createdAt: string } | null; marks: { course: string; kind: MarkKind; id: string; firstAt: string }[]; drafts: ({ sandboxId: string; lang: DraftLang } & ServerDraft)[] }`

- [ ] **Step 1: Generate the sandbox id registry**

Append to `web/src/lib/coach/buildCorpus.ts`:

```ts
/**
 * The sandbox ids sync may store drafts under. Generated from the same
 * corpus walk, because sandbox ids are not always problem slugs
 * (`find-min-rotated` belongs to `find-minimum-in-rotated-sorted-array`).
 */
export function sandboxIdsOutputPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "sandbox", "sandboxIds.generated.json");
}

export function writeSandboxIds(courseRoot = resolveCourseRoot()): string {
  const out = sandboxIdsOutputPath();
  const ids = Object.keys(buildCorpus(courseRoot)).sort();
  writeFileSync(out, `${JSON.stringify(ids, null, 2)}\n`);
  return out;
}
```

In `web/scripts/build-coach-corpus.mjs`, change the import and add a call after `writeCoachCorpus()`:

```js
const { buildCorpus, writeCoachCorpus, writeSandboxIds } = await jiti.import(
  "../src/lib/coach/buildCorpus.ts",
);

const out = writeCoachCorpus();
const idsOut = writeSandboxIds();
console.log(
  `[coach-corpus] ${Object.keys(buildCorpus()).length} problems → ${out}; ids → ${idsOut}`,
);
```

Run: `node scripts/build-coach-corpus.mjs`
Expected: `src/lib/sandbox/sandboxIds.generated.json` holds 116 sorted ids.

- [ ] **Step 2: Write the failing tests**

`web/tests/progressIds.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCorpus, sandboxIdsOutputPath } from "../src/lib/coach/buildCorpus";
import { allLessonIds } from "../src/lib/course/manifest";
import { isKnownLessonId, isKnownSandboxId } from "../src/lib/progress/knownIds";

describe("progress id registries", () => {
  it("the generated sandbox id list matches a fresh corpus build", () => {
    const written = JSON.parse(readFileSync(sandboxIdsOutputPath(), "utf8")) as string[];
    expect(written).toEqual(Object.keys(buildCorpus()).sort());
  }, 20000);

  it("accepts real ids and rejects typos, other courses and the landing sandbox", () => {
    expect(isKnownSandboxId("find-min-rotated")).toBe(true);
    expect(isKnownSandboxId("find-minimum-in-rotated-sorted-array")).toBe(false);
    expect(isKnownSandboxId("landing-find-pair")).toBe(false);
    const lesson = allLessonIds()[0]!;
    expect(isKnownLessonId("dsa", lesson)).toBe(true);
    expect(isKnownLessonId("dsa", `${lesson}x`)).toBe(false);
    expect(isKnownLessonId("nextjs", lesson)).toBe(false);
  });
});
```

`web/tests/progressStore.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./helpers/testDb";
import { user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";
import {
  addMarks, deleteAccount, exportAccount, getDrafts, getMarks, putDraft,
} from "../src/lib/progress/store";

let db: Db;
let close: () => Promise<void>;
const AT = "2026-09-18T10:00:00.000Z";

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values([
    { id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true },
    { id: "u2", name: "Bo", email: "bo@example.com", emailVerified: true },
  ]);
});
afterEach(async () => close());

describe("marks", () => {
  it("a repeated batch inserts once and is scoped to its user", async () => {
    const batch = [{ kind: "visited" as const, id: "arrays/intro" }, { kind: "solved" as const, id: "hash-tables/two-sum" }];
    await addMarks(db, "u1", "dsa", batch);
    await addMarks(db, "u1", "dsa", batch);
    expect(await getMarks(db, "u1", "dsa")).toEqual({
      visited: ["arrays/intro"], solved: ["hash-tables/two-sum"], hasDrafts: false,
    });
    expect(await getMarks(db, "u2", "dsa")).toEqual({ visited: [], solved: [], hasDrafts: false });
  });
});

describe("drafts", () => {
  const body = { lang: "python" as const, code: "a", updatedAt: AT, baseRev: 0, deleted: false };

  it("creates at rev 1, then advances only from the current rev", async () => {
    expect(await putDraft(db, "u1", "two-sum", body)).toEqual({ ok: true, rev: 1 });
    expect(await putDraft(db, "u1", "two-sum", { ...body, code: "b", baseRev: 1 })).toEqual({ ok: true, rev: 2 });
    const stale = await putDraft(db, "u1", "two-sum", { ...body, code: "c", baseRev: 1 });
    expect(stale).toEqual({ ok: false, server: { code: "b", updatedAt: AT, rev: 2, deleted: false } });
  });

  it("a baseRev-0 write over an existing row is a conflict, not an overwrite", async () => {
    await putDraft(db, "u1", "two-sum", body);
    const second = await putDraft(db, "u1", "two-sum", { ...body, code: "other" });
    expect(second.ok).toBe(false);
  });

  it("a tombstone is kept and a stale device cannot revive it", async () => {
    await putDraft(db, "u1", "two-sum", body);
    await putDraft(db, "u1", "two-sum", { ...body, code: "", deleted: true, baseRev: 1 });
    const stale = await putDraft(db, "u1", "two-sum", { ...body, code: "old", baseRev: 1 });
    expect(stale).toEqual({ ok: false, server: { code: "", updatedAt: AT, rev: 2, deleted: true } });
    expect((await getDrafts(db, "u1", "two-sum")).python?.deleted).toBe(true);
  });

  it("drafts are invisible to other users and reported by hasDrafts", async () => {
    await putDraft(db, "u1", "two-sum", body);
    expect(await getDrafts(db, "u2", "two-sum")).toEqual({});
    expect((await getMarks(db, "u1", "dsa")).hasDrafts).toBe(true);
  });
});

describe("account", () => {
  it("export holds the user's data; delete leaves nothing", async () => {
    await addMarks(db, "u1", "dsa", [{ kind: "visited", id: "arrays/intro" }]);
    await putDraft(db, "u1", "two-sum", { lang: "python", code: "a", updatedAt: AT, baseRev: 0, deleted: false });
    const data = await exportAccount(db, "u1");
    expect(data.user?.email).toBe("ada@example.com");
    expect(data.marks.map((m) => m.id)).toEqual(["arrays/intro"]);
    expect(data.drafts).toHaveLength(1);
    await deleteAccount(db, "u1");
    const after = await exportAccount(db, "u1");
    expect(after).toEqual({ user: null, marks: [], drafts: [] });
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npm test -- tests/progressIds.test.ts tests/progressStore.test.ts` → FAIL, modules not found.

- [ ] **Step 4: Implement**

`web/src/lib/progress/knownIds.ts`:

```ts
import sandboxIds from "@/lib/sandbox/sandboxIds.generated.json";
import { allLessonIds } from "@/lib/course/manifest";

// Only DSA syncs: the Next.js course 404s every route while disabled.
export const COURSE_SLUGS = ["dsa"] as const;

const LESSON_IDS = new Set(allLessonIds());
const SANDBOX_IDS = new Set<string>(sandboxIds);

export function isKnownLessonId(course: string, id: string): boolean {
  return course === "dsa" && LESSON_IDS.has(id);
}

export function isKnownSandboxId(id: string): boolean {
  return SANDBOX_IDS.has(id);
}
```

`web/src/lib/progress/schemas.ts`:

```ts
import { z } from "zod";
import { COURSE_SLUGS } from "./knownIds";
import { MARK_BATCH_MAX } from "./types";

export { MARK_BATCH_MAX };
export const DRAFT_MAX_BYTES = 65536;

const encoder = new TextEncoder();

export const marksBatchSchema = z.object({
  course: z.enum(COURSE_SLUGS),
  marks: z
    .array(z.object({ kind: z.enum(["visited", "solved"]), id: z.string().min(1).max(200) }))
    .min(1)
    .max(MARK_BATCH_MAX),
});

export const draftPutSchema = z.object({
  lang: z.enum(["python", "javascript"]),
  // The column CHECK counts bytes, so this must too: 65536 characters of
  // non-ASCII code would pass a length check and then fail the insert.
  code: z.string().refine((s) => encoder.encode(s).length <= DRAFT_MAX_BYTES, "draft too large"),
  updatedAt: z.iso.datetime(),
  baseRev: z.number().int().min(0),
  deleted: z.boolean(),
});

export type DraftPutBody = z.infer<typeof draftPutSchema>;
```

`web/src/lib/progress/store.ts`:

```ts
import { and, eq, sql } from "drizzle-orm";
import { progressMark, sandboxDraft, user } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import type { DraftPutBody } from "./schemas";
import type { DraftLang, MarkKind, MarksSnapshot, ServerDraft, ServerDrafts } from "./types";

export async function getMarks(db: Db, userId: string, course: string): Promise<MarksSnapshot> {
  const rows = await db
    .select({ kind: progressMark.kind, id: progressMark.itemId })
    .from(progressMark)
    .where(and(eq(progressMark.userId, userId), eq(progressMark.courseSlug, course)));
  const draft = await db
    .select({ one: sql<number>`1` })
    .from(sandboxDraft)
    .where(eq(sandboxDraft.userId, userId))
    .limit(1);
  return {
    visited: rows.filter((r) => r.kind === "visited").map((r) => r.id).sort(),
    solved: rows.filter((r) => r.kind === "solved").map((r) => r.id).sort(),
    hasDrafts: draft.length > 0,
  };
}

export async function addMarks(
  db: Db,
  userId: string,
  course: string,
  marks: { kind: MarkKind; id: string }[],
): Promise<void> {
  if (marks.length === 0) return;
  await db
    .insert(progressMark)
    .values(marks.map((m) => ({ userId, courseSlug: course, kind: m.kind, itemId: m.id })))
    .onConflictDoNothing();
}

function toServerDraft(row: { code: string; updatedAt: Date; rev: number; deleted: boolean }): ServerDraft {
  return { code: row.code, updatedAt: row.updatedAt.toISOString(), rev: row.rev, deleted: row.deleted };
}

export async function getDrafts(db: Db, userId: string, sandboxId: string): Promise<ServerDrafts> {
  const rows = await db
    .select()
    .from(sandboxDraft)
    .where(and(eq(sandboxDraft.userId, userId), eq(sandboxDraft.sandboxId, sandboxId)));
  const out: ServerDrafts = {};
  for (const row of rows) out[row.lang] = toServerDraft(row);
  return out;
}

export type PutDraftResult = { ok: true; rev: number } | { ok: false; server: ServerDraft };

/**
 * Optimistic concurrency: the write lands only if the row is still at the
 * rev this device last saw (0 = "I have never seen a server copy"). A
 * mismatch returns the server's copy so the client can stash, not overwrite.
 */
export async function putDraft(
  db: Db,
  userId: string,
  sandboxId: string,
  body: DraftPutBody,
): Promise<PutDraftResult> {
  const values = { code: body.code, updatedAt: new Date(body.updatedAt), deleted: body.deleted };
  const key = and(
    eq(sandboxDraft.userId, userId),
    eq(sandboxDraft.sandboxId, sandboxId),
    eq(sandboxDraft.lang, body.lang),
  );
  const written =
    body.baseRev === 0
      ? await db
          .insert(sandboxDraft)
          .values({ userId, sandboxId, lang: body.lang, rev: 1, ...values })
          .onConflictDoNothing()
          .returning({ rev: sandboxDraft.rev })
      : await db
          .update(sandboxDraft)
          .set({ ...values, rev: sql`${sandboxDraft.rev} + 1` })
          .where(and(key, eq(sandboxDraft.rev, body.baseRev)))
          .returning({ rev: sandboxDraft.rev });
  if (written[0]) return { ok: true, rev: written[0].rev };

  const current = (await getDrafts(db, userId, sandboxId))[body.lang];
  // The row this device based its edit on no longer exists (the account
  // was reset elsewhere): start it afresh rather than fail forever.
  if (!current) return putDraft(db, userId, sandboxId, { ...body, baseRev: 0 });
  return { ok: false, server: current };
}

export async function deleteAccount(db: Db, userId: string): Promise<void> {
  // Sessions, accounts, marks and drafts all cascade from the user row.
  await db.delete(user).where(eq(user.id, userId));
}

export interface AccountExport {
  user: { name: string; email: string; createdAt: string } | null;
  marks: { course: string; kind: MarkKind; id: string; firstAt: string }[];
  drafts: ({ sandboxId: string; lang: DraftLang } & ServerDraft)[];
}

export async function exportAccount(db: Db, userId: string): Promise<AccountExport> {
  const [person] = await db.select().from(user).where(eq(user.id, userId));
  const marks = await db.select().from(progressMark).where(eq(progressMark.userId, userId));
  const drafts = await db.select().from(sandboxDraft).where(eq(sandboxDraft.userId, userId));
  return {
    user: person ? { name: person.name, email: person.email, createdAt: person.createdAt.toISOString() } : null,
    marks: marks.map((m) => ({ course: m.courseSlug, kind: m.kind, id: m.itemId, firstAt: m.firstAt.toISOString() })),
    drafts: drafts.map((d) => ({ sandboxId: d.sandboxId, lang: d.lang, ...toServerDraft(d) })),
  };
}
```

- [ ] **Step 5: Run the tests** → `progressIds` 2 passed, `progressStore` 6 passed.

- [ ] **Step 6: Prove it can fail**

Remove `eq(sandboxDraft.rev, body.baseRev)` from the update's `where`: the stale-write and tombstone tests FAIL (a stale device overwrites). Restore: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/coach/buildCorpus.ts scripts/build-coach-corpus.mjs src/lib/sandbox/sandboxIds.generated.json src/lib/progress/knownIds.ts src/lib/progress/schemas.ts src/lib/progress/store.ts tests/progressIds.test.ts tests/progressStore.test.ts
git commit -m "feat(progress): id registries, request schemas and SQL store with draft revisions"
```

---

### Task 5: API handlers, rate limit and routes

**Files:**
- Create: `web/src/lib/progress/rateLimit.ts`, `web/src/lib/progress/handlers.ts`, `web/src/lib/progress/routeDeps.ts`, `web/src/app/api/progress/route.ts`, `web/src/app/api/progress/drafts/[sandboxId]/route.ts`, `web/src/app/api/account/route.ts`, `web/src/app/api/account/export/route.ts`
- Test: `web/tests/progressApi.test.ts`

**Interfaces:**
- Consumes: store, schemas, knownIds (Task 4); `getDb` (Task 1); `getAuth`, `sessionUserId` (Task 2); `isSameOrigin` (`lib/coach/origin.ts`).
- Produces:
  - `interface RateLimiter { hit(userId: string): Promise<boolean> }` (true = allowed); `MemoryRateLimit`, `RedisRateLimit`; `WRITES_PER_MINUTE = 120`
  - `interface ProgressDeps { configured: boolean; sameOrigin: boolean; userId: string | null; db: Db | null; limiter: RateLimiter }`
  - `interface HandlerResult { status: number; body: unknown }`
  - `handleMarksGet(course: string | null, deps)`, `handleMarksPost(body: unknown, deps)`, `handleDraftsGet(sandboxId: string, deps)`, `handleDraftPut(sandboxId: string, body: unknown, deps)`, `handleAccountDelete(deps)`, `handleAccountExport(deps)` — all `Promise<HandlerResult>`
  - Error bodies: `{ code: "auth_unavailable" | "unauthorized" | "cross_origin" | "rate_limited" | "bad_request" }`. 409 body: `{ code: "conflict", server: ServerDraft }`. Draft PUT 200 body: `{ rev: number }`.

- [ ] **Step 1: Write the failing test**

`web/tests/progressApi.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./helpers/testDb";
import { user } from "../src/lib/db/schema";
import type { Db } from "../src/lib/db/types";
import {
  handleAccountDelete, handleAccountExport, handleDraftPut, handleDraftsGet,
  handleMarksGet, handleMarksPost, type ProgressDeps,
} from "../src/lib/progress/handlers";
import { MemoryRateLimit } from "../src/lib/progress/rateLimit";
import { allLessonIds } from "../src/lib/course/manifest";

let db: Db;
let close: () => Promise<void>;
const LESSON = allLessonIds()[0]!;
const SANDBOX = "find-min-rotated";
const AT = "2026-09-18T10:00:00.000Z";

function deps(over: Partial<ProgressDeps> = {}): ProgressDeps {
  return { configured: true, sameOrigin: true, userId: "u1", db, limiter: new MemoryRateLimit(120), ...over };
}

beforeEach(async () => {
  ({ db, close } = await createTestDb());
  await db.insert(user).values([
    { id: "u1", name: "Ada", email: "ada@example.com", emailVerified: true },
    { id: "u2", name: "Bo", email: "bo@example.com", emailVerified: true },
  ]);
});
afterEach(async () => close());

describe("guards", () => {
  it("503 when auth is not configured, 401 without a session, 403 cross-origin writes", async () => {
    expect((await handleMarksGet("dsa", deps({ configured: false, db: null }))).status).toBe(503);
    expect((await handleMarksGet("dsa", deps({ userId: null }))).status).toBe(401);
    expect((await handleDraftsGet(SANDBOX, deps({ userId: null }))).status).toBe(401);
    expect((await handleAccountExport(deps({ userId: null }))).status).toBe(401);
    const post = { course: "dsa", marks: [{ kind: "visited", id: LESSON }] };
    expect((await handleMarksPost(post, deps({ sameOrigin: false }))).status).toBe(403);
  });

  it("429 once the per-minute write budget is spent", async () => {
    const limiter = new MemoryRateLimit(1);
    const post = { course: "dsa", marks: [{ kind: "visited", id: LESSON }] };
    expect((await handleMarksPost(post, deps({ limiter }))).status).toBe(204);
    expect((await handleMarksPost(post, deps({ limiter }))).status).toBe(429);
  });
});

describe("validation against the real registries", () => {
  it("rejects unknown lesson ids, unknown courses and unknown sandboxes", async () => {
    expect((await handleMarksPost({ course: "dsa", marks: [{ kind: "visited", id: "nope/nope" }] }, deps())).status).toBe(400);
    expect((await handleMarksPost({ course: "nextjs", marks: [{ kind: "visited", id: LESSON }] }, deps())).status).toBe(400);
    expect((await handleMarksGet("nextjs", deps())).status).toBe(400);
    const draft = { lang: "python", code: "x", updatedAt: AT, baseRev: 0, deleted: false };
    expect((await handleDraftPut("landing-find-pair", draft, deps())).status).toBe(400);
    expect((await handleDraftsGet("landing-find-pair", deps())).status).toBe(400);
    expect((await handleDraftPut(SANDBOX, { ...draft, code: "é".repeat(40000) }, deps())).status).toBe(400);
  });
});

describe("round trips", () => {
  it("marks post then get", async () => {
    await handleMarksPost({ course: "dsa", marks: [{ kind: "solved", id: LESSON }] }, deps());
    const got = await handleMarksGet("dsa", deps());
    expect(got).toEqual({ status: 200, body: { visited: [], solved: [LESSON], hasDrafts: false } });
  });

  it("draft put, conflict, get", async () => {
    const body = { lang: "python", code: "a", updatedAt: AT, baseRev: 0, deleted: false };
    expect(await handleDraftPut(SANDBOX, body, deps())).toEqual({ status: 200, body: { rev: 1 } });
    const conflict = await handleDraftPut(SANDBOX, { ...body, code: "b" }, deps());
    expect(conflict).toEqual({
      status: 409,
      body: { code: "conflict", server: { code: "a", updatedAt: AT, rev: 1, deleted: false } },
    });
    expect((await handleDraftsGet(SANDBOX, deps())).body).toEqual({
      python: { code: "a", updatedAt: AT, rev: 1, deleted: false },
    });
  });
});

describe("isolation: the user id only ever comes from the session", () => {
  it("user u2 cannot see or overwrite u1's rows, even naming u1 in the body", async () => {
    const body = { lang: "python", code: "mine", updatedAt: AT, baseRev: 0, deleted: false };
    await handleDraftPut(SANDBOX, body, deps());
    expect((await handleDraftsGet(SANDBOX, deps({ userId: "u2" }))).body).toEqual({});
    await handleDraftPut(SANDBOX, { ...body, code: "theirs", userId: "u1" }, deps({ userId: "u2" }));
    expect((await handleDraftsGet(SANDBOX, deps())).body).toEqual({
      python: { code: "mine", updatedAt: AT, rev: 1, deleted: false },
    });
  });
});

describe("account", () => {
  it("export then delete; the deleted session can no longer read", async () => {
    await handleMarksPost({ course: "dsa", marks: [{ kind: "visited", id: LESSON }] }, deps());
    const exported = await handleAccountExport(deps());
    expect(exported.status).toBe(200);
    expect(await handleAccountDelete(deps())).toEqual({ status: 204, body: null });
    expect((await handleAccountExport(deps())).body).toEqual({ user: null, marks: [], drafts: [] });
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, modules not found.

- [ ] **Step 3: Implement the rate limiter**

`web/src/lib/progress/rateLimit.ts`:

```ts
export const WRITES_PER_MINUTE = 120;

export interface RateLimiter {
  /** True when the write is allowed. */
  hit(userId: string): Promise<boolean>;
}

function minuteKey(now: Date): string {
  return now.toISOString().slice(0, 16);
}

export class MemoryRateLimit implements RateLimiter {
  private readonly counts = new Map<string, number>();

  constructor(
    private readonly cap: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async hit(userId: string): Promise<boolean> {
    const key = `${minuteKey(this.now())}:${userId}`;
    const used = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, used);
    return used <= this.cap;
  }
}

/** Same Upstash instance and shape as the coach's RedisQuota. */
export class RedisRateLimit implements RateLimiter {
  constructor(
    private readonly redis: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<unknown>;
    },
    private readonly cap: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async hit(userId: string): Promise<boolean> {
    const key = `progress:${minuteKey(this.now())}:${userId}`;
    const used = await this.redis.incr(key);
    if (used === 1) await this.redis.expire(key, 120);
    return used <= this.cap;
  }
}
```

- [ ] **Step 4: Implement the handlers**

`web/src/lib/progress/handlers.ts`:

```ts
import type { Db } from "@/lib/db/types";
import { isKnownLessonId, isKnownSandboxId } from "./knownIds";
import type { RateLimiter } from "./rateLimit";
import { draftPutSchema, marksBatchSchema } from "./schemas";
import { addMarks, deleteAccount, exportAccount, getDrafts, getMarks, putDraft } from "./store";

export interface ProgressDeps {
  configured: boolean;
  sameOrigin: boolean;
  userId: string | null;
  db: Db | null;
  limiter: RateLimiter;
}

export interface HandlerResult {
  status: number;
  body: unknown;
}

const err = (status: number, code: string): HandlerResult => ({ status, body: { code } });

type Ready = { userId: string; db: Db };

/**
 * Every route passes through here. The user id comes only from the session:
 * no request field can name another learner.
 */
async function guard(deps: ProgressDeps, write: boolean): Promise<Ready | HandlerResult> {
  if (!deps.configured || !deps.db) return err(503, "auth_unavailable");
  if (!deps.userId) return err(401, "unauthorized");
  if (write && !deps.sameOrigin) return err(403, "cross_origin");
  if (write && !(await deps.limiter.hit(deps.userId))) return err(429, "rate_limited");
  return { userId: deps.userId, db: deps.db };
}

function isResult(x: Ready | HandlerResult): x is HandlerResult {
  return "status" in x;
}

export async function handleMarksGet(course: string | null, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  if (course !== "dsa") return err(400, "bad_request");
  return { status: 200, body: await getMarks(ready.db, ready.userId, course) };
}

export async function handleMarksPost(body: unknown, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  const parsed = marksBatchSchema.safeParse(body);
  if (!parsed.success) return err(400, "bad_request");
  const { course, marks } = parsed.data;
  if (!marks.every((m) => isKnownLessonId(course, m.id))) return err(400, "bad_request");
  await addMarks(ready.db, ready.userId, course, marks);
  return { status: 204, body: null };
}

export async function handleDraftsGet(sandboxId: string, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  if (!isKnownSandboxId(sandboxId)) return err(400, "bad_request");
  return { status: 200, body: await getDrafts(ready.db, ready.userId, sandboxId) };
}

export async function handleDraftPut(sandboxId: string, body: unknown, deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  if (!isKnownSandboxId(sandboxId)) return err(400, "bad_request");
  const parsed = draftPutSchema.safeParse(body);
  if (!parsed.success) return err(400, "bad_request");
  const result = await putDraft(ready.db, ready.userId, sandboxId, parsed.data);
  return result.ok
    ? { status: 200, body: { rev: result.rev } }
    : { status: 409, body: { code: "conflict", server: result.server } };
}

export async function handleAccountDelete(deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, true);
  if (isResult(ready)) return ready;
  await deleteAccount(ready.db, ready.userId);
  return { status: 204, body: null };
}

export async function handleAccountExport(deps: ProgressDeps): Promise<HandlerResult> {
  const ready = await guard(deps, false);
  if (isResult(ready)) return ready;
  return { status: 200, body: await exportAccount(ready.db, ready.userId) };
}
```

Note: zod's `z.object` strips unknown keys, so the isolation test's `userId: "u1"` in the body is discarded, and `putDraft` receives the session's user id.

- [ ] **Step 5: Implement route wiring**

`web/src/lib/progress/routeDeps.ts`:

```ts
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
```

`web/src/app/api/progress/route.ts`:

```ts
import { handleMarksGet, handleMarksPost } from "@/lib/progress/handlers";
import { readJson, routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function GET(req: Request): Promise<Response> {
  const course = new URL(req.url).searchParams.get("course");
  return toResponse(await handleMarksGet(course, await routeDeps(req)));
}

export async function POST(req: Request): Promise<Response> {
  return toResponse(await handleMarksPost(await readJson(req), await routeDeps(req)));
}
```

`web/src/app/api/progress/drafts/[sandboxId]/route.ts`:

```ts
import { handleDraftPut, handleDraftsGet } from "@/lib/progress/handlers";
import { readJson, routeDeps, toResponse } from "@/lib/progress/routeDeps";

type Ctx = { params: Promise<{ sandboxId: string }> };

export async function GET(req: Request, { params }: Ctx): Promise<Response> {
  const { sandboxId } = await params;
  return toResponse(await handleDraftsGet(sandboxId, await routeDeps(req)));
}

export async function PUT(req: Request, { params }: Ctx): Promise<Response> {
  const { sandboxId } = await params;
  return toResponse(await handleDraftPut(sandboxId, await readJson(req), await routeDeps(req)));
}
```

`web/src/app/api/account/route.ts`:

```ts
import { handleAccountDelete } from "@/lib/progress/handlers";
import { routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function DELETE(req: Request): Promise<Response> {
  return toResponse(await handleAccountDelete(await routeDeps(req)));
}
```

`web/src/app/api/account/export/route.ts`:

```ts
import { handleAccountExport } from "@/lib/progress/handlers";
import { routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function GET(req: Request): Promise<Response> {
  const res = toResponse(await handleAccountExport(await routeDeps(req)));
  if (res.ok) res.headers.set("content-disposition", 'attachment; filename="leetexpert-data.json"');
  return res;
}
```

- [ ] **Step 6: Run the tests** → `npm test -- tests/progressApi.test.ts`: 8 passed.

- [ ] **Step 7: Prove it can fail**

In `handleDraftPut`, delete the `isKnownSandboxId` line: the validation test FAILS. Restore. In `guard`, return `{ userId: "u1", db: deps.db }` instead of `deps.userId`: the isolation test FAILS. Restore: all PASS.

- [ ] **Step 8: Typecheck, lint and commit**

Run: `npx tsc --noEmit && npx eslint src/lib/progress src/app/api` → clean.

```bash
git add src/lib/progress/rateLimit.ts src/lib/progress/handlers.ts src/lib/progress/routeDeps.ts src/app/api/progress src/app/api/account tests/progressApi.test.ts
git commit -m "feat(progress): progress, draft and account API with session-scoped access"
```

---

### Task 6: Client local store (keys, timestamps, sync record, clearing)

**Files:**
- Create: `web/src/lib/progress/localStore.ts`
- Modify: `web/src/components/sandbox/Sandbox.tsx:61-63,154-175` (use the shared draft helpers; write the `:at` timestamp)
- Test: `web/tests/progressLocalStore.test.ts`

**Interfaces:**
- Consumes: `readSet`, `visitedKey`, `solvedKey` (`components/providers/progressStorage.ts`); types (Task 3).
- Produces:
  - `draftKey(id: string, lang: DraftLang): string` (= `dsa:sandbox:<id>:<lang>`, unchanged format), `draftAtKey(id, lang)` (= `…:at`), `draftSlot(id, lang)` (= `<id>:<lang>`)
  - `readLocalDraft(s: Storage, id, lang): LocalDraft | null`, `writeLocalDraft(s, id, lang, code: string, at: string): void`, `removeLocalDraft(s, id, lang): void`
  - `listLocalDrafts(s: Storage, isKnown: (id: string) => boolean): { sandboxId: string; lang: DraftLang; draft: LocalDraft }[]`
  - `OWNER_KEY = "sync:owner"`, `readOwner(s): string | null`, `writeOwner(s, userId)`
  - `interface PendingDraft { code: string; updatedAt: string; deleted: boolean }`
  - `interface SyncRecord { marks: Mark[]; drafts: Record<string, PendingDraft>; baseRevs: Record<string, number>; stashes: Record<string, Stash> }`
  - `emptySyncRecord(): SyncRecord`, `readSyncRecord(s, userId): SyncRecord`, `writeSyncRecord(s, userId, r: SyncRecord): void`
  - `interface AnonymousSummary { visited: number; solved: number; drafts: number }`, `anonymousSummary(s, course: string, isKnown): AnonymousSummary`, `hasAnyData(sum): boolean`
  - `clearSyncedData(s: Storage): void`

- [ ] **Step 1: Write the failing test**

`web/tests/progressLocalStore.test.ts`:

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  anonymousSummary, clearSyncedData, draftAtKey, draftKey, listLocalDrafts,
  readLocalDraft, readOwner, readSyncRecord, removeLocalDraft, writeLocalDraft,
  writeOwner, writeSyncRecord, emptySyncRecord,
} from "../src/lib/progress/localStore";
import { migrateLegacyProgress, readSet, visitedKey } from "../src/components/providers/progressStorage";

const known = (id: string) => id !== "landing-find-pair";

beforeEach(() => localStorage.clear());

describe("drafts", () => {
  it("keeps the existing key format and stores a sibling timestamp", () => {
    expect(draftKey("two-sum", "python")).toBe("dsa:sandbox:two-sum:python");
    writeLocalDraft(localStorage, "two-sum", "python", "code", "2026-09-18T10:00:00.000Z");
    expect(localStorage.getItem(draftAtKey("two-sum", "python"))).toBe("2026-09-18T10:00:00.000Z");
    expect(readLocalDraft(localStorage, "two-sum", "python")).toEqual({
      code: "code", updatedAt: "2026-09-18T10:00:00.000Z", deleted: false,
    });
  });

  it("a legacy draft (no timestamp) reads with updatedAt null", () => {
    localStorage.setItem("dsa:sandbox:two-sum:javascript", "old");
    expect(readLocalDraft(localStorage, "two-sum", "javascript")).toEqual({ code: "old", updatedAt: null, deleted: false });
  });

  it("remove clears both keys", () => {
    writeLocalDraft(localStorage, "two-sum", "python", "c", "2026-09-18T10:00:00.000Z");
    removeLocalDraft(localStorage, "two-sum", "python");
    expect(localStorage.length).toBe(0);
  });

  it("lists only registry sandboxes, ignoring timestamp keys", () => {
    writeLocalDraft(localStorage, "two-sum", "python", "a", "2026-09-18T10:00:00.000Z");
    localStorage.setItem("dsa:sandbox:landing-find-pair:python", "x");
    expect(listLocalDrafts(localStorage, known).map((d) => `${d.sandboxId}:${d.lang}`)).toEqual(["two-sum:python"]);
  });
});

describe("summary", () => {
  it("counts this device's anonymous progress", () => {
    localStorage.setItem("course-progress:dsa", JSON.stringify(["a/b", "a/c"]));
    localStorage.setItem("course-solved:dsa", JSON.stringify(["a/c"]));
    localStorage.setItem("dsa:sandbox:two-sum:python", "x");
    expect(anonymousSummary(localStorage, "dsa", known)).toEqual({ visited: 2, solved: 1, drafts: 1 });
  });
});

describe("clearSyncedData (spec §5.4)", () => {
  it("clears progress, drafts, legacy keys and sync state; keeps preferences", () => {
    const keep = { "dsa:ide:results-tab": "tests", "code-lang": "python", theme: "dark" };
    for (const [k, v] of Object.entries(keep)) localStorage.setItem(k, v);
    localStorage.setItem("course-progress:dsa", "[]");
    localStorage.setItem("course-solved:dsa", "[]");
    localStorage.setItem("dsa-course-progress", JSON.stringify(["arrays/intro"]));
    localStorage.setItem("dsa-course-solved", "[]");
    writeLocalDraft(localStorage, "two-sum", "python", "c", "2026-09-18T10:00:00.000Z");
    writeOwner(localStorage, "u1");
    writeSyncRecord(localStorage, "u1", emptySyncRecord());

    clearSyncedData(localStorage);

    expect(Object.keys({ ...localStorage }).sort()).toEqual(Object.keys(keep).sort());
    expect(readOwner(localStorage)).toBeNull();
  });

  it("after clearing, the legacy migration cannot revive the last learner's progress", () => {
    localStorage.setItem("dsa-course-progress", JSON.stringify(["arrays/intro"]));
    migrateLegacyProgress("dsa");
    clearSyncedData(localStorage);
    migrateLegacyProgress("dsa");
    expect(readSet(visitedKey("dsa")).size).toBe(0);
  });
});

describe("sync record", () => {
  it("is per user and survives a corrupt value", () => {
    const record = { ...emptySyncRecord(), baseRevs: { "two-sum:python": 3 } };
    writeSyncRecord(localStorage, "u1", record);
    expect(readSyncRecord(localStorage, "u1")).toEqual(record);
    expect(readSyncRecord(localStorage, "u2")).toEqual(emptySyncRecord());
    localStorage.setItem("sync:v1:u3", "{not json");
    expect(readSyncRecord(localStorage, "u3")).toEqual(emptySyncRecord());
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, module not found.

- [ ] **Step 3: Implement**

`web/src/lib/progress/localStore.ts`:

```ts
import { readSet, solvedKey, visitedKey } from "@/components/providers/progressStorage";
import type { DraftLang, LocalDraft, Mark, Stash } from "./types";

const DRAFT_PREFIX = "dsa:sandbox:";
const DRAFT_KEY = /^dsa:sandbox:(.+):(python|javascript)$/;

export function draftKey(id: string, lang: DraftLang): string {
  return `${DRAFT_PREFIX}${id}:${lang}`;
}

/** Sibling key, so drafts written before sync keep their bare-string format. */
export function draftAtKey(id: string, lang: DraftLang): string {
  return `${draftKey(id, lang)}:at`;
}

export function draftSlot(id: string, lang: DraftLang): string {
  return `${id}:${lang}`;
}

function attempt<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    // Private mode or a full quota: sync degrades, the page still works.
    return fallback;
  }
}

export function readLocalDraft(s: Storage, id: string, lang: DraftLang): LocalDraft | null {
  return attempt(() => {
    const code = s.getItem(draftKey(id, lang));
    if (code === null) return null;
    return { code, updatedAt: s.getItem(draftAtKey(id, lang)), deleted: false };
  }, null);
}

export function writeLocalDraft(s: Storage, id: string, lang: DraftLang, code: string, at: string): void {
  attempt(() => {
    s.setItem(draftKey(id, lang), code);
    s.setItem(draftAtKey(id, lang), at);
  }, undefined);
}

export function removeLocalDraft(s: Storage, id: string, lang: DraftLang): void {
  attempt(() => {
    s.removeItem(draftKey(id, lang));
    s.removeItem(draftAtKey(id, lang));
  }, undefined);
}

function keys(s: Storage): string[] {
  return attempt(() => Array.from({ length: s.length }, (_, i) => s.key(i)).filter((k): k is string => k !== null), []);
}

export function listLocalDrafts(
  s: Storage,
  isKnown: (id: string) => boolean,
): { sandboxId: string; lang: DraftLang; draft: LocalDraft }[] {
  const out: { sandboxId: string; lang: DraftLang; draft: LocalDraft }[] = [];
  for (const key of keys(s)) {
    const m = DRAFT_KEY.exec(key);
    if (!m) continue;
    const sandboxId = m[1]!;
    const lang = m[2] === "python" ? "python" : "javascript";
    if (!isKnown(sandboxId)) continue;
    const draft = readLocalDraft(s, sandboxId, lang);
    if (draft) out.push({ sandboxId, lang, draft });
  }
  return out.sort((a, b) => draftSlot(a.sandboxId, a.lang).localeCompare(draftSlot(b.sandboxId, b.lang)));
}

export const OWNER_KEY = "sync:owner";

export function readOwner(s: Storage): string | null {
  return attempt(() => s.getItem(OWNER_KEY), null);
}

export function writeOwner(s: Storage, userId: string): void {
  attempt(() => s.setItem(OWNER_KEY, userId), undefined);
}

export interface PendingDraft {
  code: string;
  updatedAt: string;
  deleted: boolean;
}

export interface SyncRecord {
  marks: Mark[];
  drafts: Record<string, PendingDraft>;
  baseRevs: Record<string, number>;
  stashes: Record<string, Stash>;
}

export function emptySyncRecord(): SyncRecord {
  return { marks: [], drafts: {}, baseRevs: {}, stashes: {} };
}

// Keyed by user so one account's queue can never be sent under another's session.
function syncRecordKey(userId: string): string {
  return `sync:v1:${userId}`;
}

export function readSyncRecord(s: Storage, userId: string): SyncRecord {
  return attempt(() => {
    const raw = s.getItem(syncRecordKey(userId));
    if (!raw) return emptySyncRecord();
    const parsed = JSON.parse(raw) as Partial<SyncRecord>;
    return { ...emptySyncRecord(), ...parsed };
  }, emptySyncRecord());
}

export function writeSyncRecord(s: Storage, userId: string, record: SyncRecord): void {
  attempt(() => s.setItem(syncRecordKey(userId), JSON.stringify(record)), undefined);
}

export interface AnonymousSummary {
  visited: number;
  solved: number;
  drafts: number;
}

export function anonymousSummary(s: Storage, course: string, isKnown: (id: string) => boolean): AnonymousSummary {
  return {
    visited: readSet(visitedKey(course)).size,
    solved: readSet(solvedKey(course)).size,
    drafts: listLocalDrafts(s, isKnown).length,
  };
}

export function hasAnyData(sum: AnonymousSummary): boolean {
  return sum.visited + sum.solved + sum.drafts > 0;
}

/**
 * Everything that belongs to a learner; preferences stay. The legacy flat
 * keys go too: migrateLegacyProgress copies them into a missing namespaced
 * key, so leaving them would restore the last learner's older progress.
 */
const SYNCED = [/^course-progress:/, /^course-solved:/, /^dsa-course-progress$/, /^dsa-course-solved$/, /^dsa:sandbox:/, /^sync:/];

export function clearSyncedData(s: Storage): void {
  for (const key of keys(s)) {
    if (SYNCED.some((re) => re.test(key))) attempt(() => s.removeItem(key), undefined);
  }
}
```

Note: `readSet` in `progressStorage.ts` reads the global `localStorage`; `anonymousSummary` is only ever called with `window.localStorage`, so that holds. Do not add a `Storage` parameter to `readSet` in this task.

- [ ] **Step 4: Point Sandbox at the shared helpers**

In `web/src/components/sandbox/Sandbox.tsx`, delete the local `draftKey` function (lines 61-63) and add:

```ts
import { draftKey, removeLocalDraft, writeLocalDraft } from "@/lib/progress/localStore";
```

Replace the body of `setDraft`'s `try` with:

```ts
      writeLocalDraft(window.localStorage, spec.id, lang, next, new Date().toISOString());
```

and remove its now-empty `try/catch` (the helper already swallows storage errors). Replace the `try/catch` in `restoreStarter` with:

```ts
    removeLocalDraft(window.localStorage, spec.id, lang);
```

The restore effect keeps reading `window.localStorage.getItem(draftKey(spec.id, l))`.

- [ ] **Step 5: Run the tests**

Run: `npm test -- tests/progressLocalStore.test.ts tests/progressStorage.test.ts` → all pass.

- [ ] **Step 6: Prove it can fail**

Remove `/^dsa-course-progress$/` from `SYNCED`: the "cannot revive" test FAILS. Restore: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/progress/localStore.ts src/components/sandbox/Sandbox.tsx tests/progressLocalStore.test.ts
git commit -m "feat(progress): local store helpers, draft timestamps and sign-out clearing"
```

---

### Task 7: Client transport and the persisted sync queue

**Files:**
- Create: `web/src/lib/progress/api.ts`, `web/src/lib/progress/syncQueue.ts`
- Test: `web/tests/syncQueue.test.ts`

**Interfaces:**
- Consumes: `localStore` (Task 6), `resolveOn409` (Task 3), `DraftPutBody` (Task 4).
- Produces (`api.ts`):
  - `type PutOutcome = { kind: "ok"; rev: number } | { kind: "conflict"; server: ServerDraft } | { kind: "error"; status: number }` (`status` 0 = network failure)
  - `class TransportError extends Error { status: number }`
  - `interface Transport { getMarks(course: string): Promise<MarksSnapshot>; postMarks(course: string, marks: { kind: MarkKind; id: string }[], opts?: SendOpts): Promise<number>; getDrafts(sandboxId: string): Promise<ServerDrafts>; putDraft(sandboxId: string, body: DraftPutBody, opts?: SendOpts): Promise<PutOutcome> }`, `interface SendOpts { keepalive?: boolean }`
  - `httpTransport: Transport`
- Produces (`syncQueue.ts`):
  - `MARKS_DEBOUNCE_MS = 2000`, `DRAFTS_DEBOUNCE_MS = 1500`, `BACKOFF_START_MS = 2000`, `BACKOFF_MAX_MS = 60000`
  - `type SyncStatus = "synced" | "syncing" | "offline" | "unauthorized"`
  - `class SyncQueue` — `constructor({ storage, userId, transport, now? })`; `enqueueMark(m: Mark)`; `enqueueDraft(sandboxId, lang, d: PendingDraft)`; `flush(opts?: SendOpts): Promise<void>`; `flushWithin(ms: number): Promise<boolean>`; `retryNow(): void`; `pendingCount(): number`; `status(): SyncStatus`; `offlineSince(): number | null`; `baseRev(sandboxId, lang): number`; `setBaseRev(sandboxId, lang, rev)`; `stash(sandboxId, lang): Stash | null`; `setStash(sandboxId, lang, s: Stash | null)`; `hasPendingDraft(sandboxId, lang): boolean`; `subscribe(fn: () => void): () => void`; `dispose()`

- [ ] **Step 1: Write the failing test**

`web/tests/syncQueue.test.ts`:

```ts
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PutOutcome, Transport } from "../src/lib/progress/api";
import { SyncQueue } from "../src/lib/progress/syncQueue";
import type { ServerDraft } from "../src/lib/progress/types";

const AT = "2026-09-18T10:00:00.000Z";

function fakeTransport(over: Partial<Transport> = {}) {
  const t = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
    ...over,
  };
  return t;
}

function queue(transport: Transport, userId = "u1") {
  return new SyncQueue({ storage: localStorage, userId, transport, now: () => Date.now() });
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("marks", () => {
  it("debounces 2 s after the last change", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await vi.advanceTimersByTimeAsync(1999);
    expect(t.postMarks).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(t.postMarks).toHaveBeenCalledWith("dsa", [{ kind: "visited", id: "a/b" }], undefined);
    expect(q.pendingCount()).toBe(0);
    expect(q.status()).toBe("synced");
  });

  it("sends at most 500 marks per request", async () => {
    const t = fakeTransport();
    const q = queue(t);
    for (let i = 0; i < 1200; i++) q.enqueueMark({ course: "dsa", kind: "visited", id: `m/${i}` });
    await q.flush();
    expect(t.postMarks.mock.calls.map((c) => c[1].length)).toEqual([500, 500, 200]);
  });

  it("backs off from 2 s doubling to a 60 s cap while the server fails", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 503) });
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    expect(q.status()).toBe("offline");
    const gaps = [2000, 4000, 8000, 16000, 32000, 60000, 60000];
    for (const gap of gaps) {
      const before = t.postMarks.mock.calls.length;
      await vi.advanceTimersByTimeAsync(gap - 1);
      expect(t.postMarks.mock.calls.length).toBe(before);
      await vi.advanceTimersByTimeAsync(1);
      expect(t.postMarks.mock.calls.length).toBe(before + 1);
    }
  });

  it("401 stops syncing and keeps the queue", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 401) });
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    await vi.advanceTimersByTimeAsync(300000);
    expect(t.postMarks).toHaveBeenCalledTimes(1);
    expect(q.status()).toBe("unauthorized");
    expect(q.pendingCount()).toBe(1);
  });

  it("400 drops the change instead of blocking the queue", async () => {
    const t = fakeTransport({ postMarks: vi.fn(async () => 400) });
    const q = queue(t);
    vi.spyOn(console, "error").mockImplementation(() => {});
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush();
    expect(q.pendingCount()).toBe(0);
  });

  it("persists across reloads and is scoped to the user", async () => {
    const q = queue(fakeTransport({ postMarks: vi.fn(async () => 0) }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    q.dispose();
    expect(queue(fakeTransport()).pendingCount()).toBe(1);
    expect(queue(fakeTransport(), "u2").pendingCount()).toBe(0);
  });

  it("passes keepalive through for the hide flush", async () => {
    const t = fakeTransport();
    const q = queue(t);
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    await q.flush({ keepalive: true });
    expect(t.postMarks).toHaveBeenCalledWith("dsa", [{ kind: "visited", id: "a/b" }], { keepalive: true });
  });
});

describe("drafts", () => {
  const server = (over: Partial<ServerDraft> = {}): ServerDraft => ({
    code: "theirs", updatedAt: AT, rev: 5, deleted: false, ...over,
  });

  it("debounces 1.5 s, sends the base rev, then records the new rev", async () => {
    const t = fakeTransport({ putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 4 })) });
    const q = queue(t);
    q.setBaseRev("two-sum", "python", 3);
    q.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: AT, deleted: false });
    await vi.advanceTimersByTimeAsync(1500);
    expect(t.putDraft).toHaveBeenCalledWith(
      "two-sum", { lang: "python", code: "mine", updatedAt: AT, deleted: false, baseRev: 3 }, undefined,
    );
    expect(q.baseRev("two-sum", "python")).toBe(4);
    expect(q.hasPendingDraft("two-sum", "python")).toBe(false);
  });

  it("409 with different code: stash the server copy, keep what is on screen, re-send on top", async () => {
    const putDraft = vi
      .fn<Transport["putDraft"]>()
      .mockResolvedValueOnce({ kind: "conflict", server: server() })
      .mockResolvedValueOnce({ kind: "ok", rev: 6 });
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: AT, deleted: false });
    await q.flush();
    expect(putDraft.mock.calls[1]![1].baseRev).toBe(5);
    expect(putDraft.mock.calls[1]![1].code).toBe("mine");
    expect(q.stash("two-sum", "python")).toEqual({ code: "theirs", updatedAt: AT, deleted: false });
    expect(q.baseRev("two-sum", "python")).toBe(6);
  });

  it("409 with identical code adopts the rev without a stash or a re-send", async () => {
    const putDraft = vi.fn<Transport["putDraft"]>().mockResolvedValueOnce({ kind: "conflict", server: server({ code: "same" }) });
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "same", updatedAt: AT, deleted: false });
    await q.flush();
    expect(putDraft).toHaveBeenCalledTimes(1);
    expect(q.stash("two-sum", "python")).toBeNull();
    expect(q.baseRev("two-sum", "python")).toBe(5);
  });

  it("an edit made during the request is not cleared by that request's success", async () => {
    let release: (v: PutOutcome) => void = () => {};
    const putDraft = vi.fn<Transport["putDraft"]>().mockImplementationOnce(
      () => new Promise((r) => { release = r; }),
    );
    const q = queue(fakeTransport({ putDraft }));
    q.enqueueDraft("two-sum", "python", { code: "v1", updatedAt: AT, deleted: false });
    const flushing = q.flush();
    q.enqueueDraft("two-sum", "python", { code: "v2", updatedAt: AT, deleted: false });
    release({ kind: "ok", rev: 1 });
    await flushing;
    expect(q.hasPendingDraft("two-sum", "python")).toBe(true);
  });
});

describe("flushWithin", () => {
  it("reports false when the cap runs out with writes still queued", async () => {
    const q = queue(fakeTransport({ postMarks: vi.fn(() => new Promise<number>(() => {})) }));
    q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
    const done = q.flushWithin(3000);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await done).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, module not found.

- [ ] **Step 3: Implement the transport**

`web/src/lib/progress/api.ts`:

```ts
import { z } from "zod";
import type { DraftPutBody } from "./schemas";
import type { MarkKind, MarksSnapshot, ServerDraft, ServerDrafts } from "./types";

export interface SendOpts {
  keepalive?: boolean;
}

export type PutOutcome =
  | { kind: "ok"; rev: number }
  | { kind: "conflict"; server: ServerDraft }
  | { kind: "error"; status: number };

export class TransportError extends Error {
  constructor(readonly status: number) {
    super(`progress request failed: ${status}`);
  }
}

export interface Transport {
  getMarks(course: string): Promise<MarksSnapshot>;
  postMarks(course: string, marks: { kind: MarkKind; id: string }[], opts?: SendOpts): Promise<number>;
  getDrafts(sandboxId: string): Promise<ServerDrafts>;
  putDraft(sandboxId: string, body: DraftPutBody, opts?: SendOpts): Promise<PutOutcome>;
}

// Responses are parsed, not cast: a server bug should fail loudly here
// rather than write a malformed value into localStorage.
const serverDraft = z.object({ code: z.string(), updatedAt: z.string(), rev: z.number(), deleted: z.boolean() });
const snapshot = z.object({ visited: z.array(z.string()), solved: z.array(z.string()), hasDrafts: z.boolean() });
const drafts = z.object({ python: serverDraft.optional(), javascript: serverDraft.optional() });
const putOk = z.object({ rev: z.number() });
const conflict = z.object({ server: serverDraft });

async function send(url: string, init: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
  } catch {
    return null;
  }
}

function jsonInit(method: string, body: unknown, opts?: SendOpts): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    // keepalive lets the hide-flush outlive a closing tab.
    keepalive: opts?.keepalive ?? false,
  };
}

export const httpTransport: Transport = {
  async getMarks(course) {
    const res = await send(`/api/progress?course=${encodeURIComponent(course)}`, {});
    if (!res?.ok) throw new TransportError(res?.status ?? 0);
    return snapshot.parse(await res.json());
  },
  async postMarks(course, marks, opts) {
    const res = await send("/api/progress", jsonInit("POST", { course, marks }, opts));
    return res?.status ?? 0;
  },
  async getDrafts(sandboxId) {
    const res = await send(`/api/progress/drafts/${encodeURIComponent(sandboxId)}`, {});
    if (!res?.ok) throw new TransportError(res?.status ?? 0);
    return drafts.parse(await res.json());
  },
  async putDraft(sandboxId, body, opts) {
    const res = await send(`/api/progress/drafts/${encodeURIComponent(sandboxId)}`, jsonInit("PUT", body, opts));
    if (!res) return { kind: "error", status: 0 };
    if (res.status === 200) return { kind: "ok", rev: putOk.parse(await res.json()).rev };
    if (res.status === 409) return { kind: "conflict", server: conflict.parse(await res.json()).server };
    return { kind: "error", status: res.status };
  },
};
```

- [ ] **Step 4: Implement the queue**

`web/src/lib/progress/syncQueue.ts`:

```ts
import type { SendOpts, Transport } from "./api";
import { draftSlot, readSyncRecord, writeSyncRecord, type PendingDraft, type SyncRecord } from "./localStore";
import { resolveOn409 } from "./merge";
import { MARK_BATCH_MAX, type DraftLang, type Mark, type Stash } from "./types";

export const MARKS_DEBOUNCE_MS = 2000;
export const DRAFTS_DEBOUNCE_MS = 1500;
export const BACKOFF_START_MS = 2000;
export const BACKOFF_MAX_MS = 60000;

export type SyncStatus = "synced" | "syncing" | "offline" | "unauthorized";

interface QueueDeps {
  storage: Storage;
  userId: string;
  transport: Transport;
  now?: () => number;
}

function parseSlot(slot: string): { sandboxId: string; lang: DraftLang } {
  const cut = slot.lastIndexOf(":");
  return { sandboxId: slot.slice(0, cut), lang: slot.slice(cut + 1) === "python" ? "python" : "javascript" };
}

export class SyncQueue {
  private record: SyncRecord;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private backoff = BACKOFF_START_MS;
  private current: SyncStatus = "synced";
  private offlineAt: number | null = null;
  private inFlight: Promise<void> | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;

  constructor(private readonly deps: QueueDeps) {
    this.record = readSyncRecord(deps.storage, deps.userId);
    this.now = deps.now ?? Date.now;
  }

  enqueueMark(mark: Mark): void {
    const dup = this.record.marks.some((m) => m.course === mark.course && m.kind === mark.kind && m.id === mark.id);
    if (!dup) this.record.marks.push(mark);
    this.persist();
    this.schedule(MARKS_DEBOUNCE_MS);
  }

  enqueueDraft(sandboxId: string, lang: DraftLang, draft: PendingDraft): void {
    this.record.drafts[draftSlot(sandboxId, lang)] = draft;
    this.persist();
    this.schedule(DRAFTS_DEBOUNCE_MS);
  }

  hasPendingDraft(sandboxId: string, lang: DraftLang): boolean {
    return draftSlot(sandboxId, lang) in this.record.drafts;
  }

  baseRev(sandboxId: string, lang: DraftLang): number {
    return this.record.baseRevs[draftSlot(sandboxId, lang)] ?? 0;
  }

  setBaseRev(sandboxId: string, lang: DraftLang, rev: number): void {
    this.record.baseRevs[draftSlot(sandboxId, lang)] = rev;
    this.persist();
  }

  stash(sandboxId: string, lang: DraftLang): Stash | null {
    return this.record.stashes[draftSlot(sandboxId, lang)] ?? null;
  }

  setStash(sandboxId: string, lang: DraftLang, stash: Stash | null): void {
    const slot = draftSlot(sandboxId, lang);
    if (stash) this.record.stashes[slot] = stash;
    else delete this.record.stashes[slot];
    this.persist();
  }

  pendingCount(): number {
    return this.record.marks.length + Object.keys(this.record.drafts).length;
  }

  status(): SyncStatus {
    return this.current;
  }

  offlineSince(): number | null {
    return this.offlineAt;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Called on the browser's `online` event: skip the rest of the backoff. */
  retryNow(): void {
    if (this.current !== "offline") return;
    this.backoff = BACKOFF_START_MS;
    void this.flush();
  }

  flush(opts?: SendOpts): Promise<void> {
    // Single-flight: two overlapping flushes would send the same batch twice.
    this.inFlight ??= this.run(opts).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  async flushWithin(ms: number): Promise<boolean> {
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ms));
    const done = this.flush().then(() => this.pendingCount() === 0);
    return Promise.race([done, timeout]);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.listeners.clear();
  }

  private persist(): void {
    writeSyncRecord(this.deps.storage, this.deps.userId, this.record);
    for (const fn of this.listeners) fn();
  }

  private setStatus(next: SyncStatus): void {
    if (this.current === next) return;
    this.current = next;
    for (const fn of this.listeners) fn();
  }

  private schedule(ms: number): void {
    if (this.current === "unauthorized") return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, ms);
  }

  private fail(status: number): void {
    if (status === 401) {
      // Keep the queue: the same learner signing back in resumes it.
      this.setStatus("unauthorized");
      return;
    }
    this.offlineAt ??= this.now();
    this.setStatus("offline");
    this.schedule(this.backoff);
    this.backoff = Math.min(this.backoff * 2, BACKOFF_MAX_MS);
  }

  private async run(opts?: SendOpts): Promise<void> {
    if (this.current === "unauthorized" || this.pendingCount() === 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.setStatus("syncing");

    while (this.record.marks.length > 0) {
      const course = this.record.marks[0]!.course;
      const batch = this.record.marks.filter((m) => m.course === course).slice(0, MARK_BATCH_MAX);
      const status = await this.deps.transport.postMarks(course, batch.map(({ kind, id }) => ({ kind, id })), opts);
      if (status === 204 || status === 400) {
        // A 400 can only come from a bug; retrying it forever would block
        // every later write behind it.
        if (status === 400) console.error("[sync] marks rejected", batch);
        this.record.marks = this.record.marks.filter((m) => !batch.includes(m));
        this.persist();
        continue;
      }
      return this.fail(status);
    }

    for (const slot of Object.keys(this.record.drafts)) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const pending = this.record.drafts[slot];
        if (!pending) break;
        const { sandboxId, lang } = parseSlot(slot);
        const body = { lang, ...pending, baseRev: this.record.baseRevs[slot] ?? 0 };
        const out = await this.deps.transport.putDraft(sandboxId, body, opts);
        if (out.kind === "ok") {
          this.record.baseRevs[slot] = out.rev;
          // Identity check: an edit that arrived during the request is newer
          // than what was sent and must stay queued.
          if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
          this.persist();
          break;
        }
        if (out.kind === "conflict") {
          this.record.baseRevs[slot] = out.server.rev;
          if (resolveOn409(pending, out.server) === "adopt-rev") {
            if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
            this.persist();
            break;
          }
          this.record.stashes[slot] = { code: out.server.code, updatedAt: out.server.updatedAt, deleted: out.server.deleted };
          this.persist();
          continue;
        }
        if (out.status === 400) {
          console.error("[sync] draft rejected", slot);
          delete this.record.drafts[slot];
          this.persist();
          break;
        }
        return this.fail(out.status);
      }
    }

    this.backoff = BACKOFF_START_MS;
    this.offlineAt = null;
    this.setStatus(this.pendingCount() === 0 ? "synced" : "syncing");
  }
}
```

- [ ] **Step 5: Run the tests** → `npm test -- tests/syncQueue.test.ts`: 12 passed.

- [ ] **Step 6: Prove it can fail**

Remove the identity check (`if (this.record.drafts[slot] === pending)`) in the `ok` branch: "an edit made during the request" FAILS. Restore. Change `Math.min(this.backoff * 2, BACKOFF_MAX_MS)` to `this.backoff * 2`: the backoff test FAILS at the cap. Restore: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/progress/api.ts src/lib/progress/syncQueue.ts tests/syncQueue.test.ts
git commit -m "feat(progress): persisted sync queue with debounce, backoff and draft conflicts"
```

---

### Task 8: First sign-in and account-switch flow

**Files:**
- Create: `web/src/lib/progress/signInFlow.ts`
- Test: `web/tests/signInFlow.test.ts`

**Interfaces:**
- Consumes: `localStore` (Task 6), `SyncQueue`, `Transport`, `TransportError` (Task 7), `merge` (Task 3), `readSet`/`writeSet`/`visitedKey`/`solvedKey` (`progressStorage.ts`).
- Produces:
  - `prepareDevice(storage: Storage, userId: string): OwnerAction` — run **before** constructing the `SyncQueue`; clears another account's data on `replace`.
  - `interface FlowDeps { storage: Storage; userId: string; course: string; transport: Transport; queue: SyncQueue; isKnownSandbox: (id: string) => boolean }`
  - `type SignInResult = { kind: "ready" } | { kind: "ask"; summary: AnonymousSummary }`
  - `beginSignIn(deps: FlowDeps, action: OwnerAction): Promise<SignInResult>`
  - `completeMerge(deps: FlowDeps, choice: "add" | "discard"): Promise<void>`
  - `pullMarks(deps: FlowDeps): Promise<void>`
  - Both `beginSignIn` and `completeMerge` throw `TransportError` when offline; `sync:owner` is then **not** written, so the flow reruns on the next load.

- [ ] **Step 1: Write the failing test**

`web/tests/signInFlow.test.ts`:

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PutOutcome, Transport } from "../src/lib/progress/api";
import { SyncQueue } from "../src/lib/progress/syncQueue";
import {
  beginSignIn, completeMerge, prepareDevice, type FlowDeps,
} from "../src/lib/progress/signInFlow";
import { readLocalDraft, readOwner, writeLocalDraft, writeOwner } from "../src/lib/progress/localStore";
import { readSet, solvedKey, visitedKey } from "../src/components/providers/progressStorage";
import type { MarksSnapshot } from "../src/lib/progress/types";

const EMPTY: MarksSnapshot = { visited: [], solved: [], hasDrafts: false };

function transport(server: MarksSnapshot, over: Partial<Transport> = {}): Transport {
  return {
    getMarks: vi.fn(async () => server),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
    ...over,
  };
}

function deps(t: Transport, userId = "u1"): FlowDeps {
  const queue = new SyncQueue({ storage: localStorage, userId, transport: t });
  return { storage: localStorage, userId, course: "dsa", transport: t, queue, isKnownSandbox: (id) => id === "two-sum" };
}

function seedAnonymous() {
  localStorage.setItem(visitedKey("dsa"), JSON.stringify(["arrays/intro"]));
  localStorage.setItem(solvedKey("dsa"), JSON.stringify(["hash-tables/two-sum"]));
  writeLocalDraft(localStorage, "two-sum", "python", "mine", "2026-09-18T11:00:00.000Z");
}

beforeEach(() => localStorage.clear());

describe("owner cases", () => {
  it("replace clears the other account's data before anything else", () => {
    writeOwner(localStorage, "u2");
    seedAnonymous();
    expect(prepareDevice(localStorage, "u1")).toBe("replace");
    expect(readSet(visitedKey("dsa")).size).toBe(0);
    expect(readOwner(localStorage)).toBeNull();
  });

  it("resume pulls and unions without uploading", async () => {
    writeOwner(localStorage, "u1");
    localStorage.setItem(visitedKey("dsa"), JSON.stringify(["a/local"]));
    const t = transport({ ...EMPTY, visited: ["a/server"] });
    expect(await beginSignIn(deps(t), prepareDevice(localStorage, "u1"))).toEqual({ kind: "ready" });
    expect([...readSet(visitedKey("dsa"))].sort()).toEqual(["a/local", "a/server"]);
    expect(t.postMarks).not.toHaveBeenCalled();
  });
});

describe("merge flow (spec §7)", () => {
  it("empty device: pull only and take ownership", async () => {
    const t = transport({ ...EMPTY, solved: ["x/y"] });
    expect(await beginSignIn(deps(t), "merge")).toEqual({ kind: "ready" });
    expect([...readSet(solvedKey("dsa"))]).toEqual(["x/y"]);
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("empty account: merges silently", async () => {
    seedAnonymous();
    const t = transport(EMPTY);
    expect(await beginSignIn(deps(t), "merge")).toEqual({ kind: "ready" });
    expect(t.postMarks).toHaveBeenCalled();
    expect(t.putDraft).toHaveBeenCalledWith(
      "two-sum",
      { lang: "python", code: "mine", updatedAt: "2026-09-18T11:00:00.000Z", deleted: false, baseRev: 0 },
      undefined,
    );
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("existing account: asks, with counts from the local sets", async () => {
    seedAnonymous();
    const result = await beginSignIn(deps(transport({ ...EMPTY, visited: ["z/z"] })), "merge");
    expect(result).toEqual({ kind: "ask", summary: { visited: 1, solved: 1, drafts: 1 } });
    expect(readOwner(localStorage)).toBeNull();
  });

  it("Don't add: clears the anonymous data, then pulls", async () => {
    seedAnonymous();
    const t = transport({ ...EMPTY, visited: ["z/z"] });
    await completeMerge(deps(t), "discard");
    expect([...readSet(visitedKey("dsa"))]).toEqual(["z/z"]);
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
    expect(t.postMarks).not.toHaveBeenCalled();
    expect(readOwner(localStorage)).toBe("u1");
  });

  it("a conflicting draft: the newer copy stays, the other is stashed", async () => {
    seedAnonymous();
    const older = { code: "theirs", updatedAt: "2026-09-18T09:00:00.000Z", rev: 4, deleted: false };
    const putDraft = vi.fn<Transport["putDraft"]>()
      .mockResolvedValueOnce({ kind: "conflict", server: older })
      .mockResolvedValue({ kind: "ok", rev: 5 });
    const d = deps(transport(EMPTY, { putDraft }));
    await completeMerge(d, "add");
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("mine");
    expect(d.queue.stash("two-sum", "python")?.code).toBe("theirs");
  });

  it("a legacy draft loses to the server copy and is stashed, not lost", async () => {
    localStorage.setItem("dsa:sandbox:two-sum:python", "legacy");
    const server = { code: "theirs", updatedAt: "2026-09-18T09:00:00.000Z", rev: 4, deleted: false };
    const d = deps(transport(EMPTY, { putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "conflict", server })) }));
    await completeMerge(d, "add");
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("theirs");
    expect(d.queue.stash("two-sum", "python")?.code).toBe("legacy");
  });

  it("offline mid-merge: throws and does not take ownership, so it reruns", async () => {
    seedAnonymous();
    const t = transport(EMPTY, { postMarks: vi.fn(async () => 0) });
    await expect(completeMerge(deps(t), "add")).rejects.toThrow();
    expect(readOwner(localStorage)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, module not found.

- [ ] **Step 3: Implement**

`web/src/lib/progress/signInFlow.ts`:

```ts
import { readSet, solvedKey, visitedKey, writeSet } from "@/components/providers/progressStorage";
import { TransportError, type Transport } from "./api";
import {
  anonymousSummary, clearSyncedData, hasAnyData, listLocalDrafts, readOwner,
  removeLocalDraft, writeLocalDraft, writeOwner, type AnonymousSummary,
} from "./localStore";
import { LEGACY_UPDATED_AT, mergeDecision, ownerAction, resolveOnMount, unionIds, type OwnerAction } from "./merge";
import type { SyncQueue } from "./syncQueue";

export interface FlowDeps {
  storage: Storage;
  userId: string;
  course: string;
  transport: Transport;
  queue: SyncQueue;
  isKnownSandbox: (id: string) => boolean;
}

export type SignInResult = { kind: "ready" } | { kind: "ask"; summary: AnonymousSummary };

/**
 * Must run before the SyncQueue is built: on "replace" the device holds
 * another account's data (its session expired and someone else signed in),
 * and that account's unsent queue must be discarded, never sent.
 */
export function prepareDevice(storage: Storage, userId: string): OwnerAction {
  const action = ownerAction(readOwner(storage), userId);
  if (action === "replace") clearSyncedData(storage);
  return action;
}

export async function pullMarks(deps: FlowDeps): Promise<void> {
  const server = await deps.transport.getMarks(deps.course);
  writeSet(visitedKey(deps.course), new Set(unionIds(readSet(visitedKey(deps.course)), server.visited)));
  writeSet(solvedKey(deps.course), new Set(unionIds(readSet(solvedKey(deps.course)), server.solved)));
}

export async function beginSignIn(deps: FlowDeps, action: OwnerAction): Promise<SignInResult> {
  if (action === "resume") {
    await pullMarks(deps);
    return { kind: "ready" };
  }
  // "merge", or "replace" (whose data prepareDevice already cleared).
  const summary = anonymousSummary(deps.storage, deps.course, deps.isKnownSandbox);
  const server = await deps.transport.getMarks(deps.course);
  const decision = mergeDecision(hasAnyData(summary), server);
  if (decision === "ask") return { kind: "ask", summary };
  if (decision === "merge-silently") await uploadAnonymous(deps);
  await finish(deps);
  return { kind: "ready" };
}

export async function completeMerge(deps: FlowDeps, choice: "add" | "discard"): Promise<void> {
  if (choice === "add") await uploadAnonymous(deps);
  else clearSyncedData(deps.storage);
  await finish(deps);
}

/** sync:owner is the commit marker, so it is written only after everything else. */
async function finish(deps: FlowDeps): Promise<void> {
  await pullMarks(deps);
  writeOwner(deps.storage, deps.userId);
}

async function uploadAnonymous(deps: FlowDeps): Promise<void> {
  const { course, queue, storage, transport } = deps;
  for (const id of readSet(visitedKey(course))) queue.enqueueMark({ course, kind: "visited", id });
  for (const id of readSet(solvedKey(course))) queue.enqueueMark({ course, kind: "solved", id });
  await queue.flush();
  if (queue.pendingCount() > 0) throw new TransportError(0);

  for (const { sandboxId, lang, draft } of listLocalDrafts(storage, deps.isKnownSandbox)) {
    const baseRev = queue.baseRev(sandboxId, lang);
    const out = await transport.putDraft(sandboxId, {
      lang,
      code: draft.code,
      // A draft saved before sync shipped loses every tie-break.
      updatedAt: draft.updatedAt ?? LEGACY_UPDATED_AT,
      deleted: false,
      baseRev,
    });
    if (out.kind === "error") throw new TransportError(out.status);
    if (out.kind === "ok") {
      queue.setBaseRev(sandboxId, lang, out.rev);
      continue;
    }
    const server = out.server;
    queue.setBaseRev(sandboxId, lang, server.rev);
    const resolution = resolveOnMount(draft, true, server, baseRev);
    if (resolution === "server-wins-stash-local") {
      queue.setStash(sandboxId, lang, draft);
      if (server.deleted) removeLocalDraft(storage, sandboxId, lang);
      else writeLocalDraft(storage, sandboxId, lang, server.code, server.updatedAt);
    } else if (resolution === "local-wins-stash-server") {
      queue.setStash(sandboxId, lang, { code: server.code, updatedAt: server.updatedAt, deleted: server.deleted });
      queue.enqueueDraft(sandboxId, lang, { code: draft.code, updatedAt: draft.updatedAt ?? LEGACY_UPDATED_AT, deleted: false });
    }
  }
}
```

- [ ] **Step 4: Run the tests** → 9 passed.

- [ ] **Step 5: Prove it can fail**

Delete the `if (queue.pendingCount() > 0) throw` line: the offline test FAILS (ownership is taken with marks unsent). Restore: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/progress/signInFlow.ts tests/signInFlow.test.ts
git commit -m "feat(progress): first sign-in merge and account-switch handling"
```

---

### Task 9: Sync bridge, dialog shell, auth client and ProgressProvider hookup

**Files:**
- Create: `web/src/components/providers/SyncBridge.tsx`, `web/src/components/ui/Dialog.tsx`, `web/src/lib/auth/client.ts`
- Modify: `web/src/lib/progress/types.ts` (add `SYNCED_COURSE`), `web/src/components/providers/ProgressProvider.tsx`, `web/src/components/layout/AppShell.tsx` (wrap in `SyncBridgeProvider`, accept `authEnabled`), `web/src/app/layout.tsx:115` (pass `authEnabled`)
- Test: `web/tests/syncBridge.test.tsx`, `web/tests/dialog.test.tsx`

**Interfaces:**
- Consumes: `SyncQueue` (type only), `Transport` (type only), `isAuthConfigured` (Task 2).
- Produces:
  - `types.ts`: `export const SYNCED_COURSE = "dsa";`
  - `interface SyncRuntime { userId: string; queue: SyncQueue; transport: Transport }`
  - `interface SyncBridgeValue { authEnabled: boolean; runtime: SyncRuntime | null; setRuntime(r: SyncRuntime | null): void; marksEpoch: number; bumpMarks(): void }`
  - `SyncBridgeProvider({ authEnabled, children })`, `useSyncBridge(): SyncBridgeValue` (outside a provider: `authEnabled: false`, `runtime: null`, no-ops)
  - `Dialog({ open, onClose, label, children, className? })` — portalled, focus-trapped, Esc closes, focus returns to the opener
  - `authClient` (`createAuthClient()` from `better-auth/react`)

- [ ] **Step 1: Write the failing tests**

`web/tests/dialog.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dialog } from "@/components/ui/Dialog";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(open: boolean, onClose = vi.fn()) {
  const host = document.createElement("div");
  document.body.append(host);
  const opener = document.createElement("button");
  document.body.append(opener);
  opener.focus();
  root = createRoot(host);
  act(() =>
    root!.render(
      <Dialog open={open} onClose={onClose} label="Test dialog">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    ),
  );
  return { onClose, opener };
}

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    mount(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("is labelled, modal, and focuses its first control", () => {
    mount(true);
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("Test dialog");
    expect(document.activeElement?.textContent).toBe("First");
  });

  it("Escape closes; Tab wraps from last to first and Shift+Tab back", () => {
    const { onClose } = mount(true);
    const [first, last] = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')];
    last!.focus();
    act(() => last!.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true })));
    expect(document.activeElement).toBe(first);
    act(() => first!.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true })));
    expect(document.activeElement).toBe(last);
    act(() => first!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("returns focus to the opener when it closes", () => {
    const { opener } = mount(true);
    act(() => root!.render(<Dialog open={false} onClose={() => {}} label="Test dialog">x</Dialog>));
    expect(document.activeElement).toBe(opener);
  });
});
```

`web/tests/syncBridge.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ProgressProvider, useProgress } from "@/components/providers/ProgressProvider";
import { SyncBridgeProvider, useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import type { Transport } from "@/lib/progress/api";
import { SyncQueue } from "@/lib/progress/syncQueue";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
beforeEach(() => localStorage.clear());
afterEach(() => {
  act(() => root?.unmount());
  root = null;
});

function fakeRuntime() {
  const transport: Transport = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => ({})),
    putDraft: vi.fn(async () => ({ kind: "ok" as const, rev: 1 })),
  };
  const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  const enqueueMark = vi.spyOn(queue, "enqueueMark");
  const runtime: SyncRuntime = { userId: "u1", queue, transport };
  return { runtime, enqueueMark };
}

let api: { markVisited: (id: string) => void; visited: Set<string> } | null = null;
let bridge: ReturnType<typeof useSyncBridge> | null = null;

function Probe({ runtime }: { runtime: SyncRuntime | null }) {
  const progress = useProgress();
  const b = useSyncBridge();
  api = progress;
  bridge = b;
  useEffect(() => b.setRuntime(runtime), [b, runtime]);
  return null;
}

function mount(runtime: SyncRuntime | null) {
  const host = document.createElement("div");
  root = createRoot(host);
  act(() =>
    root!.render(
      <SyncBridgeProvider authEnabled>
        <ProgressProvider courseSlug="dsa" totalCount={1} totalProblemCount={1} lessonProgressIds={["a/b"]}>
          <Probe runtime={runtime} />
        </ProgressProvider>
      </SyncBridgeProvider>,
    ),
  );
}

describe("ProgressProvider through the sync bridge", () => {
  it("signed out: marks write localStorage only", () => {
    mount(null);
    act(() => api!.markVisited("a/b"));
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["a/b"]);
  });

  it("signed in: a new mark is enqueued once; a repeat visit is not", () => {
    const { runtime, enqueueMark } = fakeRuntime();
    mount(runtime);
    act(() => api!.markVisited("a/b"));
    act(() => api!.markVisited("a/b"));
    expect(enqueueMark).toHaveBeenCalledTimes(1);
    expect(enqueueMark).toHaveBeenCalledWith({ course: "dsa", kind: "visited", id: "a/b" });
  });

  it("bumpMarks re-reads localStorage after a pull", () => {
    mount(null);
    localStorage.setItem("course-progress:dsa", JSON.stringify(["x/y"]));
    act(() => bridge!.bumpMarks());
    expect([...api!.visited]).toEqual(["x/y"]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail** → FAIL, modules not found.

- [ ] **Step 3: Implement**

Add to `web/src/lib/progress/types.ts`:

```ts
/** The only course that syncs; the Next.js course is disabled. */
export const SYNCED_COURSE = "dsa";
```

`web/src/components/providers/SyncBridge.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Transport } from "@/lib/progress/api";
import type { SyncQueue } from "@/lib/progress/syncQueue";

export interface SyncRuntime {
  userId: string;
  queue: SyncQueue;
  transport: Transport;
}

export interface SyncBridgeValue {
  authEnabled: boolean;
  runtime: SyncRuntime | null;
  setRuntime(runtime: SyncRuntime | null): void;
  /** Bumped after a pull writes localStorage, so readers re-read it. */
  marksEpoch: number;
  bumpMarks(): void;
}

const SIGNED_OUT: SyncBridgeValue = {
  authEnabled: false,
  runtime: null,
  setRuntime: () => {},
  marksEpoch: 0,
  bumpMarks: () => {},
};

const Ctx = createContext<SyncBridgeValue>(SIGNED_OUT);

/**
 * The seam between today's localStorage stores and sync. It holds only type
 * imports, so signed-out visitors download none of the sync code: the
 * signed-in runtime arrives later in a dynamic chunk and registers here.
 */
export function SyncBridgeProvider({ authEnabled, children }: { authEnabled: boolean; children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<SyncRuntime | null>(null);
  const [marksEpoch, setEpoch] = useState(0);
  const bumpMarks = useCallback(() => setEpoch((n) => n + 1), []);
  const value = useMemo(
    () => ({ authEnabled, runtime, setRuntime, marksEpoch, bumpMarks }),
    [authEnabled, runtime, marksEpoch, bumpMarks],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSyncBridge(): SyncBridgeValue {
  return useContext(Ctx);
}
```

`web/src/components/ui/Dialog.tsx`:

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * The SearchDialog surface plus the two things a confirm dialog needs that
 * search did not: a focus trap, and focus returned to whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => opener.current?.focus();
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/25 px-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full max-w-md rounded-[length:var(--radius-lg)] border border-border bg-elevated p-6 shadow-elevation",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

`web/src/lib/auth/client.ts`:

```ts
"use client";

import { createAuthClient } from "better-auth/react";

// Same origin as the app, so no baseURL: the client calls /api/auth/*.
export const authClient = createAuthClient();
```

Modify `web/src/components/providers/ProgressProvider.tsx`:

1. Add imports:

```ts
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { SYNCED_COURSE, type MarkKind } from "@/lib/progress/types";
```

2. Inside the component, after the `sKey` line:

```ts
  const { runtime, marksEpoch } = useSyncBridge();
```

3. Change the restore effect's dependency list to `[courseSlug, marksEpoch]` and keep its body. A pull bumps the epoch, so the union it wrote to localStorage reaches the UI.

4. Add a helper above `markVisited`:

```ts
  // Checked against storage, not React state: VisitTracker can fire before
  // the restore effect (see markVisited), when state is still empty and every
  // visit would look new.
  const report = useCallback(
    (key: string, kind: MarkKind, id: string) => {
      if (!runtime || courseSlug !== SYNCED_COURSE) return;
      if (readSet(key).has(id)) return;
      runtime.queue.enqueueMark({ course: courseSlug, kind, id });
    },
    [runtime, courseSlug],
  );
```

5. In `markVisited`, call `report(vKey, "visited", id);` as the first statement (before `setVisited`), and add `report` to its dependency list. Do the same in `markSolved` with `report(sKey, "solved", id);`.

Modify `web/src/components/layout/AppShell.tsx`: change the signature to `export function AppShell({ children, authEnabled = false }: { children: React.ReactNode; authEnabled?: boolean })`, import `SyncBridgeProvider`, and wrap the returned `<ProgressProvider …>…</ProgressProvider>` in `<SyncBridgeProvider authEnabled={authEnabled}>…</SyncBridgeProvider>`.

Modify `web/src/app/layout.tsx`: import `isAuthConfigured` from `@/lib/auth/env` and change line 115 to `<AppShell authEnabled={isAuthConfigured()}>{children}</AppShell>`. `env.ts` has no imports, so the layout stays hook-free (the §4 rule). The value is read when pages are statically rendered, so **changing the auth variables needs a redeploy**; the rollout notes in Task 14 say so.

- [ ] **Step 4: Run the tests**

Run: `npm test -- tests/dialog.test.tsx tests/syncBridge.test.tsx tests/progressStorage.test.ts tests/appShellRouting.test.ts` → all pass.

- [ ] **Step 5: Prove it can fail**

Remove the `readSet(key).has(id)` early return in `report`: the "repeat visit is not" test FAILS (2 calls). Restore. Remove `marksEpoch` from the restore effect's dependencies: the `bumpMarks` test FAILS. Restore: PASS.

- [ ] **Step 6: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/components/providers src/components/ui src/lib/auth src/components/layout/AppShell.tsx src/app/layout.tsx` → clean.

```bash
git add src/components/providers/SyncBridge.tsx src/components/ui/Dialog.tsx src/lib/auth/client.ts src/lib/progress/types.ts src/components/providers/ProgressProvider.tsx src/components/layout/AppShell.tsx src/app/layout.tsx tests/dialog.test.tsx tests/syncBridge.test.tsx
git commit -m "feat(sync): bridge between local stores and sync, dialog shell, auth client"
```

---

### Task 10: Signed-in sync runtime and the merge prompt

**Files:**
- Create: `web/src/components/providers/SyncProvider.tsx`, `web/src/components/auth/MergePromptDialog.tsx`, `web/src/components/auth/AccountRuntime.tsx`
- Modify: `web/src/components/layout/AppShell.tsx` (render `<AccountRuntime />` inside `SyncBridgeProvider`)
- Test: `web/tests/syncProvider.test.tsx`

**Interfaces:**
- Consumes: `SyncBridge`, `Dialog`, `authClient` (Task 9); `signInFlow` (Task 8); `SyncQueue`, `httpTransport` (Task 7); `sandboxIds.generated.json` (Task 4).
- Produces:
  - listens on `AUTH_CHANNEL` (Task 3's `types.ts`) for the message `"signed-out"`; Task 12 posts it
  - `default export SyncProvider({ userId }: { userId: string })`
  - `MergePromptDialog({ summary, busy, onChoose }: { summary: AnonymousSummary | null; busy: boolean; onChoose(choice: "add" | "discard"): void })`
  - `AccountRuntime()` — renders nothing unless `authEnabled` and a session exists; then loads `SyncProvider` with `next/dynamic`

- [ ] **Step 1: Write the failing test**

`web/tests/syncProvider.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { PutOutcome, Transport } from "@/lib/progress/api";
import type { MarksSnapshot } from "@/lib/progress/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let server: MarksSnapshot = { visited: [], solved: [], hasDrafts: false };
const fake: Transport = {
  getMarks: vi.fn(async () => server),
  postMarks: vi.fn(async () => 204),
  getDrafts: vi.fn(async () => ({})),
  putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 1 })),
};
vi.mock("@/lib/progress/api", async (orig) => ({
  ...(await orig<typeof import("@/lib/progress/api")>()),
  httpTransport: fake,
}));

const { default: SyncProvider } = await import("@/components/providers/SyncProvider");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");
const { SyncQueue } = await import("@/lib/progress/syncQueue");

let root: Root | null = null;
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  server = { visited: [], solved: [], hasDrafts: false };
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

async function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root!.render(
      <SyncBridgeProvider authEnabled>
        <SyncProvider userId="u1" />
      </SyncBridgeProvider>,
    );
  });
}

describe("SyncProvider", () => {
  it("empty device: pulls, takes ownership, shows no prompt", async () => {
    server = { visited: ["arrays/intro"], solved: [], hasDrafts: false };
    await mount();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(JSON.parse(localStorage.getItem("course-progress:dsa")!)).toEqual(["arrays/intro"]);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("existing account with local progress: asks, and Add merges", async () => {
    localStorage.setItem("course-progress:dsa", JSON.stringify(["arrays/intro"]));
    server = { visited: ["z/z"], solved: [], hasDrafts: false };
    await mount();
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain("1 lesson visited");
    const add = [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Add to my account")!;
    await act(async () => add.click());
    expect(fake.postMarks).toHaveBeenCalled();
    expect(localStorage.getItem("sync:owner")).toBe("u1");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("flushes with keepalive when the tab is hidden", async () => {
    const flush = vi.spyOn(SyncQueue.prototype, "flush");
    await mount();
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(flush).toHaveBeenCalledWith({ keepalive: true });
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, module not found.

- [ ] **Step 3: Implement the merge prompt**

`web/src/components/auth/MergePromptDialog.tsx`:

```tsx
"use client";

import { Dialog } from "@/components/ui/Dialog";
import type { AnonymousSummary } from "@/lib/progress/localStore";

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function MergePromptDialog({
  summary,
  busy,
  onChoose,
}: {
  summary: AnonymousSummary | null;
  busy: boolean;
  onChoose: (choice: "add" | "discard") => void;
}) {
  // No close-without-choosing: until the learner answers, the device's
  // progress belongs to nobody, so Escape and the backdrop do nothing.
  return (
    <Dialog open={summary !== null} onClose={() => {}} label="Progress on this device">
      {summary ? (
        <>
          <h2 className="font-display text-lg font-bold">This device has progress from before you signed in.</h2>
          <p className="mt-3 text-sm text-muted">
            {plural(summary.visited, "lesson visited", "lessons visited")} ·{" "}
            {plural(summary.solved, "problem solved", "problems solved")} ·{" "}
            {plural(summary.drafts, "draft", "drafts")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => onChoose("add")}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:opacity-90 disabled:opacity-60"
            >
              Add to my account
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onChoose("discard")}
              className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface disabled:opacity-60"
            >
              Don&apos;t add
            </button>
          </div>
        </>
      ) : null}
    </Dialog>
  );
}
```

- [ ] **Step 4: Implement the runtime**

`web/src/components/providers/SyncProvider.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import sandboxIds from "@/lib/sandbox/sandboxIds.generated.json";
import { MergePromptDialog } from "@/components/auth/MergePromptDialog";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { httpTransport } from "@/lib/progress/api";
import type { AnonymousSummary } from "@/lib/progress/localStore";
import { beginSignIn, completeMerge, prepareDevice, type FlowDeps } from "@/lib/progress/signInFlow";
import { SyncQueue } from "@/lib/progress/syncQueue";
import { AUTH_CHANNEL, SYNCED_COURSE } from "@/lib/progress/types";

const KNOWN = new Set<string>(sandboxIds);

/**
 * Loaded only once a session exists (next/dynamic in AccountRuntime), so
 * signed-out visitors never download the queue, the merge rules or zod.
 */
export default function SyncProvider({ userId }: { userId: string }) {
  const { setRuntime, bumpMarks } = useSyncBridge();
  const [ask, setAsk] = useState<AnonymousSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const deps = useRef<FlowDeps | null>(null);

  useEffect(() => {
    const storage = window.localStorage;
    const action = prepareDevice(storage, userId);
    const queue = new SyncQueue({ storage, userId, transport: httpTransport });
    const flow: FlowDeps = {
      storage, userId, course: SYNCED_COURSE, transport: httpTransport, queue,
      isKnownSandbox: (id) => KNOWN.has(id),
    };
    deps.current = flow;
    setRuntime({ userId, queue, transport: httpTransport });

    let cancelled = false;
    let started = false;
    const start = async () => {
      try {
        const result = await beginSignIn(flow, action);
        started = true;
        if (cancelled) return;
        if (result.kind === "ask") setAsk(result.summary);
        else {
          bumpMarks();
          void queue.flush();
        }
      } catch {
        // Offline before ownership was taken: sync:owner is unwritten, so
        // the flow reruns on reconnect or the next load. The queue keeps
        // anything enqueued meanwhile.
      }
    };
    void start();

    const onHide = () => {
      if (document.visibilityState === "hidden") void queue.flush({ keepalive: true });
    };
    const onOnline = () => {
      if (!started) void start();
      queue.retryNow();
    };
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    // Another tab signed out and cleared storage; this tab's in-memory state
    // is the last learner's, and a reload is the one reset that covers all of it.
    channel.onmessage = (e: MessageEvent) => {
      if (e.data === "signed-out") window.location.reload();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
      channel.close();
      queue.dispose();
      setRuntime(null);
      deps.current = null;
    };
  }, [userId, setRuntime, bumpMarks]);

  const choose = async (choice: "add" | "discard") => {
    const flow = deps.current;
    if (!flow) return;
    setBusy(true);
    try {
      await completeMerge(flow, choice);
      setAsk(null);
      bumpMarks();
      void flow.queue.flush();
    } catch {
      // Offline: the prompt stays up; the learner can retry once connected.
    } finally {
      setBusy(false);
    }
  };

  return <MergePromptDialog summary={ask} busy={busy} onChoose={(c) => void choose(c)} />;
}
```

- [ ] **Step 5: Mount it**

`web/src/components/auth/AccountRuntime.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";

const SyncProvider = dynamic(() => import("@/components/providers/SyncProvider"), { ssr: false });

function SessionSync() {
  const { data } = authClient.useSession();
  return data ? <SyncProvider userId={data.user.id} /> : null;
}

export function AccountRuntime() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionSync /> : null;
}
```

In `web/src/components/layout/AppShell.tsx`, import `AccountRuntime` and render `<AccountRuntime />` next to `<VisitTracker />` (inside the providers, so it can reach the bridge).

- [ ] **Step 6: Run the tests**

Run: `npm test -- tests/syncProvider.test.tsx tests/syncBridge.test.tsx` → all pass.

- [ ] **Step 7: Prove it can fail**

In `SyncProvider`, change `if (result.kind === "ask") setAsk(result.summary);` to `if (result.kind === "ask") void choose("add");`: the prompt test FAILS (it merged without asking). Restore: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/providers/SyncProvider.tsx src/components/auth/MergePromptDialog.tsx src/components/auth/AccountRuntime.tsx src/components/layout/AppShell.tsx tests/syncProvider.test.tsx
git commit -m "feat(sync): signed-in runtime with merge prompt, hide flush and cross-tab sign-out"
```

---

### Task 11: Draft sync in the sandbox, the stash row and Compare

**Files:**
- Create: `web/src/components/sandbox/useDraftSync.ts`, `web/src/components/sandbox/DraftStashRow.tsx`
- Modify: `web/src/components/kit/CodeEditor.tsx` (add `readOnly`), `web/src/components/sandbox/Sandbox.tsx` (add `syncDraft` prop, call the hook, render the row), `web/src/components/problems/ProblemWorkspace.tsx:165` (pass `syncDraft`)
- Test: `web/tests/draftSync.test.tsx`

**Interfaces:**
- Consumes: `useSyncBridge` (Task 9); `SyncQueue` API (Task 7); `resolveOnMount` (Task 3); `readLocalDraft`, `writeLocalDraft`, `removeLocalDraft` (Task 6); `Dialog` (Task 9).
- Produces:
  - `useDraftSync({ sandboxId, enabled, applyRemote }: { sandboxId: string; enabled: boolean; applyRemote: (lang: DraftLang, code: string | null) => void }): DraftSyncApi` — `code: null` means "show the starter"
  - `interface DraftSyncApi { stashes: Partial<Record<DraftLang, Stash>>; recordEdit(lang: DraftLang, code: string, at: string): void; recordReset(lang: DraftLang): void; takeStash(lang: DraftLang, current: string): Stash | null; dismiss(lang: DraftLang): void }`
  - `DraftStashRow({ stash, current, lang, onUse, onDismiss })`
  - `CodeEditor` gains `readOnly?: boolean` (default false)

- [ ] **Step 1: Write the failing test**

`web/tests/draftSync.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SyncBridgeProvider, useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import { useDraftSync, type DraftSyncApi } from "@/components/sandbox/useDraftSync";
import { DraftStashRow } from "@/components/sandbox/DraftStashRow";
import type { PutOutcome, Transport } from "@/lib/progress/api";
import { readLocalDraft, writeLocalDraft } from "@/lib/progress/localStore";
import { SyncQueue } from "@/lib/progress/syncQueue";
import type { ServerDrafts } from "@/lib/progress/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EARLY = "2026-09-18T09:00:00.000Z";
const LATE = "2026-09-18T11:00:00.000Z";

let root: Root | null = null;
let api: DraftSyncApi | null = null;
const applied: [string, string | null][] = [];

beforeEach(() => {
  localStorage.clear();
  applied.length = 0;
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function runtimeWith(serverDrafts: ServerDrafts) {
  const transport: Transport = {
    getMarks: vi.fn(async () => ({ visited: [], solved: [], hasDrafts: false })),
    postMarks: vi.fn(async () => 204),
    getDrafts: vi.fn(async () => serverDrafts),
    putDraft: vi.fn(async (): Promise<PutOutcome> => ({ kind: "ok", rev: 9 })),
  };
  const queue = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  const runtime: SyncRuntime = { userId: "u1", queue, transport };
  return { runtime, queue };
}

function Harness({ runtime }: { runtime: SyncRuntime }) {
  const { setRuntime } = useSyncBridge();
  useEffect(() => setRuntime(runtime), [runtime, setRuntime]);
  api = useDraftSync({ sandboxId: "two-sum", enabled: true, applyRemote: (l, c) => applied.push([l, c]) });
  return null;
}

async function mount(runtime: SyncRuntime) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(<SyncBridgeProvider authEnabled><Harness runtime={runtime} /></SyncBridgeProvider>));
}

describe("useDraftSync on mount (spec §6.3)", () => {
  it("clean local, newer server: takes the server copy into storage and the editor", async () => {
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(readLocalDraft(localStorage, "two-sum", "python")?.code).toBe("server");
    expect(queue.baseRev("two-sum", "python")).toBe(2);
  });

  it("both changed, local newer: local stays, server copy is stashed", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", LATE);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: EARLY, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: LATE, deleted: false });
    await mount(runtime);
    expect(applied).toEqual([]);
    expect(api!.stashes.python?.code).toBe("server");
  });

  it("both changed, server newer: server goes in the editor, local is stashed", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "mine", EARLY);
    const { runtime, queue } = runtimeWith({ python: { code: "server", updatedAt: LATE, rev: 2, deleted: false } });
    queue.setBaseRev("two-sum", "python", 1);
    queue.enqueueDraft("two-sum", "python", { code: "mine", updatedAt: EARLY, deleted: false });
    await mount(runtime);
    expect(applied).toEqual([["python", "server"]]);
    expect(api!.stashes.python?.code).toBe("mine");
  });

  it("a server tombstone over a clean local draft resets to the starter", async () => {
    writeLocalDraft(localStorage, "two-sum", "python", "old", EARLY);
    const { runtime, queue } = runtimeWith({ python: { code: "", updatedAt: LATE, rev: 3, deleted: true } });
    queue.setBaseRev("two-sum", "python", 2);
    await mount(runtime);
    expect(applied).toEqual([["python", null]]);
    expect(readLocalDraft(localStorage, "two-sum", "python")).toBeNull();
  });
});

describe("edits and stashes", () => {
  it("edits and resets are queued; a reset is a tombstone", async () => {
    const { runtime, queue } = runtimeWith({});
    await mount(runtime);
    act(() => api!.recordEdit("python", "x", LATE));
    expect(queue.hasPendingDraft("two-sum", "python")).toBe(true);
    const spy = vi.spyOn(queue, "enqueueDraft");
    act(() => api!.recordReset("javascript"));
    expect(spy.mock.calls[0]![2]).toMatchObject({ code: "", deleted: true });
  });

  it("taking the stash keeps the displaced code as the new stash", async () => {
    const { runtime, queue } = runtimeWith({});
    await mount(runtime);
    act(() => queue.setStash("two-sum", "python", { code: "other", updatedAt: EARLY, deleted: false }));
    let taken = null as ReturnType<DraftSyncApi["takeStash"]>;
    act(() => {
      taken = api!.takeStash("python", "on screen");
    });
    expect(taken?.code).toBe("other");
    expect(api!.stashes.python?.code).toBe("on screen");
    act(() => api!.dismiss("python"));
    expect(api!.stashes.python).toBeUndefined();
  });
});

describe("DraftStashRow", () => {
  it("names the situation and wires its three actions", () => {
    const onUse = vi.fn();
    const onDismiss = vi.fn();
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    act(() =>
      root!.render(
        <DraftStashRow
          stash={{ code: "other", updatedAt: EARLY, deleted: false }}
          current="mine"
          lang="python"
          onUse={onUse}
          onDismiss={onDismiss}
        />,
      ),
    );
    expect(host.textContent).toContain("A different version of this draft was saved on another device.");
    const button = (label: string) => [...host.querySelectorAll("button")].find((b) => b.textContent === label)!;
    act(() => button("Use that version").click());
    act(() => button("Dismiss").click());
    expect(onUse).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
    act(() => button("Compare").click());
    expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Compare draft versions");
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, modules not found.

- [ ] **Step 3: Implement the hook**

`web/src/components/sandbox/useDraftSync.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { readLocalDraft, removeLocalDraft, writeLocalDraft } from "@/lib/progress/localStore";
import { resolveOnMount } from "@/lib/progress/merge";
import { DRAFT_LANGS, type DraftLang, type ServerDraft, type Stash } from "@/lib/progress/types";

export interface DraftSyncApi {
  stashes: Partial<Record<DraftLang, Stash>>;
  recordEdit(lang: DraftLang, code: string, at: string): void;
  recordReset(lang: DraftLang): void;
  takeStash(lang: DraftLang, current: string): Stash | null;
  dismiss(lang: DraftLang): void;
}

export function useDraftSync({
  sandboxId,
  enabled,
  applyRemote,
}: {
  sandboxId: string;
  enabled: boolean;
  applyRemote: (lang: DraftLang, code: string | null) => void;
}): DraftSyncApi {
  const { runtime } = useSyncBridge();
  const active = enabled ? runtime : null;
  const [stashes, setStashes] = useState<Partial<Record<DraftLang, Stash>>>({});

  useEffect(() => {
    if (!active) {
      setStashes({});
      return;
    }
    const read = () => {
      const next: Partial<Record<DraftLang, Stash>> = {};
      for (const lang of DRAFT_LANGS) {
        const stash = active.queue.stash(sandboxId, lang);
        if (stash) next[lang] = stash;
      }
      setStashes(next);
    };
    read();
    return active.queue.subscribe(read);
  }, [active, sandboxId]);

  useEffect(() => {
    if (!active) return;
    const { queue, transport } = active;
    const storage = window.localStorage;
    let cancelled = false;

    const takeServer = (lang: DraftLang, server: ServerDraft) => {
      if (server.deleted) removeLocalDraft(storage, sandboxId, lang);
      else writeLocalDraft(storage, sandboxId, lang, server.code, server.updatedAt);
      applyRemote(lang, server.deleted ? null : server.code);
    };

    transport
      .getDrafts(sandboxId)
      .then((server) => {
        if (cancelled) return;
        for (const lang of DRAFT_LANGS) {
          const remote = server[lang] ?? null;
          const local = readLocalDraft(storage, sandboxId, lang);
          const baseRev = queue.baseRev(sandboxId, lang);
          // Never synced from this device (baseRev 0) counts as a local change.
          const dirty = queue.hasPendingDraft(sandboxId, lang) || (baseRev === 0 && local !== null);
          const resolution = resolveOnMount(local, dirty, remote, baseRev);
          if (!remote) {
            if (dirty && local && !queue.hasPendingDraft(sandboxId, lang)) {
              queue.enqueueDraft(sandboxId, lang, { code: local.code, updatedAt: local.updatedAt ?? new Date().toISOString(), deleted: false });
            }
            continue;
          }
          if (resolution === "keep-local") continue;
          queue.setBaseRev(sandboxId, lang, remote.rev);
          if (resolution === "take-server") takeServer(lang, remote);
          else if (resolution === "local-wins-stash-server") {
            queue.setStash(sandboxId, lang, { code: remote.code, updatedAt: remote.updatedAt, deleted: remote.deleted });
            if (local) queue.enqueueDraft(sandboxId, lang, { code: local.code, updatedAt: local.updatedAt ?? new Date().toISOString(), deleted: false });
          } else if (resolution === "server-wins-stash-local") {
            if (local) queue.setStash(sandboxId, lang, local);
            takeServer(lang, remote);
          }
        }
      })
      // Offline: the local draft stays; the next mount or edit tries again.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // applyRemote is a setState wrapper from the caller; re-pulling on its
    // identity would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sandboxId]);

  const recordEdit = useCallback(
    (lang: DraftLang, code: string, at: string) => {
      active?.queue.enqueueDraft(sandboxId, lang, { code, updatedAt: at, deleted: false });
    },
    [active, sandboxId],
  );

  const recordReset = useCallback(
    (lang: DraftLang) => {
      active?.queue.enqueueDraft(sandboxId, lang, { code: "", updatedAt: new Date().toISOString(), deleted: true });
    },
    [active, sandboxId],
  );

  const takeStash = useCallback(
    (lang: DraftLang, current: string): Stash | null => {
      const stash = active?.queue.stash(sandboxId, lang) ?? null;
      if (!active || !stash) return null;
      // The displaced code becomes the stash, so "Use that version" is
      // reversible until the learner dismisses it.
      active.queue.setStash(sandboxId, lang, { code: current, updatedAt: new Date().toISOString(), deleted: false });
      return stash;
    },
    [active, sandboxId],
  );

  const dismiss = useCallback(
    (lang: DraftLang) => active?.queue.setStash(sandboxId, lang, null),
    [active, sandboxId],
  );

  return { stashes, recordEdit, recordReset, takeStash, dismiss };
}
```

- [ ] **Step 4: Implement the row and Compare**

In `web/src/components/kit/CodeEditor.tsx` add `readOnly = false` to the destructured props and `readOnly?: boolean;` to the prop type (with the comment `/** Compare view: shows code in the editor's own colours, not editable. */`), make `onChange` optional (`onChange?: (next: string) => void`), and pass `readOnly={readOnly}` and `editable={!readOnly}` to `<CodeMirror>`.

`web/src/components/sandbox/DraftStashRow.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import type { DraftLang, Stash } from "@/lib/progress/types";

// Same lazy editor as the sandbox, so Compare paints from the one code palette.
const CodeEditor = dynamic(() => import("@/components/kit/CodeEditor").then((m) => m.CodeEditor), { ssr: false });

const ROW_BUTTON = "text-sm font-medium text-info underline decoration-info-line underline-offset-4 hover:decoration-info";

export function DraftStashRow({
  stash,
  current,
  lang,
  onUse,
  onDismiss,
}: {
  stash: Stash;
  current: string;
  lang: DraftLang;
  onUse: () => void;
  onDismiss: () => void;
}) {
  const [comparing, setComparing] = useState(false);
  return (
    <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-elevated px-4 py-2">
      <p className="text-sm text-info">A different version of this draft was saved on another device.</p>
      <div className="flex gap-4">
        <button type="button" className={ROW_BUTTON} onClick={() => setComparing(true)}>Compare</button>
        <button type="button" className={ROW_BUTTON} onClick={onUse}>Use that version</button>
        <button type="button" className={ROW_BUTTON} onClick={onDismiss}>Dismiss</button>
      </div>
      <Dialog open={comparing} onClose={() => setComparing(false)} label="Compare draft versions" className="max-w-5xl">
        <div className="grid gap-4 md:grid-cols-2">
          <section aria-label="This editor">
            <h2 className="font-display text-sm font-bold">This editor</h2>
            <div className="mt-2 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-code-editor">
              <CodeEditor value={current} lang={lang} readOnly ariaLabel="Code in this editor" minHeight="16rem" />
            </div>
          </section>
          <section aria-label="Other device">
            <h2 className="font-display text-sm font-bold">Other device</h2>
            <div className="mt-2 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-code-editor">
              <CodeEditor
                value={stash.deleted ? "" : stash.code}
                lang={lang}
                readOnly
                ariaLabel="Code from the other device"
                minHeight="16rem"
              />
            </div>
          </section>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className={ROW_BUTTON} onClick={() => setComparing(false)}>Close</button>
        </div>
      </Dialog>
    </div>
  );
}
```

Colour: `text-info` is the info ink (`--info`, AA on `--elevated`) and `decoration-info-line` the grain-safe 3:1 rule (`--info-line`), which may only sit on `--elevated`, as this row does.

- [ ] **Step 5: Wire the sandbox**

In `web/src/components/sandbox/Sandbox.tsx`:

1. Add `syncDraft?: boolean` to `Sandbox`'s and `SandboxBody`'s props (with the comment `/** Problem sandboxes only: their ids are in the sync registry; the landing sandbox's is not. */`) and pass it through.
2. In `SandboxBody`, after the `drafts` state:

```ts
  const applyRemote = useCallback(
    (l: SandboxLang, code: string | null) =>
      setDrafts((current) => ({ ...current, [l]: code ?? spec.starter[l] })),
    [spec.starter],
  );
  const sync = useDraftSync({ sandboxId: spec.id, enabled: syncDraft, applyRemote });
```

3. In `setDraft`, share one timestamp between storage and the queue:

```ts
      const at = new Date().toISOString();
      writeLocalDraft(window.localStorage, spec.id, lang, next, at);
      sync.recordEdit(lang, next, at);
```

(add `sync` to its dependency list). In `restoreStarter`, after `removeLocalDraft(...)` add `sync.recordReset(lang);`.

4. Above both `<CodeEditor … />` render sites (lines ~357 and ~534), render:

```tsx
        {sync.stashes[lang] ? (
          <DraftStashRow
            stash={sync.stashes[lang]}
            current={drafts[lang]}
            lang={lang}
            onUse={() => {
              const taken = sync.takeStash(lang, drafts[lang]);
              if (taken) setDraft(taken.deleted ? spec.starter[lang] : taken.code);
            }}
            onDismiss={() => sync.dismiss(lang)}
          />
        ) : null}
```

In `web/src/components/problems/ProblemWorkspace.tsx`, add `syncDraft` to the `<Sandbox … />` at line 165.

- [ ] **Step 6: Run the tests**

Run: `npm test -- tests/draftSync.test.tsx tests/codeLangSurfaces.test.tsx tests/landingFeatures.test.tsx` → all pass.

- [ ] **Step 7: Prove it can fail**

In `useDraftSync`, remove `if (local) queue.setStash(sandboxId, lang, local);`: the server-newer test FAILS (the learner's code would be lost). Restore: PASS.

- [ ] **Step 8: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/components/sandbox src/components/kit src/components/problems` → clean.

```bash
git add src/components/sandbox src/components/kit/CodeEditor.tsx src/components/problems/ProblemWorkspace.tsx tests/draftSync.test.tsx
git commit -m "feat(sync): draft pull, conflict stash and compare in problem sandboxes"
```

---

### Task 12: Header account control, account menu, sign-out and account deletion

**Files:**
- Create: `web/src/lib/auth/signOutDevice.ts`, `web/src/components/auth/AccountControl.tsx`, `web/src/components/auth/DeleteAccountDialog.tsx`
- Modify: `web/src/components/auth/AccountRuntime.tsx` (finish an offline sign-out), `web/src/components/layout/Header.tsx` (after `ThemeToggle`), `web/src/components/landing/LandingHeader.tsx` (after `ThemeToggle`)
- Test: `web/tests/signOutDevice.test.ts`, `web/tests/accountControl.test.tsx`

**Deviation 6 (added in planning):** an httpOnly session cookie can only be cleared by the server, so a sign-out on a dead network cannot end the session there. The device is still cleared at once, and a `signout-pending` flag makes the next load finish the sign-out **before** sync can start, so the next person never sees the account's progress pulled back in. The spec's "signed out regardless" holds for this device's data; the server session ends on reconnect.

**Interfaces:**
- Consumes: `SyncQueue.flushWithin`, `status`, `offlineSince`, `pendingCount`, `subscribe` (Task 7); `clearSyncedData` (Task 6); `AUTH_CHANNEL` (Task 3); `Dialog`, `authClient`, `useSyncBridge` (Task 9); `NAV_LINK`, `ROUND_CONTROL` (`layout/headerChrome.ts`).
- Produces:
  - `SIGN_OUT_FLUSH_MS = 3000`, `SIGNOUT_PENDING_KEY = "signout-pending"`
  - `signOutDevice(deps: { queue: SyncQueue | null; endSession: () => Promise<void>; storage: Storage; broadcast: (msg: "signed-out") => void; flushMs?: number }): Promise<{ unsynced: boolean }>`
  - `syncWarning(status: SyncStatus, offlineSince: number | null, pending: number, now: number): boolean` — true for `unauthorized`, or offline > 5 min with writes pending
  - `AccountControl()`; `DeleteAccountDialog({ open, onClose, onConfirm, busy })`

- [ ] **Step 1: Write the failing tests**

`web/tests/signOutDevice.test.ts`:

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SIGNOUT_PENDING_KEY, signOutDevice, syncWarning } from "../src/lib/auth/signOutDevice";
import { SyncQueue } from "../src/lib/progress/syncQueue";
import type { Transport } from "../src/lib/progress/api";

function queueWith(postMarks: Transport["postMarks"]) {
  const transport: Transport = {
    getMarks: vi.fn(), postMarks, getDrafts: vi.fn(), putDraft: vi.fn(),
  };
  const q = new SyncQueue({ storage: localStorage, userId: "u1", transport });
  q.enqueueMark({ course: "dsa", kind: "visited", id: "a/b" });
  return q;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("course-progress:dsa", '["a/b"]');
  localStorage.setItem("code-lang", "python");
});

describe("signOutDevice (spec §5.4)", () => {
  it("flushes, ends the session, clears the device, tells other tabs", async () => {
    const order: string[] = [];
    const q = queueWith(vi.fn(async () => { order.push("flush"); return 204; }));
    const broadcast = vi.fn(() => order.push("broadcast"));
    const result = await signOutDevice({
      queue: q, storage: localStorage, broadcast,
      endSession: async () => { order.push("end"); },
    });
    expect(result).toEqual({ unsynced: false });
    expect(order).toEqual(["flush", "end", "broadcast"]);
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(localStorage.getItem("code-lang")).toBe("python");
  });

  it("reports unsynced writes when the 3 s cap runs out, and still signs out", async () => {
    vi.useFakeTimers();
    const q = queueWith(vi.fn(() => new Promise<number>(() => {})));
    const done = signOutDevice({ queue: q, storage: localStorage, broadcast: vi.fn(), endSession: async () => {} });
    await vi.advanceTimersByTimeAsync(3000);
    expect(await done).toEqual({ unsynced: true });
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    vi.useRealTimers();
  });

  it("offline: clears the device and leaves the sign-out pending for the next load", async () => {
    await signOutDevice({
      queue: null, storage: localStorage, broadcast: vi.fn(),
      endSession: async () => { throw new Error("offline"); },
    });
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
    expect(localStorage.getItem(SIGNOUT_PENDING_KEY)).toBe("1");
  });
});

describe("syncWarning", () => {
  const MIN = 60_000;
  it("warns for a revoked session, or 5+ minutes offline with writes pending", () => {
    expect(syncWarning("unauthorized", null, 0, 0)).toBe(true);
    expect(syncWarning("offline", 0, 1, 5 * MIN)).toBe(true);
    expect(syncWarning("offline", 0, 1, 5 * MIN - 1)).toBe(false);
    expect(syncWarning("offline", 0, 0, 10 * MIN)).toBe(false);
    expect(syncWarning("synced", null, 0, 10 * MIN)).toBe(false);
  });
});
```

`web/tests/accountControl.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type SessionState = { data: { user: { id: string; name: string; email: string; image: string | null } } | null; isPending: boolean };
let session: SessionState = { data: null, isPending: false };
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => session,
    signOut: vi.fn(async () => {}),
    revokeSessions: vi.fn(async () => {}),
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/courses/dsa/arrays/intro" }));

const { AccountControl } = await import("@/components/auth/AccountControl");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

function mount(authEnabled: boolean) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(<SyncBridgeProvider authEnabled={authEnabled}><AccountControl /></SyncBridgeProvider>));
  return host;
}

describe("AccountControl", () => {
  it("renders nothing when auth is not configured", () => {
    session = { data: null, isPending: false };
    expect(mount(false).innerHTML).toBe("");
  });

  it("reserves the avatar's space while the session loads", () => {
    session = { data: null, isPending: true };
    const host = mount(true);
    expect(host.querySelector("[data-account-placeholder]")).not.toBeNull();
  });

  it("signed out: a Sign in link that returns to this page", () => {
    session = { data: null, isPending: false };
    const links = [...mount(true).querySelectorAll("a")];
    expect(links.length).toBeGreaterThan(0);
    for (const a of links) {
      expect(a.getAttribute("href")).toBe("/sign-in?next=%2Fcourses%2Fdsa%2Farrays%2Fintro");
    }
  });

  it("signed in: an avatar button that opens the account menu", () => {
    session = { data: { user: { id: "u1", name: "Ada Lovelace", email: "ada@example.com", image: null } }, isPending: false };
    const host = mount(true);
    const button = host.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("Account menu, signed in as Ada Lovelace");
    expect(button.textContent).toContain("AL");
    act(() => button.click());
    const menu = document.querySelector('[role="menu"]')!;
    const items = [...menu.querySelectorAll('[role="menuitem"]')].map((i) => i.textContent);
    expect(items).toEqual(["Sign out", "Sign out everywhere", "Download my data", "Delete account"]);
    expect(document.body.textContent).toContain("ada@example.com");
  });
});
```

- [ ] **Step 2: Run them to verify they fail** → FAIL, modules not found.

- [ ] **Step 3: Implement the sign-out sequence**

`web/src/lib/auth/signOutDevice.ts`:

```ts
import { clearSyncedData } from "@/lib/progress/localStore";
import type { SyncQueue, SyncStatus } from "@/lib/progress/syncQueue";

export const SIGN_OUT_FLUSH_MS = 3000;
/** Outside the `sync:` prefix on purpose: clearSyncedData must not remove it. */
export const SIGNOUT_PENDING_KEY = "signout-pending";
const WARN_AFTER_MS = 5 * 60_000;

export async function signOutDevice(deps: {
  queue: SyncQueue | null;
  endSession: () => Promise<void>;
  storage: Storage;
  broadcast: (msg: "signed-out") => void;
  flushMs?: number;
}): Promise<{ unsynced: boolean }> {
  // Writes must go first: once the session ends the API rejects them. The
  // cap keeps sign-out working on a dead network.
  const flushed = deps.queue ? await deps.queue.flushWithin(deps.flushMs ?? SIGN_OUT_FLUSH_MS) : true;
  let ended = true;
  try {
    await deps.endSession();
  } catch {
    ended = false;
  }
  deps.queue?.dispose();
  clearSyncedData(deps.storage);
  if (!ended) {
    try {
      deps.storage.setItem(SIGNOUT_PENDING_KEY, "1");
    } catch {
      /* storage unavailable: nothing more this device can do */
    }
  }
  deps.broadcast("signed-out");
  return { unsynced: !flushed };
}

export function syncWarning(status: SyncStatus, offlineSince: number | null, pending: number, now: number): boolean {
  if (status === "unauthorized") return true;
  return status === "offline" && pending > 0 && offlineSince !== null && now - offlineSince >= WARN_AFTER_MS;
}
```

In `web/src/components/auth/AccountRuntime.tsx`, replace `SessionSync` with:

```tsx
function SessionSync() {
  const { data } = authClient.useSession();
  const [pendingSignOut, setPendingSignOut] = useState(false);

  // An offline sign-out cleared this device but could not end the session.
  // Finish it before sync starts, or the account's progress would be pulled
  // straight back for whoever uses this device next.
  useEffect(() => {
    if (!data) return;
    let flag: string | null = null;
    try {
      flag = window.localStorage.getItem(SIGNOUT_PENDING_KEY);
    } catch {
      return;
    }
    if (!flag) return;
    setPendingSignOut(true);
    void authClient.signOut().then(() => {
      window.localStorage.removeItem(SIGNOUT_PENDING_KEY);
      window.location.reload();
    });
  }, [data]);

  return data && !pendingSignOut && !hasPendingSignOut() ? <SyncProvider userId={data.user.id} /> : null;
}

function hasPendingSignOut(): boolean {
  try {
    return window.localStorage.getItem(SIGNOUT_PENDING_KEY) !== null;
  } catch {
    return false;
  }
}
```

and add `import { useEffect, useState } from "react";` and `import { SIGNOUT_PENDING_KEY } from "@/lib/auth/signOutDevice";`. (`hasPendingSignOut()` runs during render only on the client: `AccountRuntime` renders nothing on the server because `useSession` has no data there.)

- [ ] **Step 4: Implement the delete dialog**

`web/src/components/auth/DeleteAccountDialog.tsx`:

```tsx
"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";

export function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  return (
    <Dialog open={open} onClose={onClose} label="Delete account">
      <h2 className="font-display text-lg font-bold">Delete your account?</h2>
      <p className="mt-3 text-sm text-muted">
        This permanently erases your account, every lesson and problem you have marked, and all your saved
        sandbox code, on every device. It cannot be undone.
      </p>
      <label htmlFor={inputId} className="mt-4 block text-sm">
        Type <strong>delete</strong> to confirm
      </label>
      <input
        id={inputId}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        className="mt-2 h-10 w-full rounded-[length:var(--radius-md)] border border-border bg-background px-3 text-sm"
      />
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={typed !== "delete" || busy}
          onClick={onConfirm}
          className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-bad-line px-4 text-sm font-semibold text-bad transition hover:bg-bad-surface disabled:opacity-50"
        >
          Delete account
        </button>
      </div>
    </Dialog>
  );
}
```

(`text-bad`, `border-bad-line` and `bg-bad-surface` are defined in `globals.css` at lines 423-433, measured 2026-09-18.)

- [ ] **Step 5: Implement the control and menu**

`web/src/components/auth/AccountControl.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserCircle } from "@phosphor-icons/react";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { NAV_LINK, ROUND_CONTROL } from "@/components/layout/headerChrome";
import { AUTH_CHANNEL } from "@/lib/progress/types";
import { useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";
import { signOutDevice, syncWarning } from "@/lib/auth/signOutDevice";
import type { SyncStatus } from "@/lib/progress/syncQueue";
import { cn } from "@/lib/utils";

const CONTROL_SIZE = "h-11 w-11 md:h-10 md:w-10";

const STATUS_TEXT: Record<SyncStatus, string> = {
  synced: "Synced",
  syncing: "Syncing…",
  offline: "Offline, will retry",
  unauthorized: "Signed out, sign in to keep syncing",
};

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

function useSyncState(runtime: SyncRuntime | null) {
  const read = () => ({
    status: runtime?.queue.status() ?? "synced",
    warn: runtime
      ? syncWarning(runtime.queue.status(), runtime.queue.offlineSince(), runtime.queue.pendingCount(), Date.now())
      : false,
  });
  const [state, setState] = useState(read);
  useEffect(() => {
    if (!runtime) return;
    const update = () => setState(read());
    update();
    const off = runtime.queue.subscribe(update);
    // The 5-minute warning is time-based; nothing else would re-check it.
    const tick = window.setInterval(update, 30_000);
    return () => {
      off();
      window.clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime]);
  return state;
}

export function AccountControl() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SessionControl /> : null;
}

function SessionControl() {
  const { data, isPending } = authClient.useSession();
  const pathname = usePathname();
  if (isPending) return <span data-account-placeholder aria-hidden className={cn("shrink-0", CONTROL_SIZE)} />;
  if (!data) {
    const href = `/sign-in?next=${encodeURIComponent(pathname)}`;
    return (
      <>
        <Link href={href} className={cn(NAV_LINK, "hidden md:inline-flex")}>Sign in</Link>
        <Link href={href} aria-label="Sign in" className={cn(ROUND_CONTROL, CONTROL_SIZE, "md:hidden")}>
          <UserCircle className="h-5 w-5" aria-hidden />
        </Link>
      </>
    );
  }
  return <AccountMenu user={data.user} />;
}

function AccountMenu({ user }: { user: { name: string; email: string; image?: string | null } }) {
  const { runtime } = useSyncBridge();
  const { status, warn } = useSyncState(runtime);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return;
    const r = trigger.current.getBoundingClientRect();
    const el = menu.current;
    el.style.top = `${r.bottom + 8}px`;
    el.style.left = `${Math.max(16, r.right - el.offsetWidth)}px`;
    el.style.visibility = "visible";
    el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (e.target instanceof Node && !menu.current?.contains(e.target) && !trigger.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const finish = (unsynced: boolean) => {
    if (unsynced) {
      // The notice lives in the menu, so keep it open until they read it.
      setNotice("Some recent changes hadn't synced and were not saved.");
      setOpen(true);
    } else window.location.reload();
  };

  const signOut = async (everywhere: boolean) => {
    setBusy(true);
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    const { unsynced } = await signOutDevice({
      queue: runtime?.queue ?? null,
      storage: window.localStorage,
      broadcast: (msg) => channel.postMessage(msg),
      endSession: async () => {
        if (everywhere) await authClient.revokeSessions();
        await authClient.signOut();
      },
    });
    channel.close();
    setBusy(false);
    finish(unsynced);
  };

  const deleteAccount = async () => {
    setBusy(true);
    const res = await fetch("/api/account", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
    if (!res || res.status !== 204) {
      setBusy(false);
      setNotice("Your account could not be deleted. Nothing was erased; try again when you're online.");
      setDeleting(false);
      return;
    }
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    // The server data is gone, so there is nothing to flush.
    await signOutDevice({
      queue: null,
      storage: window.localStorage,
      broadcast: (msg) => channel.postMessage(msg),
      endSession: async () => {
        await authClient.signOut();
      },
    });
    channel.close();
    window.location.reload();
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(at + step + items.length) % items.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const ITEM = "flex min-h-11 w-full items-center px-3 text-left text-sm text-foreground transition-colors hover:bg-surface md:min-h-9";

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu, signed in as ${user.name}`}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(ROUND_CONTROL, CONTROL_SIZE, "relative overflow-visible text-xs font-medium text-foreground")}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- provider avatars come from arbitrary hosts; next/image would need each allowlisted
          <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-surface">{initials(user.name)}</span>
        )}
        {warn ? <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-warn" /> : null}
        {warn ? <span className="sr-only">, sync needs attention</span> : null}
      </button>
      {open
        ? createPortal(
            <div
              ref={menu}
              style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
              className="z-50 w-64 overflow-hidden rounded-[length:var(--radius-md)] border border-border bg-elevated py-1 font-sans shadow-elevation"
            >
              <div className="border-b border-border px-3 pt-2 pb-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <p className={cn("mt-1 text-xs", warn ? "text-warn" : "text-muted")}>{STATUS_TEXT[status]}</p>
              </div>
              {notice ? <p role="alert" className="border-b border-border px-3 py-2 text-xs text-warn">{notice}</p> : null}
              <div role="menu" aria-label="Account" onKeyDown={onMenuKeyDown}>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={ITEM} onClick={() => void signOut(false)}>Sign out</button>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={ITEM} onClick={() => void signOut(true)}>Sign out everywhere</button>
                <a role="menuitem" tabIndex={-1} href="/api/account/export" download className={ITEM}>Download my data</a>
                <button type="button" role="menuitem" tabIndex={-1} disabled={busy} className={cn(ITEM, "text-bad")} onClick={() => { setOpen(false); setDeleting(true); }}>Delete account</button>
              </div>
              {notice?.startsWith("Some recent") ? (
                <div className="border-t border-border px-3 py-2">
                  <button type="button" className="text-sm font-medium underline underline-offset-4" onClick={() => window.location.reload()}>Continue</button>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
      <DeleteAccountDialog open={deleting} busy={busy} onClose={() => setDeleting(false)} onConfirm={() => void deleteAccount()} />
    </>
  );
}
```

`text-warn` / `bg-warn` / `text-bad` are defined in `globals.css` (`--color-warn`, `--color-bad`, lines 423-434).

- [ ] **Step 6: Put it in both headers**

In `web/src/components/layout/Header.tsx` and `web/src/components/landing/LandingHeader.tsx`, import `AccountControl` and render `<AccountControl />` immediately after `<ThemeToggle … />`. `LandingHeader` stays hook-free: it renders the element, it does not call a hook.

- [ ] **Step 7: Run the tests**

Run: `npm test -- tests/signOutDevice.test.ts tests/accountControl.test.tsx tests/appHeader.test.tsx tests/landingHeader.test.tsx tests/appHeaderLampAlign.test.tsx` → all pass. If `landingHeader.test.tsx` counts the header's right-hand children, update its expected list to include the account control and say so in the commit message.

- [ ] **Step 8: Prove it can fail**

In `signOutDevice`, move `clearSyncedData(deps.storage)` inside `if (ended)`: the offline test FAILS (the device keeps the learner's progress). Restore: PASS.

- [ ] **Step 9: Typecheck, lint, commit**

Run: `npx tsc --noEmit && npx eslint src/components/auth src/lib/auth src/components/layout/Header.tsx src/components/landing/LandingHeader.tsx` → clean.

```bash
git add src/lib/auth/signOutDevice.ts src/components/auth src/components/layout/Header.tsx src/components/landing/LandingHeader.tsx tests/signOutDevice.test.ts tests/accountControl.test.tsx
git commit -m "feat(auth): header account control, sign-out that clears the device, account deletion"
```

---

### Task 13: Sign-in page, safe redirects and the hub hint

**Files:**
- Create: `web/src/lib/auth/redirect.ts`, `web/src/app/sign-in/page.tsx`, `web/src/app/sign-in/SignInButtons.tsx`, `web/src/components/auth/SyncHint.tsx`
- Modify: `web/src/app/courses/dsa/page.tsx:77-80` (render `<SyncHint />` after the "modules live" line)
- Test: `web/tests/signIn.test.tsx`

**Interfaces:**
- Consumes: `authClient`, `useSyncBridge` (Task 9); `isAuthConfigured` (Task 2).
- Produces: `DEFAULT_NEXT = "/courses/dsa"`, `safeNext(raw: string | null | undefined): string`; `SignInButtons()`; `SyncHint()`.

- [ ] **Step 1: Write the failing test**

`web/tests/signIn.test.tsx`:

```tsx
// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DEFAULT_NEXT, safeNext } from "@/lib/auth/redirect";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const social = vi.fn(async () => ({}));
let session: { data: { user: { id: string } } | null; isPending: boolean } = { data: null, isPending: false };
let params = new URLSearchParams();
vi.mock("@/lib/auth/client", () => ({
  authClient: { signIn: { social }, useSession: () => session },
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => params }));

const { SignInButtons } = await import("@/app/sign-in/SignInButtons");
const { SyncHint } = await import("@/components/auth/SyncHint");
const { SyncBridgeProvider } = await import("@/components/providers/SyncBridge");

let root: Root | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  social.mockClear();
});

function mount(node: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(node));
  return host;
}

describe("safeNext (spec §5.1)", () => {
  it.each([
    ["/courses/dsa/arrays", "/courses/dsa/arrays"],
    ["/courses/dsa?x=1#y", "/courses/dsa?x=1#y"],
    [null, DEFAULT_NEXT],
    ["", DEFAULT_NEXT],
    ["https://evil.example", DEFAULT_NEXT],
    ["//evil.example", DEFAULT_NEXT],
    ["/\\evil.example", DEFAULT_NEXT],
    ["javascript:alert(1)", DEFAULT_NEXT],
    ["/ok\nSet-Cookie: x", DEFAULT_NEXT],
  ])("%s → %s", (raw, expected) => {
    expect(safeNext(raw)).toBe(expected);
  });
});

describe("SignInButtons", () => {
  it("starts OAuth with the validated return path", async () => {
    params = new URLSearchParams("next=%2Fcourses%2Fdsa%2Farrays");
    const host = mount(<SignInButtons />);
    const github = [...host.querySelectorAll("button")].find((b) => b.textContent?.includes("GitHub"))!;
    await act(async () => github.click());
    expect(social).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: "/courses/dsa/arrays",
      errorCallbackURL: "/sign-in?error=oauth&next=%2Fcourses%2Fdsa%2Farrays",
    });
  });

  it("never forwards a hostile next", async () => {
    params = new URLSearchParams("next=%2F%2Fevil.example");
    const host = mount(<SignInButtons />);
    const google = [...host.querySelectorAll("button")].find((b) => b.textContent?.includes("Google"))!;
    await act(async () => google.click());
    expect(social).toHaveBeenCalledWith(expect.objectContaining({ provider: "google", callbackURL: DEFAULT_NEXT }));
  });

  it("shows an OAuth error with the buttons still usable", () => {
    params = new URLSearchParams("error=oauth");
    const host = mount(<SignInButtons />);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Sign-in didn't complete");
    expect(host.querySelectorAll("button")).toHaveLength(2);
  });
});

describe("SyncHint", () => {
  it("shows only to signed-out visitors where auth is configured", () => {
    session = { data: null, isPending: false };
    expect(mount(<SyncBridgeProvider authEnabled><SyncHint /></SyncBridgeProvider>).textContent)
      .toContain("Progress is saved on this device.");
    act(() => root!.unmount());
    expect(mount(<SyncBridgeProvider authEnabled={false}><SyncHint /></SyncBridgeProvider>).textContent).toBe("");
    act(() => root!.unmount());
    session = { data: { user: { id: "u1" } }, isPending: false };
    expect(mount(<SyncBridgeProvider authEnabled><SyncHint /></SyncBridgeProvider>).textContent).toBe("");
  });
});
```

- [ ] **Step 2: Run it to verify it fails** → FAIL, modules not found.

- [ ] **Step 3: Implement**

`web/src/lib/auth/redirect.ts`:

```ts
export const DEFAULT_NEXT = "/courses/dsa";

/**
 * Only a same-origin path may follow sign-in. `//host` and `/\host` are
 * protocol-relative to browsers, and control characters can split headers,
 * so each is refused rather than repaired.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return DEFAULT_NEXT;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_NEXT;
  // eslint-disable-next-line no-control-regex -- matching control characters is the point
  if (/[\x00-\x1f\x7f]/.test(raw)) return DEFAULT_NEXT;
  return raw;
}
```

`web/src/app/sign-in/SignInButtons.tsx`:

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/redirect";

const PROVIDERS = [
  { id: "github", label: "Continue with GitHub", Icon: GithubLogo },
  { id: "google", label: "Continue with Google", Icon: GoogleLogo },
] as const;

export function SignInButtons() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const failed = params.get("error") !== null;
  const [busy, setBusy] = useState(false);

  const start = async (provider: "github" | "google") => {
    setBusy(true);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: `/sign-in?error=oauth&next=${encodeURIComponent(next)}`,
      });
    } finally {
      // The page navigates away on success; this only matters on failure.
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {failed ? (
        <p role="alert" className="text-sm text-bad">
          Sign-in didn&apos;t complete. You can try again.
        </p>
      ) : null}
      {PROVIDERS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          disabled={busy}
          onClick={() => void start(id)}
          className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium transition hover:bg-surface disabled:opacity-60"
        >
          {/* Monochrome marks: the lamp stays the only non-steel colour in chrome. */}
          <Icon aria-hidden className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  );
}
```

`web/src/app/sign-in/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/auth/env";
import { SignInButtons } from "./SignInButtons";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Static: the query string is read on the client (useSearchParams inside
// Suspense), so this page does not render per request.
export default function SignInPage() {
  const available = isAuthConfigured();
  return (
    <div className="mx-auto flex max-w-md px-4 py-16 lg:py-24">
      <section className="w-full rounded-[length:var(--radius-lg)] border border-border bg-elevated p-8 shadow-elevation">
        <h1 className="font-display text-2xl font-bold tracking-tight">Sign in</h1>
        {available ? (
          <>
            <p className="mt-3 text-sm text-muted">Your progress and code follow you to any device.</p>
            <Suspense fallback={<div className="mt-6 h-[6.25rem]" />}>
              <SignInButtons />
            </Suspense>
            <p className="mt-6 text-xs text-muted">
              We store your name, email, avatar, lesson progress and sandbox code.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Sign-in isn&apos;t available here. Your progress is saved on this device.</p>
        )}
      </section>
    </div>
  );
}
```

`web/src/components/auth/SyncHint.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { authClient } from "@/lib/auth/client";

export function SyncHint() {
  const { authEnabled } = useSyncBridge();
  return authEnabled ? <SignedOutLine /> : null;
}

function SignedOutLine() {
  const { data, isPending } = authClient.useSession();
  if (isPending || data) return null;
  return (
    <p className="mt-2 text-sm text-muted">
      Progress is saved on this device.{" "}
      <Link href="/sign-in?next=%2Fcourses%2Fdsa" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
        Sign in to keep it everywhere.
      </Link>
    </p>
  );
}
```

In `web/src/app/courses/dsa/page.tsx`, import `SyncHint` and render `<SyncHint />` directly after the `<p className="mt-4 text-sm text-muted">…modules live…</p>` paragraph.

- [ ] **Step 4: Run the tests**

Run: `npm test -- tests/signIn.test.tsx tests/seo.test.ts tests/content.test.ts` → all pass. `/sign-in` is `noindex` and not listed in `sitemap.ts`. If a `seo.test.ts` case enumerates page files and demands a sitemap entry for each, add `/sign-in` to that case's not-indexed list with the comment "noindex: an auth page, not content", never to the sitemap.

- [ ] **Step 5: Prove it can fail**

Delete the `raw.startsWith("//")` check: the `//evil.example` case FAILS. Restore: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/redirect.ts src/app/sign-in src/components/auth/SyncHint.tsx src/app/courses/dsa/page.tsx tests/signIn.test.tsx
git commit -m "feat(auth): sign-in page with safe return paths and a signed-out hub hint"
```

---

### Task 14: Test sign-in, two-device browser verification, full checks and the project rule

**Files:**
- Create: `web/src/app/api/test-login/route.ts`, `web/e2e/sync.e2e.mjs`, `web/e2e/test-login-prod.e2e.mjs`
- Modify: `web/package.json` (scripts `e2e:sync`, `e2e:test-login-prod`), `CLAUDE.md` (new §5 bullet), `web/.env.example` (create if absent)
- Test: the two e2e scripts, plus the full suite

**Interfaces:**
- Consumes: `createAuth`, `readAuthEnv` (Task 2); `getDb`, `user` (Task 1); the UI from Tasks 10-13.
- Produces: `POST /api/test-login` with body `{ email: string, name?: string }` → 204 and a session cookie, **only** when `NODE_ENV !== "production"` and `AUTH_TEST_LOGIN === "1"`; otherwise 404.

- [ ] **Step 1: Implement the test-only sign-in**

`web/src/app/api/test-login/route.ts`:

```ts
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
    const parts = [`${c.name}=${c.value}`, `Path=${c.path}`, "SameSite=Lax"];
    if (c.httpOnly) parts.push("HttpOnly");
    if (c.secure) parts.push("Secure");
    if (c.expires) parts.push(`Expires=${new Date(c.expires * 1000).toUTCString()}`);
    res.headers.append("set-cookie", parts.join("; "));
  }
  return res;
}
```

(If `TestCookie.expires` turns out to be milliseconds in 1.7.5, `tsc` will not catch it: check the cookie's expiry in the browser in Step 4 and drop the `* 1000` if it lands in the far future.)

- [ ] **Step 2: Write the production-404 check**

`web/e2e/test-login-prod.e2e.mjs`:

```js
// Builds for production and proves /api/test-login is a 404 there, even with
// the flag set. Run from web/: npm run e2e:test-login-prod
import { spawn, spawnSync } from "node:child_process";

const build = spawnSync("npm", ["run", "build"], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn("npx", ["next", "start", "-p", "3100"], {
  env: { ...process.env, AUTH_TEST_LOGIN: "1" },
  stdio: "inherit",
});
try {
  let res = null;
  for (let i = 0; i < 60 && !res; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    res = await fetch("http://localhost:3100/api/test-login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "prod-check@example.com" }),
    }).catch(() => null);
  }
  if (!res) throw new Error("server never answered");
  if (res.status !== 404) throw new Error(`expected 404 in production, got ${res.status}`);
  console.log("test-login is 404 in a production build ✓");
} finally {
  server.kill();
}
```

- [ ] **Step 3: Write the two-device browser script**

`web/e2e/sync.e2e.mjs`:

```js
// Two browser contexts = two devices, against `npm run dev` on :3000 with
// AUTH_TEST_LOGIN=1 and DATABASE_URL pointing at a Neon DEVELOPMENT branch
// (never production). Run from web/: npm run e2e:sync
import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const LESSON_PATH = "/courses/dsa/arrays";
const PROBLEM = "move-zeroes";
const email = `e2e-${Date.now()}@example.com`;

const browser = await chromium.launch({ channel: "chrome" });
const failures = [];
const check = (name, ok) => {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failures.push(name);
};
const settle = (ms = 3500) => new Promise((r) => setTimeout(r, ms)); // > 2 s mark debounce
const storage = (page) => page.evaluate(() => ({ ...localStorage }));

async function device(signInAs) {
  const context = await browser.newContext();
  if (signInAs) {
    const res = await context.request.post(`${BASE}/api/test-login`, { data: { email: signInAs } });
    if (res.status() !== 204) throw new Error(`test-login ${res.status()}`);
  }
  return context;
}

async function firstLessonHref(page) {
  await page.goto(`${BASE}${LESSON_PATH}`);
  return page.locator('a[href^="/courses/dsa/arrays/"]').first().getAttribute("href");
}

try {
  // 1. A solves/visits; B sees it.
  const a = await device(email);
  const pa = await a.newPage();
  const lesson = await firstLessonHref(pa);
  await pa.goto(`${BASE}${lesson}`);
  await settle();
  const b = await device(email);
  const pb = await b.newPage();
  await pb.goto(`${BASE}/courses/dsa`);
  await settle(1500);
  const lessonId = lesson.replace("/courses/dsa/", "");
  check("a visit on A reaches B", JSON.parse((await storage(pb))["course-progress:dsa"] ?? "[]").includes(lessonId));

  // 2. Concurrent draft edits: the stash row appears and neither version is lost.
  await pa.goto(`${BASE}/courses/dsa/problems/${PROBLEM}`);
  await pb.goto(`${BASE}/courses/dsa/problems/${PROBLEM}`);
  await settle(2000);
  await pa.locator(".cm-content").first().click();
  await pa.keyboard.type("# from A\n");
  await settle(2500);
  await pb.locator(".cm-content").first().click();
  await pb.keyboard.type("# from B\n");
  await settle(2500);
  const row = pb.getByText("A different version of this draft was saved on another device.");
  check("B shows the stash row", await row.isVisible());
  check("B's editor still holds B's code", (await pb.locator(".cm-content").first().innerText()).includes("# from B"));
  await pb.getByRole("button", { name: "Compare" }).click();
  check("Compare shows A's code", (await pb.getByRole("dialog").innerText()).includes("# from A"));
  await pb.keyboard.press("Escape");

  // 3. Merge prompt on an existing account: Don't add.
  const c = await device(null);
  const pc = await c.newPage();
  await pc.goto(`${BASE}/courses/dsa/arrays`);
  await pc.goto(`${BASE}${await firstLessonHref(pc)}`);
  await c.request.post(`${BASE}/api/test-login`, { data: { email } });
  await pc.goto(`${BASE}/courses/dsa`);
  const prompt = pc.getByRole("dialog", { name: "Progress on this device" });
  await prompt.waitFor({ timeout: 10000 });
  check("existing account is asked before merging", await prompt.isVisible());
  await pc.getByRole("button", { name: "Don't add" }).click();
  await settle(1500);
  check("Don't add takes ownership", (await storage(pc))["sync:owner"] !== undefined);

  // 4. Offline edits arrive after reconnecting.
  await b.setOffline(true);
  await pb.locator(".cm-content").first().click();
  await pb.keyboard.type("# offline edit\n");
  await settle(2000);
  await b.setOffline(false);
  await pb.evaluate(() => window.dispatchEvent(new Event("online")));
  await settle(3000);
  await pa.reload();
  await settle(2500);
  check("an offline edit arrives after reconnect", (await pa.locator(".cm-content").first().innerText()).includes("# offline edit"));

  // 5. Sign out clears this device, and another open tab.
  const pa2 = await a.newPage();
  await pa2.goto(`${BASE}/courses/dsa`);
  await pa.getByRole("button", { name: /^Account menu/ }).click();
  const reloaded = pa2.waitForEvent("load", { timeout: 10000 });
  await pa.getByRole("menuitem", { name: "Sign out" }).click();
  await reloaded;
  await settle(1500);
  const left = Object.keys(await storage(pa)).filter((k) => /^(course-|dsa:sandbox:|sync:|dsa-course-)/.test(k));
  check("sign-out leaves no learner data on the device", left.length === 0);
  const left2 = Object.keys(await storage(pa2)).filter((k) => /^(course-|dsa:sandbox:|sync:)/.test(k));
  check("the other tab reloaded without the learner's data", left2.length === 0);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`${failures.length} check(s) failed`);
  process.exit(1);
}
```

Add to `web/package.json` scripts:

```json
"e2e:sync": "node e2e/sync.e2e.mjs",
"e2e:test-login-prod": "node e2e/test-login-prod.e2e.mjs"
```

- [ ] **Step 4: Run the browser verification**

Prerequisites (owner): a Neon **development** branch URL; any placeholder values for the four OAuth variables (test sign-in does not use them); `BETTER_AUTH_SECRET` from `openssl rand -base64 32`; `BETTER_AUTH_URL=http://localhost:3000`. Put them in `web/.env.local` (git-ignored) plus `AUTH_TEST_LOGIN=1`. Document every variable, without values, in `web/.env.example`:

```bash
# Accounts (spec 2026-09-18). All seven must be set or sign-in stays off.
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Development only: enables POST /api/test-login for browser tests. 404 in production builds.
AUTH_TEST_LOGIN=
```

Then:

```bash
DATABASE_URL=<dev branch url> npm run db:migrate
```

Start the dev server with the preview tool (`preview_start` for the project's dev configuration), then run `npm run e2e:sync`.
Expected: every line `✓`, exit 0. Then `npm run e2e:test-login-prod` → "test-login is 404 in a production build ✓".

Prove the e2e can fail: comment out `clearSyncedData(deps.storage);` in `signOutDevice`, rerun `npm run e2e:sync`: "sign-out leaves no learner data" is `✗`. Restore.

In the browser pane, also check by hand and take screenshots for the report:
- the header control signed out / signed in, in light and dark themes, and at mobile width (375 px): no horizontal scroll, the avatar has room
- keyboard only: Tab to the avatar, Enter opens the menu, arrows move, Escape returns focus to the avatar; the delete dialog traps focus and Escape closes it
- `/sign-in` in both themes, and with `?error=oauth`
- the stash row and Compare dialog in both themes
- with auth unconfigured (unset `DATABASE_URL`, restart): no Sign in control, `/sign-in` says it is unavailable, lessons work exactly as before

Then the real providers, by hand: create development OAuth apps (GitHub: callback `http://localhost:3000/api/auth/callback/github`; Google: `http://localhost:3000/api/auth/callback/google`), put their ids in `.env.local`, restart, and sign in with each. Sign in with GitHub, sign out, sign in with Google using the same verified email: it must be the same account (progress present). The report must say these checks were manual.

- [ ] **Step 5: Full checks**

```bash
npx tsc --noEmit
npx eslint
npm test
npm run build 2>&1 | tee "$TMPDIR/build-after.txt"
```

Expected: all clean. Compare the route tables in `build-before.txt` and `build-after.txt`: every pre-existing route keeps its symbol; the only new routes are `/sign-in` (static `○`) and the `ƒ` API routes (`/api/auth/[...all]`, `/api/progress`, `/api/progress/drafts/[sandboxId]`, `/api/account`, `/api/account/export`, `/api/test-login`). Any lesson or module route that turned `ƒ` is a defect: find the server-side session or `searchParams` read that caused it and remove it.

Check the signed-out bundle: in `.next/static/chunks`, `grep -l "resolveOnMount" -r .next/static/chunks | head` must list only chunks that are not in any page's initial load (they belong to the `SyncProvider` dynamic import). Record the size of `lib/auth/client` in the shared chunk as reported by the build in the final report.

- [ ] **Step 6: Record the project rule**

Add this bullet to `CLAUDE.md` §5 (Code standards), after the "Registry-addressed content" bullet:

```markdown
- **Accounts are optional and progress is local-first** (spec
  `docs/superpowers/specs/2026-09-18-accounts-and-progress-sync-design.md`).
  Signed out, the app is exactly the localStorage app; `SyncBridge` is the
  only seam, and the signed-in runtime (`SyncProvider`) is a dynamic chunk.
  Pages never read the session on the server — a lesson that turns dynamic is
  a defect. The API takes the user id only from the session, read with the
  cookie cache disabled so revocation stops writes at once. Marks are an
  insert-only set; drafts carry a server `rev` and the client never
  overwrites or drops code on a conflict — it stashes. Sign-out clears every
  synced key, including the legacy `dsa-course-*` keys, or the migration
  revives them. Only visited, solved and problem-sandbox drafts sync; adding
  a kind means a merge rule and tests first. Merge rules live in the pure
  `lib/progress/merge.ts`; SQL guarantees are tested on PGlite with the real
  migrations. Guarded in `progressMerge`, `progressStore`, `progressApi`,
  `syncQueue`, `signInFlow` and `progressLocalStore` tests, and
  `e2e/sync.e2e.mjs`.
```

Also add `web/drizzle/` to the repo map table: `| web/drizzle/ | Generated Postgres migrations (drizzle-kit); applied by `npm run db:migrate` as a deploy step, never at request time |`.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/test-login e2e package.json .env.example
git add ../CLAUDE.md
git commit -m "test(sync): two-device browser verification and a production check on test sign-in"
```

`CLAUDE.md` has unrelated uncommitted edits in the working tree. Stage only this task's hunks with `git add -p ../CLAUDE.md`, or ask the owner first if the hunks cannot be separated.

- [ ] **Step 8: Report**

Report, per CLAUDE.md §6: what ran and passed (with the commands), what was checked by hand (real OAuth, themes, keyboard, mobile), the route-table comparison, the signed-out bundle cost, and what remains for the owner:
1. Neon production database; production GitHub and Google OAuth apps with the production callback URLs; the seven variables in Vercel (a **redeploy** is needed after setting them, because `authEnabled` is read when pages are statically rendered).
2. `npm run db:migrate` against production as a deploy step.
3. The privacy policy page, which gates enabling sign-in in production (spec §11).

---

## Spec coverage

| Spec section | Task |
| --- | --- |
| §3 architecture, units | 1, 2, 4, 5, 7, 9, 10 |
| §4 data model (set, revs, tombstones, cascade) | 1, 4 |
| §5.1 sign-in, safe `next`, OAuth error | 13 |
| §5.2 verified-email linking | 2 (no `trustedProviders`); 14 manual check |
| §5.3 sessions, static pages | 2, 9, 14 (route table) |
| §5.4 sign-out sequence, legacy keys, other tabs | 6, 10, 12 |
| §5.5 account menu, export, delete | 5, 12 |
| §5.6 not configured → anonymous, 503 | 2, 5, 9, 13 |
| §6.1 marks pull/push, keepalive | 7, 8, 9, 10 |
| §6.2 lazy draft pull, base-rev push, `:at` | 4, 6, 7, 11 |
| §6.3 conflicts and stash, Use/Compare/Dismiss | 3, 7, 11 |
| §6.4 offline, 401, 400, warn dot | 7, 12 |
| §6.5 validation, isolation, rate limit, same-origin | 4, 5 |
| §7 owner cases, merge flow, commit marker, legacy drafts | 3, 8, 10 |
| §8 UI | 10, 11, 12, 13 |
| §9 performance | 9, 10, 14 |
| §10 testing | every task; 14 |
| §11 rollout | 14 |

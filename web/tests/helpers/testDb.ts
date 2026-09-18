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

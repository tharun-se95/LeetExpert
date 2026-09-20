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

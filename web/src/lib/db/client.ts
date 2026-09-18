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

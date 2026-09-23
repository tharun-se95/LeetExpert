import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type * as schema from "./schema";

/** Neon in production, PGlite in tests: both are Postgres dialect databases. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

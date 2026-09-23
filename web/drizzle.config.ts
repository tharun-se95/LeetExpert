import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Only `migrate` connects; `generate` works from the schema alone.
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});

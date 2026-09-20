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

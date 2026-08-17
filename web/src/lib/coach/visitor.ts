import { createHash, randomUUID } from "node:crypto";

export const VISITOR_COOKIE = "dsa-coach-id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function newVisitorId(): string {
  return randomUUID();
}

export function visitorCookieHeader(id: string, secure: boolean): string {
  const parts = [
    `${VISITOR_COOKIE}=${id}`,
    "Path=/",
    `Max-Age=${ONE_YEAR}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readVisitorId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === VISITOR_COOKIE && rest.length > 0) {
      const value = rest.join("=").trim();
      return value || null;
    }
  }
  return null;
}

/** Stable hash if a raw id ever needs to be logged — never log the cookie. */
export function hashVisitorId(id: string): string {
  return createHash("sha256").update(id).digest("hex").slice(0, 16);
}

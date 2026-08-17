import { describe, it, expect } from "vitest";
import { MemoryQuota } from "../src/lib/coach/quota";

describe("MemoryQuota", () => {
  it("allows turns until the daily cap, then refuses", async () => {
    const quota = new MemoryQuota(2, () => new Date("2026-08-16T12:00:00Z"));
    const first = await quota.consume("v1");
    expect(first).toEqual({
      allowed: true,
      remaining: 1,
      resetAt: "2026-08-17T00:00:00.000Z",
    });
    const second = await quota.consume("v1");
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    const third = await quota.consume("v1");
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.resetAt).toBe("2026-08-17T00:00:00.000Z");
  });

  it("resets when the UTC day key changes", async () => {
    let now = new Date("2026-08-16T23:00:00Z");
    const quota = new MemoryQuota(1, () => now);
    expect((await quota.consume("v1")).allowed).toBe(true);
    expect((await quota.consume("v1")).allowed).toBe(false);
    now = new Date("2026-08-17T00:00:01Z");
    const next = await quota.consume("v1");
    expect(next.allowed).toBe(true);
    expect(next.remaining).toBe(0);
    expect(next.resetAt).toBe("2026-08-18T00:00:00.000Z");
  });

  it("tracks visitors separately", async () => {
    const quota = new MemoryQuota(1, () => new Date("2026-08-16T12:00:00Z"));
    expect((await quota.consume("a")).allowed).toBe(true);
    expect((await quota.consume("b")).allowed).toBe(true);
    expect((await quota.consume("a")).allowed).toBe(false);
  });
});

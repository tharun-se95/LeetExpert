import type { CoachQuotaResult } from "./types";

export const DEFAULT_DAILY_CAP = 40;

export interface CoachQuota {
  consume(visitorId: string): Promise<CoachQuotaResult>;
  peek(visitorId: string): Promise<CoachQuotaResult>;
}

export function utcDayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function utcNextMidnight(now: Date): string {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.toISOString();
}

export class MemoryQuota implements CoachQuota {
  private readonly counts = new Map<string, number>();

  constructor(
    private readonly cap: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async peek(visitorId: string): Promise<CoachQuotaResult> {
    const now = this.now();
    const key = `${utcDayKey(now)}:${visitorId}`;
    const used = this.counts.get(key) ?? 0;
    const resetAt = utcNextMidnight(now);
    if (used >= this.cap) return { allowed: false, remaining: 0, resetAt };
    return { allowed: true, remaining: this.cap - used, resetAt };
  }

  async consume(visitorId: string): Promise<CoachQuotaResult> {
    const now = this.now();
    const key = `${utcDayKey(now)}:${visitorId}`;
    const used = this.counts.get(key) ?? 0;
    const resetAt = utcNextMidnight(now);
    if (used >= this.cap) {
      return { allowed: false, remaining: 0, resetAt };
    }
    this.counts.set(key, used + 1);
    return { allowed: true, remaining: this.cap - used - 1, resetAt };
  }
}

export class RedisQuota implements CoachQuota {
  constructor(
    private readonly redis: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<unknown>;
      get?: (key: string) => Promise<unknown>;
    },
    private readonly cap: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async peek(visitorId: string): Promise<CoachQuotaResult> {
    const now = this.now();
    const key = `coach:${utcDayKey(now)}:${visitorId}`;
    const raw = await this.redis.get?.(key);
    const used = typeof raw === "number" ? raw : Number(raw ?? 0);
    const resetAt = utcNextMidnight(now);
    if (used >= this.cap) return { allowed: false, remaining: 0, resetAt };
    return { allowed: true, remaining: this.cap - used, resetAt };
  }

  async consume(visitorId: string): Promise<CoachQuotaResult> {
    const now = this.now();
    const key = `coach:${utcDayKey(now)}:${visitorId}`;
    const used = await this.redis.incr(key);
    if (used === 1) {
      const reset = new Date(utcNextMidnight(now));
      const ttl = Math.max(60, Math.ceil((reset.getTime() - now.getTime()) / 1000));
      await this.redis.expire(key, ttl);
    }
    const resetAt = utcNextMidnight(now);
    if (used > this.cap) {
      return { allowed: false, remaining: 0, resetAt };
    }
    return { allowed: true, remaining: this.cap - used, resetAt };
  }
}

export function dailyCap(): number {
  const raw = process.env.COACH_DAILY_CAP;
  const n = raw ? Number(raw) : DEFAULT_DAILY_CAP;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_CAP;
}

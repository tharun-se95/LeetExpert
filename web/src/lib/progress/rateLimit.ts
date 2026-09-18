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

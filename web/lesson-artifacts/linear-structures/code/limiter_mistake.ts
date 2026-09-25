class RecentCalls {
  q: number[] = []; start = 0;
  constructor(public window = 3000) {}

  ping(t: number): number {
    this.q.push(t);
    while (this.q[this.start] <= t - this.window) this.start++; // also drops the call exactly 3000 ms old
    return this.q.length - this.start;
  }
}

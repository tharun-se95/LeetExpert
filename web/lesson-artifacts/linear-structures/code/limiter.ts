class RecentCalls {
  q: number[] = []; start = 0; // a queue: front at q[start]
  constructor(public window = 3000) {}

  ping(t: number): number {
    this.q.push(t);
    while (this.q[this.start] < t - this.window) this.start++; // older than the window: gone
    return this.q.length - this.start; // calls in [t - window, t]
  }
}

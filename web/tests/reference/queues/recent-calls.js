class RecentCounter {
  constructor() {
    this.q = [];
    this.head = 0;
  }

  ping(t) {
    this.q.push(t);
    while (this.q[this.head] < t - 3000) this.head++;
    return this.q.length - this.head;
  }
}

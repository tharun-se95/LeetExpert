class FirstUnique {
  constructor() {
    this.count = new Map();
    this.q = [];
    this.head = 0;
  }

  add(ch) {
    this.count.set(ch, (this.count.get(ch) || 0) + 1);
    this.q.push(ch);
    while (this.head < this.q.length && this.count.get(this.q[this.head]) > 1) {
      this.head++;
    }
    return this.head < this.q.length ? this.q[this.head] : "#";
  }
}

class MinStack {
  constructor() { this.s = []; this.m = []; }
  push(val) { this.s.push(val); this.m.push(this.m.length ? Math.min(val, this.m[this.m.length - 1]) : val); }
  pop() { this.m.pop(); return this.s.pop(); }
  top() { return this.s[this.s.length - 1]; }
  getMin() { return this.m[this.m.length - 1]; }
}

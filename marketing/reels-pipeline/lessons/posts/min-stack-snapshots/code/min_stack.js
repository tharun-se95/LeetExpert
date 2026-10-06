class OneMin {
  stack = [];
  min = null;

  push(val) {
    this.stack.push(val);
    if (this.min === null || val < this.min) this.min = val;
  }

  pop() {
    this.stack.pop();
  }

  getMin() {
    return this.min;
  }
}

class ScanMin extends OneMin {
  getMin() {
    return Math.min(...this.stack);
  }
}

class MinStack {
  stack = [];
  mins = [];

  push(val) {
    this.stack.push(val);
    const currentMin =
      this.mins.length > 0 ? Math.min(val, this.mins[this.mins.length - 1]) : val;
    this.mins.push(currentMin);
  }

  pop() {
    this.stack.pop();
    this.mins.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.mins[this.mins.length - 1];
  }
}

module.exports = { OneMin, ScanMin, MinStack };

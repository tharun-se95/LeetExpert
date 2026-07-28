class MyQueue {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }

  pour() {
    if (this.outbox.length === 0) {
      while (this.inbox.length > 0) this.outbox.push(this.inbox.pop());
    }
  }

  push(x) {
    this.inbox.push(x);
  }

  pop() {
    this.pour();
    return this.outbox.pop();
  }

  peek() {
    this.pour();
    return this.outbox[this.outbox.length - 1];
  }

  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}

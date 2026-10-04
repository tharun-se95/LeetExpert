function dequeueShift(items) {
  const front = items[0];
  for (let j = 1; j < items.length; j++) items[j - 1] = items[j];
  items.pop();
  return front;
}

class HeadQueue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(x) {
    this.items.push(x);
  }

  dequeue() {
    const x = this.items[this.head];
    this.head++;
    return x;
  }
}

module.exports = { dequeueShift, HeadQueue };

class MedianFinder {
  constructor() {
    this.values = [];
  }

  addNum(num) {
    this.values.push(num);
    this.values.sort((a, b) => a - b);
  }

  findMedian() {
    const n = this.values.length;
    const mid = Math.floor(n / 2);
    if (n % 2 === 1) return this.values[mid];
    return (this.values[mid - 1] + this.values[mid]) / 2;
  }
}

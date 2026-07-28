class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.values = [...nums].sort((a, b) => a - b);
  }

  add(val) {
    this.values.push(val);
    this.values.sort((a, b) => a - b);
    return this.values[this.values.length - this.k];
  }
}

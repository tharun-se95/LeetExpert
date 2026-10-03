class DynamicArray {
  constructor() {
    this.capacity = 1;
    this.length = 0;
    this.store = new Array(this.capacity);
  }

  append(value) {
    if (this.length === this.capacity) this.grow();
    this.store[this.length] = value;
    this.length++;
  }

  grow() {
    this.capacity *= 2;
    const next = new Array(this.capacity);
    for (let j = 0; j < this.length; j++) next[j] = this.store[j];
    this.store = next;
  }
}

module.exports = { DynamicArray };

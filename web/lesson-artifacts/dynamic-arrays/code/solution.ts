class DynamicArray<T> {
  protected capacity = 1;
  protected length_ = 0;
  protected store: (T | undefined)[] = new Array(1); // simulated raw array
  copies = 0; // elements copied by growth, so the cost can be read

  get length(): number {
    return this.length_;
  }

  get(i: number): T {
    if (i < 0 || i >= this.length_) throw new RangeError(`index ${i}`);
    return this.store[i] as T; // O(1): address arithmetic
  }

  set(i: number, value: T): void {
    if (i < 0 || i >= this.length_) throw new RangeError(`index ${i}`);
    this.store[i] = value; // O(1)
  }

  append(value: T): void {
    if (this.length_ === this.capacity) this.grow(); // O(n), but rare
    this.store[this.length_] = value; // O(1)
    this.length_++;
  }

  pop(): T {
    if (this.length_ === 0) throw new RangeError("pop from empty array");
    this.length_--;
    const value = this.store[this.length_] as T;
    this.store[this.length_] = undefined; // release the reference
    return value; // O(1): nothing shifts at the end
  }

  insert(i: number, value: T): void {
    if (i < 0 || i > this.length_) throw new RangeError(`index ${i}`);
    if (this.length_ === this.capacity) this.grow();
    for (let j = this.length_; j > i; j--) this.store[j] = this.store[j - 1]; // shift right: O(n - i)
    this.store[i] = value;
    this.length_++;
  }

  protected grow(): void {
    this.capacity *= 2; // multiplicative: load-bearing
    const next: (T | undefined)[] = new Array(this.capacity);
    for (let j = 0; j < this.length_; j++) { // copy: O(n)
      next[j] = this.store[j];
      this.copies++;
    }
    this.store = next;
  }
}

class AdditiveArray<T> extends DynamicArray<T> {
  protected grow(): void {
    this.capacity += 8; // a fixed step instead of a factor
    const next: (T | undefined)[] = new Array(this.capacity);
    for (let j = 0; j < this.length_; j++) {
      next[j] = this.store[j];
      this.copies++;
    }
    this.store = next;
  }
}

export class DynArrayFixed<T> {
  capacity: number;
  size: number;
  data: (T | null)[];
  copies: number;
  totalCopies: number;

  constructor(initialCapacity = 1) {
    this.capacity = Math.max(1, initialCapacity);
    this.size = 0;
    this.data = new Array(this.capacity).fill(null);
    this.copies = 0;
    this.totalCopies = 0;
  }

  append(val: T): number {
    let copies = 0;
    if (this.size === this.capacity) {
      // Mistake: grows by fixed constant (+1) instead of doubling
      const newCapacity = this.capacity + 1;
      const newData: (T | null)[] = new Array(newCapacity).fill(null);
      for (let i = 0; i < this.size; i++) {
        newData[i] = this.data[i];
      }
      copies = this.size;
      this.totalCopies += copies;
      this.data = newData;
      this.capacity = newCapacity;
    }
    this.copies = copies;
    this.data[this.size] = val;
    this.size++;
    return copies;
  }

  get(index: number): T {
    if (index < 0 || index >= this.size) {
      throw new Error("Index out of bounds");
    }
    return this.data[index] as T;
  }
}

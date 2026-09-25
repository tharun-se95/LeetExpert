class Ring<T> {
  buf: (T | null)[]; head = 0; size = 0;
  constructor(cap: number) { this.buf = new Array(cap).fill(null); }

  push(x: T): boolean { // false when full: the packet is dropped
    if (this.size === this.buf.length) return false;
    this.buf[(this.head + this.size) % this.buf.length] = x; // wrap past the end
    this.size++;
    return true;
  }

  pop(): T {
    const x = this.buf[this.head] as T;
    this.head = (this.head + 1) % this.buf.length;
    this.size--;
    return x;
  }
}

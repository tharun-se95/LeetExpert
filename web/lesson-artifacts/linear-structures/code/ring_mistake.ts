class RingMistake<T> extends Ring<T> {
  pop(): T {
    const x = this.buf[this.head] as T;
    this.head++; // never wraps: runs off the end
    this.size--;
    return x;
  }
}

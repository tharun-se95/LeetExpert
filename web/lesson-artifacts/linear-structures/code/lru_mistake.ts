class LRUMistake extends LRU {
  use(key: string): boolean {
    const hit = this.map.get(key);
    if (hit) { this.toFront(hit); return true; } // relinked without unlinking first
    return super.use(key);
  }
}

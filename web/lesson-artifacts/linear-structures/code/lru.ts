class LRU {
  // most recent at the front; a map finds a node, the list orders them
  map = new Map<string, LNode>();
  head = new LNode(null); // sentinels: no empty-list branches
  tail = new LNode(null);
  constructor(public cap: number) { this.head.next = this.tail; this.tail.prev = this.head; }

  protected unlink(n: LNode): void { n.prev!.next = n.next; n.next!.prev = n.prev; }
  protected toFront(n: LNode): void {
    n.prev = this.head; n.next = this.head.next;
    this.head.next!.prev = n; this.head.next = n;
  }

  use(key: string): boolean { // true on a hit
    const hit = this.map.get(key);
    if (hit) { this.unlink(hit); this.toFront(hit); return true; }
    if (this.map.size === this.cap) { // full: evict the least recent
      const old = this.tail.prev!;
      this.unlink(old); this.map.delete(old.key!);
    }
    const n = new LNode(key);
    this.map.set(key, n); this.toFront(n);
    return false;
  }

  order(): string[] {
    const out: string[] = [];
    for (let n = this.head.next!; n !== this.tail; n = n.next!) out.push(n.key!);
    return out;
  }
}

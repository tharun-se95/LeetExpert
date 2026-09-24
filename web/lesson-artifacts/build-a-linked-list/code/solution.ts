class ListNode<T> {
  constructor(
    public value: T,
    public next: ListNode<T> | null = null,
  ) {}
}

class LinkedList<T> {
  head: ListNode<T> | null = null; // first node, or null when empty
  tail: ListNode<T> | null = null; // last node, kept so pushBack is O(1)
  size = 0;

  pushFront(value: T): void {
    this.head = new ListNode(value, this.head);
    if (this.tail === null) this.tail = this.head; // the list was empty
    this.size++;
  }

  pushBack(value: T): void {
    const node = new ListNode(value);
    if (this.tail === null) {
      this.head = this.tail = node; // the list was empty
    } else {
      this.tail.next = node; // the old tail links on
      this.tail = node;
    }
    this.size++;
  }

  find(value: T): ListNode<T> | null {
    let curr = this.head;
    while (curr !== null) {
      if (curr.value === value) return curr;
      curr = curr.next;
    }
    return null;
  }

  delete(value: T): boolean {
    let prev: ListNode<T> | null = null;
    let curr = this.head;
    while (curr !== null) {
      if (curr.value === value) {
        if (prev === null) this.head = curr.next; // deleting the head
        else prev.next = curr.next; // splice curr out
        if (curr === this.tail) this.tail = prev; // deleting the tail
        this.size--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }

  toArray(): T[] {
    const out: T[] = [];
    for (let curr = this.head; curr !== null; curr = curr.next) out.push(curr.value);
    return out;
  }
}

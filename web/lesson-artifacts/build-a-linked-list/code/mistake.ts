class LeakyList<T> extends LinkedList<T> {
  delete(value: T): boolean {
    let prev: ListNode<T> | null = null;
    let curr = this.head;
    while (curr !== null) {
      if (curr.value === value) {
        if (prev === null) this.head = curr.next;
        else prev.next = curr.next;
        // missing: if (curr === this.tail) this.tail = prev;
        this.size--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }
}

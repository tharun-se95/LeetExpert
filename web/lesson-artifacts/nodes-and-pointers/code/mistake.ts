function insertAfterSwapped<T>(node: ListNode<T>, value: T): ListNode<T> {
  const created = new ListNode(value);
  node.next = created;      // node points at the new node first...
  created.next = node.next; // ...so this reads the new node: it points at itself
  return created;
}

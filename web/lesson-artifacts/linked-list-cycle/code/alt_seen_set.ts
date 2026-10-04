function hasCycle(head: ListNode | null): boolean {
  const seen = new Set<ListNode>(); // one entry per node visited: O(n) memory
  for (let node = head; node !== null; node = node.next) {
    if (seen.has(node)) return true; // a node met twice: the walk came back
    seen.add(node);
  }
  return false;
}

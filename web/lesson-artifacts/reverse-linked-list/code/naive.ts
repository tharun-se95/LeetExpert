function reverseList(head: ListNode | null): ListNode | null {
  const nodes: ListNode[] = [];
  for (let c = head; c !== null; c = c.next) nodes.push(c); // O(n) extra memory
  for (let i = nodes.length - 1; i > 0; i--) nodes[i].next = nodes[i - 1]; // relink from the back
  if (nodes.length === 0) return null;
  nodes[0].next = null; // the old head is the new tail
  return nodes[nodes.length - 1];
}

function middleNode(head: ListNode | null): ListNode | null {
  let n = 0;
  for (let node = head; node !== null; node = node.next) n++; // pass 1: count the nodes
  let node = head;
  for (let i = 0; i < Math.floor(n / 2); i++) node = node!.next; // pass 2: walk to index n / 2
  return node;
}

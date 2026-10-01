function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    const nxt: ListNode | null = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return curr; // the loop only ends when curr is null
}

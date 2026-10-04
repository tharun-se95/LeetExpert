function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null; // reversed part: empty
  let curr = head;                  // untouched part: everything
  while (curr !== null) {
    const nxt: ListNode | null = curr.next; // 1) save the lifeline
    curr.next = prev;                       // 2) the flip
    prev = curr;                            // 3) march
    curr = nxt;
  }
  return prev; // curr is null; prev heads it all
}

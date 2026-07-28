function mergeKLists(lists) {
  // Small inputs here: re-selecting the minimum head each step is the same
  // choice a heap makes, without a heap implementation in the way.
  const heads = lists.filter((h) => h !== null);
  const dummy = new ListNode(0);
  let tail = dummy;
  while (heads.length > 0) {
    let best = 0;
    for (let i = 1; i < heads.length; i++) {
      if (heads[i].val < heads[best].val) best = i;
    }
    const node = heads[best];
    tail.next = node;
    tail = node;
    if (node.next !== null) heads[best] = node.next;
    else heads.splice(best, 1);
  }
  tail.next = null;
  return dummy.next;
}

function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  if (list1 === null) return list2; // without a dummy, the empty cases
  if (list2 === null) return list1;
  let head: ListNode;
  if (list1.val <= list2.val) { head = list1; list1 = list1.next; } // and the first node are special
  else { head = list2; list2 = list2.next; }
  let tail = head;
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
    else { tail.next = list2; list2 = list2.next; }
    tail = tail.next;
  }
  tail.next = list1 !== null ? list1 : list2;
  return head;
}

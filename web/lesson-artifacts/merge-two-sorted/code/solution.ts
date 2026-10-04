function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy; // last node of the merged part
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) { // <= takes ties from list1: stable
      tail.next = list1;          // splice the existing node
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 !== null ? list1 : list2; // attach what is left
  return dummy.next;
}

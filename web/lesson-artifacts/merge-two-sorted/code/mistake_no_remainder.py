def merge_two_lists(list1, list2):
    dummy = ListNode(0)
    tail = dummy
    while list1 is not None and list2 is not None:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    return dummy.next                     # the leftover list is never attached

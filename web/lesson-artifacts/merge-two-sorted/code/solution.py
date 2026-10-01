def merge_two_lists(list1, list2):
    dummy = ListNode(0)
    tail = dummy                          # last node of the merged part
    while list1 is not None and list2 is not None:
        if list1.val <= list2.val:        # <= takes ties from list1: stable
            tail.next = list1             # splice the existing node
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 is not None else list2  # attach what is left
    return dummy.next

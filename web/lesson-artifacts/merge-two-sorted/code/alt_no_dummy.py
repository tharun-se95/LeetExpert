def merge_two_lists(list1, list2):
    if list1 is None:                     # without a dummy, the empty cases
        return list2
    if list2 is None:
        return list1
    if list1.val <= list2.val:            # and the first node are special
        head, list1 = list1, list1.next
    else:
        head, list2 = list2, list2.next
    tail = head
    while list1 is not None and list2 is not None:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 if list1 is not None else list2
    return head

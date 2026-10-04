def delete_all(head, target):
    dummy = Node(None, head)
    prev = dummy
    while prev.next is not None:
        if prev.next.value == target:
            prev.next = prev.next.next
        prev = prev.next              # advances even after a splice
    return dummy.next

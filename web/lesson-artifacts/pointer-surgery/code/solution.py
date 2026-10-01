class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def delete_all(head, target):
    dummy = Node(None, head)          # a predecessor for the head
    prev = dummy
    while prev.next is not None:      # stand on prev, inspect prev.next
        if prev.next.value == target:
            prev.next = prev.next.next    # splice it out, and stay: prev.next is new
        else:
            prev = prev.next
    return dummy.next                 # the head, whatever it now is

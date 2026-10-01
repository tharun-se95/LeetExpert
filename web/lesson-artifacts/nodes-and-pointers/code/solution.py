class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next          # where the next node lives, or None


def get(head, i):
    node = head
    for _ in range(i):            # no address arithmetic: follow i links
        node = node.next
    return node


def insert_after(node, value):
    new = Node(value)
    new.next = node.next          # 1) point the new node where node pointed
    node.next = new               # 2) then point node at it
    return new

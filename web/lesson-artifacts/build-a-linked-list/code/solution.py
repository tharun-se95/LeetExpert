class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None      # first node, or None when empty
        self.tail = None      # last node, kept so push_back is O(1)
        self.size = 0

    def push_front(self, value):
        self.head = Node(value, next=self.head)
        if self.tail is None:             # the list was empty
            self.tail = self.head
        self.size += 1

    def push_back(self, value):
        node = Node(value)
        if self.tail is None:             # the list was empty
            self.head = self.tail = node
        else:
            self.tail.next = node         # the old tail links on
            self.tail = node
        self.size += 1

    def find(self, value):
        curr = self.head
        while curr is not None:
            if curr.value == value:
                return curr
            curr = curr.next
        return None

    def delete(self, value):
        prev, curr = None, self.head
        while curr is not None:
            if curr.value == value:
                if prev is None:          # deleting the head
                    self.head = curr.next
                else:
                    prev.next = curr.next # splice curr out
                if curr is self.tail:     # deleting the tail
                    self.tail = prev
                self.size -= 1
                return True
            prev, curr = curr, curr.next
        return False

    def to_list(self):
        out, curr = [], self.head
        while curr is not None:
            out.append(curr.value)
            curr = curr.next
        return out

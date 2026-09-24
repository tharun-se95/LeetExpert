class LeakyList(LinkedList):
    def delete(self, value):
        prev, curr = None, self.head
        while curr is not None:
            if curr.value == value:
                if prev is None:
                    self.head = curr.next
                else:
                    prev.next = curr.next
                # missing: if curr is self.tail: self.tail = prev
                self.size -= 1
                return True
            prev, curr = curr, curr.next
        return False

class LRU:
    """Most recent at the front; a dict finds a node, the list orders them."""
    def __init__(self, cap):
        self.cap, self.map = cap, {}
        self.head = Node(None)                  # sentinels: no empty-list branches
        self.tail = Node(None)
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, n):
        n.prev.next, n.next.prev = n.next, n.prev

    def _to_front(self, n):
        n.prev, n.next = self.head, self.head.next
        self.head.next.prev = n
        self.head.next = n

    def use(self, key):                         # True on a hit
        if key in self.map:
            n = self.map[key]
            self._unlink(n)
            self._to_front(n)
            return True
        if len(self.map) == self.cap:           # full: evict the least recent
            old = self.tail.prev
            self._unlink(old)
            del self.map[old.key]
        n = Node(key)
        self.map[key] = n
        self._to_front(n)
        return False

    def order(self):
        out, n = [], self.head.next
        while n is not self.tail:
            out.append(n.key)
            n = n.next
        return out

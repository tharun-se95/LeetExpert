from collections import deque

class FirstUnique:
    def __init__(self):
        self.count = {}
        self.q = deque()

    def add(self, ch):
        self.count[ch] = self.count.get(ch, 0) + 1
        self.q.append(ch)
        while self.q and self.count[self.q[0]] > 1:
            self.q.popleft()
        return self.q[0] if self.q else "#"

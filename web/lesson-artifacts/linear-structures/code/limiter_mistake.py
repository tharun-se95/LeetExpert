from collections import deque

class RecentCalls:
    def __init__(self, window=3000):
        self.window, self.q = window, deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] <= t - self.window:     # also drops the call exactly 3000 ms old
            self.q.popleft()
        return len(self.q)

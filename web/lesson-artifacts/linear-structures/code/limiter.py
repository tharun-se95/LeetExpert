from collections import deque

class RecentCalls:
    def __init__(self, window=3000):
        self.window, self.q = window, deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:      # older than the window: gone for good
            self.q.popleft()
        return len(self.q)                      # calls in [t - window, t]

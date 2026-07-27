class MinStack:
    def __init__(self):
        self.s = []
        self.m = []

    def push(self, val):
        self.s.append(val)
        self.m.append(val if not self.m else min(val, self.m[-1]))

    def pop(self):
        self.m.pop()
        return self.s.pop()

    def top(self):
        return self.s[-1]

    def get_min(self):
        return self.m[-1]

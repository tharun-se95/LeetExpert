class Ring:
    def __init__(self, cap):
        self.buf, self.head, self.size = [None] * cap, 0, 0

    def push(self, x):                         # False when full: the packet is dropped
        if self.size == len(self.buf):
            return False
        self.buf[(self.head + self.size) % len(self.buf)] = x   # wrap past the end
        self.size += 1
        return True

    def pop(self):
        x = self.buf[self.head]
        self.head = (self.head + 1) % len(self.buf)
        self.size -= 1
        return x

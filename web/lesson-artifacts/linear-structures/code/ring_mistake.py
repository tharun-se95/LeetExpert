class RingMistake(Ring):
    def pop(self):
        x = self.buf[self.head]
        self.head += 1                          # never wraps: runs off the end
        self.size -= 1
        return x

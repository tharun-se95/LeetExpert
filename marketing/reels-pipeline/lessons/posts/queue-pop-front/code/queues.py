def dequeue_shift(items):
    front = items[0]
    for j in range(1, len(items)):
        items[j - 1] = items[j]
    items.pop()
    return front

class HeadQueue:
    def __init__(self):
        self.items = []
        self.head = 0

    def enqueue(self, x):
        self.items.append(x)

    def dequeue(self):
        x = self.items[self.head]
        self.head += 1
        return x

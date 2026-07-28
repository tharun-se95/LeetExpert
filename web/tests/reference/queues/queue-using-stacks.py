class MyQueue:
    def __init__(self):
        self.inbox = []
        self.outbox = []

    def _pour(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def push(self, x):
        self.inbox.append(x)

    def pop(self):
        self._pour()
        return self.outbox.pop()

    def peek(self):
        self._pour()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox

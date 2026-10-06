class OneMin:
    def __init__(self):
        self.stack = []
        self.min = None

    def push(self, val):
        self.stack.append(val)
        if self.min is None or val < self.min:
            self.min = val

    def pop(self):
        self.stack.pop()

    def getMin(self):
        return self.min

class ScanMin(OneMin):
    def getMin(self):
        return min(self.stack)

class MinStack:
    def __init__(self) -> None:
        self._stack: list[int] = []
        self._mins: list[int] = []

    def push(self, val: int) -> None:
        self._stack.append(val)
        current_min = min(val, self._mins[-1]) if self._mins else val
        self._mins.append(current_min)

    def pop(self) -> None:
        self._stack.pop()
        self._mins.pop()

    def top(self) -> int:
        return self._stack[-1]

    def getMin(self) -> int:
        return self._mins[-1]

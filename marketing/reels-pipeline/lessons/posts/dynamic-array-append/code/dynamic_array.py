class DynamicArray:
    def __init__(self):
        self._capacity = 1
        self._length = 0
        self._store = [None] * self._capacity

    def append(self, value):
        if self._length == self._capacity:
            self._grow()
        self._store[self._length] = value
        self._length += 1

    def _grow(self):
        self._capacity *= 2
        new_store = [None] * self._capacity
        for j in range(self._length):
            new_store[j] = self._store[j]
        self._store = new_store

class DynamicArray:
    def __init__(self) -> None:
        self._capacity = 1
        self._length = 0
        self._store = [None] * self._capacity   # simulated raw array
        self.copies = 0                          # elements copied by growth, so the cost can be read

    def __len__(self) -> int:
        return self._length

    def get(self, i: int):
        if not 0 <= i < self._length:
            raise IndexError(i)
        return self._store[i]                   # O(1): address arithmetic

    def set(self, i: int, value) -> None:
        if not 0 <= i < self._length:
            raise IndexError(i)
        self._store[i] = value                  # O(1)

    def append(self, value) -> None:
        if self._length == self._capacity:
            self._grow()                        # O(n), but rare
        self._store[self._length] = value       # O(1)
        self._length += 1

    def pop(self):
        if self._length == 0:
            raise IndexError("pop from empty array")
        self._length -= 1
        value = self._store[self._length]
        self._store[self._length] = None        # release the reference
        return value                            # O(1): nothing shifts at the end

    def insert(self, i: int, value) -> None:
        if not 0 <= i <= self._length:
            raise IndexError(i)
        if self._length == self._capacity:
            self._grow()
        for j in range(self._length, i, -1):    # shift right: O(n - i)
            self._store[j] = self._store[j - 1]
        self._store[i] = value
        self._length += 1

    def _grow(self) -> None:
        self._capacity *= 2                     # multiplicative: load-bearing
        new_store = [None] * self._capacity
        for j in range(self._length):           # copy: O(n)
            new_store[j] = self._store[j]
            self.copies += 1
        self._store = new_store

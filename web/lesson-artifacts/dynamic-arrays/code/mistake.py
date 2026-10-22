class AdditiveArray(DynamicArray):
    def _grow(self) -> None:
        self._capacity += 8                     # a fixed step instead of a factor
        new_store = [None] * self._capacity
        for j in range(self._length):
            new_store[j] = self._store[j]
            self.copies += 1
        self._store = new_store

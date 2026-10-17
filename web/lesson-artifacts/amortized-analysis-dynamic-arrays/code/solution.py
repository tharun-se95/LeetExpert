class DynArray:
    """Dynamic array that doubles its capacity when full, achieving O(1) amortized append."""

    def __init__(self, initial_capacity=1):
        self.capacity = max(1, initial_capacity)
        self.size = 0
        self.data = [None] * self.capacity
        self.copies = 0
        self.total_copies = 0

    def append(self, val):
        copies = 0
        if self.size == self.capacity:
            new_capacity = self.capacity * 2
            new_data = [None] * new_capacity
            for i in range(self.size):
                new_data[i] = self.data[i]
            copies = self.size
            self.total_copies += copies
            self.data = new_data
            self.capacity = new_capacity
        self.copies = copies
        self.data[self.size] = val
        self.size += 1
        return copies

    def get(self, index):
        if not (0 <= index < self.size):
            raise IndexError("Index out of bounds")
        return self.data[index]

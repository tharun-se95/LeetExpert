class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.values = sorted(nums)

    def add(self, val):
        self.values.append(val)
        self.values.sort()
        return self.values[len(self.values) - self.k]

import bisect

class MedianFinder:
    def __init__(self):
        self.values = []

    def add_num(self, num):
        bisect.insort(self.values, num)

    def find_median(self):
        n = len(self.values)
        mid = n // 2
        if n % 2 == 1:
            return self.values[mid]
        return (self.values[mid - 1] + self.values[mid]) / 2

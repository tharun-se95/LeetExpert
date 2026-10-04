class ChainedTable:
    def __init__(self, m):
        self.buckets = [[] for _ in range(m)]

    def put(self, key, value):
        chain = self.buckets[key % len(self.buckets)]
        for entry in chain:
            if entry[0] == key:
                entry[1] = value
                return
        chain.append([key, value])

    def get(self, key):
        for k, v in self.buckets[key % len(self.buckets)]:
            if k == key:
                return v
        return None

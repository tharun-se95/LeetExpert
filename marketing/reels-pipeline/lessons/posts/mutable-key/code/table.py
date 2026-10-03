def slot(key):
    return sum(key) % 8

class Table:
    def __init__(self):
        self.buckets = [[] for _ in range(8)]

    def put(self, key, value):
        self.buckets[slot(key)].append((key, value))

    def get(self, key):
        for k, v in self.buckets[slot(key)]:
            if k == key:
                return v
        return None

def demo():
    table = Table()
    key = [1, 2]
    table.put(key, "parcel")
    key.append(5)
    return table, key

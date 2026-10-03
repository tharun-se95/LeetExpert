def address(base, slot_size, i):
    return base + i * slot_size

def insert_front(store, length, value):
    for j in range(length, 0, -1):
        store[j] = store[j - 1]
    store[0] = value

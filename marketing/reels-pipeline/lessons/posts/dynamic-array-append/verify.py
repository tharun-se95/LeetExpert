"""Facts for the dynamic-array append carousel: counts every copy the shown class makes."""
import importlib.util
import json

spec = importlib.util.spec_from_file_location("dynamic_array", "code/dynamic_array.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

N, C = 1000, 10


class Counted(mod.DynamicArray):
    """The shown class, counting each grow and each element it copies."""
    def __init__(self):
        super().__init__()
        self.grows, self.copies, self.worst = 0, 0, 0

    def _grow(self):
        self.grows += 1
        self.copies += self._length
        self.worst = max(self.worst, self._length)
        self._resize()

    def _resize(self):
        mod.DynamicArray._grow(self)


class Additive(Counted):
    """The policy the lesson rejects: C more slots each time."""
    def _resize(self):
        self._capacity += C
        new_store = [None] * self._capacity
        for j in range(self._length):
            new_store[j] = self._store[j]
        self._store = new_store


def run(cls):
    a = cls()
    for i in range(N):
        a.append(i)
    assert [a._store[i] for i in range(N)] == list(range(N))
    return a


d, s = run(Counted), run(Additive)
assert d.copies < 2 * N  # the lesson's bound
print(json.dumps({"n": N, "c": C, "double_grows": d.grows, "double_copies": d.copies, "worst": d.worst,
                  "avg": f"{d.copies / N:.2f}", "add_grows": s.grows, "add_copies": s.copies,
                  "ratio": s.copies // d.copies}))

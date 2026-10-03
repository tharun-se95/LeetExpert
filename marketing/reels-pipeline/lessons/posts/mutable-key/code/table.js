function slot(key) {
  return key.reduce((a, b) => a + b, 0) % 8;
}

class Table {
  constructor() {
    this.buckets = Array.from({ length: 8 }, () => []);
  }

  put(key, value) {
    this.buckets[slot(key)].push([key, value]);
  }

  get(key) {
    for (const [k, v] of this.buckets[slot(key)]) {
      if (k.length === key.length && k.every((x, i) => x === key[i])) return v;
    }
    return null;
  }
}

function demo() {
  const table = new Table();
  const key = [1, 2];
  table.put(key, "parcel");
  key.push(5);
  return [table, key];
}

module.exports = { slot, Table, demo };

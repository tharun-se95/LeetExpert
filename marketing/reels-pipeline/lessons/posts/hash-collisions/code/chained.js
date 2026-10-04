class ChainedTable {
  constructor(m) {
    this.buckets = Array.from({ length: m }, () => []);
  }

  put(key, value) {
    const chain = this.buckets[key % this.buckets.length];
    for (const entry of chain) {
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
    }
    chain.push([key, value]);
  }

  get(key) {
    for (const [k, v] of this.buckets[key % this.buckets.length]) {
      if (k === key) return v;
    }
    return null;
  }
}

module.exports = { ChainedTable };

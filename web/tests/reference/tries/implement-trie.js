class Trie {
  constructor() {
    this.root = new Map();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.has(ch)) node.set(ch, new Map());
      node = node.get(ch);
    }
    node.set("$", true);
  }

  walk(s) {
    let node = this.root;
    for (const ch of s) {
      if (!node.has(ch)) return null;
      node = node.get(ch);
    }
    return node;
  }

  search(word) {
    const node = this.walk(word);
    return node !== null && node.has("$");
  }

  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }
}

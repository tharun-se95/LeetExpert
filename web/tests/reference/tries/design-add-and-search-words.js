class WordDictionary {
  constructor() {
    this.root = new Map();
  }

  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.has(ch)) node.set(ch, new Map());
      node = node.get(ch);
    }
    node.set("$", true);
  }

  search(word) {
    const dfs = (i, node) => {
      if (i === word.length) return node.has("$");
      const ch = word[i];
      if (ch === ".") {
        for (const [key, child] of node) {
          if (key !== "$" && dfs(i + 1, child)) return true;
        }
        return false;
      }
      return node.has(ch) && dfs(i + 1, node.get(ch));
    };
    return dfs(0, this.root);
  }
}

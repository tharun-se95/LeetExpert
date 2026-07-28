class WordDictionary:
    def __init__(self):
        self.root = {}

    def add_word(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word):
        def dfs(i, node):
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch == ".":
                for key, child in node.items():
                    if key != "$" and dfs(i + 1, child):
                        return True
                return False
            return ch in node and dfs(i + 1, node[ch])

        return dfs(0, self.root)

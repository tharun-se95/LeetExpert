def clone_graph(node):
    if node is None:
        return None
    cloned = {}

    def dfs(original):
        if id(original) in cloned:
            return cloned[id(original)]
        copy = Node(original.val)
        cloned[id(original)] = copy
        for neighbor in original.neighbors:
            copy.neighbors.append(dfs(neighbor))
        return copy

    return dfs(node)

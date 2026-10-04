def insert_after(node, value):
    new = Node(value)
    node.next = new               # node points at the new node first...
    new.next = node.next          # ...so this reads the new node: it points at itself
    return new

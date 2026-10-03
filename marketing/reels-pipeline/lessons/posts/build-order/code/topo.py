from collections import deque

def topo_sort_kahn(num_vertices: int,
                   adj: list[list[int]]) -> list[int] | None:
    indegree = [0] * num_vertices
    for u in range(num_vertices):
        for v in adj[u]:
            indegree[v] += 1

    queue = deque(u for u in range(num_vertices) if indegree[u] == 0)
    order: list[int] = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)

    return order if len(order) == num_vertices else None

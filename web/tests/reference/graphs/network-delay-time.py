import heapq

def network_delay_time(times, n, k):
    adj = {}
    for u, v, w in times:
        adj.setdefault(u, []).append((v, w))
    dist = {}
    pq = [(0, k)]
    while pq:
        d, node = heapq.heappop(pq)
        if node in dist:
            continue
        dist[node] = d
        for v, w in adj.get(node, []):
            if v not in dist:
                heapq.heappush(pq, (d + w, v))
    if len(dist) < n:
        return -1
    return max(dist.values())

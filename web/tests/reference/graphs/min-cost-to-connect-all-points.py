def min_cost_connect_points(points):
    n = len(points)
    if n <= 1:
        return 0
    in_tree = [False] * n
    best = [float("inf")] * n
    best[0] = 0
    total = 0
    for _ in range(n):
        pick = -1
        for i in range(n):
            if not in_tree[i] and (pick == -1 or best[i] < best[pick]):
                pick = i
        in_tree[pick] = True
        total += best[pick]
        for j in range(n):
            if not in_tree[j]:
                d = abs(points[pick][0] - points[j][0]) + abs(points[pick][1] - points[j][1])
                if d < best[j]:
                    best[j] = d
    return total

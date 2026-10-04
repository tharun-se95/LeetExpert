def find_circle_num(is_connected):
    n = len(is_connected)
    seen = [False] * n
    count = 0
    for start in range(n):
        if seen[start]:
            continue
        count += 1
        stack = [start]
        seen[start] = True
        while stack:
            node = stack.pop()
            for j in range(n):
                if is_connected[node][j] == 1 and not seen[j]:
                    seen[j] = True
                    stack.append(j)
    return count

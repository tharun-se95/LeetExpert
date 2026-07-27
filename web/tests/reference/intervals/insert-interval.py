def insert(intervals, new_interval):
    result = []
    ns, ne = new_interval
    i, n = 0, len(intervals)

    while i < n and intervals[i][1] < ns:
        result.append(intervals[i])
        i += 1

    while i < n and intervals[i][0] <= ne:
        ns = min(ns, intervals[i][0])
        ne = max(ne, intervals[i][1])
        i += 1
    result.append([ns, ne])

    while i < n:
        result.append(intervals[i])
        i += 1

    return result

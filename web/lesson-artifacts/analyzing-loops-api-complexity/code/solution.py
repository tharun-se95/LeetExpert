def count_iterations(shape, n):
    count = 0
    if shape == "doubling":
        i = 1
        while i < n:
            count += 1
            i *= 2
    elif shape == "sequential":
        for i in range(n):
            count += 1
        for j in range(n):
            count += 1
    elif shape == "dependent":
        for i in range(n):
            for j in range(i):
                count += 1
    return count


def dedupe_set(items):
    seen = set()
    result = []
    comparisons = 0
    for x in items:
        comparisons += 1
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result, comparisons

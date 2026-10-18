def linear_search_early_exit(arr, target):
    comparisons = 0
    for i in range(len(arr)):
        comparisons += 1
        if arr[i] == target:
            return i, comparisons
        return -1, comparisons  # bug: returns on first mismatch
    return -1, comparisons

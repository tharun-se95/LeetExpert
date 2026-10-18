def dedupe_list(items):
    result = []
    comparisons = 0
    for x in items:
        # Hidden linear search: 'x in result' checks existing elements
        for existing in result:
            comparisons += 1
            if existing == x:
                break
        else:
            result.append(x)
    return result, comparisons

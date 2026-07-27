def partition_labels(s):
    last_occurrence = {ch: i for i, ch in enumerate(s)}

    result = []
    start = 0
    end = 0
    for i, ch in enumerate(s):
        end = max(end, last_occurrence[ch])
        if i == end:
            result.append(end - start + 1)
            start = i + 1

    return result

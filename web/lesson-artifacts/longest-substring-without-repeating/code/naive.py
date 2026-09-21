def length_of_longest_substring(s):
    best = 0
    for start in range(len(s)):           # try every starting point...
        seen = set()
        for end in range(start, len(s)):  # ...and read forward from scratch
            if s[end] in seen:
                break                     # this start cannot reach any further
            seen.add(s[end])
        best = max(best, len(seen))
    return best

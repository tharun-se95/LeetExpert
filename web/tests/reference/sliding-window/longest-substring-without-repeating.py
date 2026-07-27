def length_of_longest_substring(s):
    window = set()
    left = 0
    best = 0
    for right in range(len(s)):
        while s[right] in window:
            window.remove(s[left])
            left += 1
        window.add(s[right])
        best = max(best, right - left + 1)
    return best

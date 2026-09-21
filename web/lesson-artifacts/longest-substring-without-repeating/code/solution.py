def length_of_longest_substring(s):
    window = set()                        # the characters currently inside the window
    left = 0
    best = 0
    for right in range(len(s)):
        while s[right] in window:         # shrink UNTIL the newcomer is not a duplicate
            window.remove(s[left])
            left += 1
        window.add(s[right])              # expand: the window is valid again
        best = max(best, right - left + 1)   # record AFTER restoring validity
    return best

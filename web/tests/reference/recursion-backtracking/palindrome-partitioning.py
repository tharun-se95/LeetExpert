def partition(s):
    result = []
    n = len(s)

    def is_palindrome(lo, hi):
        while lo < hi:
            if s[lo] != s[hi]:
                return False
            lo += 1
            hi -= 1
        return True

    def backtrack(start, path):
        if start == n:
            result.append(path.copy())
            return
        for end in range(start, n):
            if not is_palindrome(start, end):
                continue
            path.append(s[start : end + 1])
            backtrack(end + 1, path)
            path.pop()

    backtrack(0, [])
    return result

def fib_broken_memo(n):
    calls = 0

    def helper(k):
        nonlocal calls
        calls += 1
        memo = {}  # bug: recreating memo inside helper prevents cross-call caching
        if k in memo:
            return memo[k]
        if k <= 1:
            res = k
        else:
            res = helper(k - 1) + helper(k - 2)
        memo[k] = res
        return res

    return helper(n), calls

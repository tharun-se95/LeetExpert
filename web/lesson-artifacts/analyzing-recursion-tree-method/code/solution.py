def fib_naive(n):
    calls = 0

    def helper(k):
        nonlocal calls
        calls += 1
        if k <= 1:
            return k
        return helper(k - 1) + helper(k - 2)

    return helper(n), calls


def fib_memo(n):
    memo = {}
    calls = 0

    def helper(k):
        nonlocal calls
        calls += 1
        if k in memo:
            return memo[k]
        if k <= 1:
            res = k
        else:
            res = helper(k - 1) + helper(k - 2)
        memo[k] = res
        return res

    return helper(n), calls

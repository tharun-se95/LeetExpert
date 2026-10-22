def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    for i in range(1, n):
        answer[i] = answer[i - 1] * nums[i - 1]

    right = 1
    for i in range(n - 1, -1, -1):
        right *= nums[i]                  # too early: right now includes nums[i] itself
        answer[i] *= right
    return answer

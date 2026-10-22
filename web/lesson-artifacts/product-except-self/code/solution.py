def product_except_self(nums):
    n = len(nums)
    answer = [1] * n                      # answer[0] has nothing on its left: the empty product is 1

    for i in range(1, n):                 # forward: answer[i] = everything to the left of i
        answer[i] = answer[i - 1] * nums[i - 1]

    right = 1                             # backward: the product of everything to the right of i
    for i in range(n - 1, -1, -1):
        answer[i] *= right                # fold the right side into the left side already stored
        right *= nums[i]                  # only now does nums[i] join the right side
    return answer

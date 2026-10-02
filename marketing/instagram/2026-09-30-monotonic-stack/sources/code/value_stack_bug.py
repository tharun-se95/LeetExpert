def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []
    for x in nums:
        while stack and stack[-1] < x:
            answer[nums.index(stack.pop())] = x
        stack.append(x)
    return answer

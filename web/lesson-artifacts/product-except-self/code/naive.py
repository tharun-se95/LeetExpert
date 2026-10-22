def product_except_self(nums):
    answer = []
    for i in range(len(nums)):
        product = 1
        for j in range(len(nums)):        # multiply every other element
            if j != i:
                product *= nums[j]
        answer.append(product)
    return answer

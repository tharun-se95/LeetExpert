"""The stack's events for the scene gen.py draws: pushes and pops, in order.

Mirrors code/next_greater.py with each move recorded; verify.py holds it to the shown code.
"""


def stack_events(nums):
    """[("push", i) | ("pop", j, by_i)] in the order they happen."""
    out, stack = [], []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            out.append(("pop", stack.pop(), i))
        stack.append(i)
        out.append(("push", i))
    return out

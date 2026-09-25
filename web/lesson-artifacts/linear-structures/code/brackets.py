PAIR = {")": "(", "]": "[", "}": "{"}

def balanced(s):
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)                   # an opener waits for its closer
        elif ch in PAIR:
            if not stack or stack.pop() != PAIR[ch]:
                return False                   # closes the wrong thing, or nothing
    return not stack                           # every opener was closed

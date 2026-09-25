PAIR = {")": "(", "]": "[", "}": "{"}

def balanced(s):
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in PAIR:
            if not stack or stack.pop() != PAIR[ch]:
                return False
    return True                                # forgets openers still waiting

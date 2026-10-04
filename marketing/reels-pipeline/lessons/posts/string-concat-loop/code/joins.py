def join_bad(words):
    result = ""
    for w in words:
        result += w
    return result

def join_good(words):
    parts = []
    for w in words:
        parts.append(w)
    return "".join(parts)

def longest_word(words):
    present = set(words)
    best = ""
    for w in sorted(words):
        if all(w[:i] in present for i in range(1, len(w))):
            if len(w) > len(best):
                best = w
    return best

def run_cases(fn, cases):
    results = []
    for args, expected in cases:
        try:
            got = fn(*args)
        except Exception as err:      # one broken case must not stop the others
            got = f"{type(err).__name__}: {err}"
        results.append({"passed": got == expected, "got": got, "expected": expected})
    return results

"""Rows for the grid primitive, traced by running the real DP fill."""
import json, os
from math import comb

def unique_paths(R, C):
    dp = [[0] * C for _ in range(R)]
    vals = lambda: [["" if dp[r][c] == 0 else str(dp[r][c]) for c in range(C)] for r in range(R)]
    steps = []
    for r in range(R):
        for c in range(C):
            deps = []
            if r == 0 or c == 0:
                dp[r][c] = 1
                note = ("The start square — exactly one way to be here."
                        if r == 0 and c == 0 else
                        "On the top edge there is only one route: keep going right."
                        if r == 0 else
                        "On the left edge there is only one route: keep going down.")
            else:
                deps = [[r - 1, c], [r, c - 1]]
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
                note = (f"Every path into ({r},{c}) arrives from above or from the left, "
                        f"so <b>{dp[r-1][c]} + {dp[r][c-1]} = {dp[r][c]}</b>.")
            steps.append({"cur": [r, c], "values": vals(), "deps": deps, "note": note})
    answer = dp[R - 1][C - 1]
    assert answer == comb(R + C - 2, R - 1), "DP must agree with the closed form C(R+C-2, R-1)"
    steps.append({"cur": None, "values": vals(), "deps": [],
                  "note": f"The bottom-right cell holds the answer: <b>{answer}</b> distinct paths. "
                          f"Every cell was computed once — that is what turns an exponential "
                          f"search into {R}x{C} work."})
    return steps, answer

R, C = 4, 4
steps, answer = unique_paths(R, C)
rows = [{
  "_out": "dp-unique-paths", "family": "state-transition", "theme": "dark",
  "eyebrow": "State Transition", "title": "Unique Paths — DP Table",
  "rows": R, "cols": C, "showAxes": True,
  "recurrence": "dp[r][c] = dp[r-1][c] + dp[r][c-1]",
  "stepSeconds": 1.0, "steps": json.dumps(steps),
}]
out = os.path.join(os.path.dirname(__file__), "rows-grid.json")
json.dump(rows, open(out, "w"), indent=2)
print(f"{len(steps)} steps · {R}x{C} · answer {answer} (closed form C({R+C-2},{R-1}) = {comb(R+C-2,R-1)})")

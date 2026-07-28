import { describe, it, expect } from "vitest";
import { matches, formatCall } from "../src/lib/sandbox/compare";

/**
 * The comparison and the call label are the two things a learner actually
 * sees decide their run. Both are pure functions over plain JSON, so they
 * are cheap to pin down here rather than through the browser.
 */

describe("formatCall", () => {
  it("renders a plain call without the args-array brackets", () => {
    expect(formatCall("moveZeroes", [[0, 1, 0, 3, 12]])).toBe(
      "moveZeroes([0, 1, 0, 3, 12])",
    );
  });

  it("renders a cyclic list as the list, not as harness encoding", () => {
    // The learner's function receives a linked list whose tail points back —
    // never the `{values, pos}` object the lesson author writes.
    expect(formatCall("hasCycle", [{ values: [3, 2, 0, -4], pos: 1 }])).toBe(
      "hasCycle([3, 2, 0, -4] with tail → index 1)",
    );
  });

  it("omits the tail note when pos says there is no cycle", () => {
    expect(formatCall("hasCycle", [{ values: [1, 2], pos: -1 }])).toBe(
      "hasCycle([1, 2])",
    );
  });

  it("leaves an ordinary object argument alone", () => {
    expect(formatCall("f", [{ pos: 1 }])).toBe('f({"pos":1})');
  });
});

describe("matches", () => {
  it("set-of-sets keeps multiplicity — [2,2,3] is not [2,3]", () => {
    // Combination Sum depends on this: dropping a repeat is a wrong answer.
    expect(matches([[2, 2, 3]], [[2, 3]], "set-of-sets")).toBe(false);
  });

  it("set-of-sets ignores order at both levels", () => {
    expect(
      matches(
        [
          [3, 2],
          [7],
        ],
        [[7], [2, 3]],
        "set-of-sets",
      ),
    ).toBe(true);
  });

  it("sorted keeps the inner order load-bearing", () => {
    // Palindrome Partitioning: ["a","ab"] and ["ab","a"] are different answers.
    expect(matches([["a", "ab"]], [["ab", "a"]], "sorted")).toBe(false);
  });
});

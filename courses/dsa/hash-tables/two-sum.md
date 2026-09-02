---
title: Two Sum
type: problem
---

## Problem

Given `nums` and `target`, return the ==indices== of the two numbers that
sum to `target`. Exactly one solution exists; you may not use the same
element twice.

```goal
Return a pair of indices — not the values. Order of the pair does not
matter to the judge as long as both indices are correct.
```

**Examples**

```examples
nums = [2,7,11,15], target = 9   →  [0,1]
nums = [3,2,4],     target = 6   →  [1,2]   (not [0,0]!)
nums = [3,3],       target = 6   →  [0,1]
```

```constraint
2 ≤ n ≤ 10⁴ · values in ±10⁹ · exactly one answer
```

## Attempt it first

```tip
You've known the O(n) *decision* version ("does a pair exist?") since
lesson one of Big O. This asks for **indices** — which changes the
structure you carry. Watch `[3,2,4]` and `[3,3]`: both trap specific
wrong versions.
```


```sandbox
{
  "id": "two-sum",
  "fn": { "python": "two_sum", "javascript": "twoSum" },
  "check": "return",
  "starter": {
    "python": "def two_sum(nums, target):\n    # Return the two indices, smaller first.\n    pass\n",
    "javascript": "function twoSum(nums, target) {\n  // Return the two indices, smaller first.\n}\n"
  },
  "cases": [
    { "args": [[2,7,11,15],9], "expect": [0,1] },
    { "args": [[3,2,4],6], "expect": [1,2] },
    { "args": [[3,3],6], "expect": [0,1] },
    { "args": [[-1,-2,-3,-4],-7], "expect": [2,3] }
  ]
}
```
````reveal Hint 1 — which verb?
"Find the partner" is the INDEX verb: you need each value's location, not
just its existence. Carry value → index. A set loses exactly the
information the answer is made of.
````

````reveal Hint 2 — one pass, check before insert
For each nums[i], the partner is target − nums[i]. Ask the map BEFORE
inserting nums[i]: if the partner is there, its stored index is earlier
than i — distinctness is free. (Check what inserting first would do to
nums = [3,2,4], target = 6.)
````

## Brute force, for contrast

All pairs: C(n,2) ≈ 5·10⁷ at n = 10⁴ — actually *survivable* here, which
is worth noticing. The hash version isn't required by the constraints;
it's required by the interviewer, and by every larger cousin of this
problem where n² genuinely dies.

## The insight

> Searching for "the x with value v" is O(n) in an array — unless you've
> built the reverse index as you walked. Check-then-insert makes the map
> a record of *strictly earlier* elements, so "partner in map" ⇒ a valid,
> distinct, earlier index. The pair search collapses into n lookups.

## Solution

`````reveal Solution — one pass over a value→index map
````tabs
```python
def two_sum(nums: list[int], target: int) -> list[int]:
    index_of: dict[int, int] = {}          # value -> earliest index
    for i, x in enumerate(nums):
        partner = target - x
        if partner in index_of:            # check BEFORE insert
            return [index_of[partner], i]
        index_of[x] = i
    raise ValueError("no solution")        # unreachable per constraints
```

```typescript
function twoSum(nums: number[], target: number): number[] {
  const indexOf = new Map<number, number>(); // value -> earliest index
  for (let i = 0; i < nums.length; i++) {
    const partner = target - nums[i];
    if (indexOf.has(partner)) {
      // check BEFORE insert
      return [indexOf.get(partner)!, i];
    }
    indexOf.set(nums[i], i);
  }
  throw new Error("no solution"); // unreachable per constraints
}
```
````

Why check-before-insert handles both traps:

- `[3,2,4], target 6`: inserting 3 first and *then* checking would find
  partner 3 = 6−3 immediately — pairing index 0 with itself. Checking
  first, the map is empty at i = 0: no false match.
- `[3,3], target 6`: at i = 1, partner 3 IS in the map (from i = 0) —
  duplicates work because the two copies are distinct entries in time,
  even though the second insert would overwrite the first.

Invariant: entering iteration i, `index_of` maps every value in
nums[0..i) to an index where it occurs. The return therefore always
yields two distinct indices.

```complexity
{
  "time": "O(n) average",
  "space": "O(n)",
  "why": "One pass; each step is an O(1)-average lookup and insert. The map can hold all n values. This is the canonical time-for-space trade — and the 'average' qualifier is the module's honesty tax."
}
```
`````

## Variants

- **Sorted input** (Two Sum II): converging pointers give O(n) time,
  O(1) space — sortedness replaces the map. Two Pointers module.
- **Three Sum:** sort + fix one element + two-pointer the rest — the
  classic composition, also Module 10.
- **Count pairs summing to target:** switch the map to the Count verb.

```quiz
{
  "question": "Why does the one-pass version insert nums[i] AFTER checking for its partner, rather than building the whole map first and then scanning?",
  "options": [
    "Insert-after is required for the map to fit in memory — checking before inserting avoids ever holding more than n−1 entries at once, keeping the map within a tighter memory bound than build-then-scan would need",
    "It saves one pass but is otherwise equivalent — both orderings produce the same map contents by the time the scan finishes, so the only real difference is the minor speedup from combining two loops into one",
    "Build-then-scan must handle 'partner is myself' explicitly (target − nums[i] == nums[i] finds its OWN index) — check-then-insert makes the map contain only strictly-earlier elements, so self-pairing is structurally impossible"
  ],
  "answer": 2,
  "explanation": "Both can be made correct, but check-then-insert gets distinctness from its INVARIANT (map = past only) instead of from a patch (`index_of[partner] != i`). Invariant-shaped correctness survives modification; patch-shaped correctness breaks in variants."
}
```

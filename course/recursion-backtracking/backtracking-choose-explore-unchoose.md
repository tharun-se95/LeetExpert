---
title: "Backtracking: Choose, Explore, Unchoose"
type: concept
---

## When the answer is a sequence of choices

Imagine trying on outfits from a shared clothing rack, one item at a
time, to see which combinations look good together. You pull on a
jacket, then hold up a pair of trousers against it. If that pairing
doesn't work, you don't start over from nothing — you just take the
trousers off and try a different pair, still wearing the same jacket.
Only when you've tried every pair of trousers with that jacket do you
finally take the jacket off too, and reach for a different one. At
every step you're either putting something on (committing to a choice),
pausing to check how the current combination looks (exploring further
from here), or taking something back off before moving on to the next
option (undoing a choice so it doesn't linger into the next attempt).

Some problems ask you to *build* something out of a series of decisions
exactly like this: which elements go in a subset, what order to arrange
items, where to place queens on a board. The set of all possible ways
to make those decisions forms a **state-space tree** — the root is
"nothing decided yet," each edge is one choice, and each leaf is one
complete configuration. Solving the problem means walking that tree and
either collecting every valid leaf (all subsets) or finding one that
satisfies a constraint (a valid queen placement). **Backtracking** is
the disciplined way to walk it: a depth-first traversal of the choice
tree that shares one mutable "current state" across the whole walk — the
outfit you're currently wearing — and carefully **undoes** each choice
as it retreats, exactly like taking the trousers back off before
reaching for the next pair. This lesson builds the template, proves why
the undo step is mandatory, and shows how *pruning* turns an
intractable tree into a merely-large one.

```diagram
{
  "id": "backtracking-tree"
}
```


## The template: choose, explore, unchoose

Every backtracking function has the same skeleton. You maintain a
`path` (the choices made so far — the partial solution) and, at each
node, loop over the choices available *here*:

````tabs
```python
def backtrack(path: list, choices: list, result: list) -> None:
    if is_complete(path):              # reached a leaf — a full solution
        result.append(path.copy())     # RECORD a snapshot, not the live list
        return
    for choice in choices:
        if not is_valid(choice, path): # PRUNE: skip choices that can't work
            continue
        path.append(choice)            # 1. CHOOSE: extend the partial solution
        backtrack(path, next_choices(choice), result)  # 2. EXPLORE: recurse
        path.pop()                     # 3. UNCHOOSE: undo before the next choice
```

```typescript
function backtrack(path: number[], choices: number[], result: number[][]): void {
  if (isComplete(path)) {
    // reached a leaf — a full solution
    result.push([...path]); // RECORD a snapshot, not the live array
    return;
  }
  for (const choice of choices) {
    if (!isValid(choice, path)) continue; // PRUNE: skip impossible choices
    path.push(choice); // 1. CHOOSE: extend the partial solution
    backtrack(path, nextChoices(choice), result); // 2. EXPLORE: recurse
    path.pop(); // 3. UNCHOOSE: undo before the next choice
  }
}
```
````

Read the three lines in the loop body as one atomic ritual:

1. **Choose** — commit to one option by mutating the shared `path`.
2. **Explore** — recurse. The subtree below now sees a `path` that
   includes this choice, and explores *every* completion consistent with
   it.
3. **Unchoose** — pop the choice back off. This restores `path` to
   exactly what it was before the iteration, so the *next* loop
   iteration starts from a clean slate.

The recursion is the vertical movement (deeper into the tree); the
`for` loop is the horizontal movement (trying sibling choices at one
level). The base case, `is_complete`, is where you've reached a leaf and
record the solution. Notice we record a **copy** (`path.copy()` /
`[...path]`) — `path` is a single shared list mutated throughout the
walk, so if we stored a reference to it, every "solution" in `result`
would point at the same list, which by the end is empty. This copy
requirement is a direct consequence of the shared-mutable-state design,
and it's the same reason the unchoose step exists.

## Why "unchoose" is not optional

The undo step is the part beginners drop, and the bug it causes is
instructive because it reveals the whole mechanism. There is **one**
`path` object, shared by every node in the traversal. It is not copied
on the way down — that shared mutation is exactly what makes
backtracking memory-cheap (O(depth), not O(tree size)). But sharing has
a price: after exploring one choice, the `path` is polluted with that
choice, and the *sibling* choices at the same level must not see it.

Concretely, suppose we're generating subsets of `[1, 2, 3]` and we
**forget the pop**:

````tabs
```python
def broken(nums, start, path, result):
    result.append(path.copy())
    for i in range(start, len(nums)):
        path.append(nums[i])          # CHOOSE
        broken(nums, i + 1, path, result)
        # path.pop()  ← FORGOTTEN
```

```typescript
function broken(nums, start, path, result) {
  result.push([...path]);
  for (let i = start; i < nums.length; i++) {
    path.push(nums[i]); // CHOOSE
    broken(nums, i + 1, path, result);
    // path.pop();  ← FORGOTTEN
  }
}
```
````

Walk it. Start `path = []`. We push 1 → recurse → push 2 → recurse →
push 3. When those calls return, `path` is `[1, 2, 3]` and **stays that
way**. Back at the top level, the loop advances to `i = 1` (element 2)
and pushes it onto the *already-polluted* `[1, 2, 3]`, producing
`[1, 2, 3, 2]` — garbage that was never a real branch of the tree. The
choices from one subtree leak sideways into its siblings, because
nothing rewound the shared state. The pop is what enforces the tree's
structure: **a choice made on one branch must be invisible to every
other branch.** Without it, you're not traversing a tree anymore; you're
smearing all the branches into one ever-growing list.

There is an alternative design — pass a fresh copy of `path` into each
recursive call instead of mutating a shared one (`backtrack(path +
[choice], ...)`). That removes the need to unchoose, at the cost of
allocating a new list at every node — O(depth) extra work *per node*
instead of O(1). For deep trees that's a real slowdown and more memory
churn, which is why the mutate-and-undo pattern is the standard. Know
both exist; the choose/explore/unchoose form is what you'll write by
default and what every solution in this module uses.

One more thing worth naming before you meet the problems: `path` is
only the simplest shared tracker, not the only kind. Whatever mutable
state records the current partial solution needs the same choose/
unchoose discipline, whether it's a list you append to and pop, a
boolean array marking elements "in use" that you flip on and back off,
or several sets tracking different constraints at once — same rack, more
than one hook. Permutations tracks a `used` array instead of relying on
a start index, and unmarks an element on the way back up exactly where
`path` would get popped; N-Queens tracks three separate sets (columns,
and both diagonals) and removes an entry from each of them on the way
back up. The mechanism is identical — mutate on choose, restore on
unchoose — just applied to a different piece of shared state.

## Pruning: cutting branches before they bloom

The state-space tree is enormous, but you rarely have to visit all of
it. **Pruning** means recognizing, at an *internal* node, that no leaf
in its subtree can be a valid solution — and refusing to recurse into
it, skipping that entire subtree in one stroke. That's the `is_valid`
check in the template: it's not just filtering final answers, it's
cutting the walk short as early as possible.

The payoff is dramatic *when it triggers early*. Suppose a subtree has
1000 leaves but you can tell at its root that the partial solution
already violates a constraint. Pruning at the root saves visiting all
1000 leaves plus every internal node beneath — one check, a thousand-fold
saving on that subtree. The earlier in the tree you can prune, the more
you cut, because subtrees near the root are the biggest.

Be honest about what pruning does and doesn't do to complexity, though.
**Pruning does not change the worst-case big-O.** If an adversarial
input lets no branch be cut, you still visit the whole exponential tree
— N-Queens is still O(exponential) in the worst case even with perfect
conflict-checking. What pruning changes is the *typical* and *practical*
running time, often by many orders of magnitude, by making the tree you
*actually* walk far smaller than the tree that *could* exist. The
distinction matters: you prune to make a problem solvable in practice,
not to earn a better asymptotic label. Generate Parentheses (a later
problem) is the cleanest case — pruning invalid branches during
construction instead of generating everything and filtering at the end
is what makes it efficient, even though both approaches are "exponential"
in a loose sense.

## How to reason about backtracking complexity

Never quote "exponential" as a reflex. Derive it from the tree's actual
shape, using two numbers:

- **The number of nodes (or leaves) in the state-space tree** — this is
  where the exponential/factorial factor comes from, and it's specific
  to the problem's branching. Subsets: each element is in or out, so 2ⁿ
  leaves. Permutations: n choices, then n−1, then n−2… so n! leaves.
- **The work done per node**, especially at the leaves — copying a
  length-k solution into the result is O(k), not O(1), and that factor
  multiplies the leaf count.

So a subsets solution is O(n · 2ⁿ): 2ⁿ subsets, each costing O(n) to
copy out. A permutations solution is O(n · n!): n! permutations, each
O(n) to copy. Getting the total right means multiplying "how many nodes"
by "cost per node" — the same two-factor discipline you'll apply to
every problem in this module.

That multiplication only tells the whole story once you check it
against the OTHER nodes in the tree — the internal ones, where you
`choose`/`unchoose` but don't record anything. For subsets, the tree has
O(2ⁿ) nodes total (internal and leaf combined, since it's a binary
tree of depth n), and each internal node costs O(1) — so all the
internal work together is only O(2ⁿ), strictly smaller than the leaves'
O(n · 2ⁿ). The leaf work dominates, so it alone sets the total. The same
check applies to permutations: O(n!) internal nodes at O(1) each is
O(n!), dominated by the leaves' O(n · n!). This is why the two-factor
answer is safe to state directly — the internal-node cost never wins
that comparison in this module's problems — but the check itself, not
just the multiplication, is what makes the answer a derivation instead
of a guess. When we get to the individual problems, this is the
reasoning you'll reproduce each time, not a table you'll memorize.

```complexity
{
  "operations": [
    { "name": "choose / unchoose per node", "time": "O(1)", "why": "one append and one pop on the shared path — this is the whole point of mutate-and-undo vs. copying, which would be O(depth) per node" },
    { "name": "recording a leaf solution", "time": "O(depth)", "why": "must copy the length-'depth' path into result; the live path keeps mutating, so a reference would be worthless" },
    { "name": "full traversal", "time": "O(nodes × work-per-node)", "why": "the honest formula: total = size of the state-space tree × cost at each node — never just 'exponential' with no derivation" },
    { "name": "effect of pruning", "time": "no change to worst-case big-O", "why": "pruning shrinks the tree actually walked (huge practical wins) but an adversarial input can leave nothing to cut, so the asymptotic worst case stands" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "In backtracking, a single mutable `path` is shared across the entire traversal, and you must call path.pop() (unchoose) after each recursive call. What goes wrong if you omit the pop?",
      "options": [
        "Nothing functional — the pop is only a minor performance optimization; the algorithm still explores every branch correctly, it just holds onto slightly more memory in the path array than strictly necessary",
        "The recursion never terminates because the base case is never reached — an ever-growing unpopped path means the length check that triggers the base case can never be satisfied, so the traversal runs forever",
        "The choices made deep in one branch stay in the shared path when control returns to a sibling choice at the same level, so siblings build on a polluted state and produce configurations that were never real branches of the tree"
      ],
      "answer": 2,
      "explanation": "There is exactly one path object. Exploring a choice mutates it; the pop rewinds that mutation so sibling branches start clean. Without the pop, one subtree's choices leak sideways into the next — e.g. subsets of [1,2,3] yields garbage like [1,2,3,2]. The pop is what enforces that a choice on one branch is invisible to every other branch."
    },
    {
      "question": "Why do backtracking solutions store a COPY of the path (path.copy() / [...path]) when recording a completed solution, rather than the path itself?",
      "options": [
        "Because path is a single object that keeps being mutated (pushed and popped) for the rest of the traversal — storing a reference means every recorded 'solution' points at the same list, which ends up in whatever state the walk finishes in (typically empty)",
        "Copying is required by the language's type system — passing a live array reference into a results list is disallowed by both Python's and TypeScript's type systems, forcing an explicit copy at the call site",
        "The copy makes the algorithm asymptotically faster — allocating a fresh array at the point of recording avoids more expensive copies that would otherwise be needed elsewhere in the traversal"
      ],
      "answer": 0,
      "explanation": "Same root cause as the unchoose step: shared mutable state. The result must capture a snapshot of the path at the leaf, because the live path will be rewound and rebuilt many more times. A reference would alias the one shared list, so all recorded answers would be identical (and wrong)."
    },
    {
      "question": "Pruning cuts off a whole subtree when a partial solution already can't lead to a valid answer. Which statement about its effect on complexity is correct?",
      "options": [
        "Pruning improves the worst-case big-O from exponential to polynomial — cutting subtrees early is what allows backtracking algorithms to be classified in the same complexity tier as, for instance, sorting-based approaches",
        "Pruning can drastically reduce the tree actually walked — often by orders of magnitude in practice — but does not change the worst-case big-O, because an adversarial input may leave no branch that can be cut",
        "Pruning only affects space complexity, never time — skipping a subtree means fewer partial solutions are held in memory simultaneously, but the total number of comparisons performed stays exactly the same either way"
      ],
      "answer": 1,
      "explanation": "Pruning attacks the constant/typical case, not the asymptotic worst case. Earlier cuts save more (bigger subtrees near the root), making problems like N-Queens solvable in practice. But if nothing can be pruned on some input, you still traverse the full exponential tree — so the big-O label is unchanged. Prune for practicality, not for a better asymptotic class."
    }
  ]
}
```

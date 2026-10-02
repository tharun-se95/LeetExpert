# Generated sandbox inputs (issue #157)

Status: implemented 2026-10-02. Owner standard: CLAUDE.md §2 (no hand-written
expectations, both runtimes) and §3 (cases cover the stated constraints).

## Problem

A sandbox case writes `args` and `expect` literally in the lesson's `sandbox`
fence, so no case can reach a stated ceiling (`reverse-linked-list` says
length ≤ 5000, its longest case has 5 nodes; a recursive solution only
overflows Python's stack at that size). Typing 5000 elements, and the answer
for them, into markdown is neither readable nor honest.

## How sandboxes work today

- The fence is JSON. `components/sandbox/parseSpec.ts` validates it into a
  `SandboxSpec`; `Sandbox.tsx` / `useRunner.ts` post `spec.cases` to a Worker
  (`public/sandbox/js-runner.js`, `py-runner.js`) which builds structures and
  returns raw outcomes. Pass/fail is decided on the main thread
  (`lib/sandbox/compare.ts`).
- CI (`tests/reference.test.ts`) reads the fences with
  `tests/helpers/sandboxCases.ts`, runs `tests/reference/<lesson>.{js,py}`
  through the same shipped worker files and judges with the same `matches`.

## Design

1. **Syntax.** Two declarative generators, valid at any depth of a case's `args`
   or `expect`: `{"$range": [from, to]}` (inclusive integers, descending when
   from > to) and `{"$repeat": [value, count]}`. Composable with existing
   harness encodings: `{"values": {"$range": [1, 10000]}, "pos": 0}`. No code
   in markdown. An unknown `$key`, a generator mixed with data keys, a
   non-integer bound or a length over 100 000 is an error (`GeneratorError`),
   which makes the parser return null (the page's "Invalid sandbox block"),
   so a typo cannot silently test nothing.
2. **One expansion, two callers.** `lib/sandbox/generate.ts` (hook-free)
   holds `expandGenerators`. `parseSandboxSpec` expands on the main thread,
   so the Workers still receive plain JSON and need no change; the CI harness
   (`sandboxFences`) calls the same function. They cannot disagree on what a
   case is.
3. **`expect` is stored as a generator, and verified by execution.** The
   alternative, computing `expect` from a reference solution, was rejected:
   the learner's browser must grade without the reference (shipping it leaks
   the solution, §3), so the expectation has to live in the fence either way.
   A generator like `{"$range": [5000, 1]}` is a declarative statement of
   the answer, and CI proves it exactly as it proves a literal: both reference
   solutions must produce it. A wrong generator, or a wrong reference,
   fails (tests below). Nothing is computed at build time and nothing is stored
   outside the lesson.
4. **Display.** A generated case carries `argsLabel` / `expectLabel`
   (`describeGenerated`): `reverse_list([1..5000])`, expected `[5000..1]`,
   `{ values: [1..10000], pos: 0 }`. The case list, the result row name and
   the expected column use them; literal cases render exactly as before.
5. **Failure output.** `pretty()` already truncates; it now appends the
   length when it cuts an array (`[5000, 4999, …] (5000 items)`), so a learner
   who fails the ceiling case sees what size they failed at.

## Tests (`tests/sandboxGenerate.test.ts`, `tests/reference.test.ts`)

Expansion and rejection of malformed generators; parser labels and null on a
bad generator; the real `reverse-linked-list` fence reaches 5000; the checked-in
reference passes; a reference that is wrong only at the ceiling fails; a wrong
generated `expect` fails. Fault proved on the real lesson by editing its
`expect` to `[5000, 2]`: both runtimes' reference tests failed, then restored.

## Out of scope

Adding ceiling cases to the other lessons in the appendix (one lesson at a
time, each needing a reference that runs in budget in both runtimes), and
generators beyond ranges and repeats (random inputs would break
reproducibility; add a seeded form only when a lesson needs it).

## Appendix: audit of stated bounds against the longest current case

Read-only audit, 2026-10-02. "Longest case" is the largest array length, string length or op count anywhere in a case's `args`/`ops` (for a matrix, the longer side), so it is a proxy for the size reached, not an exact n. Bound text is the first `≤` line found in the lesson. The two lessons fixed by this change are marked. 93 sandbox lessons state a numeric bound and, apart from those two, none has a case near its ceiling. Whether a ceiling case is worth adding is per lesson: a 10^5-element case needs a reference that runs inside the 3 s budget in both runtimes.

| Lesson | Stated bound | Longest current case |
| --- | --- | --- |
| arrays/best-time-to-buy-sell-stock | 1 ≤ n ≤ 10⁵ | 6 |
| arrays/move-zeroes | 1 ≤ n ≤ 10⁴ | 6 |
| arrays/product-except-self | 2 ≤ n ≤ 10⁵ | 5 |
| arrays/remove-duplicates-sorted | 1 ≤ n ≤ 3·10⁴ | 10 |
| arrays/rotate-array | 1 ≤ n ≤ 10⁵ | 7 |
| binary-search/find-first-and-last | 0 ≤ n ≤ 10⁵. | 6 |
| binary-search/find-minimum-in-rotated-sorted-array | 1 ≤ n ≤ 5000 | 7 |
| binary-search/koko-eating-bananas | 1 ≤ piles.length ≤ 10⁴ | 5 |
| binary-search/search-insert-position | 1 ≤ n ≤ 10⁴ | 4 |
| binary-search/search-rotated-sorted-array | 1 ≤ n ≤ 5000 | 7 |
| binary-trees/binary-tree-level-order-traversal | 0 ≤ n ≤ 2000 nodes | 7 |
| binary-trees/binary-tree-right-side-view | 0 ≤ n ≤ 100 nodes | 7 |
| binary-trees/construct-binary-tree-from-preorder-and-inorder | 1 ≤ n ≤ 3000 nodes | 5 |
| binary-trees/diameter-of-binary-tree | 1 ≤ n ≤ 10⁴ nodes | 11 |
| binary-trees/lowest-common-ancestor-of-a-binary-tree | 2 ≤ n ≤ 10⁵ nodes | 11 |
| binary-trees/maximum-depth-of-binary-tree | 0 ≤ n ≤ 10⁴ nodes | 7 |
| bst/convert-sorted-array-to-bst | 1 ≤ nums.length ≤ 10⁴ | 7 |
| bst/delete-node-in-a-bst | 0 ≤ n ≤ 10⁴ nodes | 7 |
| bst/insert-into-a-binary-search-tree | 0 ≤ n ≤ 10⁴ nodes | 7 |
| bst/kth-smallest-element-in-a-bst | 1 ≤ k ≤ n ≤ 10⁴ | 8 |
| bst/lowest-common-ancestor-of-a-bst | 2 ≤ n ≤ 10⁵ nodes | 11 |
| bst/validate-binary-search-tree | 1 ≤ n ≤ 10⁴ nodes | 7 |
| dynamic-programming/coin-change | 1 ≤ coins.length ≤ 12, 1 ≤ coins[i] ≤ 2³¹-1, 0 ≤ amount ≤ 10⁴. | 4 |
| dynamic-programming/edit-distance | 0 ≤ word1.length, word2.length ≤ 500. | 9 |
| dynamic-programming/house-robber | 1 ≤ nums.length ≤ 100, values in [0, 400]. | 5 |
| dynamic-programming/longest-common-subsequence | 1 ≤ text1.length, text2.length ≤ 1000. | 11 |
| dynamic-programming/longest-increasing-subsequence | 1 ≤ nums.length ≤ 2500. | 8 |
| dynamic-programming/partition-equal-subset-sum | 1 ≤ nums.length ≤ 200, values in [1, 100]. | 50 |
| dynamic-programming/unique-paths | 1 ≤ m, n ≤ 100. | 2 |
| dynamic-programming/word-break | 1 ≤ s.length ≤ 300, up to 1000 dictionary words. | 13 |
| graphs/min-cost-to-connect-all-points | 1 ≤ points.length ≤ 1000, coordinates in ±10⁴. | 5 |
| graphs/network-delay-time | 1 ≤ k ≤ n ≤ 100, up to 6000 edges, positive weights. | 4 |
| graphs/number-of-provinces | 1 ≤ n ≤ 200. | 4 |
| greedy/candy | 1 ≤ n ≤ 2·10⁴. | 7 |
| greedy/gas-station | 1 ≤ n ≤ 10⁵ | 5 |
| greedy/jump-game-ii | 1 ≤ n ≤ 10⁴ | 5 |
| greedy/jump-game | 1 ≤ n ≤ 10⁴ | 5 |
| greedy/partition-labels | 1 ≤ s.length ≤ 500, lowercase English letters only. | 24 |
| hash-tables/contains-duplicate-ii | 1 ≤ n ≤ 10⁵ | 6 |
| hash-tables/first-unique-character | 1 ≤ n ≤ 10⁵ | 12 |
| hash-tables/group-anagrams | 1 ≤ count ≤ 10⁴ | 6 |
| hash-tables/longest-consecutive-sequence | 0 ≤ n ≤ 10⁵ | 10 |
| hash-tables/two-sum | 2 ≤ n ≤ 10⁴ | 4 |
| heaps/k-closest-points-to-origin | 1 ≤ k ≤ points.length ≤ 10⁴, coordinates in ±10⁴. | 3 |
| heaps/kth-largest-element-in-a-stream | 1 ≤ k ≤ 10⁴, up to 10⁴ add calls, values in ±10⁴. | 5 |
| heaps/task-scheduler | 1 ≤ tasks.length ≤ 10⁴, 0 ≤ n ≤ 100, uppercase letters only (at mo | 12 |
| heaps/top-k-frequent-elements | 1 ≤ n ≤ 10⁵, k is between 1 and the number of distinct values, values  | 6 |
| intervals/insert-interval | 0 ≤ n ≤ 10⁴ | 5 |
| intervals/meeting-rooms | 0 ≤ n ≤ 10⁴. | 3 |
| intervals/minimum-arrows-to-burst-balloons | 1 ≤ n ≤ 10⁵ | 4 |
| intervals/non-overlapping-intervals | 1 ≤ n ≤ 10⁵ | 4 |
| linked-lists/linked-list-cycle | 0 ≤ length ≤ 10⁴ | 10000 (fixed here) |
| linked-lists/middle-of-list | 1 ≤ length ≤ 100. | 6 |
| linked-lists/reverse-linked-list | 0 ≤ length ≤ 5000 | 5000 (fixed here) |
| matrix/number-of-islands | 1 ≤ m, n ≤ 300, each cell is '0' or '1'. | 5 |
| matrix/rotate-image | n == matrix.length == matrix[i].length, 1 ≤ n ≤ 20, values in ±100 | 5 |
| matrix/set-matrix-zeroes | 1 ≤ m, n ≤ 200, values in ±2³¹. The follow-up that makes this proble | 4 |
| matrix/spiral-matrix | 1 ≤ m, n ≤ 10, values in ±100. Note the grid is m × n — **not** ne | 4 |
| prefix-sum/contiguous-array | 1 ≤ n ≤ 10⁵. | 8 |
| prefix-sum/kadanes-algorithm | 1 ≤ n ≤ 10⁵ | 9 |
| prefix-sum/range-sum-2d-immutable | 1 ≤ rows, cols ≤ 200 | 4 |
| prefix-sum/range-sum-query-immutable | 1 ≤ n ≤ 10⁴ | 5 |
| prefix-sum/subarray-sum-equals-k | 1 ≤ n ≤ 2·10⁴ | 8 |
| queues/queue-using-stacks | ≤ 100 operations | 9 |
| queues/recent-calls | ≤ 10⁴ calls | 5 |
| queues/sliding-window-maximum | 1 ≤ n ≤ 10⁵ | 8 |
| queues/stream-first-unique | ≤ 10⁵ arrivals | 6 |
| sliding-window/longest-substring-without-repeating | 0 ≤ n ≤ 5·10⁴ | 8 |
| sliding-window/maximum-average-subarray | 1 ≤ k ≤ n ≤ 10⁵ | 6 |
| sliding-window/minimum-size-subarray-sum | 1 ≤ n ≤ 10⁵ | 12 |
| sliding-window/minimum-window-substring | 1 ≤ \|s\|, \|t\| ≤ 10⁵ | 17 |
| sliding-window/permutation-in-string | 1 ≤ \|s1\| ≤ \|s2\| ≤ 10⁴ | 12 |
| sorting/kth-largest-element | 1 ≤ k ≤ n ≤ 10⁴. | 9 |
| sorting/largest-number | 1 ≤ n ≤ 10⁴ | 5 |
| sorting/meeting-rooms-ii | 1 ≤ n ≤ 10⁴. | 6 |
| sorting/merge-intervals | 1 ≤ n ≤ 10⁴ | 4 |
| sorting/sort-an-array | 1 ≤ n ≤ 5·10⁴ | 10 |
| stacks/daily-temperatures | 1 ≤ n ≤ 10⁵ | 8 |
| stacks/evaluate-rpn | 1 ≤ tokens ≤ 10⁴ | 13 |
| stacks/largest-rectangle | 1 ≤ n ≤ 10⁵ | 6 |
| stacks/min-stack | ≤ 3·10⁴ operations | 8 |
| stacks/valid-parentheses | 1 ≤ n ≤ 10⁴ | 6 |
| strings/find-the-index | 1 ≤ lengths ≤ 10⁴ | 9 |
| strings/longest-common-prefix | 1 ≤ count ≤ 200 | 7 |
| strings/reverse-words | 1 ≤ n ≤ 10⁴ | 16 |
| strings/valid-anagram | 1 ≤ n ≤ 5·10⁴ | 7 |
| strings/valid-palindrome | 1 ≤ n ≤ 2·10⁵ | 30 |
| tries/longest-word-in-dictionary | 1 ≤ words.length ≤ 1000, 1 ≤ words[i].length ≤ 30, lowercase lette | 9 |
| two-pointers/container-with-most-water | 2 ≤ n ≤ 10⁵ | 9 |
| two-pointers/sort-colors | 1 ≤ n ≤ 300 | 7 |
| two-pointers/three-sum | 3 ≤ n ≤ 3000 | 6 |
| two-pointers/trapping-rain-water | 1 ≤ n ≤ 2·10⁴ | 12 |
| two-pointers/two-sum-ii | 2 ≤ n ≤ 3·10⁴ | 8 |

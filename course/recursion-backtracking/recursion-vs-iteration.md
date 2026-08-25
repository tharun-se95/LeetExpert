---
title: Recursion vs. Iteration
type: concept
---

## Two ways to repeat work

Anything you can compute with recursion you can compute with a loop, and
vice versa — they are equivalent in raw power. The choice between them is
not about what's *possible* but about what's *clear* and what's *safe*.
Recursion shines when a problem is naturally self-similar (trees,
divide-and-conquer, the choice trees of the last lesson): the code mirrors
the structure and the induction proof writes itself. Iteration shines when
the repetition is flat and, crucially, when the depth of the process could
get large — because recursion carries a hidden, bounded resource that a
loop doesn't: **the call stack**. This lesson is about that hidden cost,
when it forces you to convert recursion into an explicit-stack loop, and
one optimization (tail calls) that sounds like it should save you but
mostly doesn't in the languages you'll actually use.

## Recursion depth is real O(depth) auxiliary space

The last two lessons said it; this one makes it the headline. Every
un-returned recursive call keeps a stack frame alive. So a recursion that
descends to depth d has, at its deepest moment, **d frames on the stack
simultaneously** — that is **O(d) auxiliary space**, consumed by the
machinery of recursion itself, entirely separate from whatever data
structures your algorithm allocates.

This is the space cost people forget to count. Consider summing a linked
list recursively:

````tabs
```python
def sum_list(node: "Node | None") -> int:
    if node is None:          # base case: empty list sums to 0
        return 0
    return node.val + sum_list(node.next)   # one frame per node
```

```typescript
function sumList(node: Node | null): number {
  if (node === null) return 0; // base case: empty list sums to 0
  return node.val + sumList(node.next); // one frame per node
}
```
````

This looks like it uses no extra memory — no arrays, no hash maps. But it
descends one level per node, so on a list of n nodes it holds **n stack
frames** at the deepest point: **O(n) auxiliary space**, invisibly. The
iterative version is genuinely O(1):

````tabs
```python
def sum_list_iter(node: "Node | None") -> int:
    total = 0
    while node is not None:   # one reused frame, walk the pointers
        total += node.val
        node = node.next
    return total              # O(1) auxiliary space
```

```typescript
function sumListIter(node: Node | null): number {
  let total = 0;
  while (node !== null) {
    // one reused frame, walk the pointers
    total += node.val;
    node = node.next;
  }
  return total; // O(1) auxiliary space
}
```
````

```diagram
{
  "id": "call-stack-frames",
  "title": "recursive sum",
  "frames": [
    { "label": "sum(node1)" },
    { "label": "sum(node2)" },
    { "label": "sum(node3)" },
    { "label": "sum(null)", "detail": "base" }
  ],
  "compare": {
    "title": "iterative sum",
    "frames": [
      { "label": "one frame", "detail": "loop reuses locals" }
    ]
  },
  "caption": "depth-n recursion vs O(1) iteration"
}
```

When you write a complexity claim for a recursive function, the space
term must include the recursion depth. A recursive tree traversal is
**O(h)** space where h is the tree height, not O(1) — a fact that matters
enormously in Module 17, where a balanced tree gives h = O(log n) but a
degenerate (linked-list-shaped) tree gives h = O(n).

## When the depth limit forces your hand

The stack is not just costly, it is **bounded**. Runtimes cap recursion
depth to protect against runaway growth — CPython defaults to roughly
1000 nested calls before raising `RecursionError`; V8 (Node/browsers)
allows on the order of 10⁴ frames before `RangeError: Maximum call stack
size exceeded`. These are *small* numbers next to the size of real
inputs. A linked list of 100,000 nodes, or a pathologically unbalanced
tree of similar height, will blow the stack of the recursive `sum_list`
above **long before** it runs out of actual memory — the algorithm is
correct, uses modest total memory, and still crashes.

The fix when depth is the problem is to stop using the *call* stack and
use an **explicit stack** — a `list`/array you push and pop yourself —
running the traversal in a plain loop. Think of the call stack as one
small, fixed desk drawer that only ever holds a capped number of
folders — perfectly fine for a shallow pile, but it jams shut the
moment you try to force in the thousand-and-first folder, no matter how
much floor space the rest of the room has. An explicit stack is the
same pile of folders moved onto the floor instead: you're doing the
identical push-one-on, pop-one-off bookkeeping yourself, but now
you're limited only by how much floor the room actually has, not by
the size of one drawer. This converts O(depth) *call-stack* space
(capped, crash-prone) into O(depth) *heap* space (bounded only by real
memory, no artificial limit), and it's the standard move for iterative
tree traversals (Module 17) and any deep divide-and-conquer:

````tabs
```python
def sum_list_explicit(node: "Node | None") -> int:
    stack, total = [], 0
    while node is not None:       # push everything onto OUR stack
        stack.append(node.val)
        node = node.next
    while stack:                  # then process — no call-depth limit
        total += stack.pop()
    return total
```

```typescript
function sumListExplicit(node: Node | null): number {
  const stack: number[] = [];
  let total = 0;
  while (node !== null) {
    // push onto OUR stack, not the call stack
    stack.push(node.val);
    node = node.next;
  }
  while (stack.length) {
    // process — no call-depth limit
    total += stack.pop()!;
  }
  return total;
}
```
````

This particular example doesn't even need a stack (summation is
order-independent), but for tree traversals the explicit stack faithfully
reproduces the call stack's push/pop behavior — you're manually doing what
the runtime did for you, precisely to escape the runtime's depth cap. The
trade is real: the explicit-stack version is more code and less obviously
correct, so you reach for it when you *must* (depth could exceed the
limit), not by default.

## Tail calls: the optimization that mostly isn't there

There is a special case where recursion *could* run in O(1) stack space:
a **tail call** — a recursive call that is the *very last* action in the
function, with nothing left to do after it returns. In `sum_list`, the
call is **not** in tail position, because after `sum_list(node.next)`
returns you still have to add `node.val` to it — that pending addition is
why the frame must stay alive. Rewrite it so the running total is passed
*down* as an argument and the recursive call is the final act:

````tabs
```python
def sum_tail(node: "Node | None", acc: int = 0) -> int:
    if node is None:
        return acc                         # answer already fully accumulated
    return sum_tail(node.next, acc + node.val)   # tail call: nothing pending
```

```typescript
function sumTail(node: Node | null, acc: number = 0): number {
  if (node === null) return acc; // answer already fully accumulated
  return sumTail(node.next, acc + node.val); // tail call: nothing pending
}
```
````

In a language with **tail-call optimization (TCO)**, the compiler notices
there's nothing to do after the call and *reuses the current frame*
instead of pushing a new one — turning the recursion into a loop under
the hood, O(1) stack space, no overflow. Scheme, most Lisps, and some
functional languages guarantee this.

Here is the plain truth you must not oversell: **the mainstream languages
this course uses do not do TCO.** CPython does not (Guido van Rossum has
explicitly declined to add it, partly to keep tracebacks intact).
JavaScript engines *don't in practice* either — proper tail calls are in
the ECMAScript spec, but V8 (Node, Chrome) and most other engines never
shipped it, so you cannot rely on it. Java, C#, and most others: also no
(or not by default). So in Python and JavaScript, `sum_tail` above holds
just as many frames as `sum_list` and overflows on the same deep input —
rewriting to tail form buys you **nothing** for stack safety. Do not
convert a recursion to tail-recursive form expecting it to stop
overflowing; it won't. If depth is your problem, the real fix is the
**explicit-stack loop** from the previous section, not tail-call trickery.

## Choosing between them

```complexity
{
  "operations": [
    { "name": "recursion — space", "time": "O(depth)", "why": "one live stack frame per un-returned call; a depth-d descent holds d frames at once, on top of any data structures — and this is CAPPED (~1000 in CPython, ~10⁴ in V8)" },
    { "name": "iteration — space", "time": "O(1) control", "why": "a loop reuses a single frame; only your explicit data structures cost memory, with no artificial depth limit" },
    { "name": "explicit-stack conversion", "time": "O(depth) heap space", "why": "moves the depth cost from the capped call stack to the heap — same asymptotic space, but bounded by real memory instead of the runtime's ~10³–10⁴ frame limit, so it survives deep inputs" },
    { "name": "tail-call form in Python/JS", "time": "O(depth) — NO savings", "why": "CPython and V8 do not optimize tail calls, so tail-recursive code holds just as many frames and overflows identically; TCO helps only in languages that actually implement it" }
  ]
}
```

The decision rule: reach for **recursion** when the problem is naturally
self-similar (trees, backtracking, divide-and-conquer) *and* the depth is
safely bounded — a balanced tree of height O(log n) will never approach
1000 levels until n is astronomically large, so recursion is perfectly
safe there and far clearer. Reach for **iteration / an explicit stack**
when the depth could be large and input-controlled — long linked lists,
potentially-degenerate trees, or any recursion whose depth scales with n
rather than log n. And never reach for tail-recursive rewriting *as a
stack-safety fix* in Python or JavaScript, because those runtimes won't
honor it.

```quiz
{
  "questions": [
    {
      "question": "A function recursively sums a linked list: return node.val + sumList(node.next). It allocates no arrays or hash maps. Why is its auxiliary space O(n), not O(1)?",
      "options": [
        "Because the + operation allocates memory proportional to n — each addition of node.val to the accumulating result requires the runtime to allocate a new number object whose size scales with how large the sum has grown",
        "Because the recursion descends one level per node, so at the deepest point n stack frames are alive simultaneously — the call stack itself is O(n) auxiliary space, separate from any data structures the code allocates",
        "It is actually O(1); the claim of O(n) is a mistake — since no arrays or hash maps are ever created, the function's memory footprint stays flat regardless of how many nodes the list contains"
      ],
      "answer": 1,
      "explanation": "Stack frames are memory. Each recursive call to sumList suspends with a pending addition (node.val + ...), so its frame can't be freed until the deeper call returns — all n frames coexist at the bottom of the descent. That's O(n) space consumed by recursion itself. The iterative version reuses one frame and is genuinely O(1). Recursion depth must always be counted in a space analysis."
    },
    {
      "question": "You have a correct recursive tree traversal that crashes with 'maximum call stack size exceeded' on a large, deeply-unbalanced input, even though total memory use is modest. What is the appropriate fix?",
      "options": [
        "Rewrite it in tail-recursive form so Python/JS can optimize away the frames — restructuring the function so the recursive call is the last action lets these runtimes collapse the frames automatically, eliminating the depth cap entirely",
        "Increase the input size limit; the algorithm is simply wrong — a traversal that crashes on large inputs has a fundamental correctness defect, and the right fix is documenting a maximum supported input size rather than changing the code",
        "Convert it to an iterative traversal using an explicit stack (a list you push/pop yourself), moving the depth cost from the capped call stack to the heap, which is bounded only by real memory"
      ],
      "answer": 2,
      "explanation": "The crash is the runtime's depth cap (~1000 frames in CPython, ~10⁴ in V8), not real exhaustion — a shallow limit an input-controlled depth can exceed. An explicit stack reproduces the traversal in a loop with one reused frame, storing the pending work on the heap instead, so it survives arbitrarily deep inputs. Tail-recursive rewriting does NOT help here, because those runtimes don't optimize tail calls."
    },
    {
      "question": "Why is rewriting a recursion into tail-recursive form NOT a reliable way to prevent stack overflow in Python or JavaScript?",
      "options": [
        "Tail-recursive code is always slower, so it overflows sooner — the extra accumulator parameter threaded through each call adds enough overhead per frame that the stack fills up faster than the original non-tail-recursive version",
        "Tail-call optimization (reusing the current frame instead of pushing a new one) is only a benefit in languages that actually implement it — CPython deliberately doesn't, and mainstream JS engines like V8 never shipped it, so tail-recursive code still pushes one frame per call and overflows on the same deep inputs",
        "Tail recursion changes the function's output, so it can't be used as a drop-in replacement — restructuring the calculation to pass an accumulator downward alters the order operations happen in, which can produce a different final result"
      ],
      "answer": 1,
      "explanation": "TCO is a language-implementation feature, not a property of the code shape. Writing a call in tail position only pays off where the runtime recognizes and optimizes it (Scheme, most Lisps). In CPython and V8 the frame is pushed regardless, so tail form buys zero stack safety. Relying on it is a common overselling; the actual fix for depth is an explicit stack."
    }
  ]
}
```

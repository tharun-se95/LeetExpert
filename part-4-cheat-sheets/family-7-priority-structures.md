# Family 7 — Priority Structures Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## Stack

**Recognition:** nesting, matching parentheses, undo, decode string, calculator / RPN, simplify path  
**Complexity:** Time O(n) · Space O(n)  
**Data Structure:** LIFO stack (± aux min stack) — last plate on the pile comes off first  
**Difficulty:** Easy–Hard · **Interview Frequency:** Very High

### Template

```pseudo
stack = empty
for ch in s:
    if ch is opener: stack.push(ch)
    else:
        if stack empty or not match(stack.pop(), ch):
            return false
return stack is empty
```

### Common Questions

- Valid Parentheses · Min Stack · Decode String · Evaluate Reverse Polish Notation · Basic Calculator

### Common Mistakes

- Counts instead of a stack for interleaved bracket types
- Putting next-greater problems here (use Monotonic Stack)

---

## Queue

**Recognition:** FIFO stream, circular queue, moving average, recent calls, task arrival order  
**Complexity:** Time O(1) amortized enqueue/dequeue · Space O(k) for sized windows  
**Data Structure:** FIFO queue / circular buffer — first in line, first served  
**Difficulty:** Easy–Medium · **Interview Frequency:** Medium

### Template

```pseudo
q = empty queue; sum = 0
on next(val):
    q.enqueue(val); sum += val
    if q.size > k:
        sum -= q.dequeue()
    return sum / q.size
```

### Common Questions

- Implement Queue using Stacks · Moving Average from Data Stream · Design Circular Queue · Number of Recent Calls · Design Hit Counter

### Common Mistakes

- Front-delete on a dynamic array treated as O(1) when it is O(n)
- Confusing queue with priority queue / heap

---

## Heap / Priority Queue

**Recognition:** Top K, kth largest, K closest, merge K lists, running median, task scheduler  
**Complexity:** Time O(n log K) Top K · Space O(K) (+ O(n) counts if needed)  
**Data Structure:** Binary heap (min or max); often pair with hash map counts — always grab the current best  
**Difficulty:** Medium–Hard · **Interview Frequency:** Very High

### Template

```pseudo
# K largest: min-heap of size K
heap = empty min-heap
for x in arr:
    heap.push(x)
    if heap.size > K:
        heap.pop()
return heap          # or heap.peek() for kth

# Top K frequent: count with map, then heap-select by frequency
```

### Common Questions

- Kth Largest Element · Top K Frequent Elements · K Closest Points · Merge k Sorted Lists · Find Median from Data Stream

### Common Mistakes

- Full sort when a size-K heap is enough
- Max-heap vs min-heap confusion for K largest vs K smallest

---

## Monotonic Stack

**Recognition:** next greater / smaller, daily temperatures, stock span, largest rectangle in histogram  
**Complexity:** Time O(n) amortized · Space O(n)  
**Data Structure:** Stack of indices keeping a mono increasing/decreasing order  
**Difficulty:** Medium–Hard · **Interview Frequency:** High

### Template

```pseudo
stack = empty   # indices; maintaining monotone order
ans = array(n, default)
for i in 0..n-1:
    while stack not empty and breaks_mono(stack.top, i):
        j = stack.pop()
        ans[j] = answer_from(i, j)
    stack.push(i)
# drain remaining if needed
```

### Common Questions

- Next Greater Element I/II · Daily Temperatures · Online Stock Span · Largest Rectangle in Histogram · Maximal Rectangle

### Common Mistakes

- Storing values without indices when distance matters
- Wrong strict vs non-strict inequality for duplicates

---

## Trie

**Recognition:** prefix dictionary, autocomplete, replace words, word search II (trie + DFS)  
**Complexity:** Time O(L) per insert/search · Space O(total characters) with shared prefixes  
**Data Structure:** Tree of children maps / arrays + `is_end` flag — shared letter paths like a word treasure map  
**Difficulty:** Medium–Hard · **Interview Frequency:** Medium–High

### Template

```pseudo
# Node: children map, is_end bool
function insert(word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = new Node()
        node = node.children[ch]
    node.is_end = true

function search / startsWith(s):
    walk chars; return is_end / whether walk succeeded
```

### Common Questions

- Implement Trie · Design Add and Search Words · Replace Words · Word Search II · Design Search Autocomplete System

### Common Mistakes

- Forgetting `is_end` (prefix exists ≠ word exists)
- Building a trie when a hash set is enough (exact match only)

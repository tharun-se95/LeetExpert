# Family 2 — Pointer Movement Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## Two Pointers

**Recognition:** sorted pair sum, ends move inward, palindrome, container water, 3Sum, in-place partition  
**Complexity:** Time O(n) after optional O(n log n) sort · Space O(1)  
**Data Structure:** Two indices (opposite ends or slow/fast write)  
**Difficulty:** Easy–Medium · **Interview Frequency:** Very High

### Template

```pseudo
L, R = 0, n - 1
best = init
while L < R:
    best = improve(best, L, R)
    if should_move_left(L, R):
        L += 1
    else:
        R -= 1
```

### Common Questions

- Valid Palindrome · Container With Most Water · 3Sum · Two Sum II · Trapping Rain Water

### Common Mistakes

- Two pointers on unsorted pair-sum without sort or a hash map
- Moving the wrong side (say why that finger can still improve the answer)

---

## Sliding Window

**Recognition:** longest/shortest contiguous, at most K distinct, window sum, no-repeat substring  
**Complexity:** Time O(n) · Space O(Σ) for the alphabet / distinct keys  
**Data Structure:** Window `[L,R]` + running counts / constraint — like a growing/shrinking viewfinder  
**Difficulty:** Medium · **Interview Frequency:** Very High

### Template

```pseudo
L = 0
for R in 0..n-1:
    add(arr[R])                 # expand
    while window_invalid():
        remove(arr[L]); L += 1  # shrink
    update_best(L, R)
```

### Common Questions

- Longest Substring Without Repeating Characters · Minimum Window Substring · Fruit Into Baskets · Longest Repeating Character Replacement

### Common Mistakes

- Shrinking when you should only expand (or the reverse) for the constraint
- Treating subsequences as windows (a window must be contiguous)

---

## Fast & Slow Pointers

**Recognition:** cycle detect, find middle, happy number, kth from end (gap pointers)  
**Complexity:** Time O(n) · Space O(1)  
**Data Structure:** Two node references on a linked structure (one walks faster)  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
        return cycle_found
# no cycle; slow is middle if fast hit null
```

### Common Questions

- Linked List Cycle · Linked List Cycle II · Middle of the Linked List · Happy Number · Remove Nth Node From End

### Common Mistakes

- Null checks wrong on `fast.next` before `fast.next.next`
- Forgetting the second phase for cycle entrance (Floyd)

---

## Linked List Pointer Manipulation

**Recognition:** reverse, merge sorted lists, swap pairs, reverse k-group, reorder list  
**Complexity:** Time O(n) · Space O(1) iterative  
**Data Structure:** prev / curr / next (and splice pointers)  
**Difficulty:** Medium · **Interview Frequency:** High

### Template

```pseudo
# Reverse
prev, curr = null, head
while curr:
    nxt = curr.next
    curr.next = prev
    prev, curr = curr, nxt
return prev

# Merge two sorted
dummy = node(); tail = dummy
while l1 and l2:
    if l1.val <= l2.val: tail.next = l1; l1 = l1.next
    else:                tail.next = l2; l2 = l2.next
    tail = tail.next
tail.next = l1 or l2
return dummy.next
```

### Common Questions

- Reverse Linked List · Merge Two Sorted Lists · Swap Nodes in Pairs · Reverse Nodes in k-Group · Reorder List

### Common Mistakes

- Losing the `next` reference before rewiring
- Off-by-one when counting a k-group before reversing

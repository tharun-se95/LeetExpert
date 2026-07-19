# Family 1 — Linear Traversal Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## Arrays

**Recognition:** in-place, rotate, move zeroes, product except self, spiral / index walks  
**Complexity:** Time O(n) · Space O(1) extra  
**Data Structure:** Array + read/write index fingers  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
write = 0
for read in 0..n-1:
    if should_keep(arr[read]):
        arr[write] = transform(arr[read])
        write += 1
# optional: fill / clear arr[write .. n-1]
```

### Common Questions

- Move Zeroes · Rotate Array · Product of Array Except Self · Spiral Matrix · First Missing Positive

### Common Mistakes

- Off-by-one when filling the compacted tail
- Allocating O(n) when the follow-up wants O(1) extra space

---

## Hash Maps

**Recognition:** frequency, complement / pair sum, group by key, anagram, isomorphic  
**Complexity:** Time O(n) · Space O(n)  
**Data Structure:** Hash map (key → count / index / list) — labeled toy boxes  
**Difficulty:** Easy–Medium · **Interview Frequency:** Very High

### Template

```pseudo
map = {}
for i, x in enumerate(arr):
    if need(x) in map:
        return answer_from(map, i)
    map[x] = i          # or counts[x] += 1 / groups[sig].append(x)
```

### Common Questions

- Two Sum · Valid Anagram · Group Anagrams · First Unique Character · Subarray Sum Equals K _(also Prefix)_

### Common Mistakes

- Storing only "seen" when you need the index or count
- Using a map when a set is enough (pure "seen before")

---

## Hash Sets

**Recognition:** duplicate, unique, membership, intersection, longest consecutive  
**Complexity:** Time O(n) · Space O(n)  
**Data Structure:** Hash set (yes/no membership only)  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
seen = set()
for x in arr:
    if x in seen: return True   # or collect intersection / skip
    seen.add(x)
# consecutive: only start runs where x-1 not in set
```

### Common Questions

- Contains Duplicate · Intersection of Two Arrays · Longest Consecutive Sequence · Happy Number _(set of seen)_

### Common Mistakes

- Counting frequencies with a set (need a map)
- Sorting for uniqueness when an O(n) set check is enough

---

## Prefix Sum

**Recognition:** range sum, subarray sum equals K, pivot index, cumulative difference  
**Complexity:** Build O(n) · Query O(1) · Equals-K one-pass O(n)  
**Data Structure:** Prefix array ± hash map of prefix frequencies  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
prefix[0] = 0
for i in 0..n-1:
    prefix[i+1] = prefix[i] + arr[i]
# sum L..R = prefix[R+1] - prefix[L]

# equals K:
count = {0: 1}; running = 0; ans = 0
for x in arr:
    running += x
    ans += count.get(running - K, 0)
    count[running] = count.get(running, 0) + 1
```

### Common Questions

- Range Sum Query Immutable · Subarray Sum Equals K · Find Pivot Index · Contiguous Array

### Common Mistakes

- Off-by-one on inclusive bounds (`prefix[R+1] - prefix[L]`)
- Forgetting `count[0] = 1` for subarrays that start at index 0

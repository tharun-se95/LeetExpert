# Family 3 — Ordering & Search Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## Sorting

**Recognition:** sort then scan, rearrange / custom comparator, partition (Dutch flag), nearby duplicates after order  
**Complexity:** Time O(n log n) typical (+ O(n) scan); O(n) special partitions · Space O(1)–O(n)  
**Data Structure:** Array (± comparator); sometimes 3-way pointers  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
sort(arr, by key or comparator)
for i in 0..n-1:
    use order to update answer / merge / compare neighbors
# or Dutch partition: lo / mid / hi over a tiny key domain
```

### Common Questions

- Sort Colors · Largest Number · Merge Sorted Array · Wiggle Sort II · Sort Array By Parity

### Common Mistakes

- Sorting when a hash map already solves it in O(n)
- Custom comparator that is not a total order (Largest Number bugs)

---

## Binary Search

**Recognition:** sorted search, rotated sorted, first/last occurrence, first bad version, binary search on answer (Koko, split sum)  
**Complexity:** Time O(log n); answer-space O(f(n) log R) · Space O(1)  
**Data Structure:** Sorted index range or monotone answer range `[lo, hi]` — keep cutting the guess space in half  
**Difficulty:** Easy–Hard · **Interview Frequency:** Very High

### Template

```pseudo
# Sorted index space
lo, hi = 0, n - 1
while lo <= hi:
    mid = lo + (hi - lo) // 2
    if arr[mid] == target: return mid
    if arr[mid] < target: lo = mid + 1
    else: hi = mid - 1

# Answer space (minimize feasible value)
lo, hi = min_ans, max_ans
while lo < hi:
    mid = lo + (hi - lo) // 2
    if feasible(mid): hi = mid
    else: lo = mid + 1
return lo
```

### Common Questions

- Binary Search · First Bad Version · Search in Rotated Sorted Array · Koko Eating Bananas · Split Array Largest Sum

### Common Mistakes

- Off-by-one / infinite loop (`lo < hi` vs `lo <= hi` and mid updates)
- Binary search without sortedness or monotone feasibility

---

## Intervals

**Recognition:** merge intervals, insert interval, meeting conflict, non-overlapping removals, free time  
**Complexity:** Time O(n log n) sort + O(n) · Space O(n) output  
**Data Structure:** List of `[start, end)` sorted by start  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
sort intervals by start
merged = []
for intv in intervals:
    if merged empty or intv.start > merged[-1].end:
        merged.append(intv)
    else:
        merged[-1].end = max(merged[-1].end, intv.end)
```

### Common Questions

- Merge Intervals · Insert Interval · Meeting Rooms · Non-overlapping Intervals · Employee Free Time

### Common Mistakes

- Forgetting to sort first
- Using merge logic for **max concurrency** (need Sweep Line / heap of ends)

---

## Sweep Line

**Recognition:** events on a timeline, max concurrency / meeting rooms II, skyline, calendar conflicts at a point  
**Complexity:** Time O(n log n) · Space O(n) for events  
**Data Structure:** Sorted event list (± active counter / structure) — walk time left to right  
**Difficulty:** Medium–Hard · **Interview Frequency:** Medium–High

### Template

```pseudo
events = []
for each interval [s, e):
    events.append(s, +1)
    events.append(e, -1)
sort events by (time asc, ends before starts on ties)
cur = best = 0
for time, delta in events:
    cur += delta
    best = max(best, cur)
return best
```

### Common Questions

- Meeting Rooms II · The Skyline Problem · My Calendar I/III · Car Fleet

### Common Mistakes

- Wrong tie-break when one meeting ends as another starts
- Merging intervals when the question asks peak overlap count

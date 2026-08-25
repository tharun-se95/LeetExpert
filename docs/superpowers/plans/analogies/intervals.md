# Intervals — curriculum review + content-quality review

## Curriculum-designer review — one reordering accepted, one flawed justification rejected

Ran against the single concept-lesson source (Sorting Intervals & the Sweep)
plus all 5 problem lessons' worked-solution sections, explicitly instructed
to verify problem lessons self-teach before recommending any new concept
lesson.

- **Count, self-teaching:** confirmed 1 concept lesson + 5 problem lessons is
  right, and all 5 problem lessons self-teach their technique (each has its
  own "The insight" or equivalently-named derivation section).
- **Accepted (on independent merits): move Meeting Rooms to lead the
  problem set.** Meeting Rooms (a boolean "can everyone attend?" question)
  is a strictly simpler instance of the sweep skeleton than Insert Interval,
  Non-overlapping Intervals, or Burst Balloons — leading with it lets a
  learner meet the simplest possible application of the concept lesson's
  ideas first. Applied: manifest now orders Meeting Rooms → Insert Interval
  → Non-overlapping Intervals → Minimum Arrows to Burst Balloons → Employee
  Free Time.
- **Rejected: the reviewer's stated justification for that same move.** The
  review argued this was fixing "a major regression — Meeting Rooms
  (simpler) was ordered after Meeting Rooms II (harder, taught in Module
  14)," calling this "a major pedagogical step backward" and "redundant
  teaching effort." Checked against `course/intervals/meeting-rooms.md`
  directly: it contains an explicit section titled "Meeting Rooms vs.
  Meeting Rooms II — why the harder one needs more," proving the course
  deliberately revisits the simpler variant to teach a distinct lesson
  (matching machinery to the question a problem actually asks), not
  redundant repetition. The reordering itself still stands on its own
  simpler-first merit; the "regression" framing does not describe a real
  defect and was not used as the reason.
- **Rejected: new "Point Event sweep" concept/problem lesson.** Suggested to
  cover the counting-events variant (Meeting Rooms II's two-sorted-list
  approach) more directly. Out of scope for a content-quality pass — Meeting
  Rooms II already exists in Module 14 and covers this; a new lesson here
  would be genuine duplication, unlike the Meeting Rooms/Meeting Rooms II
  pair above which teaches distinct machinery-matching, not the same
  content twice.

## Content-quality review — verified additions, two tightening claims rejected

- **Concept lesson (Sorting Intervals & the Sweep):** added a sustained
  "shared movie screening room" analogy across three points in the lesson —
  introduced before the overlap-condition derivation (the touching-endpoint
  ambiguity as "does the room need a gap to reset"), and extended into the
  end-sort-greedy bullet ("book whichever showing lets the room out
  earliest next"). Also added a concrete, hand-verified adjacent-neighbour
  trace using `[1,3]`, `[5,8]`, `[10,12]` sorted by start, showing explicitly
  why `[10,12]` can never reach back to overlap `[1,3]` once `[5,8]` already
  couldn't (verified in Python: both the `a,b` and `a,c` overlap tests
  return `False` under `a.start<=b.end and b.start<=a.end`).
- **Employee Free Time:** added a note on the k-way-merge/heap alternative
  (each employee's schedule already arrives sorted, so a min-heap holding
  one "current" interval per employee gives `O(n log k)` instead of
  `O(n log n)`, `k` = number of employees) — genuinely the same trade-off
  Merge k Sorted Lists (Module 19) already walked through, worth naming as
  a callback even though the simpler flatten-and-sort approach is what the
  lesson teaches.
- **Rejected: "double-complexity restatement" tightening claim.** Flagged
  the concept lesson's complexity table as redundant with the prose
  derivation immediately above it. Checked: the prose derives *why* sort
  dominates sweep; the table is a structured summary a learner scans
  independently. Not blind duplication.
- **Rejected: "walk left-to-right" phrasing claim.** Flagged as vague/
  informal. Checked: the phrase is used consistently and precisely
  throughout the lesson and module (Module 14 lessons use identical
  phrasing) — changing it here would introduce an inconsistency, not fix
  one.
- **Rejected: derivation-gap claim on the disjoint-to-overlap negation.**
  Flagged the final inequality flip (`NOT(a.end < b.start)` →
  `a.end >= b.start`) as an unexplained step. Checked: this is a trivial
  boolean-negation identity (`not (x < y)` is `x >= y` for totally ordered
  values), already stated explicitly as "Apply De Morgan's law" one line
  above — spelling out the individual `<`-to-`>=` flip would be redundant
  with what a reader can verify in one glance.

Concept map hand-authored; media deferred to Phase 2.

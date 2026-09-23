# Landing page — speed-sensitive wheel paging

**Date:** 2026-09-20
**Scope:** `useSectionPaging` on the landing page (`/`) only. Supersedes the
wheel-paging paragraph of `2026-09-15-landing-product-page-design.md` §14 and
the "one step per wheel gesture" sentence in `CLAUDE.md`.
**Status:** owner decisions taken 2026-09-20 ("the scroll behaviour isn't
smooth, it should be scroll speed sensitive, it feels very sluggish").

---

## 1. Why this exists

The page pages section to section under `snap-mandatory`, because Chrome's
native snapping resolved a 300px wheel scroll back to the stop it left
(measured, recorded in `useSectionPaging.ts`). The hook that replaced it turns
one wheel gesture into one stop. The owner reports it as sluggish. Reading the
code, three separate causes:

1. **The lock never drains.** Every swallowed wheel event runs
   `lockedUntil = Math.max(lockedUntil, now + MOMENTUM_MS)`. A trackpad emits
   momentum events for 1–2s after the fingers lift, and each one pushes the
   lock 250ms further out, so the freeze outlasts `LOCK_MS` by the whole
   momentum tail. The timer meant to outlast momentum is fed by it.
2. **Nothing reads speed.** `pagingIntent` branches on `deltaY > 0` alone, so a
   4px nudge and a 600px flick are the same move.
3. **The lock outlives the animation.** `behavior: "smooth"` lands in roughly
   400–500ms in Chrome; `LOCK_MS` is 900ms, leaving the page dead for ~400ms
   after it has already arrived.

## 2. Decisions

**A flick travels the same distance, faster** (owner, 2026-09-20). One gesture
still moves exactly one stop; what scales with gesture speed is the travel
time. Travelling *further* on a hard flick was offered and declined: a reader
would fly past a feature before its text had typed, while the skipped
section's reveal still fired.

**Free scroll with snap-on-rest is not reconsidered.** That is the behaviour
already measured and rejected in Chrome.

## 3. How speed is read

`deltaY` is distance per event, not velocity, and the event *rate* differs by
an order of magnitude between a mouse notch (~100px, sparse) and a trackpad
(~1–10px, ~60/s). Speed is therefore accumulated over the gesture: total
absolute delta divided by elapsed time since the gesture's first event, in
px/ms.

**The first event does not wait to be measured.** It starts the travel
immediately at a neutral duration. Sampling before moving would add exactly
the latency this change exists to remove. Later events in the same gesture
raise the speed estimate and **shorten the remaining travel** — they never
re-target it, so the landing stop is fixed at the first event.

Duration curve, on the gesture's current px/ms:

| speed | duration |
| --- | --- |
| ≤ 0.6 px/ms (a notch, a slow drag) | 620ms |
| 3.0 px/ms and above (a hard flick) | 260ms |
| between | linear |

Neutral (first event of any gesture, before a rate is known): 560ms. The
bounds are a starting point, tuned by feel; the curve is a pure function so
retuning is one constant.

## 4. Coasting: telling a tail from a new push

The discriminator is the *shape* of the delta stream, not a fixed window.
Trackpad momentum decays monotonically once the fingers lift; a deliberate
push is a rising edge. After a stop lands, the hook is **coasting**: wheel
events are swallowed while their magnitude keeps falling, and coasting ends on
either

- a **rising edge** — a delta that exceeds the largest seen since coasting
  began by more than `RISE_RATIO` (1.15), which is a new push; or
- a **quiet gap** — `QUIET_MS` (120ms) with no wheel event at all.

A second flick during the tail therefore pages at once, where today it is both
swallowed and used to extend the freeze. `LOCK_MS` and `MOMENTUM_MS` are
deleted.

Noise guard: deltas below `TAIL_FLOOR` (2px) neither release coasting nor
count toward speed. A dying tail crosses 1px repeatedly and must not read as a
rising edge.

## 5. Travel, and the snapping conflict

The duration has to be ours, so `behavior: "smooth"` (fixed, unreadable
duration) is replaced by a `requestAnimationFrame` tween over `main.scrollTop`
with an ease-out cubic.

**`scroll-snap-type: y mandatory` on `<main>` fights a hand-run tween**: each
assignment to `scrollTop` is a scroll the browser may re-snap. The tween
therefore sets `main.style.scrollSnapType = "none"` on its first frame and
clears the inline value on its last, returning the element to the class-driven
`snap-y snap-mandatory` from `AppShell`. The tween lands exactly on a stop, so
restoring snapping is a no-op in the normal case; it matters when the tween is
interrupted (unmount, a page hidden mid-travel), which must not leave the page
unsnapped.

**Direction reversal mid-travel is ignored.** A gesture that overshoots must
not whiplash the page backwards. Opposite-direction events are swallowed until
the travel ends and coasting resolves.

## 6. Unchanged

- `pagingIntent`'s `native` / `stepped` decision, and `scrollsInside`.
- Reduced motion: still an instant jump, no tween, no coasting delay.
- Keyboard, touch and everything below `lg` — still the browser's own snapping.
- The reveal and typing choreography (`useActiveSection`, `useRevealProgress`):
  each section is still visited one at a time, so nothing there changes.

## 7. Units

| Unit | Responsibility | Depends on |
| --- | --- | --- |
| `lib/landing/wheelGesture.ts` | Pure state machine: `stepWheel(state, {deltaY, now}) → {state, action, durationMs}`, where action is `start` / `shorten` / `hold`. Owns speed, the duration curve, coasting and the rising-edge test. | nothing |
| `components/landing/useSectionPaging.ts` | DOM wiring: measure sections, ask `pagingIntent` whether this is a page move at all, suspend snapping, run the tween. Keeps `pagingIntent` and `scrollsInside`. | `wheelGesture`, `useSectionReveal` |

The state machine is pure and clock-injected (`now` is a parameter), so every
timing rule in §3 and §4 is unit-testable without a browser or fake timers.

## 8. Testing

`web/tests/landingPaging.test.ts` gains, over `stepWheel`:

- a monotonically decaying tail stays held for its whole length;
- a delta rising past `RISE_RATIO` releases and pages;
- `QUIET_MS` of silence releases;
- sub-`TAIL_FLOOR` noise neither releases nor moves the speed estimate;
- duration falls as px/ms rises and clamps at both ends;
- a later event in a gesture shortens but never re-targets;
- opposite-direction events during travel are held.

Existing `pagingIntent` and `scrollsInside` tests stay as they are. Per §2 of
`CLAUDE.md`, each new assertion is run against a deliberate fault to prove it
can fail.

Wheel *feel* is not verifiable from a headless browser — real trackpad inertia
and event cadence are hardware, and synthetic wheel events do not reproduce
them. The change is therefore reported as: unit-tested, `tsc`/`eslint`/
`vitest`/`build` green, and handed to the owner to scroll. That limit is stated
rather than papered over.

## 9. Documentation to update in the same change

- `CLAUDE.md`: "moves one step per wheel gesture in a stepped section (never
  native)" becomes one step per gesture at a speed-scaled duration, with the
  coasting rule.
- `2026-09-15-landing-product-page-design.md` §14: a pointer to this spec.

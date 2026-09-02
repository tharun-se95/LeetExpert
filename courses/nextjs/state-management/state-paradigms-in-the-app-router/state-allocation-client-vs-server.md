---
title: "State Allocation (Client vs. Server)"
practiceFormat: null
depth: essential
---

## The question that comes before any state-management library choice

"Should I use Zustand, Redux, or Context?" is the wrong first question.
The right first question is: **where does this specific piece of state
actually belong** — and in an App Router application, "the client" is
only one of several legitimate answers.

## The real options, not just client vs. client-library

- **The database** — state that must persist beyond a single session and
  be consistent across every device a user might use: their saved
  preferences, their data records. This isn't "client state slowed
  down" — it's state that was never a client-side concern in the first
  place.
- **The URL (`searchParams`)** — state that describes *what the user is
  currently looking at* and that a shareable link should reproduce: an
  active filter, a search query, a pagination page number. The next
  lesson in this chapter builds directly on treating the URL itself as a
  state store.
- **Cookies** — state that needs to persist across page loads without
  living in a database, and that the server needs to read on the very
  first request (a theme preference, a session token) — something a
  purely client-side store can't provide, since it doesn't exist until
  client JavaScript has run.
- **Actual client state** — genuinely ephemeral, component-local
  interaction state that has no meaning outside the current browser tab:
  whether a dropdown is open, an in-progress unsaved form draft, a hover
  state.

## Why misallocating this causes real bugs, not just style complaints

Putting something that should be a URL param into client-only state
means a user can't share a link to their current filtered view, and a
page refresh silently resets it — a real, visible product defect, not an
aesthetic preference. Putting something that should live in the database
into client-only state means it evaporates the moment the tab closes.
The pattern is consistent: state allocated to the wrong layer doesn't
fail loudly — it fails as a subtly broken user experience that looks
like a bug report, not a stack trace.

## Why this lesson sets up the rest of the module

Every remaining lesson in this module is really an implementation detail
of one of these four allocation choices — global client stores for
genuine client state, RSC-to-client boundary passing for server-sourced
values a client component needs, and URL-as-state for shareable UI
configuration. Getting the allocation decision right first is what makes
each of those implementations actually correct rather than just
syntactically valid.

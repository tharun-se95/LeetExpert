---
title: "React's Server-Side Evolution"
practiceFormat: null
depth: essential
---

## Why this lesson exists

Almost every Next.js interview question — "explain the App Router," "why
does this hydration error happen," "when would you use ISR instead of
SSR" — assumes you already understand *why* rendering strategies exist
at all. If you skip straight to memorizing what SSR and SSG stand for,
you'll be able to define them but not reason about them under pressure.
This lesson builds the actual mental model, from first principles, so
everything later in this module has somewhere to attach.

## The problem client-side rendering was built to solve

Picture the earliest style of React app: a single, nearly empty HTML file
and one big JavaScript bundle. The browser downloads that HTML, sees
almost nothing in it — usually just a `<div id="root"></div>` — then
downloads and runs the JavaScript bundle, which is what actually builds
the page by injecting content into that empty div. This is **Client-Side
Rendering (CSR)**.

CSR was a genuine breakthrough for a specific problem: building rich,
app-like interactivity without reloading the whole page on every click.
Once the JavaScript takes over, navigating between "pages" can feel
instant, because you're not waiting on a full server round-trip — you're
just re-rendering parts of a page that's already loaded.

But CSR has a cost that's easy to underestimate until you've felt it: the
browser has to do *everything* before the user sees anything. Download
the HTML shell. Download the JavaScript bundle. Parse and execute that
bundle. Only then does the page's actual content exist. On a fast laptop
with a fast connection, that gap might be barely noticeable. On a mid-tier
phone on a mediocre connection, the user can be staring at a blank white
screen for several seconds — and a completely blank screen is worse than
a plain, boring one, because a blank screen gives no signal that anything
is happening at all.

There's a second cost, less visible but just as real: **search engines
and other automated crawlers historically had a much harder time with
CSR.** A crawler that only reads the initial HTML response sees that same
near-empty `<div id="root"></div>` — the actual content only exists after
JavaScript runs, and not every crawler executes JavaScript the way a
browser does. For any page whose business model depends on being found
(a blog, a product listing, a marketing site), that's a serious problem,
not a minor inconvenience.

## The first fix: render the HTML on the server

The direct fix for both problems — the blank-screen delay and the
crawler-visibility problem — is to not make the browser build the page
from nothing. Instead, **build the actual HTML on a server, before it's
ever sent to the browser**, so the very first response already contains
real, visible content.

This is the idea behind **Server-Side Rendering (SSR)**: on every
request, a server runs your React components, produces the resulting
HTML string (with real content already in it, not an empty div), and
sends *that* to the browser. The user sees content immediately, before
any JavaScript has even been downloaded. Crawlers reading the raw HTML
response see the same real content a human would see.

SSR doesn't eliminate JavaScript — the page still needs to become
interactive (more on exactly how in the next lesson's coverage of
hydration). What SSR changes is the *order* of operations: content first,
interactivity second, instead of interactivity being a prerequisite for
content to exist at all.

```warn
**The trade-off SSR introduces:** because the server does real work —
running your component code — on *every single request*, that work costs
time on every request. If the underlying data barely changes (think: a
blog post published last month, a marketing page, a documentation
article), you're paying that same rendering cost over and over for
content that's identical every time.
```

## The second fix: do the rendering once, ahead of time

That observation — "why redo work whose result doesn't change?" — leads
directly to **Static Site Generation (SSG)**. Instead of running your
React components on the server for every incoming request, SSG runs them
*once*, at build time, and saves the resulting HTML as a plain static
file. When a real request comes in, the server doesn't render anything at
all — it just hands back the file it already prepared, the same way a web
server has always served a `.html` file.

This is faster than SSR in the way that matters most for a static file:
there's no per-request rendering cost, because there's no per-request
rendering at all. It's also cheaper to run at scale, since serving a
static file is far less work than executing component code on every hit.

```warn
**The trade-off SSG introduces** is the mirror image of SSR's: the
content is now locked in at build time. If the underlying data changes —
a price updates, a typo gets fixed, new content gets published — that
change won't show up until the site is rebuilt and redeployed. For
content that truly never changes, that's a non-issue. For content that
changes occasionally but not on every request, it's a real limitation
SSG on its own can't solve.
```

This is exactly the gap Incremental Static Regeneration (a topic in the
next module) exists to close, letting a statically-generated page get
quietly refreshed in the background without a full rebuild.

## Why none of this is really about "which one is best"

It's tempting to rank these — SSG fastest, SSR most flexible, CSR most
interactive — but that framing misses the actual point, and it's the
point interviewers are usually probing for.

```brain
These aren't competing technologies where one wins. They're different
answers to the same underlying question: given this specific piece of
content, **when is the best time to do the work of turning your
components into HTML?**
```

- If the content is identical for everyone and rarely changes: do the
  work once, at build time. That's SSG.
- If the content depends on the specific request (a logged-in user's
  dashboard, a page that must always reflect the current moment) or
  changes too often to pre-build: do the work on each request. That's
  SSR.
- If the content is genuinely driven by client-side state after the page
  has loaded (a live chart updating from a WebSocket, a modal that opens
  based on a click) with no server involved at all: that piece stays
  client-rendered. That's CSR, and it's still the right tool for that
  specific job — this lesson isn't arguing CSR was a mistake, only that
  it can't be the *only* tool.

A real Next.js application almost always uses more than one of these at
once, at different points in the same page or across different routes.
The skill this module is building toward isn't "know the definitions" —
it's "look at a piece of content and correctly reason about which
strategy fits it, and why the other two don't fit as well." The next
lesson picks this up from a different angle: why the way React
frameworks were *structured* around these strategies (the Pages Router)
eventually ran into its own limits, and what the App Router changed to
address them.

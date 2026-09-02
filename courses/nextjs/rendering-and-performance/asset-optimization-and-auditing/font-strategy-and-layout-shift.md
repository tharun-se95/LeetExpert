---
title: "Font Strategy & Layout Shift"
practiceFormat: trace
depth: essential
---

## The specific shift a custom font causes

Before a custom web font finishes downloading, the browser has to render
text using *something* — either an invisible placeholder (a "flash of
invisible text") or a fallback system font (a "flash of unstyled text").
When the real font finally loads and swaps in, if its character widths
and line heights differ from whatever was showing before, visible text
**reflows** — headlines shift position, paragraphs re-wrap. That's a
directly measurable CLS event, not just a cosmetic annoyance.

## Why `next/font` addresses this at the source

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

`next/font` downloads and self-hosts the font file at build time — no
runtime request to an external font CDN, which removes both a network
round-trip and a third-party dependency from the critical rendering
path. More specifically for CLS: it automatically calculates fallback
font metrics that closely match the real font's sizing, so the
system-font placeholder occupies nearly the same space the real font
will need — minimizing the visible reflow when the swap happens, rather
than eliminating the swap itself.

## What actually causes the shift, precisely

```warn
The failure mode this lesson's drill is built around is a fallback
font whose character widths meaningfully diverge from the loaded
custom font's — the swap still happens (that's expected and often
unavoidable), but the reflow it causes is large and visible rather than
negligible. Spotting this in a rendering trace means correlating the
visual jump with the exact moment a font-loaded event fires, then
tracing that back to a fallback-metrics mismatch rather than assuming
the swap itself is the irreducible problem.
```

## What the practice drill is testing

**Practice (Trace-the-Execution):** you'll be shown a rendering trace
exhibiting a flash-of-unstyled-text layout shift and asked to identify
the exact moment the shift occurs, correlate it to the font swap, and
apply the correct `next/font` fallback configuration to minimize it.

## Try it

```
[0ms]    Page painted with fallback font (Arial)
[340ms]  Custom font "Inter" finishes loading
[341ms]  Font swap — headline reflows, CLS +0.18
```

Current setup:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

Why does a 0.18 CLS event happen at the swap, and what would reduce it?

````reveal Work through it
The swap at `[341ms]` is expected — `next/font` doesn't eliminate the
swap itself, only the network request for the font file (it's
self-hosted, so there's no external CDN round-trip). A visible 0.18 CLS
at swap time means the fallback font's character widths meaningfully
diverge from Inter's actual metrics, so text reflows noticeably when the
real font takes over.

```tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});
```

`next/font` automatically calculates adjusted fallback metrics to more
closely match the real font's sizing — explicitly listing appropriate
fallbacks helps it pick a closer match, minimizing the reflow the swap
causes even though the swap itself still happens.
````

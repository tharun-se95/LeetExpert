---
title: "Image Asset Optimization"
practiceFormat: sandbox
depth: essential
---

## Why a plain `<img>` tag is a performance liability by default

A raw `<img src="/hero.jpg">` ships the image at whatever resolution the
file happens to be, with no automatic resizing for the viewer's actual
screen, no modern-format conversion, and no hint to the browser about
loading priority. On a real production site with real images, this adds
up directly against the LCP and CLS metrics from two lessons ago.
`next/image` exists specifically to close this gap automatically.

## The core properties and what each one buys you

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Product hero shot"
  width={1200}
  height={630}
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

- **`width`/`height`** — required for a non-fill image; Next.js uses
  these to reserve the correct aspect-ratio space in the layout *before*
  the image finishes loading, directly preventing the CLS that an
  unsized `<img>` causes when it pops in and shifts surrounding content.
- **`priority`** — marks this image as one that should load immediately
  and skip lazy-loading, appropriate for an above-the-fold LCP candidate
  like a hero image. Misapplying `priority` to every image on the page
  defeats its purpose — it should be reserved for the one or two images
  that are actually the LCP element.
- **`sizes`** — tells the browser which of the automatically-generated
  responsive image variants to request for a given viewport width, so a
  mobile visitor doesn't download a desktop-resolution image unnecessarily.
- **`placeholder="blur"`** — shows a low-resolution blurred preview while
  the full image loads, improving perceived load experience without
  affecting CLS, since the placeholder occupies the same reserved space.

## The judgment call the practice drill is built around

The mechanical API is straightforward to read about; correctly deciding
which images on a real page deserve `priority`, and setting `sizes` to
match actual responsive breakpoints rather than leaving it at a
one-size-fits-all default, is where real understanding shows.

## What the practice drill is testing

**Practice (Semi-Constrained Sandbox):** you'll refactor a media-heavy
page's plain `<img>` tags into `next/image`, correctly setting
dimensions, marking the genuine LCP candidate with `priority`, and
configuring `sizes` for real responsive breakpoints.

## Try it

Convert this hero image — the largest visible element on the page — to
`next/image`, sized correctly and with the right loading priority.

```scratchpad image-asset-optimization
<img src="/hero.jpg" alt="Product hero shot" />
```

````reveal Work through it
```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Product hero shot"
  width={1200}
  height={630}
  priority
  sizes="100vw"
/>
```

`width`/`height` reserve the correct layout space before the image
loads, preventing CLS. `priority` is warranted specifically because this
*is* the LCP candidate — marking every image `priority` would defeat its
purpose by telling the browser everything is equally urgent. `sizes`
tells the browser which responsive variant to request; `100vw` is
appropriate here since a full-width hero occupies the entire viewport
width at every breakpoint.
````

# DSA Pattern Handbook — Web App

Interactive Next.js reader for the handbook markdown sources in the parent
folder. Renders Mermaid diagrams, multi-route navigation, dark/light mode,
print-to-PDF export, and the **Visual Lab** layer (PatternLab stages, demos,
constellation home, decision / Big-O observatories, poster cheat sheets).

## Visual Lab

Every pattern page mounts a **PatternLab** stage above the markdown:

- Family-colored theater (see `src/lib/visual/familyTheme.ts`)
- Museum analogy SVG + kid-simple caption (`analogies.ts` + `MotifMark`)
- Step-through demo from `demoRegistry` (Back / Step / Reset / speed)
- Reduced-motion jumps to `StaticFrame`

Demos live under `src/components/lab/demos/`. Registry keys are
`{familyId}/{patternSlug}` matching `manifest.ts`.

Explorers:

- `/` — Constellation journey + family portals
- `/decision-trees` — playable Decision Observatory
- `/foundations/big-o` — Big-O Observatory scrubber
- `/cheat-sheets/[family]` — museum poster grid

Print still hides interactive players (`print:hidden`); use chapter prose +
Mermaid for PDF.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `npm run dev`   | Local development server                                    |
| `npm run build` | Production build (static generation of all handbook routes) |
| `npm run start` | Serve the production build                                  |
| `npm run lint`  | ESLint                                                      |

## Content source

Markdown is read at build/request time from the parent handbook root
(`../part-1-foundations`, `../part-2-pattern-families`, …). The web app does
**not** copy or modify those files. Route/slug mapping lives in
`src/lib/content/manifest.ts`.

## Export PDF

Two options:

1. **Current page** — click **Export PDF** in the top bar (uses `window.print()`
   with a print stylesheet that hides nav and formats A4/Letter).
2. **Full handbook** — open [`/print`](http://localhost:3000/print) (also
   reachable via `/pdf`), then **Print / Save as PDF**. Choose “Save as PDF”
   in the browser print dialog. Chrome or Edge recommended; turn on
   “Background graphics” if Mermaid diagrams look washed out.

## Design notes

- Geist Sans / Geist Mono via the `geist` package
- Chrome UI accent stays Vercel blue (`#0070f3`); families use craft palettes
  (teal / copper / cobalt / iris / gold / sea / rose) on stages and ports
- Motion via `motion` with reduced-motion fallbacks
- Mobile hamburger sidebar, sticky on-page TOC on wide screens
- Visited chapter progress stored in `localStorage` (constellation + portals)

## Key routes

| Route                                            | Content                 |
| ------------------------------------------------ | ----------------------- |
| `/`                                              | Overview + family cards |
| `/foundations/[slug]`                            | Part 1 chapters         |
| `/patterns/[family]`                             | Family overview         |
| `/patterns/[family]/[pattern]`                   | Individual pattern      |
| `/recognition`, `/recognition/stems`             | Part 3                  |
| `/cheat-sheets/[family]`                         | Part 4                  |
| `/practice/[family]`                             | Part 5                  |
| `/glossary`, `/decision-trees`, `/question-bank` | Reference               |
| `/print`                                         | Concatenated print view |

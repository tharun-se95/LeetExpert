# Neon Depth — visual system for DSA pattern videos

**Status:** approved, ready for implementation
**Supersedes:** brutalist/papercut system (`video/src/lib/brutalist.tsx`) as the
default for new videos. Existing rendered videos (ch01, family7, family3-sorting)
are NOT being redone — this applies going forward only.

## Why

Two prior systems were built and shipped: a dark "cinematic" glass-panel look
(ch01) and a brutalist paper-cutout look (family7, family3-sorting). The user
asked to explore whether either was the right long-term direction, specifically
stress-testing against **abstract/structural** topics (recursion, graphs, trees)
and not just tangible/countable ones (stacks, arrays).

Working through a visual-companion comparison (CSS mockups of Brutalist /
Blueprint Technical / Cinematic Glass, then three more original swings —
Circuit-PCB, Constellation, Retro-Terminal) the user rejected all of them in
favor of a specific reference image: a dark, neon-glow, dimensionally-lit
"data structures visualized through motion" style with a real multi-color
palette, glassy 3D blocks, glowing nodes, and code-synced panels.

The open question was whether the "3D" in that reference was achievable, and
whether it would hold up for structural topics. Two real Remotion prototypes
(not CSS mockups) were built and rendered to answer this directly:

1. **Stack test** (`video/src/compositions/style-test-three/`) — 4 glossy
   cubes stacked, one active/glowing. Validates the tangible case.
2. **Recursion tree test** (`video/src/compositions/style-test-tree/`) — 5
   glowing spheres in a call tree, connected by glowing edges, with
   **recursion depth mapped to literal Z-axis depth** so deeper calls
   visibly recede via real perspective.

Both rendered successfully with genuine dimensional lighting (real bevels,
specular highlights, perspective size falloff) that CSS could not
convincingly fake in the same session. The recursion test in particular
proved the thesis: real 3D gives structural topics something 2D literally
cannot — depth as a spatial metaphor for depth as a concept.

**Decision: build the real system on this foundation.**

## Scope

This system is the default for new DSA topic videos. Per-topic decisions
(which structure gets a 3D treatment vs. a flat 2D treatment) are covered
below in "When to reach for 3D."

## Visual language

### Palette

Multi-color, not single-accent (this is the key departure from the brutalist
system's one-accent-per-video rule):

| Role | Hex | Used for |
|---|---|---|
| Background | `#070a10` | canvas/page background (near-black navy, not pure black) |
| Cyan | `#00e6ff` | default "structure" accent — trees, graphs, pointers, general active state |
| Purple | `#7c4dff` | stacks specifically, and a secondary accent |
| Orange | `#ffbb00` | highlighted/active index or "current" marker (cross-cutting, like the brutalist accent used to be) |
| Green | `#00f0a1` | O(1) / success / best-case complexity |
| Pink | `#ff4d6d` | O(n²) / worst-case complexity, danger states |
| Muted text | `#c7d2e0` | inactive labels |
| Muted structure | `#22304a` / `#2c3c56` | inactive node/cube base color |

**Rule carried over from the brutalist critique that started this
exploration:** don't scatter all five accent colors into one scene. Each
*structure type* gets one dominant hue (stacks = purple, trees/graphs =
cyan) rather than mixing purple+cyan+orange+pink in a single shot. Orange,
green, and pink are reserved for cross-cutting semantic meaning (current
index, complexity tier) that appears consistently across every video,
not per-structure decoration.

### Typography

- **Space Grotesk** (`@remotion/google-fonts/SpaceGrotesk`, already used by
  the brutalist system — reuse the loader) — headings, labels, node/cube text.
- **Fira Code** (new — needs `@remotion/google-fonts/FiraCode`) — code
  snippets, tags, complexity annotations, anything meant to read as "the
  developer's language."

### Lighting recipe (validated, copy from prototypes)

Both prototypes converged on the same working light rig after iteration.
Reuse this as the starting point for every 3D scene rather than re-deriving
it:

```
<hemisphereLight args={[skyColor, "#05070c", 1.6-1.8]} />
<ambientLight intensity={1.5-1.6} />
<directionalLight position={[3, 6, 5]} intensity={2-2.4} color="#ffffff" />
<pointLight position={cameraPosition} intensity={55-90} color="#ffffff" distance={20-26} />
<pointLight position={accentPosition} intensity={16-30} color={accentHex} distance={10-12} />
```

Key lessons baked into these numbers:
- **Ambient/hemisphere must be pushed much higher than intuition suggests**
  (1.5+, not 0.3-0.6) or inactive/non-hero elements render near-black.
  Emissive-lit "active" elements stay readable regardless because they
  self-illuminate; everything else depends on this fill light.
- **Limit to 2 point lights, not 3+.** More lights each cast their own
  specular highlight, producing a "glittery" multi-dot look on glossy
  spheres instead of one clean highlight. `roughness` around 0.35-0.42
  (not 0.2-0.25) also softens this.
- **A point light co-located with the camera** is what makes front-facing
  surfaces read at all from the viewer's angle — don't rely on the
  directional key light alone.

### Material recipe

```
<meshPhysicalMaterial
  color={active ? <bright variant> : <muted variant>}
  roughness={active ? 0.22-0.3 : 0.35-0.42}
  metalness={0.08-0.15}
  clearcoat={0.5-0.7}
  clearcoatRoughness={0.1-0.35}
  emissive={active ? accentHex : mutedHex}
  emissiveIntensity={active ? 0.9-1.3 : 0.35-0.7}
/>
```

Inactive elements still need `emissiveIntensity` around 0.6-0.7 (not near
0) or they disappear against the dark background even with strong ambient
light.

### Camera

- Tangible/stack-shaped content: a modest 3/4 angle (`position=[x, y, z]`
  with the camera pulled back far enough that fov can stay 35-40° — pulling
  the camera close and cranking fov wide distorts the blocks). Explicit
  `PerspectiveCamera` with `onUpdate={(cam) => cam.lookAt(...)}` is
  required — the ThreeCanvas default camera does not frame content usefully
  and must always be overridden.
- Structural/recursive content: camera positioned to look *into* the scene
  along the Z-axis where depth = the concept being explained (recursion
  depth, graph distance). This is the scene type where 3D earns its keep —
  lean into it with camera angles that make the recession obvious, not a
  flat front-on view.

### Labels: always 2D HTML overlay, never 3D text

`@react-three/drei`'s `<Text>` (troika-three-text) was tried and dropped —
it depends on a network font fetch that's a reliability risk in headless
render, and positioning/visibility was inconsistent. **Text is always a 2D
`AbsoluteFill` overlay positioned in screen-space over the `ThreeCanvas`**,
matching each node/cube's *rendered* position.

This means label positions must be computed or hand-calibrated against the
actual camera/projection, not guessed from the 3D coordinates directly —
in both prototypes, initial label placement guessed from world coordinates
was wrong and had to be corrected by reading pixel positions off a rendered
still. For a static camera (no camera motion in a scene), hand-calibrated
percentages are fine. If a scene ever needs camera movement, this will need
a real world-to-screen projection helper instead of hardcoded percentages —
not needed yet, flagging for future scope.

## When to reach for 3D vs. 2D

3D (`@remotion/three`) is for the elements where **spatial depth is part of
the concept**: stacks (height = recency), trees/graphs (depth/distance =
traversal progress), anything where "how far into this structure am I"
is the thing being taught.

Stay in 2D (HTML/SVG, same techniques as the brutalist system) for: text,
tags, code panels, complexity bars, chapter marks, outro cards, and any
structure where depth isn't the point (a flat array being scanned
left-to-right doesn't need a Z-axis).

Most scenes will composite both: a `ThreeCanvas` background layer for the
dimensional structure, an `AbsoluteFill` HTML layer on top for labels/tags/
code. This mirrors exactly how both prototypes are built.

## Technical setup (already done, documented here for the next session)

- Installed: `@remotion/three`, `three`, `@react-three/fiber`,
  `@react-three/drei`. All `@remotion/*` packages bumped to `4.0.491` to
  satisfy `@remotion/three`'s peer requirement.
- `video/remotion.config.ts` now sets
  `Config.setChromiumOpenGlRenderer("angle")` — **required** for WebGL to
  render in headless Chromium. Without it, render fails with
  `THREE.WebGLRenderer: Error creating WebGL context.`
  This was flagged as a deliberate risk/complexity tradeoff in the original
  ch01 handoff notes (which is why `@remotion/effects` etc. were skipped
  back then) — accepted now because the user explicitly wants real 3D and
  both test renders succeeded cleanly with this config.
- Two throwaway test compositions are registered in `video/src/Root.tsx`
  (`style-test-three`, `style-test-tree`) purely for this validation. They
  should be **removed from `Root.tsx`** once the real component library
  exists (their code can stay as reference or be deleted — see Open
  Questions).

## Component plan (next implementation step)

New shared lib, parallel to `video/src/lib/brutalist.tsx`:

- `video/src/lib/neon-theme.ts` — palette constants, matching `BRUTAL` in
  the existing theme file.
- `video/src/lib/neon3d.tsx` — reusable Three.js primitives: `Cube3D`,
  `Node3D` (sphere), `Edge3D` (glowing line), a `SceneLights` component
  wrapping the validated light rig, `SceneCamera` helper for the two camera
  patterns (tangible vs. structural).
- `video/src/lib/neon2d.tsx` — 2D overlay primitives: label component,
  `BrutalTag`-equivalent chip, code-snippet panel, complexity bar, chapter
  mark, outro card — same shapes as the brutalist system's lib, restyled to
  this palette/typography.

This mirrors the existing `lib/brutalist.tsx` + per-chapter `bits.tsx`
pattern already proven across ch01/family7/family3-sorting — reusing the
architecture, not reinventing it.

## Decisions locked for implementation

1. **Delete `style-test-three` / `style-test-tree`** (and their `Root.tsx`
   registrations) once their working values have been extracted into
   `neon3d.tsx`. They're scratch validation code, not reference examples to
   keep around — dead example code isn't free to maintain either.
2. First real video in this system follows the same process already
   validated in `feedback_video_production_speed.md`: script written to
   full depth on the first pass, anchors chosen at ch01 cadence up front,
   one voice generation, one transcription, self-QA stills pass before
   declaring done. Only the visual layer changes.
3. Voice/script approach is unchanged (eleven_v3, Scribe word-sync,
   ch01-cadence anchors) — this spec is visual-system-only.

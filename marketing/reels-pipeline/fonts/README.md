# Fonts for the Instagram builders

`carousel/glyphs.py` declares these for `carousel/cheatsheet.py`, `carousel/reelslides.py` and
`looks/looks.py`, on top of the course's own Latin subsets in `web/lesson-artifacts/fonts/`.
`carousel/render.mjs` fails if any text on a slide is drawn by a system font (#152).

| File | From | Licence |
| --- | --- | --- |
| `SpaceGrotesk-symbols.woff2` | google/fonts `ofl/spacegrotesk/SpaceGrotesk[wght].ttf`, subset | OFL 1.1, `SpaceGrotesk-OFL.txt` |
| `SpaceMono-400-symbols.woff2`, `SpaceMono-700-symbols.woff2` | google/fonts `ofl/spacemono/SpaceMono-{Regular,Bold}.ttf`, subset | OFL 1.1, `SpaceMono-OFL.txt` |
| `JetBrainsMono-greek.woff2` | google/fonts `ofl/jetbrainsmono/JetBrainsMono[wght].ttf`, subset | OFL 1.1, `JetBrainsMono-OFL.txt` |
| `Caveat[wght].ttf` | google/fonts `ofl/caveat/`, unmodified | OFL 1.1, `Caveat-OFL.txt` |
| `PermanentMarker-Regular.ttf` | google/fonts `apache/permanentmarker/`, unmodified | Apache 2.0, `PermanentMarker-LICENSE.txt` |

None of the OFL fonts declares a Reserved Font Name, so the subsets keep their family names.
The subsets were cut with fontTools (`pip install fonttools brotli`); `SYMBOLS` and `GREEK` are the
ranges in `carousel/glyphs.py`:

```
pyftsubset 'SpaceGrotesk[wght].ttf' --unicodes=U+2000-206F,U+2070-209F,U+2190-21FF,U+2200-22FF --flavor=woff2 --layout-features='*' --output-file=SpaceGrotesk-symbols.woff2
pyftsubset SpaceMono-Regular.ttf    --unicodes=<same> --flavor=woff2 --layout-features='*' --output-file=SpaceMono-400-symbols.woff2
pyftsubset SpaceMono-Bold.ttf       --unicodes=<same> --flavor=woff2 --layout-features='*' --output-file=SpaceMono-700-symbols.woff2
pyftsubset 'JetBrainsMono[wght].ttf' --unicodes=U+0370-03FF --flavor=woff2 --layout-features='*' --output-file=JetBrainsMono-greek.woff2
```

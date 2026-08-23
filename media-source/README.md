# Raw NotebookLM media exports

Local-only backup of the original, uncompressed files downloaded from
NotebookLM (Google's Gemini Notebook) during the course analogy-rewrite
project. This directory is git-ignored — never committed.

The web-optimized versions actually served by the site live in
`web/public/media/<module>/` (WebP infographics/mind maps, compressed
mono AAC audio, downscaled H.264 video). Re-derive those from these
originals with `cwebp` / `ffmpeg` if they ever need to be regenerated
at a different quality — see
`docs/superpowers/plans/2026-08-23-course-analogy-rewrite.md` for the
generation workflow and compression commands used.

Layout: `media-source/<module>/` mirrors `web/public/media/<module>/`,
one subdirectory per course module.

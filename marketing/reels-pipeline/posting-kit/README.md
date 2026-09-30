# Posting kit

The page the owner schedules from in Meta Business Suite (owner, 2026-09-30: Instagram's own
scheduler, Mon–Fri): https://claude.ai/artifact/QBH6EjeE62vGexCuwpCwor

`publish.mjs` posts at once and cannot schedule, so scheduling happens in Meta Business Suite
by hand; this page carries what each post needs there: the date, the media and cover (saved to
the phone through the page's `downloads` capability), the caption with hashtags and the alt
text, copied from each package's `post.md`.

- `october.json`: the posts in order with their dates, and the caption, hashtags, alt text and
  hook taken from each `post.md`.
- `build.py`: writes `index.html` from `template.html` and `october.json`. The media are assets
  of the kit artifact; `MEDIA` maps each post to its asset ids there (copied from the ledger
  artifact, covers and the card uploaded).
- To publish a new batch: regenerate the JSON from the packages, upload the media to the kit
  artifact, update `MEDIA`, run `python3 build.py`, and publish `index.html` to the kit's URL.

The planned dates are also in the ledger artifact's `scheduledFor`; a post's status moves to
Scheduled only once it is really scheduled in Meta Business Suite.

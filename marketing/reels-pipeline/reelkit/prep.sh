#!/usr/bin/env bash
# Copies render-time inputs into the current reel's sources/ directory: tutor
# stills, fonts, GSAP, the HyperFrames config. They live elsewhere in the repo
# and are git-ignored in each package, so there is one copy of each.
#   cd marketing/instagram/<package>/sources && bash ../../../reels-pipeline/reelkit/prep.sh
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
[ -f script.txt ] || { echo "run from a reel's sources/ directory" >&2; exit 1; }
mkdir -p stills fonts
cp "$ROOT"/marketing/reels-pipeline/tutor-poses/*.png stills/
rm -f stills/brand-avatar.png
cp "$ROOT"/hyperframes/assets/vendor/gsap.min.js .
F="$ROOT/web/lesson-artifacts/fonts"
cp "$F/SpaceGrotesk-latin-V8mDoQDjQS.woff2" fonts/SpaceGrotesk.woff2
cp "$F/SpaceMono-latin-i7dPIFZifj.woff2" fonts/SpaceMono-400.woff2
cp "$F/SpaceMono-latin-i7dMIFZifj.woff2" fonts/SpaceMono-700.woff2
cp "$ROOT"/hyperframes/hyperframes.json .
echo "prepared"

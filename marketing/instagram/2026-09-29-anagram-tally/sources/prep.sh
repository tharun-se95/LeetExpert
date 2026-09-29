#!/usr/bin/env bash
# Copies render-time inputs next to the generator: tutor stills, fonts, GSAP.
# They live elsewhere in the repo and are git-ignored here, so there is one copy.
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$(git rev-parse --show-toplevel)
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

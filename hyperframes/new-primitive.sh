#!/usr/bin/env bash
# Scaffold a primitive project. Each primitive is its own project directory
# because every HyperFrames quality gate (check/lint/validate/inspect/snapshot)
# is DIR-scoped — that is what makes per-primitive verification possible.
# assets/ is a symlink, never a copy, so tokens and fonts cannot drift.
set -euo pipefail
name="${1:?usage: ./new-primitive.sh <name>}"
dir="primitives/$name"
[ -e "$dir" ] && { echo "exists: $dir"; exit 1; }
mkdir -p "$dir"
cp hyperframes.json "$dir/hyperframes.json"
ln -sfn ../../assets "$dir/assets"
echo "scaffolded $dir (add index.html)"

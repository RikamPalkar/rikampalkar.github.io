#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/dist"

build_app() {
  npm --prefix "$1" run build
}

build_app "$ROOT_DIR/apps/portfolio"
build_app "$ROOT_DIR/apps/tictactoe"
build_app "$ROOT_DIR/apps/chroniyam"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/tictactoe" "$OUTPUT_DIR/ChroNiyam"

rsync -a "$ROOT_DIR/apps/portfolio/dist/" "$OUTPUT_DIR/"
rsync -a "$ROOT_DIR/apps/tictactoe/dist/" "$OUTPUT_DIR/tictactoe/"
rsync -a "$ROOT_DIR/apps/chroniyam/dist/" "$OUTPUT_DIR/ChroNiyam/"
touch "$OUTPUT_DIR/.nojekyll"
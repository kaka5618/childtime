#!/bin/sh
set -eu
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RELEASE_DIR=$(CDPATH= cd -- "$ROOT_DIR/.." && pwd)/孩子培养-微信发布
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
rsync -a \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='project.private.config.json' \
  "$ROOT_DIR/" "$RELEASE_DIR/"
find "$RELEASE_DIR" -type f -size +200k -print -exec wc -c {} \;
printf 'Release copy created: %s\n' "$RELEASE_DIR"

#!/bin/sh
set -eu
ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RELEASE_DIR=$(CDPATH= cd -- "$ROOT_DIR/.." && pwd)/孩子培养-微信发布
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
cp "$ROOT_DIR/project.config.json" "$RELEASE_DIR/project.config.json"
cp "$ROOT_DIR/.gitignore" "$RELEASE_DIR/.gitignore"
rsync -a "$ROOT_DIR/miniprogram" "$RELEASE_DIR/"
rsync -a "$ROOT_DIR/cloudfunctions" "$RELEASE_DIR/"
find "$RELEASE_DIR" -type f -size +200k -print -exec wc -c {} \;
printf 'Release copy created: %s\n' "$RELEASE_DIR"

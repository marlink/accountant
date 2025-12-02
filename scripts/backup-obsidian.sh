#!/bin/zsh
set -euo pipefail

VAULT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIRS=("$VAULT_ROOT/docs" "$VAULT_ROOT/.trae/documents")
DEST_DIR="$HOME/ObsidianBackups"
DATE=$(date +%Y%m%d)
ZIP_PATH="$DEST_DIR/accountant-$DATE.zip"

mkdir -p "$DEST_DIR"
rm -f "$ZIP_PATH"
cd "$VAULT_ROOT"
zip -r "$ZIP_PATH" ${SRC_DIRS[@]} -x "**/.DS_Store" "**/node_modules/**" "**/dist/**"

# keep last 14 backups
ls -t "$DEST_DIR"/accountant-*.zip | tail -n +15 | xargs -I {} rm -f {}

echo "Backup created: $ZIP_PATH"

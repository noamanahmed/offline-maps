#!/bin/bash
set -e
cd "$(dirname "$0")/.."

DEST="flutter_app/assets_web/maps/countries"
SRC="maps/countries"

mkdir -p "$DEST"

# Copy everything except country-level source PBFs
rsync -a --delete \
  --exclude='*.osm.pbf' \
  --filter='exclude maps/countries/*/*.osm.pbf' \
  "$SRC/" "$DEST/"

# Copy only deep PBF files (per-city, per-village)
find "$SRC" -name "*.osm.pbf" -type f | while read src; do
  rel="${src#$SRC/}"
  depth=$(echo "$rel" | tr '/' '\n' | wc -l)
  if [ "$depth" -gt 2 ]; then
    dest="$DEST/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
  fi
done

echo "Synced map data to $DEST"

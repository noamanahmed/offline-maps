#!/bin/bash
# Copy map data from maps/countries/ into flutter_app/web/maps/countries/
# Excludes the large country-level source PBFs (>10MB, depth 2 only)
set -e
cd "$(dirname "$0")/.."

mkdir -p flutter_app/web/maps/countries

# Copy everything - rsync will handle excludes
rsync -a --delete \
  --exclude='*.osm.pbf' \
  --filter='exclude maps/countries/*/*.osm.pbf' \
  maps/countries/ flutter_app/web/maps/countries/

# Now copy only the deep PBF files (per-city, per-village)
find maps/countries -name "*.osm.pbf" -type f | while read src; do
  rel="${src#maps/countries/}"
  depth=$(echo "$rel" | tr '/' '\n' | wc -l)
  if [ "$depth" -gt 2 ]; then
    dest="flutter_app/web/maps/countries/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
  fi
done

echo "Synced map data to flutter_app/web/maps/"

#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== Step 1: Generate places index ==="
python3 scripts/generate_places_index.py

echo "=== Step 2: Sync map data ==="
echo "SKIPPED"
#bash scripts/sync-maps.sh

echo "=== Step 3: Build Flutter web ==="
cd flutter_app
flutter pub get
flutter build web
cd ..

echo "=== Step 4: Copy PWA assets to build output ==="
BUILD_DIR="flutter_app/build/web"
cp flutter_app/web/map.html "$BUILD_DIR/"
cp -r flutter_app/web/leaflet "$BUILD_DIR/"
cp flutter_app/web/service_worker.js "$BUILD_DIR/"
cp flutter_app/web/manifest.json "$BUILD_DIR/"
cp flutter_app/web/places_index.json "$BUILD_DIR/"
mkdir -p "$BUILD_DIR/maps"
rsync -a flutter_app/web/maps/ "$BUILD_DIR/maps/"

echo "=== Step 5: Remove unused CanvasKit (HTML renderer only) ==="
rm -rf "$BUILD_DIR/canvaskit"

echo "=== Step 6: Verify no external URLs ==="
if grep -rP 'https?://(?!www\.w3\.org)' "$BUILD_DIR/" --include="*.html" --include="*.js" 2>/dev/null; then
  echo "WARNING: external URLs found"
fi

echo "Build complete: $BUILD_DIR ($(du -sh "$BUILD_DIR" | cut -f1))"

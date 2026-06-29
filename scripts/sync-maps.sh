#!/bin/bash
# Copy generated map data files from maps/ to src/maps/ for bundling.
# Webpack copies individual files (not a zip) so the webview can load them via XHR.

cd "$(dirname "$0")/.."

# Sync generated map data into src/maps (replace if exists, skip country-level PBF)
rsync -a --delete --exclude='*.osm.pbf' maps/countries/ src/maps/countries/

echo "Synced map data from maps/ to src/maps/"

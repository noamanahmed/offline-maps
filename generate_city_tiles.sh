#!/bin/bash
set -e

# Make sure tilemaker is installed
if ! command -v tilemaker &> /dev/null; then
    echo "Error: tilemaker tool is not installed or not in PATH." >&2
    exit 1
fi

WORKSPACE_DIR="/var/www/projects/offline-apps"

echo "Launching Vector Tile (.mbtiles) Generator..."
python3 "$WORKSPACE_DIR/generate_city_tiles.py" "$@"

echo "Generation process completed!"

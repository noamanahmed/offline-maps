#!/bin/bash
set -e

# Make sure osmium is installed
if ! command -v osmium &> /dev/null; then
    echo "Error: osmium tool is not installed or not in PATH." >&2
    exit 1
fi

WORKSPACE_DIR="/var/www/projects/offline-apps"

# Ensure Python helper script is executable
chmod +x "$WORKSPACE_DIR/enhance_poi.py"

echo "Launching OSM POI Enhancer (Roads, Areas, Places)..."
python3 "$WORKSPACE_DIR/enhance_poi.py" "$@"

echo "POI Enhancement process completed!"

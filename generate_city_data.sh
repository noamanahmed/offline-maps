#!/bin/bash
set -e

# Make sure osmium is installed
if ! command -v osmium &> /dev/null; then
    echo "Error: osmium tool is not installed or not in PATH." >&2
    exit 1
fi

WORKSPACE_DIR="/var/www/projects/offline-apps"

echo "Launching City & Village Map Extract and POI Generator..."
python3 "$WORKSPACE_DIR/generate_city_data.py" "$@"

echo "Generation process completed!"

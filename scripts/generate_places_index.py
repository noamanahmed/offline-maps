#!/usr/bin/env python3
"""Scan maps/countries/ and generate places_index.json listing all available places."""
import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MAPS_DIR = os.path.join(PROJECT_DIR, "maps", "countries")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "flutter_app", "assets_web")

def generate():
    places = []
    for root, dirs, files in os.walk(MAPS_DIR):
        depth = os.path.relpath(root, MAPS_DIR).count(os.sep)
        if depth != 3:
            continue
        for f in files:
            if f.endswith('.json') and f != 'pois.json':
                place_name = f.replace('.json', '')
                pbf_file = f'{place_name}.osm.pbf'
                if not os.path.exists(os.path.join(root, pbf_file)):
                    continue
                if not os.path.exists(os.path.join(root, 'pois.json')):
                    continue
                with open(os.path.join(root, f)) as jf:
                    meta = json.load(jf)
                rel = os.path.relpath(root, MAPS_DIR)
                parts = rel.split(os.sep)
                raw_type = meta.get("type", parts[2])
                singular = raw_type.replace("ies", "y").replace("s", "")
                places.append({
                    "id": meta.get("id", 0),
                    "name": meta.get("name", place_name),
                    "name_ur": meta.get("name_ur", ""),
                    "type": singular,
                    "lat": meta.get("latitude", meta.get("lat", 0)),
                    "lon": meta.get("longitude", meta.get("lon", 0)),
                    "province": meta.get("province", parts[1]),
                    "country": meta.get("country", parts[0]),
                    "path": rel
                })
    places.sort(key=lambda p: p["name"])
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output = os.path.join(OUTPUT_DIR, "places_index.json")
    with open(output, 'w') as f:
        json.dump(places, f, ensure_ascii=False)
    print(f"Generated {output} with {len(places)} places.")

if __name__ == "__main__":
    generate()

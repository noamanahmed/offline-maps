#!/usr/bin/env python3
"""Scan maps/countries/ and generate places_index.json listing all available places."""
import json
import os
import glob

MAPS_DIR = os.path.join(os.path.dirname(__file__), "..", "maps", "countries")

def generate():
    places = []
    for root, dirs, files in os.walk(MAPS_DIR):
        depth = os.path.relpath(root, MAPS_DIR).count(os.sep)
        if depth != 3:  # country/province/type/place = 3 separators
            continue
        for f in files:
            if f.endswith('.json') and f != 'pois.json':
                place_name = f.replace('.json', '')
                pbf_file = f'{place_name}.osm.pbf'
                pois_file = 'pois.json'
                pbf_path = os.path.join(root, pbf_file)
                pois_path = os.path.join(root, pois_file)
                if os.path.exists(pbf_path) and os.path.exists(pois_path):
                    with open(os.path.join(root, f)) as jf:
                        meta = json.load(jf)
                    rel = os.path.relpath(root, MAPS_DIR)
                    parts = rel.split(os.sep)
                    places.append({
                        "id": meta.get("id", 0),
                        "name": meta.get("name", place_name),
                        "name_ur": meta.get("name_ur", ""),
                        "type": meta.get("type", parts[2]).replace("ies", "y").replace("s", ""),
                        "lat": meta.get("latitude", meta.get("lat", 0)),
                        "lon": meta.get("longitude", meta.get("lon", 0)),
                        "province": meta.get("province", parts[1]),
                        "country": meta.get("country", parts[0]),
                        "path": rel
                    })
    places.sort(key=lambda p: p["name"])
    
    output = os.path.join(os.path.dirname(__file__), "..", "flutter_app", "web", "places_index.json")
    os.makedirs(os.path.dirname(output), exist_ok=True)
    with open(output, 'w') as f:
        json.dump(places, f, ensure_ascii=False)
    print(f"Generated {output} with {len(places)} places.")

if __name__ == "__main__":
    generate()

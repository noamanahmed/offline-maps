#!/usr/bin/env python3
import os
import json

WORKSPACE_DIR = "/var/www/projects/offline-apps"
MAPS_DIR = os.path.join(WORKSPACE_DIR, "maps", "countries")
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "src", "assets")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "places_index.json")

def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.")
        return

    print("Generating places index...")
    places = []

    # Traverse the directory
    for root, dirs, files in os.walk(MAPS_DIR):
        dir_name = os.path.basename(root)
        json_file = f"{dir_name}.json"
        
        if json_file in files:
            json_path = os.path.join(root, json_file)
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                
                # Check for required coordinates
                lat = meta.get("latitude")
                lon = meta.get("longitude")
                if lat is None or lon is None:
                    continue
                
                # Calculate relative path to the city/village folder from MAPS_DIR
                rel_path = os.path.relpath(root, MAPS_DIR)
                
                place_info = {
                    "id": meta.get("id"),
                    "name": meta.get("name"),
                    "name_ur": meta.get("name_ur"),
                    "type": meta.get("type", "village"),
                    "lat": float(lat),
                    "lon": float(lon),
                    "province": meta.get("province"),
                    "country": meta.get("country"),
                    "path": rel_path
                }
                places.append(place_info)
            except Exception as e:
                print(f"Error reading {json_path}: {e}")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Save to JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as out_f:
        json.dump(places, out_f, indent=2, ensure_ascii=False)

    print(f"Successfully indexed {len(places)} places and saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

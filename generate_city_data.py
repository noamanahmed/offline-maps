#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import shutil

# Root directory of workspace
WORKSPACE_DIR = "/var/www/projects/offline-apps"
MAPS_DIR = os.path.join(WORKSPACE_DIR, "maps", "countries")

def calculate_bbox(lat, lon, place_type):
    # City bbox: approx 8.8km x 8.8km (0.08 degrees total width/height)
    # Village bbox: approx 1.6km x 1.6km (0.015 degrees total width/height)
    half_size = 0.04 if place_type == "city" else 0.0075
    
    left = lon - half_size
    bottom = lat - half_size
    right = lon + half_size
    top = lat + half_size
    
    return f"{left:.6f},{bottom:.6f},{right:.6f},{top:.6f}"

def extract_pois(place_pbf, place_dir, place_name):
    tmp_pois_pbf = os.path.join(place_dir, "tmp_pois.osm.pbf")
    tmp_pois_geojson = os.path.join(place_dir, "tmp_pois.geojson")
    pois_output_json = os.path.join(place_dir, "pois.json")
    
    try:
        # Step 1: Filter nodes with POI tags
        subprocess.run([
            "osmium", "tags-filter", place_pbf,
            "n/amenity", "n/shop", "n/tourism", "n/leisure",
            "-o", tmp_pois_pbf, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Step 2: Export to GeoJSON
        subprocess.run([
            "osmium", "export", "-a", "id", tmp_pois_pbf,
            "-o", tmp_pois_geojson, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Step 3: Parse GeoJSON and build clean JSON list
        pois = []
        if os.path.exists(tmp_pois_geojson):
            with open(tmp_pois_geojson, "r", encoding="utf-8") as f:
                geojson_data = json.load(f)
                
            features = geojson_data.get("features", [])
            for feat in features:
                geom = feat.get("geometry") or {}
                props = feat.get("properties") or {}
                
                # Only extract Point POIs that have a name
                if geom.get("type") == "Point" and props.get("name"):
                    lat = geom["coordinates"][1]
                    lon = geom["coordinates"][0]
                    
                    # Find category / subcategory
                    category = None
                    subcategory = None
                    for tag in ["amenity", "shop", "tourism", "leisure"]:
                        if tag in props:
                            category = tag
                            subcategory = props[tag]
                            break
                            
                    pois.append({
                        "name": props["name"],
                        "category": category,
                        "subcategory": subcategory,
                        "latitude": lat,
                        "longitude": lon,
                        "id": props.get("@id")
                    })
                    
            # Save POIs to JSON
            with open(pois_output_json, "w", encoding="utf-8") as out_f:
                json.dump(pois, out_f, indent=2, ensure_ascii=False)
                
            print(f"  [SUCCESS] Generated pois.json with {len(pois)} POIs")
            
    except Exception as e:
        print(f"  [WARNING] Failed to extract POIs for {place_name}: {e}", file=sys.stderr)
    finally:
        # Clean up temporary files
        for f in [tmp_pois_pbf, tmp_pois_geojson]:
            if os.path.exists(f):
                os.remove(f)

def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    print("=== OSM Extract & POI Generator ===")

    # Walk through each country directory
    for country in os.listdir(MAPS_DIR):
        country_dir = os.path.join(MAPS_DIR, country)
        if not os.path.isdir(country_dir):
            continue
            
        # Find country source map (e.g. pakistan.osm.pbf)
        source_pbf = None
        for f in os.listdir(country_dir):
            if f.endswith(".osm.pbf") and os.path.isfile(os.path.join(country_dir, f)):
                source_pbf = os.path.join(country_dir, f)
                break
                
        if not source_pbf:
            print(f"Skipping country '{country}': No source .osm.pbf file found.")
            continue
            
        print(f"\nProcessing country: '{country}' using source map: {os.path.basename(source_pbf)}")
        
        # Traverse recursively to find place folders containing <folder_name>.json
        for root, dirs, files in os.walk(country_dir):
            dir_name = os.path.basename(root)
            json_file = f"{dir_name}.json"
            
            if json_file in files:
                json_path = os.path.join(root, json_file)
                output_pbf = os.path.join(root, f"{dir_name}.osm.pbf")
                pois_json = os.path.join(root, "pois.json")
                
                # Safe skip if both files already exist
                if os.path.exists(output_pbf) and os.path.exists(pois_json):
                    # print(f"  Skipping '{dir_name}' (already processed).")
                    continue
                    
                # Read metadata
                try:
                    with open(json_path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                except Exception as e:
                    print(f"  [ERROR] Failed to read {json_file}: {e}", file=sys.stderr)
                    continue
                    
                lat = meta.get("latitude")
                lon = meta.get("longitude")
                place_type = meta.get("type", "village")
                
                if lat is None or lon is None:
                    print(f"  [ERROR] Missing coordinates in {json_file}", file=sys.stderr)
                    continue
                    
                print(f"----------------------------------------")
                print(f"Processing {place_type}: '{dir_name}' ({lat}, {lon})")
                
                # Step 1: Calculate bbox
                bbox = calculate_bbox(lat, lon, place_type)
                
                # Step 2: Extract PBF
                print(f"  Extracting map: {os.path.basename(output_pbf)} (BBox: {bbox})...")
                try:
                    subprocess.run([
                        "osmium", "extract", "-b", bbox, source_pbf,
                        "-o", output_pbf, "--overwrite"
                    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    
                    # Verify file generated
                    if os.path.exists(output_pbf):
                        size_kb = os.path.getsize(output_pbf) / 1024
                        print(f"  [SUCCESS] Generated map extract ({size_kb:.2f} KB)")
                        
                        # Step 3: Extract POIs
                        extract_pois(output_pbf, root, dir_name)
                    else:
                        print(f"  [ERROR] Map extract was not created.", file=sys.stderr)
                except subprocess.CalledProcessError as e:
                    print(f"  [ERROR] osmium extract failed: {e}", file=sys.stderr)

    print("\nAll map extracts and POI data generation completed successfully!")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import time
import argparse

WORKSPACE_DIR = "/var/www/projects/offline-apps"
MAPS_DIR = os.path.join(WORKSPACE_DIR, "maps", "countries")

class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


def calculate_centroid(geometry):
    """Calculate central coordinate for any geometry type."""
    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")
    
    if not coords:
        return None
        
    if geom_type == "Point":
        return coords[1], coords[0] # lat, lon
        
    elif geom_type == "LineString":
        # Average of all points
        lats = [c[1] for c in coords]
        lons = [c[0] for c in coords]
        return sum(lats) / len(lats), sum(lons) / len(lons)
        
    elif geom_type == "Polygon":
        # Average of outer ring points
        outer_ring = coords[0]
        lats = [c[1] for c in outer_ring]
        lons = [c[0] for c in outer_ring]
        return sum(lats) / len(lats), sum(lons) / len(lons)
        
    elif geom_type == "MultiPolygon":
        # Average of outer rings of all polygons
        lats = []
        lons = []
        for poly in coords:
            if poly and len(poly) > 0:
                outer_ring = poly[0]
                lats.extend([c[1] for c in outer_ring])
                lons.extend([c[0] for c in outer_ring])
        if lats:
            return sum(lats) / len(lats), sum(lons) / len(lons)
            
    return None


def enhance_pois(pbf_path, output_json, place_name):
    """Convert PBF to GeoJSON, extract all named features, and save as pois.json."""
    place_dir = os.path.dirname(pbf_path)
    tmp_geojson = os.path.join(place_dir, "tmp_enhance.geojson")
    
    try:
        # Export entire PBF to GeoJSON using osmium
        subprocess.run([
            "osmium", "export", "-a", "id", pbf_path,
            "-o", tmp_geojson, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        if not os.path.exists(tmp_geojson):
            print(f"  {Colors.RED}✗ Failed{Colors.RESET} to export {place_name} map to GeoJSON.")
            return False

        with open(tmp_geojson, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)

        features = geojson_data.get("features", [])
        enhanced_pois = []
        
        # Tags we want to extract
        target_keys = [
            "amenity", "shop", "tourism", "leisure", "highway",
            "place", "landuse", "natural", "historic", "office", "sport"
        ]

        for feat in features:
            geom = feat.get("geometry") or {}
            props = feat.get("properties") or {}
            
            # Check for a name and target tags
            name = props.get("name")
            if not name:
                continue

            category = None
            subcategory = None
            
            # Find matching category tag
            for key in target_keys:
                if key in props:
                    category = key
                    subcategory = props[key]
                    break
            
            if not category:
                continue

            # Calculate centroid
            centroid = calculate_centroid(geom)
            if not centroid:
                continue

            enhanced_pois.append({
                "name": name,
                "category": category,
                "subcategory": subcategory,
                "latitude": centroid[0],
                "longitude": centroid[1],
                "id": props.get("@id") or feat.get("id")
            })

        # Save enhanced POIs list
        with open(output_json, "w", encoding="utf-8") as out_f:
            json.dump(enhanced_pois, out_f, indent=2, ensure_ascii=False)
            
        print(f"  {Colors.GREEN}✓ Enhanced{Colors.RESET} Generated rich pois.json with {len(enhanced_pois)} features.")
        return True

    except Exception as e:
        print(f"  {Colors.RED}✗ Error{Colors.RESET} Failed to enhance POIs for {place_name}: {e}", file=sys.stderr)
        return False
    finally:
        if os.path.exists(tmp_geojson):
            os.remove(tmp_geojson)


def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Enhance POIs from extracted OSM PBF files")
    parser.add_argument("--country", help="Filter by country name (case-insensitive)")
    parser.add_argument("--province", help="Filter by province/state name (case-insensitive)")
    parser.add_argument("--place", "--city", dest="place", help="Filter by city/village name (case-insensitive)")
    args = parser.parse_args()

    start_time = time.time()
    total_processed = 0
    total_enhanced = 0

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  OSM POI Enhancer (Roads, Areas, Places)")
    if args.country or args.province or args.place:
        print(f"  Filters applied:")
        if args.country: print(f"    - Country:  {args.country}")
        if args.province: print(f"    - Province: {args.province}")
        if args.place: print(f"    - Place:    {args.place}")
    print(f"{'=' * 56}{Colors.RESET}\n")

    # Walk through country directories
    for country in sorted(os.listdir(MAPS_DIR)):
        if args.country and country.lower() != args.country.lower():
            continue

        country_dir = os.path.join(MAPS_DIR, country)
        if not os.path.isdir(country_dir):
            continue

        print(f"{Colors.BLUE}{Colors.BOLD}📁 Processing Country: {country}{Colors.RESET}")

        # Traverse recursively to find place folders containing <folder_name>.json
        for root, dirs, files in os.walk(country_dir):
            dir_name = os.path.basename(root)
            json_file = f"{dir_name}.json"
            pbf_file = f"{dir_name}.osm.pbf"

            if json_file not in files or pbf_file not in files:
                continue

            json_path = os.path.join(root, json_file)
            pbf_path = os.path.join(root, pbf_file)
            pois_json = os.path.join(root, "pois.json")

            # Read metadata to apply filters
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
            except Exception:
                continue

            place_type = meta.get("type", "village")
            province = meta.get("province", "")
            place_name = meta.get("name", "")

            # Apply filters
            if args.province and args.province.lower() != province.lower():
                continue
            if args.place and args.place.lower() not in place_name.lower() and args.place.lower() != dir_name.lower():
                continue

            print(f"  ▶ Enhancing {place_type}: '{dir_name}'...")
            total_processed += 1
            if enhance_pois(pbf_path, pois_json, dir_name):
                total_enhanced += 1

    elapsed = time.time() - start_time
    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  POI Enhancement Complete")
    print(f"{'=' * 56}{Colors.RESET}")
    print(f"  Total processed: {total_processed}")
    print(f"  Successfully enhanced: {Colors.GREEN}{total_enhanced}{Colors.RESET}")
    print(f"  Time elapsed: {elapsed:.1f}s\n")


if __name__ == "__main__":
    main()

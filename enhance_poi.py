#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import time
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

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

stats_lock = threading.Lock()
stats = {
    "total": 0,
    "enhanced": 0,
    "failed": 0,
}


def calculate_centroid(geometry):
    """Calculate central coordinate for any geometry type."""
    geom_type = geometry.get("type")
    coords = geometry.get("coordinates")

    if not coords:
        return None

    if geom_type == "Point":
        return coords[1], coords[0]

    elif geom_type == "LineString":
        lats = [c[1] for c in coords]
        lons = [c[0] for c in coords]
        return sum(lats) / len(lats), sum(lons) / len(lons)

    elif geom_type == "Polygon":
        outer_ring = coords[0]
        lats = [c[1] for c in outer_ring]
        lons = [c[0] for c in outer_ring]
        return sum(lats) / len(lats), sum(lons) / len(lons)

    elif geom_type == "MultiPolygon":
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


target_keys = [
    "amenity", "shop", "tourism", "leisure", "highway",
    "place", "landuse", "natural", "historic", "office", "sport"
]


def enhance_place(task):
    """Process a single place — designed to run in a thread pool.
    Returns (status, place_name, pois_count, error_message).
    """
    (dir_name, pbf_path, pois_json) = task

    place_dir = os.path.dirname(pbf_path)
    tmp_geojson = os.path.join(place_dir, "tmp_enhance.geojson")
    pois_count = 0

    try:
        subprocess.run([
            "osmium", "export", "-a", "id", pbf_path,
            "-o", tmp_geojson, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if not os.path.exists(tmp_geojson):
            return ("failed", dir_name, 0, "GeoJSON export produced no file")

        with open(tmp_geojson, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)

        features = geojson_data.get("features", [])
        enhanced_pois = []

        for feat in features:
            geom = feat.get("geometry") or {}
            props = feat.get("properties") or {}

            name = props.get("name")
            category = None
            subcategory = None

            for key in target_keys:
                if key in props:
                    category = key
                    subcategory = props[key]
                    break

            if not category:
                continue

            if not name:
                name = subcategory or category or "Point of Interest"

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

        with open(pois_json, "w", encoding="utf-8") as out_f:
            json.dump(enhanced_pois, out_f, indent=2, ensure_ascii=False)

        pois_count = len(enhanced_pois)
        return ("enhanced", dir_name, pois_count, None)

    except Exception as e:
        return ("failed", dir_name, 0, str(e))
    finally:
        if os.path.exists(tmp_geojson):
            os.remove(tmp_geojson)


def collect_places(args):
    """Single-threaded scan to collect all work items."""
    places = []

    for country in sorted(os.listdir(MAPS_DIR)):
        if args.country and country.lower() != args.country.lower():
            continue

        country_dir = os.path.join(MAPS_DIR, country)
        if not os.path.isdir(country_dir):
            continue

        print(f"{Colors.BLUE}{Colors.BOLD}📁 Collecting: {country}{Colors.RESET}")

        for root, dirs, files in os.walk(country_dir):
            dir_name = os.path.basename(root)
            json_file = f"{dir_name}.json"
            pbf_file = f"{dir_name}.osm.pbf"

            if json_file not in files or pbf_file not in files:
                continue

            json_path = os.path.join(root, json_file)

            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
            except Exception:
                continue

            province = meta.get("province", "")
            place_name = meta.get("name", "")

            if args.province and args.province.lower() != province.lower():
                continue
            if args.place and args.place.lower() not in place_name.lower() and args.place.lower() != dir_name.lower():
                continue

            pbf_path = os.path.join(root, pbf_file)
            pois_json = os.path.join(root, "pois.json")

            places.append((dir_name, pbf_path, pois_json))

    return places


def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Enhance POIs from extracted OSM PBF files")
    parser.add_argument("--country", help="Filter by country name (case-insensitive)")
    parser.add_argument("--province", help="Filter by province/state name (case-insensitive)")
    parser.add_argument("--place", "--city", dest="place", help="Filter by city/village name (case-insensitive)")
    parser.add_argument("--threads", "-t", type=int, default=4, help="Number of parallel threads (default: 4)")
    args = parser.parse_args()

    start_time = time.time()

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  OSM POI Enhancer (Roads, Areas, Places)  ({args.threads} threads)")
    if args.country or args.province or args.place:
        print(f"  Filters applied:")
        if args.country: print(f"    - Country:  {args.country}")
        if args.province: print(f"    - Province: {args.province}")
        if args.place: print(f"    - Place:    {args.place}")
    print(f"{'=' * 56}{Colors.RESET}\n")

    # Phase 1: Collect all places
    print(f"{Colors.DIM}Scanning for places...{Colors.RESET}")
    places = collect_places(args)

    stats["total"] = len(places)

    if not places:
        print(f"{Colors.YELLOW}No places found matching filters.{Colors.RESET}")
        return

    print(f"{Colors.CYAN}Found {len(places)} places to process.{Colors.RESET}\n")

    # Phase 2: Process in parallel
    completed = 0
    total = len(places)

    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        futures = {executor.submit(enhance_place, p): p for p in places}

        for future in as_completed(futures):
            task = futures[future]
            dir_name = task[0]
            try:
                result = future.result()
                status, dname, pois_n, err = result

                completed += 1

                if status == "enhanced":
                    with stats_lock:
                        stats["enhanced"] += 1
                    print(f"  [{completed}/{total}] {Colors.GREEN}✓{Colors.RESET} {dname} — {pois_n} features")
                else:
                    with stats_lock:
                        stats["failed"] += 1
                    print(f"  [{completed}/{total}] {Colors.RED}✗{Colors.RESET} {dname} — {err or 'unknown error'}")

            except Exception as e:
                completed += 1
                with stats_lock:
                    stats["failed"] += 1
                print(f"  [{completed}/{total}] {Colors.RED}✗{Colors.RESET} {dir_name} — unexpected: {e}")

    # --- Summary Report ---
    elapsed = time.time() - start_time

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  POI Enhancement Complete")
    print(f"{'=' * 56}{Colors.RESET}")
    print(f"  Total places:        {stats['total']}")
    print(f"  {Colors.GREEN}Successfully enhanced: {stats['enhanced']}{Colors.RESET}")
    if stats["failed"]:
        print(f"  {Colors.RED}Failed:               {stats['failed']}{Colors.RESET}")
    print(f"  Threads used:        {args.threads}")
    print(f"  Time elapsed:        {elapsed:.1f}s\n")


if __name__ == "__main__":
    main()

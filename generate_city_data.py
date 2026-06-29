#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import time
import argparse

# Root directory of workspace
WORKSPACE_DIR = "/var/www/projects/offline-apps"
MAPS_DIR = os.path.join(WORKSPACE_DIR, "maps", "countries")

# ANSI color codes for terminal output
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

# Counters for summary report
stats = {
    "total": 0,
    "skipped": 0,
    "generated": 0,
    "failed": 0,
    "missing_pbf": [],      # Places with metadata but no .osm.pbf
    "missing_pois": [],     # Places with metadata but no pois.json
    "missing_both": [],     # Places with metadata but neither file
}


def calculate_bbox(lat, lon, place_type):
    """Calculate bounding box for osmium extract.
    City bbox: approx 8.8km x 8.8km (0.08 degrees total width/height)
    Village bbox: approx 1.6km x 1.6km (0.015 degrees total width/height)
    """
    half_size = 0.04 if place_type == "city" else 0.0075

    left = lon - half_size
    bottom = lat - half_size
    right = lon + half_size
    top = lat + half_size

    return f"{left:.6f},{bottom:.6f},{right:.6f},{top:.6f}"


def extract_pois(place_pbf, place_dir, place_name):
    """Extract POIs from the place PBF file and save as pois.json."""
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

            print(f"  {Colors.GREEN}✓ POIs{Colors.RESET}  Generated pois.json with {len(pois)} POIs")

    except Exception as e:
        print(f"  {Colors.RED}✗ POIs{Colors.RESET}  Failed to extract POIs for {place_name}: {e}", file=sys.stderr)
    finally:
        # Clean up temporary files
        for f in [tmp_pois_pbf, tmp_pois_geojson]:
            if os.path.exists(f):
                os.remove(f)


def check_and_warn_missing(dir_name, place_dir, has_pbf, has_pois, place_type):
    """Log warnings about missing files for a place that has metadata."""
    rel_path = os.path.relpath(place_dir, MAPS_DIR)

    if not has_pbf and not has_pois:
        stats["missing_both"].append(f"{dir_name} ({place_type}) → {rel_path}")
    elif not has_pbf:
        stats["missing_pbf"].append(f"{dir_name} ({place_type}) → {rel_path}")
    elif not has_pois:
        stats["missing_pois"].append(f"{dir_name} ({place_type}) → {rel_path}")


def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="OSM Extract & POI Generator")
    parser.add_argument("--country", help="Filter by country name (case-insensitive, e.g. pakistan)")
    parser.add_argument("--province", help="Filter by province/state name (case-insensitive, e.g. punjab)")
    parser.add_argument("--place", "--city", dest="place", help="Filter by city/village name (case-insensitive, e.g. lahore)")
    args = parser.parse_args()

    start_time = time.time()

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  OSM Extract & POI Generator")
    if args.country or args.province or args.place:
        print(f"  Filters applied:")
        if args.country: print(f"    - Country:  {args.country}")
        if args.province: print(f"    - Province: {args.province}")
        if args.place: print(f"    - Place:    {args.place}")
    print(f"{'=' * 56}{Colors.RESET}\n")

    # Walk through each country directory
    for country in sorted(os.listdir(MAPS_DIR)):
        if args.country and country.lower() != args.country.lower():
            continue

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
            # Only print warning if we're scanning this country
            print(f"{Colors.YELLOW}⚠ Country '{country}': No source .osm.pbf found — cannot generate, scanning for missing files...{Colors.RESET}")

        if source_pbf:
            source_size_mb = os.path.getsize(source_pbf) / (1024 * 1024)
            print(f"{Colors.BLUE}{Colors.BOLD}📁 Country: {country}{Colors.RESET} {Colors.DIM}(source: {os.path.basename(source_pbf)}, {source_size_mb:.1f} MB){Colors.RESET}")

        # Traverse recursively to find place folders containing <folder_name>.json
        for root, dirs, files in os.walk(country_dir):
            dir_name = os.path.basename(root)
            json_file = f"{dir_name}.json"

            if json_file not in files:
                continue

            json_path = os.path.join(root, json_file)
            output_pbf = os.path.join(root, f"{dir_name}.osm.pbf")
            pois_json = os.path.join(root, "pois.json")

            # Read metadata first (needed for filters and processing)
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
            except Exception as e:
                print(f"  {Colors.RED}✗ ERROR{Colors.RESET} Failed to read {json_file}: {e}", file=sys.stderr)
                stats["failed"] += 1
                continue

            place_type = meta.get("type", "village")
            lat = meta.get("latitude")
            lon = meta.get("longitude")
            province = meta.get("province", "")
            place_name = meta.get("name", "")

            # Filter by province
            if args.province and args.province.lower() != province.lower():
                continue

            # Filter by place/city name
            if args.place and args.place.lower() not in place_name.lower() and args.place.lower() != dir_name.lower():
                continue

            stats["total"] += 1

            has_pbf = os.path.exists(output_pbf)
            has_pois = os.path.exists(pois_json)

            # Skip if BOTH files already exist — do NOT regenerate
            if has_pbf and has_pois:
                pbf_size_kb = os.path.getsize(output_pbf) / 1024
                pois_count = "?"
                try:
                    with open(pois_json, "r", encoding="utf-8") as pf:
                        pois_count = len(json.load(pf))
                except Exception:
                    pass
                print(f"  {Colors.DIM}⏭ SKIP  {dir_name} ({place_type}) — already exists (pbf: {pbf_size_kb:.0f}KB, pois: {pois_count}){Colors.RESET}")
                stats["skipped"] += 1
                continue

            # Can't generate without source PBF — warn and skip
            if not source_pbf:
                check_and_warn_missing(dir_name, root, has_pbf, has_pois, place_type)
                if not has_pbf or not has_pois:
                    stats["failed"] += 1
                continue

            if lat is None or lon is None:
                print(f"  {Colors.RED}✗ ERROR{Colors.RESET} Missing coordinates in {json_file}", file=sys.stderr)
                stats["failed"] += 1
                continue

            print(f"  {Colors.CYAN}▶ GEN{Colors.RESET}   {dir_name} ({place_type}) at ({lat:.5f}, {lon:.5f})")

            # Step 1: Calculate bbox
            bbox = calculate_bbox(lat, lon, place_type)

            # Step 2: Extract PBF (only if missing)
            if not has_pbf:
                print(f"           Extracting map: {os.path.basename(output_pbf)} (bbox: {bbox})...")
                try:
                    subprocess.run([
                        "osmium", "extract", "-b", bbox, source_pbf,
                        "-o", output_pbf, "--overwrite"
                    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

                    # Verify file generated
                    if os.path.exists(output_pbf):
                        size_kb = os.path.getsize(output_pbf) / 1024
                        print(f"  {Colors.GREEN}✓ MAP{Colors.RESET}   Generated extract ({size_kb:.1f} KB)")
                    else:
                        print(f"  {Colors.RED}✗ MAP{Colors.RESET}   Extract was not created.", file=sys.stderr)
                        check_and_warn_missing(dir_name, root, False, has_pois, place_type)
                        stats["failed"] += 1
                        continue
                except subprocess.CalledProcessError as e:
                    print(f"  {Colors.RED}✗ MAP{Colors.RESET}   osmium extract failed: {e}", file=sys.stderr)
                    check_and_warn_missing(dir_name, root, False, has_pois, place_type)
                    stats["failed"] += 1
                    continue
            else:
                print(f"  {Colors.DIM}  MAP    Already exists, skipping extract.{Colors.RESET}")

            # Step 3: Extract POIs (only if missing)
            if not has_pois:
                extract_pois(output_pbf, root, dir_name)
            else:
                print(f"  {Colors.DIM}  POIs   Already exists, skipping.{Colors.RESET}")

            stats["generated"] += 1

    # --- Summary Report ---
    elapsed = time.time() - start_time

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  Summary Report")
    print(f"{'=' * 56}{Colors.RESET}")
    print(f"  Total places found:  {stats['total']}")
    print(f"  {Colors.GREEN}Generated:             {stats['generated']}{Colors.RESET}")
    print(f"  {Colors.DIM}Skipped (up-to-date):  {stats['skipped']}{Colors.RESET}")
    print(f"  {Colors.RED}Failed:                {stats['failed']}{Colors.RESET}")
    print(f"  Time elapsed:        {elapsed:.1f}s")

    # --- Missing Files Warnings ---
    has_warnings = stats["missing_both"] or stats["missing_pbf"] or stats["missing_pois"]

    if has_warnings:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠  Missing Files Warnings{Colors.RESET}")
        print(f"{Colors.YELLOW}{'─' * 56}{Colors.RESET}")

        if stats["missing_both"]:
            print(f"\n  {Colors.RED}Missing BOTH .osm.pbf and pois.json ({len(stats['missing_both'])}):{Colors.RESET}")
            for entry in stats["missing_both"][:20]:
                print(f"    • {entry}")
            if len(stats["missing_both"]) > 20:
                print(f"    ... and {len(stats['missing_both']) - 20} more")

        if stats["missing_pbf"]:
            print(f"\n  {Colors.YELLOW}Missing .osm.pbf only ({len(stats['missing_pbf'])}):{Colors.RESET}")
            for entry in stats["missing_pbf"][:20]:
                print(f"    • {entry}")
            if len(stats["missing_pbf"]) > 20:
                print(f"    ... and {len(stats['missing_pbf']) - 20} more")

        if stats["missing_pois"]:
            print(f"\n  {Colors.YELLOW}Missing pois.json only ({len(stats['missing_pois'])}):{Colors.RESET}")
            for entry in stats["missing_pois"][:20]:
                print(f"    • {entry}")
            if len(stats["missing_pois"]) > 20:
                print(f"    ... and {len(stats['missing_pois']) - 20} more")

        total_missing = len(stats["missing_both"]) + len(stats["missing_pbf"]) + len(stats["missing_pois"])
        print(f"\n  {Colors.YELLOW}Total places with missing files: {total_missing}{Colors.RESET}")
        print(f"  {Colors.DIM}To generate missing files, ensure the country source .osm.pbf exists and re-run this script.{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}✓ All places have complete data files.{Colors.RESET}")

    print()


if __name__ == "__main__":
    main()

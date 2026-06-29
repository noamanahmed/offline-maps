#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import time
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

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

# Thread-safe stats
stats_lock = threading.Lock()
stats = {
    "total": 0,
    "skipped": 0,
    "generated": 0,
    "failed": 0,
    "missing_pbf": [],
    "missing_pois": [],
    "missing_both": [],
}


def calculate_bbox(lat, lon, place_type):
    """Calculate bounding box for osmium extract."""
    half_size = 0.08 if place_type == "city" else 0.0075
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
    pois_count = 0

    try:
        subprocess.run([
            "osmium", "tags-filter", place_pbf,
            "n/amenity", "n/shop", "n/tourism", "n/leisure",
            "-o", tmp_pois_pbf, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        subprocess.run([
            "osmium", "export", "-a", "id", tmp_pois_pbf,
            "-o", tmp_pois_geojson, "--overwrite"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        pois = []
        if os.path.exists(tmp_pois_geojson):
            with open(tmp_pois_geojson, "r", encoding="utf-8") as f:
                geojson_data = json.load(f)

            features = geojson_data.get("features", [])
            for feat in features:
                geom = feat.get("geometry") or {}
                props = feat.get("properties") or {}

                if geom.get("type") == "Point":
                    lat = geom["coordinates"][1]
                    lon = geom["coordinates"][0]

                    category = None
                    subcategory = None
                    for tag in ["amenity", "shop", "tourism", "leisure"]:
                        if tag in props:
                            category = tag
                            subcategory = props[tag]
                            break

                    name = props.get("name") or subcategory or category or "Point of Interest"

                    pois.append({
                        "name": name,
                        "category": category,
                        "subcategory": subcategory,
                        "latitude": lat,
                        "longitude": lon,
                        "id": props.get("@id")
                    })

            with open(pois_output_json, "w", encoding="utf-8") as out_f:
                json.dump(pois, out_f, indent=2, ensure_ascii=False)

            pois_count = len(pois)

        return (True, pois_count, None)

    except Exception as e:
        return (False, 0, str(e))
    finally:
        for f in [tmp_pois_pbf, tmp_pois_geojson]:
            if os.path.exists(f):
                os.remove(f)


def record_missing(dir_name, place_dir, has_pbf, has_pois, place_type):
    rel_path = os.path.relpath(place_dir, MAPS_DIR)
    with stats_lock:
        if not has_pbf and not has_pois:
            stats["missing_both"].append(f"{dir_name} ({place_type}) → {rel_path}")
        elif not has_pbf:
            stats["missing_pbf"].append(f"{dir_name} ({place_type}) → {rel_path}")
        elif not has_pois:
            stats["missing_pois"].append(f"{dir_name} ({place_type}) → {rel_path}")


def generate_place(task):
    """Process a single place — designed to run in a thread pool."""
    (dir_name, root, source_pbf, lat, lon, place_type,
     json_path, output_pbf, pois_json, index) = task

    has_pbf = os.path.exists(output_pbf)
    has_pois = os.path.exists(pois_json)

    # Skip if both exist
    if has_pbf and has_pois:
        with stats_lock:
            stats["skipped"] += 1
        return ("skipped", dir_name, place_type, 0, 0)

    # Can't generate without source
    if not source_pbf:
        record_missing(dir_name, root, has_pbf, has_pois, place_type)
        with stats_lock:
            if not has_pbf or not has_pois:
                stats["failed"] += 1
        return ("missing-source", dir_name, place_type, 0, 0)

    if lat is None or lon is None:
        with stats_lock:
            stats["failed"] += 1
        return ("no-coords", dir_name, place_type, 0, 0)

    pbf_size_kb = 0
    pois_count = 0
    status = "generated"

    # Step 1: Extract PBF
    if not has_pbf:
        bbox = calculate_bbox(lat, lon, place_type)
        try:
            subprocess.run([
                "osmium", "extract", "-b", bbox, source_pbf,
                "-o", output_pbf, "--overwrite"
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            if os.path.exists(output_pbf):
                pbf_size_kb = os.path.getsize(output_pbf) / 1024
            else:
                record_missing(dir_name, root, False, has_pois, place_type)
                with stats_lock:
                    stats["failed"] += 1
                return ("pbf-failed", dir_name, place_type, 0, 0)
        except subprocess.CalledProcessError:
            record_missing(dir_name, root, False, has_pois, place_type)
            with stats_lock:
                stats["failed"] += 1
            return ("pbf-failed", dir_name, place_type, 0, 0)
    else:
        pbf_size_kb = os.path.getsize(output_pbf) / 1024

    # Step 2: Extract POIs
    if not has_pois:
        ok, pois_count, err = extract_pois(output_pbf, root, dir_name)
        if not ok:
            with stats_lock:
                stats["failed"] += 1
            return ("pois-failed", dir_name, place_type, pbf_size_kb, 0)

    with stats_lock:
        stats["generated"] += 1

    return ("generated", dir_name, place_type, pbf_size_kb, pois_count)


def collect_places(args):
    """Single-threaded scan to collect all work items, grouped by country/source_pbf."""
    places = []

    for country in sorted(os.listdir(MAPS_DIR)):
        if args.country and country.lower() != args.country.lower():
            continue

        country_dir = os.path.join(MAPS_DIR, country)
        if not os.path.isdir(country_dir):
            continue

        source_pbf = None
        for f in os.listdir(country_dir):
            if f.endswith(".osm.pbf") and os.path.isfile(os.path.join(country_dir, f)):
                source_pbf = os.path.join(country_dir, f)
                break

        if not source_pbf:
            print(f"{Colors.YELLOW}⚠ Country '{country}': No source .osm.pbf found — cannot generate, scanning for missing files...{Colors.RESET}")

        if source_pbf:
            source_size_mb = os.path.getsize(source_pbf) / (1024 * 1024)
            print(f"{Colors.BLUE}{Colors.BOLD}📁 Country: {country}{Colors.RESET} {Colors.DIM}(source: {os.path.basename(source_pbf)}, {source_size_mb:.1f} MB){Colors.RESET}")

        for root, dirs, files in os.walk(country_dir):
            dir_name = os.path.basename(root)
            json_file = f"{dir_name}.json"

            if json_file not in files:
                continue

            json_path = os.path.join(root, json_file)

            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
            except Exception:
                continue

            place_type = meta.get("type", "village")
            lat = meta.get("latitude")
            lon = meta.get("longitude")
            province = meta.get("province", "")
            place_name = meta.get("name", "")

            if args.province and args.province.lower() != province.lower():
                continue

            if args.place and args.place.lower() not in place_name.lower() and args.place.lower() != dir_name.lower():
                continue

            output_pbf = os.path.join(root, f"{dir_name}.osm.pbf")
            pois_json = os.path.join(root, "pois.json")

            places.append((
                dir_name, root, source_pbf, lat, lon, place_type,
                json_path, output_pbf, pois_json, 0
            ))

    return places


def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="OSM Extract & POI Generator")
    parser.add_argument("--country", help="Filter by country name (case-insensitive, e.g. pakistan)")
    parser.add_argument("--province", help="Filter by province/state name (case-insensitive, e.g. punjab)")
    parser.add_argument("--place", "--city", dest="place", help="Filter by city/village name (case-insensitive, e.g. lahore)")
    parser.add_argument("--threads", "-t", type=int, default=4, help="Number of parallel threads (default: 4)")
    args = parser.parse_args()

    start_time = time.time()

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  OSM Extract & POI Generator  ({args.threads} threads)")
    if args.country or args.province or args.place:
        print(f"  Filters applied:")
        if args.country: print(f"    - Country:  {args.country}")
        if args.province: print(f"    - Province: {args.province}")
        if args.place: print(f"    - Place:    {args.place}")
    print(f"{'=' * 56}{Colors.RESET}\n")

    # Phase 1: Collect all places (fast, single-threaded)
    print(f"{Colors.DIM}Scanning for places...{Colors.RESET}")
    places = collect_places(args)

    stats["total"] = len(places)

    if not places:
        print(f"{Colors.YELLOW}No places found matching filters.{Colors.RESET}")
        return

    # Count work items
    needs_work = sum(1 for p in places
                     if not (os.path.exists(p[7]) and os.path.exists(p[8])))
    print(f"{Colors.CYAN}Found {len(places)} places, {needs_work} need generation.{Colors.RESET}\n")

    # Phase 2: Process in parallel
    completed_count = 0
    needs_work_display = needs_work if needs_work > 0 else len(places)

    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        futures = {executor.submit(generate_place, p): p for p in places}

        for future in as_completed(futures):
            task = futures[future]
            dir_name = task[0]
            try:
                result = future.result()
                status, dname, ptype, pbf_kb, pois_n = result

                completed_count += 1
                done = completed_count

                if status == "skipped":
                    print(f"  {Colors.DIM}[{done}/{needs_work_display}] ⏭ SKIP  {dname} ({ptype}) — already exists{Colors.RESET}")
                elif status.startswith("missing") or status.startswith("no-coords"):
                    print(f"  {Colors.RED}[{done}/{needs_work_display}] ✗ {dname} ({ptype}) — no source PBF available{Colors.RESET}")
                elif status == "pbf-failed":
                    print(f"  {Colors.RED}[{done}/{needs_work_display}] ✗ {dname} ({ptype}) — PBF extract failed{Colors.RESET}")
                elif status == "pois-failed":
                    pts = f"{Colors.GREEN}✓ MAP{Colors.RESET}  {pbf_kb:.0f}KB" if pbf_kb else ""
                    print(f"  [{done}/{needs_work_display}] {Colors.CYAN}▶ GEN{Colors.RESET}   {dname} ({ptype})  {pts}  {Colors.RED}✗ POIs{Colors.RESET}")
                elif status == "generated":
                    pts = []
                    if pbf_kb:
                        pts.append(f"{Colors.GREEN}✓ MAP{Colors.RESET}  {pbf_kb:.0f}KB")
                    if pois_n:
                        pts.append(f"{Colors.GREEN}✓ POIs{Colors.RESET} {pois_n} items")
                    print(f"  [{done}/{needs_work_display}] {Colors.CYAN}▶ GEN{Colors.RESET}   {dname} ({ptype})  " + "  ".join(pts))
            except Exception as e:
                print(f"  {Colors.RED}✗ {dir_name} — unexpected error: {e}{Colors.RESET}")

    # --- Summary Report ---
    elapsed = time.time() - start_time

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  Summary Report")
    print(f"{'=' * 56}{Colors.RESET}")
    print(f"  Total places found:  {stats['total']}")
    print(f"  {Colors.GREEN}Generated:             {stats['generated']}{Colors.RESET}")
    print(f"  {Colors.DIM}Skipped (up-to-date):  {stats['skipped']}{Colors.RESET}")
    print(f"  {Colors.RED}Failed:                {stats['failed']}{Colors.RESET}")
    print(f"  Threads used:        {args.threads}")
    print(f"  Time elapsed:        {elapsed:.1f}s")

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

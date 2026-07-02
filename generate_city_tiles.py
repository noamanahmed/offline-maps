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
CONFIG_PATH = os.path.join(WORKSPACE_DIR, "scripts", "config.json")
PROCESS_PATH = os.path.join(WORKSPACE_DIR, "scripts", "process.lua")

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
}


def record_missing(dir_name, place_dir, place_type):
    rel_path = os.path.relpath(place_dir, MAPS_DIR)
    with stats_lock:
        stats["missing_pbf"].append(f"{dir_name} ({place_type}) → {rel_path}")


def generate_place_tiles(task, force=False):
    """Process a single place — convert .osm.pbf to .mbtiles."""
    (dir_name, root, output_pbf, output_mbtiles, place_type) = task

    has_pbf = os.path.exists(output_pbf)
    has_mbtiles = os.path.exists(output_mbtiles)

    # Skip if MBTiles exists and we aren't forcing regeneration
    if has_mbtiles and not force:
        with stats_lock:
            stats["skipped"] += 1
        return ("skipped", dir_name, place_type, 0)

    # Can't generate without raw PBF data
    if not has_pbf:
        record_missing(dir_name, root, place_type)
        with stats_lock:
            stats["failed"] += 1
        return ("missing-source", dir_name, place_type, 0)

    status = "generated"
    mbtiles_size_kb = 0

    try:
        # Run tilemaker with 1 thread per job to utilize ThreadPoolExecutor's concurrency better
        subprocess.run([
            "tilemaker",
            "--input", output_pbf,
            "--output", output_mbtiles,
            "--config", CONFIG_PATH,
            "--process", PROCESS_PATH,
            "--threads", "1"
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        if os.path.exists(output_mbtiles):
            mbtiles_size_kb = os.path.getsize(output_mbtiles) / 1024
            with stats_lock:
                stats["generated"] += 1
        else:
            with stats_lock:
                stats["failed"] += 1
            return ("failed", dir_name, place_type, 0)

    except subprocess.CalledProcessError as e:
        with stats_lock:
            stats["failed"] += 1
        return ("failed", dir_name, place_type, 0)

    return ("generated", dir_name, place_type, mbtiles_size_kb)


def collect_places(args):
    """Scan and collect all places matching filters."""
    places = []

    for country in sorted(os.listdir(MAPS_DIR)):
        if args.country and country.lower() != args.country.lower():
            continue

        country_dir = os.path.join(MAPS_DIR, country)
        if not os.path.isdir(country_dir):
            continue

        # Look for the subdirectories (provinces, places)
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
            province = meta.get("province", "")
            place_name = meta.get("name", "")

            if args.province and args.province.lower() != province.lower():
                continue

            if args.place and args.place.lower() not in place_name.lower() and args.place.lower() != dir_name.lower():
                continue

            output_pbf = os.path.join(root, f"{dir_name}.osm.pbf")
            output_mbtiles = os.path.join(root, f"{dir_name}.mbtiles")

            places.append((
                dir_name, root, output_pbf, output_mbtiles, place_type
            ))

    return places


def main():
    if not os.path.exists(MAPS_DIR):
        print(f"Error: Maps directory '{MAPS_DIR}' does not exist.", file=sys.stderr)
        sys.exit(1)

    # Make sure tilemaker is installed
    try:
        subprocess.run(["tilemaker", "--help"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except FileNotFoundError:
        print(f"{Colors.RED}Error: tilemaker is not installed or not in PATH.{Colors.RESET}", file=sys.stderr)
        sys.exit(1)

    # Make sure config files exist
    if not os.path.exists(CONFIG_PATH) or not os.path.exists(PROCESS_PATH):
        print(f"{Colors.RED}Error: Tilemaker config/process files not found at {CONFIG_PATH} or {PROCESS_PATH}.{Colors.RESET}", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Offline Vector Tile Generator")
    parser.add_argument("--country", help="Filter by country name (case-insensitive, e.g. pakistan)")
    parser.add_argument("--province", help="Filter by province/state name (case-insensitive, e.g. punjab)")
    parser.add_argument("--place", "--city", dest="place", help="Filter by city/village name (case-insensitive, e.g. lahore)")
    parser.add_argument("--threads", "-t", type=int, default=4, help="Number of parallel threads (default: 4)")
    parser.add_argument("--force", "-f", action="store_true", help="Force rebuild of .mbtiles even if it already exists")
    args = parser.parse_args()

    start_time = time.time()

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  OSM Vector Tile Generator  ({args.threads} threads)")
    if args.country or args.province or args.place:
        print(f"  Filters applied:")
        if args.country: print(f"    - Country:  {args.country}")
        if args.province: print(f"    - Province: {args.province}")
        if args.place: print(f"    - Place:    {args.place}")
    if args.force:
        print(f"  Force mode: Enabled")
    print(f"{'=' * 56}{Colors.RESET}\n")

    # Collect places
    print(f"{Colors.DIM}Scanning for places...{Colors.RESET}")
    places = collect_places(args)

    stats["total"] = len(places)

    if not places:
        print(f"{Colors.YELLOW}No places found matching filters.{Colors.RESET}")
        return

    # Count work items (needs tile generation)
    needs_work = sum(1 for p in places
                     if args.force or not os.path.exists(p[3]))
    print(f"{Colors.CYAN}Found {len(places)} places, {needs_work} need tile generation.{Colors.RESET}\n")

    # Process in parallel
    completed_count = 0
    needs_work_display = needs_work if needs_work > 0 else len(places)

    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        futures = {executor.submit(generate_place_tiles, p, args.force): p for p in places}

        for future in as_completed(futures):
            task = futures[future]
            dir_name = task[0]
            try:
                result = future.result()
                status, dname, ptype, mbtiles_kb = result

                completed_count += 1
                done = completed_count

                if status == "skipped":
                    print(f"  {Colors.DIM}[{done}/{needs_work_display}] ⏭ SKIP  {dname} ({ptype}) — already exists{Colors.RESET}")
                elif status == "missing-source":
                    print(f"  {Colors.RED}[{done}/{needs_work_display}] ✗ {dname} ({ptype}) — no source .osm.pbf available{Colors.RESET}")
                elif status == "failed":
                    print(f"  {Colors.RED}[{done}/{needs_work_display}] ✗ {dname} ({ptype}) — tile generation failed{Colors.RESET}")
                elif status == "generated":
                    pts = f"{Colors.GREEN}✓ TILES{Colors.RESET}  {mbtiles_kb:.0f}KB" if mbtiles_kb else ""
                    print(f"  [{done}/{needs_work_display}] {Colors.CYAN}▶ GEN{Colors.RESET}   {dname} ({ptype})  {pts}")
            except Exception as e:
                print(f"  {Colors.RED}✗ {dir_name} — unexpected error: {e}{Colors.RESET}")

    # Summary report
    elapsed = time.time() - start_time

    print(f"\n{Colors.BOLD}{'=' * 56}")
    print(f"  Summary Report")
    print(f"{'=' * 56}{Colors.RESET}")
    print(f"  Total places found:  {stats['total']}")
    print(f"  {Colors.GREEN}Generated:             {stats['generated']}{Colors.RESET}")
    print(f"  {Colors.DIM}Skipped:               {stats['skipped']}{Colors.RESET}")
    print(f"  {Colors.RED}Failed:                {stats['failed']}{Colors.RESET}")
    print(f"  Threads used:        {args.threads}")
    print(f"  Time elapsed:        {elapsed:.1f}s")

    if stats["missing_pbf"]:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠  Missing Source .osm.pbf Warnings{Colors.RESET}")
        print(f"{Colors.YELLOW}{'─' * 56}{Colors.RESET}")
        for entry in stats["missing_pbf"][:20]:
            print(f"    • {entry}")
        if len(stats["missing_pbf"]) > 20:
            print(f"    ... and {len(stats['missing_pbf']) - 20} more")
        print(f"\n  Total places missing PBF: {len(stats['missing_pbf'])}{Colors.RESET}")
        print(f"  {Colors.DIM}Generate missing PBF files using generate_city_data.sh first.{Colors.RESET}")
    else:
        print(f"\n{Colors.GREEN}✓ All places loaded has complete vector tiles.{Colors.RESET}")

    print()


if __name__ == "__main__":
    main()

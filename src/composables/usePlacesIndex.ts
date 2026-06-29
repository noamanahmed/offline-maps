import { ref } from 'nativescript-vue';
import { knownFolders, path, isAndroid, isIOS } from '@nativescript/core';
import { useNativeFileReader } from './useNativeFileReader';
import { Place } from './useSavedLocation';

const placesIndex = ref<Place[]>([]);
const uniqueCountries = ref<string[]>([]);
const uniqueProvinces = ref<string[]>([]);

const { readTextFile } = useNativeFileReader();

function readJavaTextFile(absPath: string): string {
  const br = new (global as any).java.io.BufferedReader(
    new (global as any).java.io.InputStreamReader(
      new (global as any).java.io.FileInputStream(new (global as any).java.io.File(absPath)), "UTF-8"
    )
  );
  const sb = new (global as any).java.lang.StringBuilder();
  let line;
  while ((line = br.readLine()) !== null) {
    sb.append(line).append("\n");
  }
  br.close();
  return sb.toString();
}

function scanAndroidDir(dir: any, country: string, province: string | null, type: string | null) {
  if (!dir.exists() || !dir.isDirectory()) return;
  const entries = dir.listFiles();
  if (!entries) return;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryName = entry.getName();

    if (entry.isDirectory()) {
      if (!country) {
        scanAndroidDir(entry, entryName, null, null);
      } else if (!province) {
        scanAndroidDir(entry, country, entryName, null);
      } else if (!type) {
        scanAndroidDir(entry, country, province, entryName);
      } else {
        scanAndroidDir(entry, country, province, type);
      }
    } else if (type && entryName.endsWith('.json') && entryName !== 'pois.json') {
      const placeName = entryName.replace(/\.json$/, '');
      const parentDir = entry.getParentFile();
      const poisFile = new (global as any).java.io.File(parentDir, 'pois.json');
      const pbfFile = new (global as any).java.io.File(parentDir, `${placeName}.osm.pbf`);

      if (poisFile.exists() && pbfFile.exists()) {
        try {
          const content = readJavaTextFile(entry.getAbsolutePath());
          const meta = JSON.parse(content);
          const placeType = (type || '').replace(/ies$/, 'y').replace(/s$/, '');
          placesIndex.value.push({
            id: meta.id || 0,
            name: meta.name || placeName,
            name_ur: meta.name_ur || '',
            type: placeType,
            lat: meta.latitude || meta.lat || 0,
            lon: meta.longitude || meta.lon || 0,
            province: meta.province || province || '',
            country: meta.country || country || '',
            path: `${country}/${province}/${type}/${placeName}`
          });
        } catch (e) {
          console.error(`[VERBOSE] loadPlacesIndex: Failed to parse ${entry.getAbsolutePath()}:`, e);
        }
      }
    }
  }
}

function scanIOSDir(dirPath: string, country: string, province: string | null, type: string | null) {
  const fm = (global as any).NSFileManager.defaultManager;
  const entries = fm.contentsOfDirectoryAtPath_error_(dirPath, null);
  if (!entries) return;

  const count = entries.count;
  for (let i = 0; i < count; i++) {
    const entryName = entries.objectAtIndex(i);
    const fullPath = path.join(dirPath, entryName);
    const isDirRef = { value: false };
    fm.fileExistsAtPath_isDirectory_(fullPath, isDirRef);
    const isDirectory = isDirRef.value;

    if (isDirectory) {
      if (!country) {
        scanIOSDir(fullPath, entryName, null, null);
      } else if (!province) {
        scanIOSDir(fullPath, country, entryName, null);
      } else if (!type) {
        scanIOSDir(fullPath, country, province, entryName);
      } else {
        scanIOSDir(fullPath, country, province, type);
      }
    } else if (type && entryName.endsWith('.json') && entryName !== 'pois.json') {
      const placeName = entryName.replace(/\.json$/, '');
      const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
      const poisPath = path.join(parentDir, 'pois.json');
      const pbfPath = path.join(parentDir, `${placeName}.osm.pbf`);

      if (fm.fileExistsAtPath(poisPath) && fm.fileExistsAtPath(pbfPath)) {
        try {
          const content = (global as any).NSString.stringWithContentsOfFile_encoding_error_(
            fullPath, 4, null
          );
          const meta = JSON.parse(content);
          const placeType = (type || '').replace(/ies$/, 'y').replace(/s$/, '');
          placesIndex.value.push({
            id: meta.id || 0,
            name: meta.name || placeName,
            name_ur: meta.name_ur || '',
            type: placeType,
            lat: meta.latitude || meta.lat || 0,
            lon: meta.longitude || meta.lon || 0,
            province: meta.province || province || '',
            country: meta.country || country || '',
            path: `${country}/${province}/${type}/${placeName}`
          });
        } catch (e) {
          console.error(`[VERBOSE] loadPlacesIndex: Failed to parse ${fullPath}:`, e);
        }
      }
    }
  }
}

export function usePlacesIndex() {

  function scanPlaces() {
    try {
      placesIndex.value = [];
      const mapsRoot = path.join(knownFolders.currentApp().path, 'maps', 'countries');

      if (isAndroid) {
        scanAndroidDir(new (global as any).java.io.File(mapsRoot), '', null, null);
      } else if (isIOS) {
        scanIOSDir(mapsRoot, '', null, null);
      }

      const countries = new Set<string>();
      placesIndex.value.forEach(p => {
        if (p.country) countries.add(p.country);
      });
      uniqueCountries.value = Array.from(countries).sort();
      console.log(`[VERBOSE] loadPlacesIndex: Scanned ${placesIndex.value.length} places dynamically.`);
    } catch (err) {
      console.error("Error scanning places index:", err);
    }
  }

  function filterProvincesByCountry(country: string): string[] {
    const provinces = new Set<string>();
    placesIndex.value.forEach(p => {
      if (p.country === country && p.province) provinces.add(p.province);
    });
    return Array.from(provinces).sort();
  }

  function filterPlacesByCountryProvinceType(country: string, province: string, type: string): Place[] {
    return placesIndex.value
      .filter(p => p.country === country && p.province === province && p.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function searchPlaces(query: string, limit: number = 15): Place[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return placesIndex.value
      .filter(p => p.name.toLowerCase().includes(q) || (p.name_ur && p.name_ur.includes(q)))
      .slice(0, limit);
  }

  function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return {
    placesIndex,
    uniqueCountries,
    uniqueProvinces,
    scanPlaces,
    filterProvincesByCountry,
    filterPlacesByCountryProvinceType,
    searchPlaces,
    getDistanceKm
  };
}

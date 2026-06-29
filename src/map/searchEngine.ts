import type { MapState, POI, OSMWay } from './types';
import { postSearchResults } from './messageBridge';

declare const L: any;

export function runSearch(state: MapState, query: string, anchorLat: number, anchorLon: number) {
  const q = (query || '').toLowerCase().trim();

  const poiResults: any[] = [];
  const roadResults: any[] = [];

  // POI search
  if (q.length === 0) {
    state.loadedPoisData.forEach(item => {
      poiResults.push({
        name: item.name || 'Unknown',
        category: item.category,
        subcategory: item.subcategory,
        latitude: item.latitude,
        longitude: item.longitude,
        id: item.id
      });
    });
  } else {
    const exactMatches: POI[] = [];
    const prefixMatches: POI[] = [];
    const containsMatches: POI[] = [];

    state.loadedPoisData.forEach(poi => {
      if (!poi.name) return;
      const nameLower = poi.name.toLowerCase();
      const subcatLower = (poi.subcategory || '').toLowerCase();
      const catLower = (poi.category || '').toLowerCase();

      if (nameLower === q) {
        exactMatches.push(poi);
      } else if (nameLower.startsWith(q)) {
        prefixMatches.push(poi);
      } else if (nameLower.includes(q) || subcatLower.includes(q) || catLower.includes(q)) {
        containsMatches.push(poi);
      }
    });

    [...exactMatches, ...prefixMatches, ...containsMatches].forEach(item => {
      poiResults.push({
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        latitude: item.latitude,
        longitude: item.longitude,
        id: item.id
      });
    });
  }

  // Road search
  if (q.length > 0) {
    const seen: Record<string, boolean> = {};
    state.loadedWays.forEach((way, idx) => {
      if (way.tags && way.tags.name) {
        const name = way.tags.name;
        if (name.toLowerCase().includes(q) && !seen[name]) {
          seen[name] = true;
          const midIdx = Math.floor(way.nodes.length / 2);
          const midNode = state.loadedNodes[way.nodes[midIdx]];
          if (midNode) {
            roadResults.push({
              name,
              category: 'road',
              subcategory: way.tags.highway || 'road',
              latitude: midNode[0],
              longitude: midNode[1],
              id: 'road-' + idx
            });
          }
        }
      }
    });
  }

  // Combine and sort by distance if anchor provided
  const combined = [...poiResults, ...roadResults];

  if (anchorLat !== undefined && anchorLon !== undefined && state.map) {
    const anchor = L.latLng(anchorLat, anchorLon);
    combined.forEach(item => {
      const pt = L.latLng(item.latitude, item.longitude);
      (item as any).distance = state.map.distance(anchor, pt) / 1000;
    });
    if (q.length === 0) {
      combined.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }
  }

  postSearchResults(state, combined, 10);
}

import type { POI, Message, MapState } from './types';

declare const L: any;

export function initMessageBridge(state: MapState) {
  (window as any).getAndClearMessages = function(): string {
    const msgs = JSON.stringify(state.pendingMessages);
    state.pendingMessages = [];
    return msgs;
  };

  (window as any).postMessage = function(type: string, data: any) {
    state.pendingMessages.push({ type, data });
  };
}

export function postMessage(state: MapState, type: string, data: any) {
  state.pendingMessages.push({ type, data });
}

export function postSearchResults(state: MapState, results: any[], maxResults: number = 10) {
  postMessage(state, 'search-results', results.slice(0, maxResults));
}

export function postPOISelected(state: MapState, poi: POI) {
  postMessage(state, 'poi-selected', {
    name: poi.name,
    category: poi.category,
    subcategory: poi.subcategory,
    latitude: poi.latitude,
    longitude: poi.longitude,
    id: poi.id
  });
}

export function postMapClicked(state: MapState, lat: number, lng: number) {
  postMessage(state, 'map-clicked', { lat, lng });
}

export function postRouteDrawn(state: MapState, fromLat: number, fromLng: number, toLat: number, toLng: number, distance: string) {
  postMessage(state, 'route-drawn', { distance, fromLat, fromLng, toLat, toLng });
}

export function postMapDataLoaded(state: MapState) {
  postMessage(state, 'map-data-loaded', { loaded: true, poiCount: state.loadedPoisData.length });
}

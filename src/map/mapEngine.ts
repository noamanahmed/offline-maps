import type { MapState, OSMElement } from './types';
import { createMapState } from './types';
import { initMessageBridge, postMessage, postMapClicked, postMapDataLoaded } from './messageBridge';
import { installBufferPolyfill, base64ToUint8Array } from './bufferPolyfill';
import { injectGPSStyles, updateGPSMarker, centerOnUser, centerOnCoordinates } from './gpsMarker';
import { renderAllPOIs, clearPOIs, setSelectedPin, clearSelectedPin } from './poiRenderer';
import { renderRoads, redrawRoads, clearRoads } from './roadRenderer';
import { runSearch } from './searchEngine';
import { drawRoute, clearRoute } from './routeDrawer';

declare const osmpbf: any;
declare const L: any;

const state: MapState = createMapState();

export function bootMap(mapInstance: any) {
  state.map = mapInstance;

  installBufferPolyfill();
  injectGPSStyles();
  initMessageBridge(state);

  mapInstance.on('click', (e: any) => {
    setSelectedPin(state, e.latlng.lat, e.latlng.lng, 'Dropped Pin');
    postMapClicked(state, e.latlng.lat, e.latlng.lng);
  });

  // Expose API for NativeScript to call
  (window as any).loadMapDataDirect = (pbfBase64: string, poisJson: string, centerLat: number, centerLng: number, zoom: number, isGPSConnected: boolean) => {
    clearRoads(state);
    clearPOIs(state);
    state.map.setView([centerLat, centerLng], zoom || 14);

    if (pbfBase64) {
      try {
        const pbfBytes = base64ToUint8Array(pbfBase64);
        const osmData = osmpbf(pbfBytes) as { elements: OSMElement[] };
        osmData.elements.forEach(el => {
          if (el.type === 'node') {
            state.loadedNodes[el.id] = [el.lat, el.lon];
          } else if (el.type === 'way') {
            state.loadedWays.push(el);
          }
        });
        renderRoads(state);
        console.log('[VERBOSE] Rendered ' + state.loadedWays.length + ' roads.');
      } catch (err: any) {
        console.error('[VERBOSE] PBF parse error: ' + err.message);
      }
    }

    if (poisJson) {
      try {
        const pois = JSON.parse(poisJson);
        renderAllPOIs(state, pois);
        console.log('[VERBOSE] Loaded ' + state.loadedPoisData.length + ' POIs.');
      } catch (err: any) {
        console.error('[VERBOSE] POI parse error: ' + err.message);
      }
    }

    if (state.userLocationMarker) {
      state.userLocationMarker.addTo(state.map);
    }
    postMapDataLoaded(state);
  };

  (window as any).setTheme = (theme: 'light' | 'dark') => {
    state.currentTheme = theme;
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    (document.getElementById('map') as HTMLElement).style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f4f3f0';
    redrawRoads(state);
  };

  (window as any).updateUserLocation = (lat: number, lng: number, connected: boolean) => {
    updateGPSMarker(state, lat, lng, connected);
  };

  (window as any).centerOnUser = () => centerOnUser(state);
  (window as any).centerOnCoordinates = (lat: number, lng: number, zoom?: number) => centerOnCoordinates(state, lat, lng, zoom);
  (window as any).clearSelectedPin = () => clearSelectedPin(state);
  (window as any).runSearch = (query: string, anchorLat: number, anchorLon: number) => runSearch(state, query, anchorLat, anchorLon);
  (window as any).drawRoute = (fromLat: number, fromLng: number, toLat: number, toLng: number) => drawRoute(state, fromLat, fromLng, toLat, toLng);
  (window as any).clearRoute = () => clearRoute(state);
  (window as any).focusPoi = (lat: number, lng: number, name: string) => {
    state.map.setView([lat, lng], 17);
    setSelectedPin(state, lat, lng, name);
    postMessage(state, 'poi-selected', { name, latitude: lat, longitude: lng, category: '', subcategory: '', id: 0 });
  };
}

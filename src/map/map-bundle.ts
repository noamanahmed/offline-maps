import { bootMap } from './mapEngine';

declare const L: any;

(window as any).__mapBundleReady = function() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('[VERBOSE] map-bundle.ts: #map container not found');
    return;
  }

  const map = (L as any).map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([31.5656822, 74.3141829], 13);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true,
    errorTileUrl: ''
  }).addTo(map);

  bootMap(map);
};

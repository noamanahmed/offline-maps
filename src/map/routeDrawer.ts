import type { MapState } from './types';
import { postRouteDrawn } from './messageBridge';

declare const L: any;

export function drawRoute(state: MapState, fromLat: number, fromLng: number, toLat: number, toLng: number) {
  clearRoute(state);

  const routePoints: [number, number][] = [[fromLat, fromLng], [toLat, toLng]];

  state.routeLayer = L.polyline(routePoints, {
    color: '#1a73e8',
    weight: 5,
    opacity: 0.8,
    dashArray: '12, 8',
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(state.map);

  const startIcon = L.divIcon({
    className: 'route-marker-start',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#0f9d58;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  const endIcon = L.divIcon({
    className: 'route-marker-end',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#ea4335;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  state.routeMarkers.push(L.marker([fromLat, fromLng], { icon: startIcon, zIndexOffset: 900 }).addTo(state.map));
  state.routeMarkers.push(L.marker([toLat, toLng], { icon: endIcon, zIndexOffset: 900 }).addTo(state.map));

  state.map.fitBounds(state.routeLayer.getBounds().pad(0.3));

  const dist = state.map.distance(L.latLng(fromLat, fromLng), L.latLng(toLat, toLng));
  const distText = dist > 1000 ? (dist / 1000).toFixed(1) + ' km' : Math.round(dist) + ' m';

  postRouteDrawn(state, fromLat, fromLng, toLat, toLng, distText);
}

export function clearRoute(state: MapState) {
  if (state.routeLayer) {
    state.map.removeLayer(state.routeLayer);
    state.routeLayer = null;
  }
  state.routeMarkers.forEach(m => state.map.removeLayer(m));
  state.routeMarkers = [];
}

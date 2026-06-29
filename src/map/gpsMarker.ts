import type { MapState } from './types';

declare const L: any;

const GPS_STYLES = `
.gps-marker-container { position: relative; width: 20px; height: 20px; }
.gps-marker-dot { width: 14px; height: 14px; border-radius: 50%; background-color: #1a73e8; border: 3px solid #fff; box-shadow: 0 0 6px rgba(0,0,0,0.3); position: absolute; top: 3px; left: 3px; z-index: 10; }
.gps-marker-dot.disconnected { background-color: #9aa0a6 !important; }
.gps-marker-halo { width: 32px; height: 32px; border-radius: 50%; background-color: rgba(26,115,232,0.25); position: absolute; top: -6px; left: -6px; animation: gps-pulse 2.5s infinite; pointer-events: none; z-index: 1; }
.gps-marker-halo.disconnected { display: none !important; }
`;

export function injectGPSStyles() {
  const style = document.createElement('style');
  style.textContent = GPS_STYLES;
  document.head.appendChild(style);
}

export function updateGPSMarker(state: MapState, lat: number, lng: number, connected: boolean) {
  const gpsClass = connected ? 'gps-marker-dot' : 'gps-marker-dot disconnected';
  const haloClass = connected ? 'gps-marker-halo' : 'gps-marker-halo disconnected';

  const html = '<div class="gps-marker-container"><div class="' + haloClass + '"></div><div class="' + gpsClass + '"></div></div>';

  const icon = L.divIcon({
    className: 'gps-custom-icon',
    html: html,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  if (state.userLocationMarker) {
    state.userLocationMarker.setLatLng([lat, lng]);
    state.userLocationMarker.setIcon(icon);
  } else {
    state.userLocationMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(state.map);
  }
}

export function centerOnUser(state: MapState) {
  if (state.userLocationMarker) {
    state.map.setView(state.userLocationMarker.getLatLng(), 15);
  }
}

export function centerOnCoordinates(state: MapState, lat: number, lng: number, zoom?: number) {
  state.map.setView([lat, lng], zoom || state.map.getZoom());
}

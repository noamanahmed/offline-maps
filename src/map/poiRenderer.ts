import type { MapState, POI, OSMWay, OSMElement } from './types';
import { postPOISelected } from './messageBridge';

declare const L: any;

const SVG_ICONS: Record<string, string> = {
  hospital: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>',
  restaurant: '<svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm8-3h-3V2h-2v11.13c0 1.44.97 2.66 2.38 2.87V22h2.5v-6c1-.22 1.76-1.1 1.95-2.16l.67-4.03C22.75 6.64 21.14 6 19 6z"/></svg>',
  cafe: '<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4zM20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm-2 10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V5h12v8zm2-5h-2V5h2v3z"/></svg>',
  shop: '<svg viewBox="0 0 24 24"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2c0 .55.45 1 1 1h1v6h10v-6h4v6h2v-6h1c.55 0 1-.45 1-1zm-9 6H6v-4h6v4z"/></svg>',
  place_of_worship: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
  default: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
};

const CATEGORY_COLORS: Record<string, string> = {
  hospital: '#1a73e8',
  school: '#f2a134',
  restaurant: '#e52592',
  cafe: '#e52592',
  fast_food: '#e52592',
  pub: '#e52592',
  bar: '#e52592',
  shop: '#4285f4',
  place_of_worship: '#795548',
  bank: '#0f9d58',
  pharmacy: '#1a73e8',
  fuel: '#0f9d58',
  hotel: '#ab47bc',
  tourism: '#ab47bc',
  leisure: '#0f9d58'
};

function getPOIColor(poi: POI): string {
  return CATEGORY_COLORS[poi.subcategory] || CATEGORY_COLORS[poi.category] || '#9aa0a6';
}

function getPOIIcon(poi: POI): string {
  const sub = poi.subcategory || '';
  const cat = poi.category || '';

  if (sub.includes('worship') || cat.includes('worship')) return SVG_ICONS.place_of_worship;
  if (sub === 'hospital' || sub === 'clinic' || sub === 'doctors' || sub === 'pharmacy') return SVG_ICONS.hospital;
  if (sub === 'restaurant' || sub === 'fast_food' || sub === 'food_court') return SVG_ICONS.restaurant;
  if (sub === 'cafe') return SVG_ICONS.cafe;
  if (cat === 'shop') return SVG_ICONS.shop;

  return SVG_ICONS[sub] || SVG_ICONS[cat] || SVG_ICONS.default;
}

export function renderPOI(state: MapState, poi: POI) {
  const color = getPOIColor(poi);
  const iconSvg = getPOIIcon(poi);
  const markerHtml = '<div class="poi-icon-wrapper">' + iconSvg + '</div>';
  const poiId = 'poi-' + poi.id;

  const customIcon = L.divIcon({
    className: 'poi-icon',
    html: markerHtml,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const marker = L.marker([poi.latitude, poi.longitude], { icon: customIcon }).addTo(state.map);

  marker.on('add', function() {
    const el = (marker as any).getElement();
    if (el) {
      el.id = poiId;
      el.style.backgroundColor = color;
    }
  });

  marker.on('click', function(e: any) {
    clearSelectedPin(state);
    L.DomEvent.stopPropagation(e);
    postPOISelected(state, poi);
  });

  state.poiMarkers.push(marker);
}

export function renderAllPOIs(state: MapState, pois: POI[]) {
  state.loadedPoisData = pois;
  pois.forEach(poi => renderPOI(state, poi));
}

export function clearPOIs(state: MapState) {
  state.poiMarkers.forEach(m => state.map.removeLayer(m));
  state.poiMarkers = [];
}

export function setSelectedPin(state: MapState, lat: number, lng: number, title?: string) {
  clearSelectedPin(state);

  const redPinSvg = '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
  const redIcon = L.divIcon({
    className: 'poi-icon',
    html: redPinSvg,
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  state.selectedLocationMarker = L.marker([lat, lng], { icon: redIcon }).addTo(state.map);
  if (title) {
    (state.selectedLocationMarker as any).bindTooltip(title, { permanent: false, direction: 'top' });
  }
}

export function clearSelectedPin(state: MapState) {
  if (state.selectedLocationMarker) {
    state.map.removeLayer(state.selectedLocationMarker);
    state.selectedLocationMarker = null;
  }
}

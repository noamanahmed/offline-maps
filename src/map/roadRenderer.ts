import type { MapState, OSMWay } from './types';

declare const L: any;

interface RoadStyle {
  color: string;
  weight: number;
  opacity: number;
  lineCap: string;
  lineJoin: string;
  dashArray?: string;
}

interface BorderStyle {
  color: string;
  weight: number;
  opacity: number;
  lineCap: string;
  lineJoin: string;
}

function getRoadStyle(highwayType: string, isDark: boolean): RoadStyle {
  const style: RoadStyle = {
    color: isDark ? '#3a3a3a' : '#ffffff',
    weight: 2,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  };

  switch (highwayType) {
    case 'motorway':
    case 'trunk':
    case 'primary':
      style.color = isDark ? '#f2a134' : '#ffe0b2';
      style.weight = 5;
      break;
    case 'secondary':
      style.color = isDark ? '#d48822' : '#fff3e0';
      style.weight = 4;
      break;
    case 'tertiary':
      style.color = isDark ? '#4a4a4a' : '#fcfcfc';
      style.weight = 3.5;
      break;
    case 'residential':
    case 'unclassified':
      style.color = isDark ? '#333333' : '#ffffff';
      style.weight = 2.5;
      break;
    case 'service':
    case 'road':
      style.color = isDark ? '#2a2a2a' : '#eaeaea';
      style.weight = 2;
      break;
    case 'footway':
    case 'path':
    case 'cycleway':
    case 'pedestrian':
    case 'track':
      style.color = isDark ? '#2e3a2e' : '#d2e4d2';
      style.weight = 1.5;
      style.dashArray = '4, 4';
      break;
  }

  return style;
}

export function renderRoads(state: MapState) {
  state.loadedWays.forEach(way => {
    if (!way.tags || !way.tags.highway) return;

    const latlngs: [number, number][] = [];
    for (let i = 0; i < way.nodes.length; i++) {
      const nodeCoords = state.loadedNodes[way.nodes[i]];
      if (nodeCoords) {
        latlngs.push(nodeCoords);
      }
    }

    if (latlngs.length < 2) return;

    const isDark = state.currentTheme === 'dark';
    const style = getRoadStyle(way.tags.highway, isDark);

    // Border line for Google Maps road style
    if (!style.dashArray) {
      const borderStyle: BorderStyle = {
        color: isDark ? '#121212' : '#e0e0e0',
        weight: style.weight + 1.5,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
      };
      const bgLine = L.polyline(latlngs, borderStyle).addTo(state.map);
      state.roadLayers.push(bgLine);
    }

    const line = L.polyline(latlngs, style).addTo(state.map);
    if (way.tags.name) {
      line.bindTooltip(way.tags.name, { sticky: true, className: 'street-label' });
    }
    state.roadLayers.push(line);
  });
}

export function redrawRoads(state: MapState) {
  state.roadLayers.forEach(l => state.map.removeLayer(l));
  state.roadLayers = [];
  renderRoads(state);
}

export function clearRoads(state: MapState) {
  state.roadLayers.forEach(l => state.map.removeLayer(l));
  state.roadLayers = [];
  state.loadedNodes = {};
  state.loadedWays = [];
}

export interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
}

export interface OSMWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags: Record<string, string>;
}

export type OSMElement = OSMNode | OSMWay;

export interface POI {
  id: number | string;
  name: string;
  category: string;
  subcategory: string;
  latitude: number;
  longitude: number;
}

export interface Message {
  type: string;
  data: any;
}

export interface MapState {
  map: any;
  currentTheme: 'light' | 'dark';
  roadLayers: any[];
  poiMarkers: any[];
  userLocationMarker: any | null;
  selectedLocationMarker: any | null;
  loadedNodes: Record<number, [number, number]>;
  loadedWays: OSMWay[];
  loadedPoisData: POI[];
  routeLayer: any | null;
  routeMarkers: any[];
  pendingMessages: Message[];
}

export function createMapState(): MapState {
  return {
    map: null,
    currentTheme: 'light',
    roadLayers: [],
    poiMarkers: [],
    userLocationMarker: null,
    selectedLocationMarker: null,
    loadedNodes: {},
    loadedWays: [],
    loadedPoisData: [],
    routeLayer: null,
    routeMarkers: [],
    pendingMessages: []
  };
}

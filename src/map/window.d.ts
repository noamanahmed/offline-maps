export {};
declare global {
  interface Window {
    getAndClearMessages: () => string;
    postMessage: (type: string, data: any) => void;
    loadMapDataDirect: (pbfBase64: string, poisJson: string, centerLat: number, centerLng: number, zoom: number, isGPSConnected: boolean) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    updateUserLocation: (lat: number, lng: number, connected: boolean) => void;
    centerOnUser: () => void;
    centerOnCoordinates: (lat: number, lng: number, zoom?: number) => void;
    clearSelectedPin: () => void;
    runSearch: (query: string, anchorLat: number, anchorLon: number) => void;
    drawRoute: (fromLat: number, fromLng: number, toLat: number, toLng: number) => void;
    clearRoute: () => void;
    focusPoi: (lat: number, lng: number, name: string) => void;
    __mapBundleReady: () => void;
  }
}

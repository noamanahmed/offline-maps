import { ref } from 'nativescript-vue';
import { knownFolders, path, isAndroid } from '@nativescript/core';
import { useNativeFileReader } from './useNativeFileReader';
import { useSavedLocation, Place } from './useSavedLocation';
import { searchResults } from './useSearch';

const { readTextFile, readBinaryFileToBase64 } = useNativeFileReader();
const { savePlace, loadSavedPlace, getLastCoordinates } = useSavedLocation();

let webView: any = null;
let pollingInterval: any = null;
let isInitialLoad = true;
let isLoadingPlace = false;

export const isWebViewLoaded = ref(false);
export const selectedDetails = ref<any>(null);
export const routeInfo = ref<any>(null);
export const loadedPlacePOICount = ref(0);
export const currentPlace = ref<Place>({
  id: 0, name: 'No Location Loaded', name_ur: '', type: 'city',
  lat: 0, lon: 0, province: '', country: '', path: ''
});

export function getMapFilePath(relative: string) {
  return 'file://' + path.join(knownFolders.currentApp().path, 'maps', relative);
}

export function callWebView(fnName: string, ...args: any[]) {
  if (!webView || !isWebViewLoaded.value) {
    console.warn(`[VERBOSE] callWebView: ${fnName} skipped — webView not ready (loaded=${isWebViewLoaded.value})`);
    return;
  }
  const argsStr = args.map(a => JSON.stringify(a)).join(', ');
  const script = `${fnName}(${argsStr})`;
  webView.executeJavaScript(script).catch((err: any) => {
    console.error(`[VERBOSE] callWebView: ${fnName} failed —`, err?.message || err);
  });
}

export function initBridge(wv: any) {
  webView = wv;

  webView.executeJavaScript = function (script: string) {
    return new Promise((resolve, reject) => {
      try {
        if (webView.android) {
          const callback = new (global as any).android.webkit.ValueCallback({
            onReceiveValue(value: string) { resolve(value); }
          });
          webView.android.evaluateJavascript(script, callback);
        } else if (webView.ios) {
          webView.ios.evaluateJavaScriptCompletionHandler(script, (result: any, error: any) => {
            if (error) reject(error);
            else resolve(result);
          });
        } else {
          reject(new Error("executeJavaScript: Unsupported platform"));
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  if (webView.android) {
    try {
      const settings = webView.android.getSettings();
      settings.setAllowFileAccess(true);
      settings.setAllowFileAccessFromFileURLs(true);
      settings.setAllowUniversalAccessFromFileURLs(true);
    } catch (err) {
      console.error("[VERBOSE] Error configuring Android WebView settings:", err);
    }
  }

  isWebViewLoaded.value = true;
  callWebView('setTheme', 'light');

  if (isInitialLoad) {
    isInitialLoad = false;
    startPolling();
    loadSavedLocation();
  }
}

function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (!webView) return;

    webView.executeJavaScript("window.getAndClearMessages()")
      .then((res: any) => {
        if (!res) return;
        let messages: any[] = [];
        try {
          let parsed = typeof res === 'string' ? JSON.parse(res) : res;
          if (typeof parsed === 'string') parsed = JSON.parse(parsed);
          messages = parsed || [];
        } catch (_) { /* parsing error */ }

        messages.forEach((msg: any) => {
          switch (msg.type) {
            case 'poi-selected':
              selectedDetails.value = {
                type: 'poi',
                name: msg.data.name,
                category: msg.data.category,
                subcategory: msg.data.subcategory,
                lat: msg.data.latitude,
                lon: msg.data.longitude,
                id: msg.data.id
              };
              break;
            case 'map-clicked':
              selectedDetails.value = {
                type: 'dropped-pin',
                name: 'Dropped Pin',
                lat: msg.data.lat,
                lon: msg.data.lng
              };
              break;
            case 'route-drawn':
              routeInfo.value = { distance: msg.data.distance };
              break;
            case 'search-results':
              searchResults.value = msg.data || [];
              break;
            case 'map-data-loaded':
              loadedPlacePOICount.value = msg.data.poiCount || 0;
              break;
          }
        });
      })
      .catch(() => {});
  }, 250);
}

export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export function loadPlace(place: Place, centerMap: boolean = true) {
  if (isLoadingPlace) {
    console.log(`[VERBOSE] loadPlace: Re-entrant call blocked.`);
    return;
  }
  isLoadingPlace = true;

  console.log(`[VERBOSE] loadPlace: "${place.name}" (${place.type}), centerMap: ${centerMap}`);

  const relativeDir = path.join('countries', place.path);
  const pbfFileName = `${place.path.split('/').pop()}.osm.pbf`;
  const pbfUrl = getMapFilePath(path.join(relativeDir, pbfFileName));
  const poisUrl = getMapFilePath(path.join(relativeDir, 'pois.json'));

  console.log(`[VERBOSE] loadPlace: "${place.name}" pbf=${pbfUrl} pois=${poisUrl}`);

  currentPlace.value = place;
  selectedDetails.value = null;
  savePlace(place);

  const absPbfPath = pbfUrl.replace('file://', '');
  const absPoisPath = poisUrl.replace('file://', '');
  const pbfBase64 = readBinaryFileToBase64(absPbfPath);
  const poisJson = readTextFile(absPoisPath);

  callWebView('loadMapDataDirect', pbfBase64, poisJson, place.lat, place.lon, centerMap ? 14 : null, false);

  const lastCoords = getLastCoordinates();
  if (lastCoords.lat && lastCoords.lon) {
    callWebView('updateUserLocation', lastCoords.lat, lastCoords.lon, false);
  }

  isLoadingPlace = false;
}

export function loadSavedLocation() {
  console.log(`[VERBOSE] loadSavedLocation: Loading saved location...`);
  const place = loadSavedPlace();
  if (place) {
    console.log(`[VERBOSE] loadSavedLocation: Restoring saved place: "${place.name}" from path "${place.path}"`);
    loadPlace(place, true);
  } else {
    console.log(`[VERBOSE] loadSavedLocation: No saved location.`);
  }
}

export function useMapBridge() {
  return {
    isWebViewLoaded,
    selectedDetails,
    routeInfo,
    loadedPlacePOICount,
    currentPlace,
    initBridge,
    startPolling,
    stopPolling,
    loadPlace,
    loadSavedLocation,
    getMapFilePath
  };
}

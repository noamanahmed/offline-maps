<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'nativescript-vue';
import { File, knownFolders, path, ApplicationSettings, isAndroid, isIOS, Application } from '@nativescript/core';
import * as Geolocation from '@nativescript/geolocation';
import { CoreTypes } from '@nativescript/core';

// --- State Variables ---
const isWebViewLoaded = ref(false);
const activeTheme = ref('light'); // 'light' or 'dark'
const isGPSConnected = ref(false);
const gpsAccuracy = ref('');
const isLocating = ref(false);
const currentOrientation = ref<'portrait' | 'landscape'>('portrait');
const showSettingsDrawer = ref(false);
const isSearchExpanded = ref(false);
const showControlDrawer = ref(false);

// POI Search state
const showSearchOverlay = ref(false);
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const searchSelectedItem = ref<any>(null);
const routeInfo = ref<any>(null);

// Active loaded place metadata
const currentPlace = ref<any>({
  id: null,
  name: 'No Location Loaded',
  type: 'city',
  province: '',
  country: '',
  path: '',
  lat: 0,
  lon: 0
});

// Selected POI or map click details
const selectedDetails = ref<any>(null);

// Geolocation track watch ID
let watchId: number | null = null;
let webView: any = null;
let pollingInterval: any = null;
let isInitialLoad = true;
let currentlyLoadedPbfPath = '';
let isLoadingPlace = false;

// Places Index (Loaded at runtime)
let placesIndex: any[] = [];
const uniqueCountries = ref<string[]>([]);
const uniqueProvinces = ref<string[]>([]);
const filteredPlaces = ref<any[]>([]);

// Wizard control
const showFirstTimeWizard = ref(false);
const showLocationChanger = ref(false);

// Wizard step states (First time)
const wizardStep = ref(1); // 1: Country, 2: Province, 3: Type & Place
const wizardSelectedCountry = ref('');
const wizardSelectedProvince = ref('');
const wizardTypeToggle = ref<'city' | 'village'>('city'); // Toggle for City vs Village
const wizardSelectedPlace = ref<any>(null);

// Location Changer states (Reverse order)
const changerSearchQuery = ref('');
const changerSelectedPlace = ref<any>(null);

// Load Places Index from assets
function loadPlacesIndex() {
  try {
    const filePath = path.join(knownFolders.currentApp().path, 'assets', 'places_index.json');
    if (File.exists(filePath)) {
      const file = File.fromPath(filePath);
      const content = file.readTextSync();
      placesIndex = JSON.parse(content);
      
      // Extract unique countries
      const countries = new Set<string>();
      placesIndex.forEach(p => {
        if (p.country) countries.add(p.country);
      });
      uniqueCountries.value = Array.from(countries).sort();
      console.log(`Loaded ${placesIndex.length} places from index.`);
    } else {
      console.error("Places index file not found at: " + filePath);
    }
  } catch (err) {
    console.error("Error loading places index:", err);
  }
}

// Distance formula to check vicinity (Euclidean distance on lat/lon)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = lat1 - lat2;
  const dLon = lon1 - lon2;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

// Proximity auto-switching disabled by user request

// --- NativeScript Geolocation Controls ---
async function requestGPSLocation() {
  isLocating.value = true;
  try {
    const hasPermission = await Geolocation.enableLocationRequest(true);
    isGPSConnected.value = true;
    startGPSTracking();
  } catch (err) {
    console.log("GPS Enable Request Rejected/Failed:", err);
    isGPSConnected.value = false;
    isLocating.value = false;
    
    // GPS unavailable and no saved location -> Trigger wizard
    if (!ApplicationSettings.getBoolean('wizard_completed', false)) {
      showFirstTimeWizard.value = true;
      wizardStep.value = 1;
    }
  }
}

function startGPSTracking() {
  if (watchId !== null) {
    console.log(`[VERBOSE] startGPSTracking: Clearing previous watch ID: ${watchId}`);
    Geolocation.clearWatch(watchId);
  }

  console.log("[VERBOSE] startGPSTracking: Starting watchLocation listener...");
  watchId = Geolocation.watchLocation(
    (loc) => {
      if (loc) {
        console.log(`[VERBOSE] GPS UPDATE: Lat: ${loc.latitude}, Lon: ${loc.longitude}, Accuracy: ${loc.horizontalAccuracy}m`);
        isGPSConnected.value = true;
        isLocating.value = false;
        gpsAccuracy.value = `${loc.horizontalAccuracy.toFixed(1)}m`;
        
        // Save last lat/long
        ApplicationSettings.setNumber('last_lat', loc.latitude);
        ApplicationSettings.setNumber('last_lon', loc.longitude);
        
        // Update user pointer on webview
        callWebView('updateUserLocation', loc.latitude, loc.longitude, true);
      }
    },
    (err) => {
      console.error("[VERBOSE] GPS Watch Location Error:", err);
      isGPSConnected.value = false;
      isLocating.value = false;
      
      // Handle GPS Disconnectivity: Draw grey marker at last known coordinates
      const lastLat = ApplicationSettings.getNumber('last_lat', 0);
      const lastLon = ApplicationSettings.getNumber('last_lon', 0);
      console.log(`[VERBOSE] GPS watchdog error/disconnection. Last known coords: (${lastLat}, ${lastLon})`);
      if (lastLat && lastLon) {
        callWebView('updateUserLocation', lastLat, lastLon, false);
      }
    },
    {
      desiredAccuracy: CoreTypes.Accuracy.high,
      updateDistance: 10, // 10 meters
      minimumUpdateTime: 4000 // 4 seconds
    }
  );
  console.log(`[VERBOSE] startGPSTracking: Registered watch ID: ${watchId}`);
}

// Re-center on current GPS Location
function reCenterGPS() {
  if (!isGPSConnected.value) {
    requestGPSLocation();
    return;
  }
  callWebView('centerOnUser');
}

// --- WebView Communication Bridge ---
function onWebViewLoaded(args: any) {
  webView = args.object;
  
  // Custom executeJavaScript bridge for standard NativeScript WebView
  webView.executeJavaScript = function(script: string) {
    return new Promise((resolve, reject) => {
      try {
        if (webView.android) {
          const callback = new (global as any).android.webkit.ValueCallback({
            onReceiveValue(value: string) {
              resolve(value);
            }
          });
          webView.android.evaluateJavascript(script, callback);
        } else if (webView.ios) {
          webView.ios.evaluateJavaScriptCompletionHandler(script, (result: any, error: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        } else {
          reject(new Error("executeJavaScript: Unsupported platform"));
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  // Configure Android WebView settings to allow cross-origin requests from local files
  if (webView.android) {
    try {
      console.log("[VERBOSE] onWebViewLoaded: Configuring Android WebView settings to allow local file access.");
      const settings = webView.android.getSettings();
      settings.setAllowFileAccess(true);
      settings.setAllowFileAccessFromFileURLs(true);
      settings.setAllowUniversalAccessFromFileURLs(true);
    } catch (err) {
      console.error("[VERBOSE] Error configuring Android WebView settings:", err);
    }
  }

  isWebViewLoaded.value = true;
  
  // Apply current theme
  callWebView('setTheme', activeTheme.value);
  
  if (isInitialLoad) {
    isInitialLoad = false;
    // Start polling messages from WebView
    startWebViewPolling();
    
    // Load saved location on startup
    loadSavedLocation();
  }
  // Note: Do NOT reload map data on subsequent @loadFinished events.
  // The WebView HTML page persists its state; re-calling loadMapData
  // would trigger another @loadFinished, creating an infinite loop.
}

function callWebView(fnName: string, ...args: any[]) {
  if (!webView || !isWebViewLoaded.value) {
    console.warn(`[VERBOSE] callWebView: ${fnName} skipped — webView not ready (loaded=${isWebViewLoaded.value})`);
    return;
  }
  const argsStr = args.map(a => JSON.stringify(a)).join(', ');
  const script = `${fnName}(${argsStr})`;
  
  webView.executeJavaScript(script)
    .catch((err: any) => {
      console.error(`[VERBOSE] callWebView: ${fnName} failed —`, err?.message || err);
    });
}

function startWebViewPolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    if (!webView) return;
    
    webView.executeJavaScript("window.getAndClearMessages()")
      .then((res: any) => {
        if (res) {
          let messages = [];
          try {
            let parsed = typeof res === 'string' ? JSON.parse(res) : res;
            if (typeof parsed === 'string') {
              parsed = JSON.parse(parsed);
            }
            messages = parsed || [];
          } catch (e) {
            // parsing error
          }
          
          messages.forEach((msg: any) => {
            if (msg.type === 'poi-selected') {
              selectedDetails.value = {
                type: 'poi',
                name: msg.data.name,
                category: msg.data.category,
                subcategory: msg.data.subcategory,
                lat: msg.data.latitude,
                lon: msg.data.longitude,
                id: msg.data.id
              };
            } else if (msg.type === 'map-clicked') {
              selectedDetails.value = {
                type: 'dropped-pin',
                name: 'Dropped Pin',
                lat: msg.data.lat,
                lon: msg.data.lng
              };
            } else if (msg.type === 'route-drawn') {
              routeInfo.value = {
                distance: msg.data.distance
              };
            } else if (msg.type === 'search-results') {
              searchResults.value = msg.data || [];
            }
          });
        }
      })
      .catch((err: any) => {
        // Polling error
      });
  }, 250);
}

// --- Local File Reading Helpers to Bypassing WebView CORS Limitations ---
function readTextFile(absolutePath: string): string {
  try {
    if (File.exists(absolutePath)) {
      const file = File.fromPath(absolutePath);
      const content = file.readTextSync();
      console.log(`[VERBOSE] readTextFile: Successfully read ${content.length} characters from ${absolutePath}`);
      return content;
    } else {
      console.error(`[VERBOSE] readTextFile: File does not exist: ${absolutePath}`);
    }
  } catch (err) {
    console.error(`[VERBOSE] readTextFile Error:`, err);
  }
  return '[]';
}

function readBinaryFileToBase64(absolutePath: string): string {
  if (!File.exists(absolutePath)) {
    console.error(`[VERBOSE] readBinaryFileToBase64: File does not exist: ${absolutePath}`);
    return '';
  }
  
  try {
    if (isAndroid) {
      const file = new (global as any).java.io.File(absolutePath);
      const length = file.length();
      const fis = new (global as any).java.io.FileInputStream(file);
      const bis = new (global as any).java.io.BufferedInputStream(fis);
      const bytes = (global as any).Array.create("byte", length);
      let totalRead = 0;
      while (totalRead < length) {
        const read = bis.read(bytes, totalRead, length - totalRead);
        if (read === -1) break;
        totalRead += read;
      }
      bis.close();
      const base64Str = (global as any).android.util.Base64.encodeToString(bytes, (global as any).android.util.Base64.NO_WRAP);
      console.log(`[VERBOSE] readBinaryFileToBase64: Successfully read ${length} bytes, base64 length: ${base64Str.length}`);
      return base64Str;
    } else if (isIOS) {
      const data = (global as any).NSData.dataWithContentsOfFile(absolutePath);
      if (data) {
        const base64Str = data.base64EncodedStringWithOptions(0);
        console.log(`[VERBOSE] readBinaryFileToBase64: Successfully read iOS file, base64 length: ${base64Str.length}`);
        return base64Str;
      }
    }
  } catch (err) {
    console.error(`[VERBOSE] readBinaryFileToBase64 Error:`, err);
  }
  return '';
}

// --- Place Loading and Settings Persistence ---
function loadPlace(place: any, centerMap: boolean = true) {
  // Guard against re-entrant calls
  if (isLoadingPlace) {
    console.log(`[VERBOSE] loadPlace: Re-entrant call blocked. Already loading a place.`);
    return;
  }
  isLoadingPlace = true;

  console.log(`[VERBOSE] loadPlace: Initiating load for place: "${place.name}" (${place.type}), centerMap: ${centerMap}`);

  // Resolve absolute paths under the app bundle's maps folder
  const mapsDir = path.join(knownFolders.currentApp().path, 'maps', 'countries', place.path);
  const pbfFile = path.join(mapsDir, `${place.path.split('/').pop()}.osm.pbf`);
  const poisFile = path.join(mapsDir, 'pois.json');

  console.log(`[VERBOSE] loadPlace: PBF absolute path: ${pbfFile}`);
  console.log(`[VERBOSE] loadPlace: POI absolute path: ${poisFile}`);

  const pbfBase64 = readBinaryFileToBase64(pbfFile);
  const poisJsonStr = readTextFile(poisFile);

  currentPlace.value = place;
  selectedDetails.value = null; // Reset selection panel

  // Save selected place coordinates and details
  ApplicationSettings.setBoolean('wizard_completed', true);
  ApplicationSettings.setString('saved_country', place.country);
  ApplicationSettings.setString('saved_province', place.province);
  ApplicationSettings.setString('saved_type', place.type);
  ApplicationSettings.setString('saved_path', place.path);
  ApplicationSettings.setString('saved_name', place.name);
  ApplicationSettings.setNumber('saved_lat', place.lat);
  ApplicationSettings.setNumber('saved_lon', place.lon);
  ApplicationSettings.setNumber('saved_id', place.id || 0);
  
  console.log(`[VERBOSE] loadPlace: Saved state to ApplicationSettings: name="${place.name}", lat=${place.lat}, lon=${place.lon}`);

  // Call WebView to load this data DIRECTLY, bypassing CORS and relative path scheme limitations
  callWebView(
    'loadMapDataDirect', 
    pbfBase64, 
    poisJsonStr, 
    place.lat, 
    place.lon, 
    centerMap ? 14 : null, // Pass zoom level if centering
    isGPSConnected.value
  );

  // Draw last user coordinates if available
  const lastLat = ApplicationSettings.getNumber('last_lat', 0);
  const lastLon = ApplicationSettings.getNumber('last_lon', 0);
  console.log(`[VERBOSE] loadPlace: Drawing user coordinates if available: (${lastLat}, ${lastLon}), GPS: ${isGPSConnected.value}`);
  if (lastLat && lastLon) {
    callWebView('updateUserLocation', lastLat, lastLon, isGPSConnected.value);
  }

  isLoadingPlace = false;
}

function loadSavedLocation() {
  console.log(`[VERBOSE] loadSavedLocation: Loading saved location...`);
  const wizardDone = ApplicationSettings.getBoolean('wizard_completed', false);
  console.log(`[VERBOSE] loadSavedLocation: wizard_completed is ${wizardDone}`);
  if (wizardDone) {
    const place = {
      country: ApplicationSettings.getString('saved_country'),
      province: ApplicationSettings.getString('saved_province'),
      type: ApplicationSettings.getString('saved_type'),
      path: ApplicationSettings.getString('saved_path'),
      name: ApplicationSettings.getString('saved_name'),
      lat: ApplicationSettings.getNumber('saved_lat'),
      lon: ApplicationSettings.getNumber('saved_lon'),
      id: ApplicationSettings.getNumber('saved_id', 0)
    };
    console.log(`[VERBOSE] loadSavedLocation: Restoring saved place: "${place.name}" from path "${place.path}"`);
    loadPlace(place, true);
  } else {
    console.log(`[VERBOSE] loadSavedLocation: Wizard not completed. Attempting GPS request...`);
    // Attempt GPS first to auto-detect location
    requestGPSLocation().then(() => {
      // If GPS successfully matched vicinity, map loads automatically.
      // Otherwise, open wizard.
      setTimeout(() => {
        const checkDone = ApplicationSettings.getBoolean('wizard_completed', false);
        console.log(`[VERBOSE] loadSavedLocation: GPS request complete. checkDone: ${checkDone}`);
        if (!checkDone) {
          console.log(`[VERBOSE] loadSavedLocation: Wizard still not completed. Triggering First Time Wizard overlay.`);
          showFirstTimeWizard.value = true;
          wizardStep.value = 1;
        }
      }, 2000);
    });
  }
}

// --- Theme Toggle ---
function toggleTheme() {
  activeTheme.value = activeTheme.value === 'light' ? 'dark' : 'light';
  callWebView('setTheme', activeTheme.value);
}

// --- Orientation Toggle ---
function toggleOrientation() {
  const target = currentOrientation.value === 'portrait' ? 'landscape' : 'portrait';
  if (isAndroid) {
    try {
      const activity = Application.android.foregroundActivity || Application.android.startActivity;
      if (activity) {
        // SCREEN_ORIENTATION_LANDSCAPE = 0
        // SCREEN_ORIENTATION_PORTRAIT = 1
        const req = target === 'landscape' ? 0 : 1;
        activity.setRequestedOrientation(req);
        currentOrientation.value = target;
      }
    } catch (err) {
      console.error("Error setting orientation on Android:", err);
    }
  } else if (isIOS) {
    try {
      const req = target === 'landscape' ? 3 : 1; // LandscapeLeft = 3, Portrait = 1
      if ((global as any).UIDevice && (global as any).UIDevice.currentDevice) {
        (global as any).UIDevice.currentDevice.setValueForKey(req, "orientation");
        currentOrientation.value = target;
      }
    } catch (err) {
      console.error("Error setting orientation on iOS:", err);
    }
  }
}

// --- First-time Wizard Controls ---
function selectWizardCountry(country: string) {
  wizardSelectedCountry.value = country;
  
  // Filter provinces of country
  const provinces = new Set<string>();
  placesIndex.forEach(p => {
    if (p.country === country && p.province) {
      provinces.add(p.province);
    }
  });
  uniqueProvinces.value = Array.from(provinces).sort();
  wizardStep.value = 2;
}

function selectWizardProvince(province: string) {
  wizardSelectedProvince.value = province;
  updateWizardPlaces();
  wizardStep.value = 3;
}

function toggleWizardType(type: 'city' | 'village') {
  wizardTypeToggle.value = type;
  updateWizardPlaces();
}

function updateWizardPlaces() {
  filteredPlaces.value = placesIndex.filter(p => 
    p.country === wizardSelectedCountry.value &&
    p.province === wizardSelectedProvince.value &&
    p.type === wizardTypeToggle.value
  ).sort((a, b) => a.name.localeCompare(b.name));
  
  wizardSelectedPlace.value = null;
}

function confirmWizard() {
  if (wizardSelectedPlace.value) {
    loadPlace(wizardSelectedPlace.value, true);
    showFirstTimeWizard.value = false;
  }
}

// --- Change Location (Reverse Dialog) Controls ---
function openChanger() {
  changerSearchQuery.value = '';
  changerSelectedPlace.value = null;
  filteredPlaces.value = [];
  showLocationChanger.value = true;
}

function onChangerSearchChange() {
  const query = changerSearchQuery.value.trim().toLowerCase();
  if (query.length < 2) {
    filteredPlaces.value = [];
    return;
  }
  
  // Search matching cities/villages
  filteredPlaces.value = placesIndex.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.name_ur && p.name_ur.includes(query))
  ).slice(0, 15); // limit to 15 results for performance
}

function selectChangerPlace(place: any) {
  changerSelectedPlace.value = place;
}

function confirmChanger() {
  if (changerSelectedPlace.value) {
    loadPlace(changerSelectedPlace.value, true);
    showLocationChanger.value = false;
  }
}

// --- POI Search Controls ---
function openSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  searchSelectedItem.value = null;
  routeInfo.value = null;
  showSearchOverlay.value = true;
  // Trigger initial nearest-POIs load (debounced via onSearchQueryChange)
  onSearchQueryChange();
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Debounce timer for search
let searchDebounceTimer: any = null;
const SEARCH_DEBOUNCE_MS = 300;

function onSearchQueryChange() {
  const query = searchQuery.value.trim();

  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  searchDebounceTimer = setTimeout(() => {
    const anchorLat = ApplicationSettings.getNumber('last_lat', currentPlace.value.lat);
    const anchorLon = ApplicationSettings.getNumber('last_lon', currentPlace.value.lon);

    if (!webView || !isWebViewLoaded.value) {
      searchResults.value = [];
      return;
    }

    webView.executeJavaScript(`runSearch(${JSON.stringify(query)}, ${anchorLat}, ${anchorLon})`)
      .catch((err: any) => {
        console.error('[VERBOSE] Search error:', err?.message || err);
      });
  }, SEARCH_DEBOUNCE_MS);
}

function selectSearchResult(item: any) {
  searchSelectedItem.value = item;
  if (item.placeData) {
    // For global place, just center view first (no local POI highlight)
    callWebView('centerOnCoordinates', item.latitude, item.longitude, 13);
  } else {
    // For local POI, focus and highlight
    callWebView('focusPoi', item.latitude, item.longitude, item.name);
  }
}

function getDirectionsToResult() {
  if (!searchSelectedItem.value) return;

  const destLat = searchSelectedItem.value.latitude;
  const destLon = searchSelectedItem.value.longitude;

  // Use GPS location as start if available, otherwise use current place center
  const startLat = ApplicationSettings.getNumber('last_lat', currentPlace.value.lat);
  const startLon = ApplicationSettings.getNumber('last_lon', currentPlace.value.lon);

  callWebView('drawRoute', startLat, startLon, destLat, destLon);
  showSearchOverlay.value = false;
}

function clearDirections() {
  callWebView('clearRoute');
  routeInfo.value = null;
}

function closeSearch() {
  showSearchOverlay.value = false;
  searchSelectedItem.value = null;
  searchResults.value = [];
}

// --- Lifecycle Hooks ---
onMounted(() => {
  loadPlacesIndex();
  requestGPSLocation();
});

onUnmounted(() => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
  }
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<template>
  <Page actionBarHidden="true" class="bg-[#f4f3f0]">
    <GridLayout rows="*, auto" columns="*">
      <!-- 1. The Offline Map WebView (fills screen) -->
      <WebView
        row="0"
        rowSpan="2"
        src="~/assets/map.html"
        @loadFinished="onWebViewLoaded"
        class="w-full h-full"
      />

      <!-- 2. Floating Top Search Bar -->
      <!-- 2. Floating Interface Grid (Header & Separate Control Stacks) -->
      <GridLayout row="0" rows="auto, *, auto" columns="auto, *, auto" isPassThroughParentEnabled="true">
        
        <!-- ==================== TOP ROW ==================== -->
        <!-- Collapsed Search Icon (Top-Left) -->
        <Button
          row="0"
          col="0"
          v-if="!isSearchExpanded"
          text="&#xebf7;"
          class="bx w-12 h-12 bg-white text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-gray-150 m-3 mt-10"
          style="elevation: 5;"
          @tap="openSearch"
        />

        <!-- Expanded Search Bar (Top-Left spanning columns) -->
        <GridLayout
          row="0"
          col="0"
          colSpan="2"
          v-if="isSearchExpanded"
          columns="auto, *, auto, auto"
          class="bg-white rounded-full p-2 shadow-lg border border-gray-100 m-3 mt-10"
          horizontalAlignment="stretch"
        >
          <Label col="0" text="&#xebf7;" class="bx text-xl align-middle px-3 text-blue-600 font-bold" verticalAlignment="center" />
          <StackLayout col="1" class="justify-center" @tap="openChanger">
            <Label :text="currentPlace.name" class="font-bold text-gray-800 text-base" maxLines="1" />
            <Label :text="currentPlace.province ? `${currentPlace.province}, ${currentPlace.country}` : 'Select a location'" class="text-gray-500 text-xs" maxLines="1" />
          </StackLayout>
          <StackLayout col="2" class="justify-center px-2">
            <Label :text="isGPSConnected ? '● GPS' : '○ Offline'" :class="isGPSConnected ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'" />
            <Label v-if="isGPSConnected && gpsAccuracy" :text="gpsAccuracy" class="text-gray-400 text-[10px]" />
          </StackLayout>
          <Label col="3" text="✕" class="text-lg text-gray-400 font-bold px-3" verticalAlignment="center" @tap="isSearchExpanded = false" />
        </GridLayout>

        <!-- Settings Cog Button (Top-Right) -->
        <Button
          row="0"
          col="2"
          text="&#xea6e;"
          :class="showSettingsDrawer ? 'bx w-12 h-12 bg-blue-50 text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-blue-200 m-3 mt-10' : 'bx w-12 h-12 bg-white text-2xl text-gray-700 font-bold rounded-full shadow-lg border border-gray-150 m-3 mt-10'"
          style="elevation: 5;"
          @tap="showSettingsDrawer = !showSettingsDrawer"
        />

        <!-- ==================== MIDDLE ROW ==================== -->
        <!-- Left Side Stack (Change Location + Rotate Screen) -->
        <StackLayout row="1" col="0" class="ml-3 justify-center" width="48">
          <!-- Change Map Area FAB -->
          <Button
            @tap="openChanger"
            text="&#xeb56;"
            class="bx w-12 h-12 bg-white text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3"
            style="elevation: 5;"
          />

          <!-- Toggle Orientation FAB -->
          <Button
            @tap="toggleOrientation"
            text="&#xeb8f;"
            class="bx w-12 h-12 bg-white text-2xl text-gray-700 font-bold rounded-full shadow-lg border border-gray-150"
            style="elevation: 5;"
          />
        </StackLayout>

        <!-- Right Side Stack (Theme + Re-center) -->
        <StackLayout row="1" col="2" class="mr-3 justify-center" width="48">
          <!-- Theme Selector FAB -->
          <Button
            @tap="toggleTheme"
            :text="activeTheme === 'light' ? '&#xeb94;' : '&#xec34;'"
            class="bx w-12 h-12 bg-white text-2xl text-purple-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3"
            style="elevation: 5;"
          />

          <!-- Re-center / Locate GPS FAB -->
          <Button
            @tap="reCenterGPS"
            text="&#xea7f;"
            :class="isLocating ? 'bx w-12 h-12 bg-blue-50 text-2xl text-green-600 font-bold rounded-full shadow-lg border border-blue-200 mb-3 animate-pulse' : 'bx w-12 h-12 bg-white text-2xl text-green-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3'"
            style="elevation: 5;"
          />
        </StackLayout>
      </GridLayout>

      <!-- 5. Route Info Banner (shown when route is active) -->
      <GridLayout
        v-if="routeInfo"
        row="0"
        rows="auto, *"
        columns="*"
        isPassThroughParentEnabled="true"
      >
        <GridLayout
          row="0"
          columns="auto, *, auto"
          class="bg-blue-600 m-3 mt-16 p-3 rounded-2xl shadow-lg"
          style="elevation: 6;"
        >
          <Label
            col="0"
            text="📡"
            class="text-lg px-2"
            verticalAlignment="center"
          />
          <StackLayout col="1" class="justify-center">
            <Label
              :text="`Distance: ${routeInfo.distance}`"
              class="text-white font-bold text-sm"
            />
            <Label
              text="Straight-line route"
              class="text-blue-200 text-xs"
            />
          </StackLayout>
          <Button
            col="2"
            text="✕"
            class="bg-blue-500 border-0 text-white rounded-full w-8 h-8 text-sm font-bold"
            @tap="clearDirections"
          />
        </GridLayout>
      </GridLayout>

      <!-- 6. Google Maps Place Details Bottom Panel -->
      <StackLayout
        v-if="selectedDetails || showSettingsDrawer"
        row="1"
        class="bg-white rounded-t-3xl shadow-2xl p-5 border-t border-gray-100"
        style="elevation: 10;"
      >
        <!-- Pull Handle -->
        <ContentView class="w-12 h-1.5 bg-gray-300 rounded-full align-self-center mb-4" />

        <GridLayout v-if="selectedDetails" columns="*, auto" rows="auto, auto, auto, auto" class="w-full">
          <!-- Title / POI Name -->
          <Label
            row="0"
            col="0"
            :text="selectedDetails.name"
            class="text-xl font-bold text-gray-800"
            textWrap="true"
          />
          <Button
            row="0"
            col="1"
            text="✕"
            class="bg-gray-100 border-0 text-gray-500 rounded-full w-8 h-8 text-sm align-top font-bold"
            @tap="selectedDetails = null"
          />

          <!-- Category/Subcategory -->
          <Label
            row="1"
            col="0"
            colSpan="2"
            :text="selectedDetails.type === 'poi' ? `${selectedDetails.category} (${selectedDetails.subcategory})` : 'Dropped Coordinates'"
            class="text-gray-500 text-sm font-semibold capitalize mt-1"
          />

          <!-- Coordinates Info -->
          <Label
            row="2"
            col="0"
            colSpan="2"
            :text="`Latitude: ${selectedDetails.lat.toFixed(6)} | Longitude: ${selectedDetails.lon.toFixed(6)}`"
            class="text-gray-400 text-xs mt-2"
          />

          <!-- Action Buttons -->
          <WrapLayout row="3" colSpan="2" class="mt-4 gap-3">
            <Button
              text="🚙 Directions"
              class="bg-blue-600 text-white rounded-full px-5 py-2 font-semibold text-sm border-0"
            />
            <Button
              text="📂 Save"
              class="bg-gray-100 text-gray-700 rounded-full px-5 py-2 font-semibold text-sm border-0"
            />
            <Button
              text="🔗 Share"
              class="bg-gray-100 text-gray-700 rounded-full px-5 py-2 font-semibold text-sm border-0"
            />
          </WrapLayout>
        </GridLayout>

        <!-- Default Place info showing active city/village details -->
        <GridLayout v-else columns="*, auto, auto" rows="auto, auto, auto" class="w-full">
          <StackLayout row="0" col="0" class="justify-center">
            <Label
              :text="currentPlace.name"
              class="text-xl font-bold text-gray-800"
            />
            <Label
              :text="`${currentPlace.type === 'city' ? '🏙️ City' : '🏡 Village'} in ${currentPlace.province}, ${currentPlace.country}`"
              class="text-gray-500 text-sm mt-0.5"
            />
          </StackLayout>
          
          <StackLayout row="0" col="1" class="items-end px-2">
            <!-- Dynamic vicinity indicator -->
            <Label
              text="💾 Memory Status"
              class="text-gray-400 text-[10px]"
            />
            <Label
              text="Only This Area Loaded"
              class="text-green-600 font-bold text-xs"
            />
          </StackLayout>

          <Button
            row="0"
            col="2"
            text="✕"
            class="bg-gray-100 border-0 text-gray-500 rounded-full w-8 h-8 text-sm align-top font-bold"
            @tap="showSettingsDrawer = false"
          />

          <Label
            row="1"
            colSpan="3"
            :text="`Coordinates: ${currentPlace.lat.toFixed(5)} , ${currentPlace.lon.toFixed(5)}`"
            class="text-gray-400 text-xs mt-3"
          />

          <Button
            row="2"
            colSpan="3"
            text="Change Location Manually"
            class="bg-blue-600 text-white rounded-full py-3 mt-4 text-center border-0 font-bold text-base shadow-lg"
            @tap="openChanger"
          />
        </GridLayout>
      </StackLayout>

      <!-- 6. First-Time Configuration Wizard Overlay (Country -> Province -> City/Village Selector) -->
      <GridLayout
        v-if="showFirstTimeWizard"
        row="0"
        rowSpan="2"
        rows="auto, *, auto"
        class="bg-[#f4f3f0] p-6 w-full h-full"
      >
        <!-- Wizard Title -->
        <StackLayout row="0" class="text-center mt-6 mb-4">
          <Label text="🗺️ Offline Map Explorer" class="text-2xl font-bold text-gray-800" />
          <Label text="Download Completed. Setup your offline area." class="text-gray-500 text-sm mt-1" />
          
          <!-- Step indicator -->
          <GridLayout columns="*, *, *" class="w-48 align-self-center mt-4">
            <ContentView col="0" :class="wizardStep >= 1 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
            <ContentView col="1" :class="wizardStep >= 2 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
            <ContentView col="2" :class="wizardStep >= 3 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
          </GridLayout>
        </StackLayout>

        <!-- Step 1: Select Country -->
        <StackLayout v-if="wizardStep === 1" row="1" class="justify-center">
          <Label text="Select Country" class="text-lg font-bold text-gray-800 mb-4 px-2" />
          <ListView :items="uniqueCountries" class="bg-white rounded-2xl shadow-lg border border-gray-100 h-64">
            <template #default="{ item }">
              <GridLayout columns="*, auto" class="p-4 border-b border-gray-100 active:bg-gray-100" @tap="selectWizardCountry(item)">
                <Label :text="item" class="text-lg font-semibold text-gray-800" />
                <Label col="1" text="➔" class="text-blue-600 font-bold text-lg" />
              </GridLayout>
            </template>
          </ListView>
        </StackLayout>

        <!-- Step 2: Select Province -->
        <StackLayout v-if="wizardStep === 2" row="1" class="justify-center">
          <Label :text="`Select Province of ${wizardSelectedCountry}`" class="text-lg font-bold text-gray-800 mb-4 px-2" />
          <ListView :items="uniqueProvinces" class="bg-white rounded-2xl shadow-lg border border-gray-100 h-64">
            <template #default="{ item }">
              <GridLayout columns="*, auto" class="p-4 border-b border-gray-100 active:bg-gray-100" @tap="selectWizardProvince(item)">
                <Label :text="item" class="text-lg font-semibold text-gray-800" />
                <Label col="1" text="➔" class="text-blue-600 font-bold text-lg" />
              </GridLayout>
            </template>
          </ListView>
          <Button text="↩ Back to Country" class="bg-transparent border-0 text-blue-600 font-bold mt-4" @tap="wizardStep = 1" />
        </StackLayout>

        <!-- Step 3: Toggle and Select Place -->
        <GridLayout v-if="wizardStep === 3" row="1" rows="auto, auto, *" class="w-full">
          <Label row="0" :text="`Select City or Village in ${wizardSelectedProvince}`" class="text-lg font-bold text-gray-800 mb-3 px-2" />
          
          <!-- Slide Toggle between City vs Village -->
          <GridLayout row="1" columns="*, *" class="bg-gray-200 rounded-full p-1 mb-4 w-64 align-self-center">
            <Button
              col="0"
              text="🏙️ Cities"
              :class="wizardTypeToggle === 'city' ? 'bg-white text-blue-600 font-bold rounded-full py-2 border-0' : 'bg-transparent text-gray-500 rounded-full py-2 border-0'"
              @tap="toggleWizardType('city')"
            />
            <Button
              col="1"
              text="🏡 Villages"
              :class="wizardTypeToggle === 'village' ? 'bg-white text-blue-600 font-bold rounded-full py-2 border-0' : 'bg-transparent text-gray-500 rounded-full py-2 border-0'"
              @tap="toggleWizardType('village')"
            />
          </GridLayout>

          <!-- List of relevant places -->
          <ListView row="2" :items="filteredPlaces" class="bg-white rounded-2xl shadow-lg border border-gray-100">
            <template #default="{ item }">
              <GridLayout
                columns="*, auto"
                :class="wizardSelectedPlace && wizardSelectedPlace.id === item.id ? 'p-4 border-b border-gray-100 bg-blue-50' : 'p-4 border-b border-gray-100 active:bg-gray-100'"
                @tap="wizardSelectedPlace = item"
              >
                <StackLayout>
                  <Label :text="item.name" class="text-lg font-semibold text-gray-800" />
                  <Label :text="item.name_ur || ''" class="text-sm text-gray-400 mt-0.5" />
                </StackLayout>
                <Label col="1" :text="wizardSelectedPlace && wizardSelectedPlace.id === item.id ? '✓' : ''" class="text-blue-600 font-bold text-xl" />
              </GridLayout>
            </template>
          </ListView>
        </GridLayout>

        <!-- Bottom Controls for Step 3 -->
        <GridLayout v-if="wizardStep === 3" row="2" columns="auto, *" class="mt-4 gap-4">
          <Button col="0" text="Back" class="bg-gray-200 text-gray-700 font-bold rounded-full px-6 py-3 border-0" @tap="wizardStep = 2" />
          <Button
            col="1"
            text="Explore Offline Map"
            :isEnabled="wizardSelectedPlace !== null"
            :class="wizardSelectedPlace !== null ? 'bg-blue-600 text-white font-bold rounded-full py-3 border-0' : 'bg-gray-300 text-gray-500 font-bold rounded-full py-3 border-0'"
            @tap="confirmWizard"
          />
        </GridLayout>
      </GridLayout>

      <!-- 7. Change Location Dialog - Reverse Order Overlay (Select Place -> Province -> Country) -->
      <GridLayout
        v-if="showLocationChanger"
        row="0"
        rowSpan="2"
        rows="auto, auto, *, auto, auto"
        class="bg-[#f4f3f0] p-6 w-full h-full"
      >
        <!-- Header -->
        <GridLayout row="0" columns="*, auto" class="mt-4 mb-4">
          <Label text="🔄 Change Map Area" class="text-2xl font-bold text-gray-800" />
          <Button col="1" text="✕" class="bg-gray-200 border-0 text-gray-600 rounded-full w-8 h-8 font-bold" @tap="showLocationChanger = false" />
        </GridLayout>

        <!-- Search Bar (Reverse lookup starts with Place search) -->
        <TextField
          row="1"
          v-model="changerSearchQuery"
          hint="🔍 Search city or village name..."
          class="bg-white rounded-full p-4 mb-4 shadow-sm border border-gray-200 text-base"
          @textChange="onChangerSearchChange"
        />

        <!-- Match List -->
        <ListView row="2" :items="filteredPlaces" class="bg-white rounded-2xl shadow-sm border border-gray-100">
          <template #default="{ item }">
            <GridLayout
              columns="*, auto"
              :class="changerSelectedPlace && changerSelectedPlace.id === item.id ? 'p-4 border-b border-gray-100 bg-blue-50' : 'p-4 border-b border-gray-100 active:bg-gray-100'"
              @tap="selectChangerPlace(item)"
            >
              <StackLayout>
                <Label :text="`${item.name} (${item.type})`" class="text-lg font-semibold text-gray-800" />
                <Label :text="item.name_ur || ''" class="text-sm text-gray-400 mt-0.5" />
              </StackLayout>
              <!-- Show Province & Country inline -->
              <Label col="1" :text="`${item.province}, ${item.country}`" class="text-gray-400 text-xs align-middle mr-2" />
            </GridLayout>
          </template>
        </ListView>

        <!-- Selected Location Details (Satisfying Reverse Order: first place, then province, then country) -->
        <StackLayout row="3" class="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-gray-100" v-if="changerSelectedPlace">
          <Label text="Selected Area Info (Reverse Trace):" class="text-gray-400 text-xs font-bold uppercase mb-2" />
          
          <GridLayout columns="80, *" class="py-1">
            <Label col="0" text="Place:" class="font-bold text-gray-500" />
            <Label col="1" :text="changerSelectedPlace.name" class="font-bold text-blue-600" />
          </GridLayout>
          
          <GridLayout columns="80, *" class="py-1">
            <Label col="0" text="Province:" class="font-bold text-gray-500" />
            <Label col="1" :text="changerSelectedPlace.province" class="text-gray-700" />
          </GridLayout>
          
          <GridLayout columns="80, *" class="py-1">
            <Label col="0" text="Country:" class="font-bold text-gray-500" />
            <Label col="1" :text="changerSelectedPlace.country" class="text-gray-700" />
          </GridLayout>
        </StackLayout>

        <!-- Confirm Button -->
        <Button
          row="4"
          text="Switch Offline Map Area"
          :isEnabled="changerSelectedPlace !== null"
          :class="changerSelectedPlace !== null ? 'bg-blue-600 text-white font-bold rounded-full py-4 mt-4 border-0 shadow-lg' : 'bg-gray-300 text-gray-500 font-bold rounded-full py-4 mt-4 border-0'"
          @tap="confirmChanger"
        />
      </GridLayout>
      <!-- 9. POI Search Overlay -->
      <GridLayout
        v-if="showSearchOverlay"
        row="0"
        rowSpan="2"
        rows="auto, auto, *, auto"
        class="bg-[#f4f3f0] p-4 w-full h-full"
      >
        <!-- Header -->
        <GridLayout row="0" columns="auto, *, auto" class="mt-6 mb-3">
          <Label col="0" text="🔍" class="text-2xl mr-2" verticalAlignment="center" />
          <Label col="1" text="Search Places" class="text-2xl font-bold text-gray-800" verticalAlignment="center" />
          <Button col="2" text="✕" class="bg-gray-200 border-0 text-gray-600 rounded-full w-8 h-8 font-bold" @tap="closeSearch" />
        </GridLayout>

        <!-- Search Input -->
        <TextField
          row="1"
          v-model="searchQuery"
          hint="Search POIs, shops, roads..."
          class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200 text-base"
          @textChange="onSearchQueryChange"
          returnKeyType="search"
        />

        <!-- Results List -->
        <GridLayout row="2" rows="*">
          <!-- Empty state -->
          <StackLayout v-if="searchResults.length === 0" class="justify-center items-center">
            <Label text="🗺️" class="text-5xl mb-4" />
            <Label text="No results found" class="text-gray-500 text-lg font-semibold" />
            <Label text="Try a different search term" class="text-gray-400 text-sm mt-1" />
          </StackLayout>

          <!-- Results -->
          <ListView v-if="searchResults.length > 0" :items="searchResults" class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <template #default="{ item }">
              <GridLayout
                columns="auto, *, auto"
                :class="searchSelectedItem && searchSelectedItem.id === item.id ? 'p-4 border-b border-gray-100 bg-blue-50' : 'p-4 border-b border-gray-100 active:bg-gray-100'"
                @tap="selectSearchResult(item)"
              >
                <!-- Category icon -->
                <Label
                  col="0"
                  :text="item.category === 'road' ? '🛣️' : item.category === 'place' ? (item.subcategory === 'city' ? '🏙️' : '🏡') : item.subcategory === 'restaurant' || item.subcategory === 'fast_food' ? '🍽️' : item.subcategory === 'hospital' || item.subcategory === 'clinic' ? '🏥' : item.subcategory === 'pharmacy' ? '💊' : item.subcategory === 'cafe' ? '☕' : item.subcategory === 'bank' ? '🏦' : item.subcategory === 'fuel' ? '⛽' : item.category === 'shop' ? '🛍️' : item.subcategory === 'school' || item.subcategory === 'college' || item.subcategory === 'university' ? '🏫' : '📍'"
                  class="text-xl mr-3"
                  verticalAlignment="center"
                />
                <!-- Name & Category -->
                <StackLayout col="1">
                  <Label :text="item.name" class="text-base font-semibold text-gray-800" maxLines="1" />
                  <Label :text="item.distance !== undefined ? `${item.category} • ${item.subcategory} • ${item.distance.toFixed(1)} km away` : `${item.category} • ${item.subcategory}`" class="text-gray-400 text-xs capitalize mt-0.5" />
                </StackLayout>
                <!-- Selection indicator -->
                <Label col="2" :text="searchSelectedItem && searchSelectedItem.id === item.id ? '✓' : ''" class="text-blue-600 font-bold text-xl" verticalAlignment="center" />
              </GridLayout>
            </template>
          </ListView>
        </GridLayout>

        <!-- Bottom Action Buttons -->
        <GridLayout row="3" columns="*, *" class="mt-3 gap-3" v-if="searchSelectedItem">
          <Button
            col="0"
            text="📍 View on Map"
            class="bg-gray-200 text-gray-700 font-bold rounded-full py-3 border-0"
            @tap="closeSearch"
          />
          <Button
            v-if="!searchSelectedItem.placeData"
            col="1"
            text="🚨 Get Directions"
            class="bg-blue-600 text-white font-bold rounded-full py-3 border-0 shadow-lg"
            @tap="getDirectionsToResult"
          />
          <Button
            v-else
            col="1"
            text="🔄 Load Map Area"
            class="bg-green-600 text-white font-bold rounded-full py-3 border-0 shadow-lg"
            @tap="loadPlace(searchSelectedItem.placeData, true); closeSearch();"
          />
        </GridLayout>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<style>
/* CSS Animations */
.animate-pulse {
  animation: pulse 1s infinite;
}

/* Boxicons Font Face styling */
.bx {
  font-family: 'boxicons', 'Boxicons';
}
</style>

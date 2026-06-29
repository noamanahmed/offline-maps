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

// Check proximity and switch active city/village if needed
function checkProximityAndSwitch(lat: number, lon: number) {
  let closest: any = null;
  let minDist = Infinity;
  
  for (const place of placesIndex) {
    const dist = getDistance(lat, lon, place.lat, place.lon);
    if (dist < minDist) {
      minDist = dist;
      closest = place;
    }
  }
  
  if (closest) {
    // Vicinity limit: 0.08 degrees (approx 8.8km) for city, 0.015 degrees (approx 1.67km) for village
    const limit = closest.type === 'city' ? 0.08 : 0.015;
    if (minDist <= limit) {
      // Compare by path to avoid issues with id=0 being falsy
      if (currentPlace.value.path !== closest.path) {
        console.log(`User in vicinity of new area: ${closest.name}. Automatically switching.`);
        loadPlace(closest, false); // Switch loaded place but don't force map centering
      }
    }
  }
}

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
    Geolocation.clearWatch(watchId);
  }

  watchId = Geolocation.watchLocation(
    (loc) => {
      if (loc) {
        isGPSConnected.value = true;
        isLocating.value = false;
        gpsAccuracy.value = `${loc.horizontalAccuracy.toFixed(1)}m`;
        
        // Save last lat/long
        ApplicationSettings.setNumber('last_lat', loc.latitude);
        ApplicationSettings.setNumber('last_lon', loc.longitude);
        
        // Update user pointer on webview
        callWebView('updateUserLocation', loc.latitude, loc.longitude, true);
        
        // Proximity detection and automatic loading of vicinity data
        checkProximityAndSwitch(loc.latitude, loc.longitude);
      }
    },
    (err) => {
      console.error("GPS Watch Location Error:", err);
      isGPSConnected.value = false;
      isLocating.value = false;
      
      // Handle GPS Disconnectivity: Draw grey marker at last known coordinates
      const lastLat = ApplicationSettings.getNumber('last_lat', 0);
      const lastLon = ApplicationSettings.getNumber('last_lon', 0);
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
  if (!webView || !isWebViewLoaded.value) return;
  const argsStr = args.map(a => JSON.stringify(a)).join(', ');
  const script = `${fnName}(${argsStr})`;
  
  webView.executeJavaScript(script)
    .catch((err: any) => {
      // Ignore initial errors before page is fully set up
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
            }
          });
        }
      })
      .catch((err: any) => {
        // Polling error
      });
  }, 250);
}

// --- Place Loading and Settings Persistence ---
function loadPlace(place: any, centerMap: boolean = true) {
  // Guard against re-entrant calls
  if (isLoadingPlace) return;
  isLoadingPlace = true;

  const pbfPath = `../maps/countries/${place.path}/${place.path.split('/').pop()}.osm.pbf`;
  const poisPath = `../maps/countries/${place.path}/pois.json`;

  const isSameMap = (currentlyLoadedPbfPath === pbfPath);

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

  if (isSameMap) {
    console.log(`Map data for ${place.name} is already loaded. Centering map.`);
    if (centerMap) {
      callWebView('centerOnCoordinates', place.lat, place.lon, 14);
    }
  } else {
    currentlyLoadedPbfPath = pbfPath;
    console.log(`LOADING DATA FOR: ${place.name} (${place.type}). PBF: ${pbfPath}`);
    
    // Call WebView to load this data (HARD requirement: only loads this data in memory)
    callWebView(
      'loadMapData', 
      pbfPath, 
      poisPath, 
      place.lat, 
      place.lon, 
      centerMap ? 14 : null, // Pass zoom level if centering
      isGPSConnected.value
    );
  }

  // Draw last user coordinates if available
  const lastLat = ApplicationSettings.getNumber('last_lat', 0);
  const lastLon = ApplicationSettings.getNumber('last_lon', 0);
  if (lastLat && lastLon) {
    callWebView('updateUserLocation', lastLat, lastLon, isGPSConnected.value);
  }

  isLoadingPlace = false;
}

function loadSavedLocation() {
  const wizardDone = ApplicationSettings.getBoolean('wizard_completed', false);
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
    loadPlace(place, true);
  } else {
    // Attempt GPS first to auto-detect location
    requestGPSLocation().then(() => {
      // If GPS successfully matched vicinity, map loads automatically.
      // Otherwise, open wizard.
      setTimeout(() => {
        if (!ApplicationSettings.getBoolean('wizard_completed', false)) {
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
}

function onSearchQueryChange() {
  const query = searchQuery.value.trim();
  if (query.length < 2) {
    searchResults.value = [];
    return;
  }

  // Search POIs in the WebView
  if (!webView || !isWebViewLoaded.value) return;

  webView.executeJavaScript(`searchPois(${JSON.stringify(query)})`)
    .then((res: any) => {
      let poiResults: any[] = [];
      try {
        let parsed = typeof res === 'string' ? JSON.parse(res) : res;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
        poiResults = parsed || [];
      } catch (e) { /* parse error */ }

      // Also search roads
      return webView.executeJavaScript(`searchRoads(${JSON.stringify(query)})`)
        .then((roadRes: any) => {
          let roadResults: any[] = [];
          try {
            let parsed = typeof roadRes === 'string' ? JSON.parse(roadRes) : roadRes;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            roadResults = parsed || [];
          } catch (e) { /* parse error */ }

          // Combine: POIs first, then roads
          searchResults.value = [...poiResults, ...roadResults].slice(0, 25);
        });
    })
    .catch((err: any) => {
      console.error('Search error:', err);
    });
}

function selectSearchResult(item: any) {
  searchSelectedItem.value = item;
  // Center map on the selected item
  callWebView('focusPoi', item.latitude, item.longitude, item.name);
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
      <GridLayout row="0" rows="auto, *" columns="*" isPassThroughParentEnabled="true">
        <GridLayout row="0" class="m-3 mt-10" style="elevation: 8;" isPassThroughParentEnabled="true">
          <!-- Collapsed: Search Icon Only -->
          <GridLayout
            v-if="!isSearchExpanded"
            columns="auto"
            class="bg-white rounded-full p-2 shadow-lg border border-gray-100"
            width="48"
            height="48"
            horizontalAlignment="left"
            @tap="openSearch"
          >
            <Label
              col="0"
              text="🔍"
              class="text-xl text-center"
              verticalAlignment="center"
              horizontalAlignment="center"
            />
          </GridLayout>

          <!-- Expanded: Full Search Bar -->
          <GridLayout
            v-if="isSearchExpanded"
            columns="auto, *, auto, auto"
            class="bg-white rounded-full p-2 shadow-lg border border-gray-100"
            horizontalAlignment="stretch"
          >
            <!-- Search Icon -->
            <Label
              col="0"
              text="🔍"
              class="text-lg align-middle px-3"
              verticalAlignment="center"
            />

            <!-- Active Location Detail text -->
            <StackLayout col="1" class="justify-center" @tap="openChanger">
              <Label
                :text="currentPlace.name"
                class="font-bold text-gray-800 text-base"
                maxLines="1"
              />
              <Label
                :text="currentPlace.province ? `${currentPlace.province}, ${currentPlace.country}` : 'Select a location'"
                class="text-gray-500 text-xs"
                maxLines="1"
              />
            </StackLayout>

            <!-- GPS Connectivity Badge -->
            <StackLayout col="2" class="justify-center px-2">
              <Label
                :text="isGPSConnected ? '● GPS' : '○ Offline'"
                :class="isGPSConnected ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'"
              />
              <Label
                v-if="isGPSConnected && gpsAccuracy"
                :text="gpsAccuracy"
                class="text-gray-400 text-[10px]"
              />
            </StackLayout>

            <!-- Collapse Button -->
            <Label
              col="3"
              text="✕"
              class="text-lg text-gray-400 font-bold px-3"
              verticalAlignment="center"
              @tap="isSearchExpanded = false"
            />
          </GridLayout>
        </GridLayout>
      </GridLayout>

      <!-- 3. Left Side Floating Action Buttons (FABs) -->
      <AbsoluteLayout row="0" class="w-full h-full" isPassThroughParentEnabled="true">
        <StackLayout
          top="80"
          left="12"
          width="48"
        >
          <!-- Change Map Area FAB -->
          <Button
            @tap="openChanger"
            text="🗺️"
            class="w-12 h-12 bg-white text-lg rounded-full shadow-lg border border-gray-100 mb-3"
            style="elevation: 4;"
            horizontalAlignment="center"
          />

          <!-- Toggle Orientation FAB -->
          <Button
            @tap="toggleOrientation"
            :text="currentOrientation === 'portrait' ? '📱' : '📟'"
            class="w-12 h-12 bg-white text-lg rounded-full shadow-lg border border-gray-100 mb-3"
            style="elevation: 4;"
            horizontalAlignment="center"
          />
        </StackLayout>
      </AbsoluteLayout>

      <!-- 4. Right Side Floating Action Buttons (FABs) -->
      <GridLayout row="0" rows="auto, *" columns="*, auto" isPassThroughParentEnabled="true">
        <StackLayout
          row="0"
          col="1"
          class="mt-20 mr-3"
          width="48"
        >
          <!-- Theme Selector FAB -->
          <Button
            @tap="toggleTheme"
            :text="activeTheme === 'light' ? '🌙' : '☀️'"
            class="w-12 h-12 bg-white text-lg rounded-full shadow-lg border border-gray-100 mb-3"
            style="elevation: 4;"
            horizontalAlignment="center"
          />

          <!-- Re-center Location FAB -->
          <Button
            @tap="reCenterGPS"
            text="🎯"
            :class="isLocating ? 'w-12 h-12 bg-blue-100 text-lg rounded-full shadow-lg border border-gray-100 mb-3 animate-pulse' : 'w-12 h-12 bg-white text-lg rounded-full shadow-lg border border-gray-100 mb-3'"
            style="elevation: 4;"
            horizontalAlignment="center"
          />

          <!-- Settings FAB -->
          <Button
            @tap="showSettingsDrawer = !showSettingsDrawer"
            text="⚙️"
            :class="showSettingsDrawer ? 'w-12 h-12 bg-blue-100 text-lg rounded-full shadow-lg border border-gray-100 mb-3' : 'w-12 h-12 bg-white text-lg rounded-full shadow-lg border border-gray-100 mb-3'"
            style="elevation: 4;"
            horizontalAlignment="center"
          />
        </StackLayout>
      </GridLayout>

      <!-- 5. My Location FAB (bottom-right, above zoom controls) -->
      <GridLayout row="0" rows="*, auto" columns="*, auto" isPassThroughParentEnabled="true">
        <Button
          row="1"
          col="1"
          @tap="reCenterGPS"
          text="📍"
          :class="isLocating ? 'w-14 h-14 bg-white text-xl rounded-full shadow-xl border border-gray-100 mb-24 mr-3 animate-pulse' : 'w-14 h-14 bg-white text-xl rounded-full shadow-xl border border-gray-100 mb-24 mr-3'"
          style="elevation: 6;"
        />
      </GridLayout>

      <!-- 6. Route Info Banner (shown when route is active) -->
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
          <StackLayout v-if="searchResults.length === 0 && searchQuery.length >= 2" class="justify-center items-center">
            <Label text="🗺️" class="text-5xl mb-4" />
            <Label text="No results found" class="text-gray-500 text-lg font-semibold" />
            <Label text="Try a different search term" class="text-gray-400 text-sm mt-1" />
          </StackLayout>

          <!-- Hint state -->
          <StackLayout v-if="searchQuery.length < 2" class="justify-center items-center">
            <Label text="🔍" class="text-5xl mb-4" />
            <Label text="Search for places" class="text-gray-500 text-lg font-semibold" />
            <Label text="Type at least 2 characters to search" class="text-gray-400 text-sm mt-1" />
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
                  :text="item.category === 'road' ? '🛣️' : item.subcategory === 'restaurant' || item.subcategory === 'fast_food' ? '🍽️' : item.subcategory === 'hospital' || item.subcategory === 'clinic' ? '🏥' : item.subcategory === 'pharmacy' ? '💊' : item.subcategory === 'cafe' ? '☕' : item.subcategory === 'bank' ? '🏦' : item.subcategory === 'fuel' ? '⛽' : item.category === 'shop' ? '🛍️' : item.subcategory === 'school' || item.subcategory === 'college' || item.subcategory === 'university' ? '🏫' : '📍'"
                  class="text-xl mr-3"
                  verticalAlignment="center"
                />
                <!-- Name & Category -->
                <StackLayout col="1">
                  <Label :text="item.name" class="text-base font-semibold text-gray-800" maxLines="1" />
                  <Label :text="`${item.category} • ${item.subcategory}`" class="text-gray-400 text-xs capitalize mt-0.5" />
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
            col="1"
            text="🚨 Get Directions"
            class="bg-blue-600 text-white font-bold rounded-full py-3 border-0 shadow-lg"
            @tap="getDirectionsToResult"
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
</style>

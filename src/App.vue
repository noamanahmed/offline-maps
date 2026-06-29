<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'nativescript-vue';
import { isAndroid, Application } from '@nativescript/core';

import MapView from './components/MapView.vue';
import SearchBar from './components/SearchBar.vue';
import RouteBanner from './components/RouteBanner.vue';
import BottomPanel from './components/BottomPanel.vue';
import FirstTimeWizard from './components/FirstTimeWizard.vue';
import LocationChangerOverlay from './components/LocationChangerOverlay.vue';
import POISearchOverlay from './components/POISearchOverlay.vue';

import { usePlacesIndex, Place } from './composables/usePlacesIndex';
import { useGPS } from './composables/useGPS';
import { useSavedLocation } from './composables/useSavedLocation';
import { loadPlace, callWebView, selectedDetails, routeInfo, stopPolling } from './composables/useMapBridge';
import { clearDirections } from './composables/useSearch';

const { scanPlaces } = usePlacesIndex();
const { requestGPSLocation, stopGPSTracking, isGPSConnected, gpsAccuracy, isLocating, reCenterGPS } = useGPS();
const { hasSavedLocation } = useSavedLocation();

const activeTheme = ref<'light' | 'dark'>('light');
const currentOrientation = ref<'portrait' | 'landscape'>('portrait');
const showSettingsDrawer = ref(false);
const isSearchExpanded = ref(false);
const showFirstTimeWizard = ref(!hasSavedLocation.value);
const showLocationChanger = ref(false);
const showSearchOverlay = ref(false);

function toggleTheme() {
  activeTheme.value = activeTheme.value === 'light' ? 'dark' : 'light';
  callWebView('setTheme', activeTheme.value);
}

function toggleOrientation() {
  const target = currentOrientation.value === 'portrait' ? 'landscape' : 'portrait';
  if (isAndroid) {
    try {
      const activity = Application.android.foregroundActivity || Application.android.startActivity;
      if (activity) {
        const req = target === 'landscape' ? 0 : 1;
        activity.setRequestedOrientation(req);
        currentOrientation.value = target;
      }
    } catch (err) {
      console.error("Error setting orientation on Android:", err);
    }
  } else {
    try {
      const req = target === 'landscape' ? 3 : 1;
      if ((global as any).UIDevice && (global as any).UIDevice.currentDevice) {
        (global as any).UIDevice.currentDevice.setValueForKey(req, "orientation");
        currentOrientation.value = target;
      }
    } catch (err) {
      console.error("Error setting orientation on iOS:", err);
    }
  }
}

function onWizardConfirm(place: Place) {
  loadPlace(place, true);
  showFirstTimeWizard.value = false;
}

function onChangerConfirm(place: Place) {
  loadPlace(place, true);
  showLocationChanger.value = false;
}

function onClearDirections() {
  clearDirections();
}

function openChanger() {
  showLocationChanger.value = true;
}

function openSearch() {
  showSearchOverlay.value = true;
}

function closePanel() {
  selectedDetails.value = null;
}

onMounted(() => {
  scanPlaces();
  requestGPSLocation(() => {
    if (!hasSavedLocation.value) {
      showFirstTimeWizard.value = true;
    }
  });
});

onUnmounted(() => {
  stopPolling();
  stopGPSTracking();
});
</script>

<template>
  <Page actionBarHidden="true" class="bg-[#f4f3f0]">
    <GridLayout rows="*, auto" columns="*">
      <MapView
        v-if="!showFirstTimeWizard"
        row="0"
        rowSpan="2"
        :activeTheme="activeTheme"
      />

      <!-- Floating UI Grid -->
      <GridLayout v-if="!showFirstTimeWizard" row="0" rows="auto, *, auto" columns="auto, *, auto" isPassThroughParentEnabled="true">
        <!-- Top Row: Search Bar -->
        <SearchBar
          row="0"
          col="0"
          colSpan="2"
          :isSearchExpanded="isSearchExpanded"
          @open-search="openSearch"
          @open-changer="openChanger"
          @toggle-expand="isSearchExpanded = !isSearchExpanded"
        />

        <!-- Settings Cog (Top-Right) -->
        <Button
          row="0"
          col="2"
          text="&#xea6e;"
          :class="showSettingsDrawer ? 'bx w-12 h-12 bg-blue-50 text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-blue-200 m-3 mt-10' : 'bx w-12 h-12 bg-white text-2xl text-gray-700 font-bold rounded-full shadow-lg border border-gray-150 m-3 mt-10'"
          style="elevation: 5;"
          @tap="showSettingsDrawer = !showSettingsDrawer"
        />

        <!-- Middle Row Left FABs -->
        <StackLayout row="1" col="0" class="ml-3 justify-center" width="48">
          <Button @tap="openChanger" text="&#xeb56;" class="bx w-12 h-12 bg-white text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3" style="elevation: 5;" />
          <Button @tap="toggleOrientation" text="&#xeb8f;" class="bx w-12 h-12 bg-white text-2xl text-gray-700 font-bold rounded-full shadow-lg border border-gray-150" style="elevation: 5;" />
        </StackLayout>

        <!-- Middle Row Right FABs -->
        <StackLayout row="1" col="2" class="mr-3 justify-center" width="48">
          <Button @tap="toggleTheme" :text="activeTheme === 'light' ? '&#xeb94;' : '&#xec34;'" class="bx w-12 h-12 bg-white text-2xl text-purple-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3" style="elevation: 5;" />
          <Button @tap="reCenterGPS" text="&#xea7f;" :class="isLocating ? 'bx w-12 h-12 bg-blue-50 text-2xl text-green-600 font-bold rounded-full shadow-lg border border-blue-200 mb-3 animate-pulse' : 'bx w-12 h-12 bg-white text-2xl text-green-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3'" style="elevation: 5;" />
        </StackLayout>
      </GridLayout>

      <RouteBanner @clear-directions="onClearDirections" />
      <BottomPanel :showSettingsDrawer="showSettingsDrawer" @open-changer="openChanger" @close-settings="showSettingsDrawer = false" @close-panel="closePanel" />

      <FirstTimeWizard :show="showFirstTimeWizard" @confirm="onWizardConfirm" @close="showFirstTimeWizard = false" />
      <LocationChangerOverlay :show="showLocationChanger" @confirm="onChangerConfirm" @close="showLocationChanger = false" />
      <POISearchOverlay :show="showSearchOverlay" @close="showSearchOverlay = false" @load-place="(p: Place) => { loadPlace(p, true); showSearchOverlay = false; }" />
    </GridLayout>
  </Page>
</template>

<style>
.animate-pulse {
  animation: pulse 1s infinite;
}

.bx {
  font-family: 'boxicons', 'Boxicons';
}
</style>

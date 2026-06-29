import { ref } from 'nativescript-vue';
import { ApplicationSettings } from '@nativescript/core';
import { callWebView, isWebViewLoaded, currentPlace } from './useMapBridge';

export const searchQuery = ref('');
export const searchResults = ref<any[]>([]);
export const searchSelectedItem = ref<any>(null);

let searchDebounceTimer: any = null;
const SEARCH_DEBOUNCE_MS = 300;

export function onQueryChange() {
  const query = searchQuery.value.trim();

  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  searchDebounceTimer = setTimeout(() => {
    const anchorLat = ApplicationSettings.getNumber('last_lat', currentPlace.value.lat);
    const anchorLon = ApplicationSettings.getNumber('last_lon', currentPlace.value.lon);

    if (!isWebViewLoaded.value) {
      searchResults.value = [];
      return;
    }

    callWebView('runSearch', query, anchorLat, anchorLon);
  }, SEARCH_DEBOUNCE_MS);
}

export function selectResult(item: any) {
  searchSelectedItem.value = item;
  if (item.placeData) {
    callWebView('centerOnCoordinates', item.latitude, item.longitude, 13);
  } else {
    callWebView('focusPoi', item.latitude, item.longitude, item.name);
  }
}

export function getDirectionsToResult() {
  if (!searchSelectedItem.value) return;
  const destLat = searchSelectedItem.value.latitude;
  const destLon = searchSelectedItem.value.longitude;
  const startLat = ApplicationSettings.getNumber('last_lat', currentPlace.value.lat);
  const startLon = ApplicationSettings.getNumber('last_lon', currentPlace.value.lon);
  callWebView('drawRoute', startLat, startLon, destLat, destLon);
}

export function clearDirections() {
  callWebView('clearRoute');
}

export function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
  searchSelectedItem.value = null;
}

export function stopSearchDebounce() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
}

export function useSearch() {
  return { searchQuery, searchResults, searchSelectedItem, onQueryChange, selectResult, getDirectionsToResult, clearDirections, clearSearch, stopSearchDebounce };
}

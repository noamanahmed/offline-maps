import { ref } from 'nativescript-vue';
import { ApplicationSettings } from '@nativescript/core';
import * as Geolocation from '@nativescript/geolocation';
import { CoreTypes } from '@nativescript/core';
import { callWebView } from './useMapBridge';
import { useSavedLocation } from './useSavedLocation';

const { setLastCoordinates } = useSavedLocation();

export const isGPSConnected = ref(false);
export const gpsAccuracy = ref('');
export const isLocating = ref(false);

let watchId: any = null;

export async function requestGPSLocation(onNoWizard?: () => void) {
  isLocating.value = true;
  try {
    await Geolocation.enableLocationRequest(true);
    isGPSConnected.value = true;
    startGPSTracking();
  } catch (err) {
    console.log("GPS Enable Request Rejected/Failed:", err);
    isGPSConnected.value = false;
    isLocating.value = false;
    if (onNoWizard) onNoWizard();
  }
}

export function startGPSTracking() {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
  }

  watchId = Geolocation.watchLocation(
    (loc) => {
      if (loc) {
        isGPSConnected.value = true;
        isLocating.value = false;
        gpsAccuracy.value = `${loc.horizontalAccuracy.toFixed(1)}m`;
        setLastCoordinates(loc.latitude, loc.longitude);
        callWebView('updateUserLocation', loc.latitude, loc.longitude, true);
      }
    },
    (err) => {
      console.error("[VERBOSE] GPS Watch Location Error:", err);
      isGPSConnected.value = false;
      isLocating.value = false;
      const lastLat = ApplicationSettings.getNumber('last_lat', 0);
      const lastLon = ApplicationSettings.getNumber('last_lon', 0);
      if (lastLat && lastLon) {
        callWebView('updateUserLocation', lastLat, lastLon, false);
      }
    },
    {
      desiredAccuracy: CoreTypes.Accuracy.high,
      updateDistance: 10,
      minimumUpdateTime: 4000
    }
  );
}

export function reCenterGPS() {
  if (!isGPSConnected.value) {
    requestGPSLocation();
    return;
  }
  callWebView('centerOnUser');
}

export function stopGPSTracking() {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;
  }
}

export function useGPS() {
  return { isGPSConnected, gpsAccuracy, isLocating, requestGPSLocation, startGPSTracking, reCenterGPS, stopGPSTracking };
}

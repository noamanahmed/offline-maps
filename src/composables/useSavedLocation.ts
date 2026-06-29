import { ref } from 'nativescript-vue';
import { ApplicationSettings } from '@nativescript/core';

export interface Place {
  id: number;
  name: string;
  name_ur: string;
  type: string;
  lat: number;
  lon: number;
  province: string;
  country: string;
  path: string;
}

const hasSavedLocation = ref(ApplicationSettings.getBoolean('wizard_completed', false));

function savePlace(place: Place) {
  ApplicationSettings.setBoolean('wizard_completed', true);
  ApplicationSettings.setString('saved_country', place.country);
  ApplicationSettings.setString('saved_province', place.province);
  ApplicationSettings.setString('saved_type', place.type);
  ApplicationSettings.setString('saved_path', place.path);
  ApplicationSettings.setString('saved_name', place.name);
  ApplicationSettings.setNumber('saved_lat', place.lat);
  ApplicationSettings.setNumber('saved_lon', place.lon);
  ApplicationSettings.setNumber('saved_id', place.id || 0);
  hasSavedLocation.value = true;
}

function loadSavedPlace(): Place | null {
  if (!hasSavedLocation.value) return null;
  return {
    id: ApplicationSettings.getNumber('saved_id', 0),
    name: ApplicationSettings.getString('saved_name', ''),
    name_ur: '',
    type: ApplicationSettings.getString('saved_type', 'city'),
    lat: ApplicationSettings.getNumber('saved_lat', 0),
    lon: ApplicationSettings.getNumber('saved_lon', 0),
    province: ApplicationSettings.getString('saved_province', ''),
    country: ApplicationSettings.getString('saved_country', ''),
    path: ApplicationSettings.getString('saved_path', '')
  };
}

function getLastCoordinates(): { lat: number; lon: number } {
  return {
    lat: ApplicationSettings.getNumber('last_lat', 0),
    lon: ApplicationSettings.getNumber('last_lon', 0)
  };
}

function setLastCoordinates(lat: number, lon: number) {
  ApplicationSettings.setNumber('last_lat', lat);
  ApplicationSettings.setNumber('last_lon', lon);
}

export function useSavedLocation() {
  return { hasSavedLocation, savePlace, loadSavedPlace, getLastCoordinates, setLastCoordinates };
}

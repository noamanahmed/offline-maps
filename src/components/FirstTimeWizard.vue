<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import { usePlacesIndex, Place } from '../composables/usePlacesIndex';

const { uniqueCountries, filterProvincesByCountry, filterPlacesByCountryProvinceType } = usePlacesIndex();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm', place: Place): void;
  (e: 'close'): void;
}>();

const wizardStep = ref(1);
const wizardSelectedCountry = ref('');
const wizardSelectedProvince = ref('');
const wizardTypeToggle = ref<'city' | 'village'>('city');
const wizardSelectedPlace = ref<Place | null>(null);
const uniqueProvinces = ref<string[]>([]);
const filteredPlaces = ref<Place[]>([]);

function selectCountry(country: string) {
  wizardSelectedCountry.value = country;
  uniqueProvinces.value = filterProvincesByCountry(country);
  wizardStep.value = 2;
}

function selectProvince(province: string) {
  wizardSelectedProvince.value = province;
  updatePlaces();
  wizardStep.value = 3;
}

function toggleType(type: 'city' | 'village') {
  wizardTypeToggle.value = type;
  updatePlaces();
}

function updatePlaces() {
  filteredPlaces.value = filterPlacesByCountryProvinceType(
    wizardSelectedCountry.value,
    wizardSelectedProvince.value,
    wizardTypeToggle.value
  );
  wizardSelectedPlace.value = null;
}

function confirm() {
  if (wizardSelectedPlace.value) {
    emit('confirm', wizardSelectedPlace.value);
  }
}
</script>

<template>
  <GridLayout v-if="show" row="0" rowSpan="2" rows="auto, *, auto" class="bg-[#f4f3f0] p-6 w-full h-full">
    <StackLayout row="0" class="text-center mt-6 mb-4">
      <Label text="🗺️ Offline Map Explorer" class="text-2xl font-bold text-gray-800" />
      <Label text="Download Completed. Setup your offline area." class="text-gray-500 text-sm mt-1" />
      <GridLayout columns="*, *, *" class="w-48 align-self-center mt-4">
        <ContentView col="0" :class="wizardStep >= 1 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
        <ContentView col="1" :class="wizardStep >= 2 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
        <ContentView col="2" :class="wizardStep >= 3 ? 'h-1 bg-blue-600 rounded-full mx-1' : 'h-1 bg-gray-300 rounded-full mx-1'" />
      </GridLayout>
    </StackLayout>

    <StackLayout v-if="wizardStep === 1" row="1" class="justify-center">
      <Label text="Select Country" class="text-lg font-bold text-gray-800 mb-4 px-2" />
      <ListView :items="uniqueCountries" class="bg-white rounded-2xl shadow-lg border border-gray-100 h-64">
        <template #default="{ item }">
          <GridLayout columns="*, auto" class="p-4 border-b border-gray-100 active:bg-gray-100" @tap="selectCountry(item)">
            <Label :text="item" class="text-lg font-semibold text-gray-800" />
            <Label col="1" text="➔" class="text-blue-600 font-bold text-lg" />
          </GridLayout>
        </template>
      </ListView>
    </StackLayout>

    <StackLayout v-if="wizardStep === 2" row="1" class="justify-center">
      <Label :text="`Select Province of ${wizardSelectedCountry}`" class="text-lg font-bold text-gray-800 mb-4 px-2" />
      <ListView :items="uniqueProvinces" class="bg-white rounded-2xl shadow-lg border border-gray-100 h-64">
        <template #default="{ item }">
          <GridLayout columns="*, auto" class="p-4 border-b border-gray-100 active:bg-gray-100" @tap="selectProvince(item)">
            <Label :text="item" class="text-lg font-semibold text-gray-800" />
            <Label col="1" text="➔" class="text-blue-600 font-bold text-lg" />
          </GridLayout>
        </template>
      </ListView>
      <Button text="↩ Back to Country" class="bg-transparent border-0 text-blue-600 font-bold mt-4" @tap="wizardStep = 1" />
    </StackLayout>

    <GridLayout v-if="wizardStep === 3" row="1" rows="auto, auto, *" class="w-full">
      <Label row="0" :text="`Select City or Village in ${wizardSelectedProvince}`" class="text-lg font-bold text-gray-800 mb-3 px-2" />
      <GridLayout row="1" columns="*, *" class="bg-gray-200 rounded-full p-1 mb-4 w-64 align-self-center">
        <Button col="0" text="🏙️ Cities" :class="wizardTypeToggle === 'city' ? 'bg-white text-blue-600 font-bold rounded-full py-2 border-0' : 'bg-transparent text-gray-500 rounded-full py-2 border-0'" @tap="toggleType('city')" />
        <Button col="1" text="🏡 Villages" :class="wizardTypeToggle === 'village' ? 'bg-white text-blue-600 font-bold rounded-full py-2 border-0' : 'bg-transparent text-gray-500 rounded-full py-2 border-0'" @tap="toggleType('village')" />
      </GridLayout>
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

    <GridLayout v-if="wizardStep === 3" row="2" columns="auto, *" class="mt-4 gap-4">
      <Button col="0" text="Back" class="bg-gray-200 text-gray-700 font-bold rounded-full px-6 py-3 border-0" @tap="wizardStep = 2" />
      <Button
        col="1"
        text="Explore Offline Map"
        :isEnabled="wizardSelectedPlace !== null"
        :class="wizardSelectedPlace !== null ? 'bg-blue-600 text-white font-bold rounded-full py-3 border-0' : 'bg-gray-300 text-gray-500 font-bold rounded-full py-3 border-0'"
        @tap="confirm"
      />
    </GridLayout>
  </GridLayout>
</template>

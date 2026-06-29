<script lang="ts" setup>
import { selectedDetails, currentPlace } from '../composables/useMapBridge';

defineProps<{
  showSettingsDrawer: boolean;
}>();

const emit = defineEmits<{
  (e: 'close-panel'): void;
  (e: 'open-changer'): void;
  (e: 'close-settings'): void;
}>();
</script>

<template>
  <StackLayout
    v-if="selectedDetails || showSettingsDrawer"
    row="1"
    class="bg-white rounded-t-3xl shadow-2xl p-5 border-t border-gray-100"
    style="elevation: 10;"
  >
    <ContentView class="w-12 h-1.5 bg-gray-300 rounded-full align-self-center mb-4" />

    <!-- POI Details View -->
    <GridLayout v-if="selectedDetails" columns="*, auto" rows="auto, auto, auto, auto" class="w-full">
      <Label row="0" col="0" :text="selectedDetails.name" class="text-xl font-bold text-gray-800" textWrap="true" />
      <Button row="0" col="1" text="✕" class="bg-gray-100 border-0 text-gray-500 rounded-full w-8 h-8 text-sm align-top font-bold" @tap="selectedDetails = null" />
      <Label row="1" col="0" colSpan="2" :text="selectedDetails.type === 'poi' ? `${selectedDetails.category} (${selectedDetails.subcategory})` : 'Dropped Coordinates'" class="text-gray-500 text-sm font-semibold capitalize mt-1" />
      <Label row="2" col="0" colSpan="2" :text="`Latitude: ${selectedDetails.lat.toFixed(6)} | Longitude: ${selectedDetails.lon.toFixed(6)}`" class="text-gray-400 text-xs mt-2" />
      <WrapLayout row="3" colSpan="2" class="mt-4 gap-3">
        <Button text="🚙 Directions" class="bg-blue-600 text-white rounded-full px-5 py-2 font-semibold text-sm border-0" />
        <Button text="📂 Save" class="bg-gray-100 text-gray-700 rounded-full px-5 py-2 font-semibold text-sm border-0" />
        <Button text="🔗 Share" class="bg-gray-100 text-gray-700 rounded-full px-5 py-2 font-semibold text-sm border-0" />
      </WrapLayout>
    </GridLayout>

    <!-- Place Info View -->
    <GridLayout v-else columns="*, auto, auto" rows="auto, auto, auto" class="w-full">
      <StackLayout row="0" col="0" class="justify-center">
        <Label :text="currentPlace.name" class="text-xl font-bold text-gray-800" />
        <Label :text="`${currentPlace.type === 'city' ? '🏙️ City' : '🏡 Village'} in ${currentPlace.province}, ${currentPlace.country}`" class="text-gray-500 text-sm mt-0.5" />
      </StackLayout>
      <StackLayout row="0" col="1" class="items-end px-2">
        <Label text="💾 Memory Status" class="text-gray-400 text-[10px]" />
        <Label text="Only This Area Loaded" class="text-green-600 font-bold text-xs" />
      </StackLayout>
      <Button row="0" col="2" text="✕" class="bg-gray-100 border-0 text-gray-500 rounded-full w-8 h-8 text-sm align-top font-bold" @tap="emit('close-settings')" />
      <Label row="1" colSpan="3" :text="`Coordinates: ${currentPlace.lat.toFixed(5)} , ${currentPlace.lon.toFixed(5)}`" class="text-gray-400 text-xs mt-3" />
      <Button row="2" colSpan="3" text="Change Location Manually" class="bg-blue-600 text-white rounded-full py-3 mt-4 text-center border-0 font-bold text-base shadow-lg" @tap="emit('open-changer')" />
    </GridLayout>
  </StackLayout>
</template>

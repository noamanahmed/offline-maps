<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import { useGPS } from '../composables/useGPS';
import { currentPlace } from '../composables/useMapBridge';

const { isGPSConnected, gpsAccuracy } = useGPS();

defineProps<{
  isSearchExpanded: boolean;
}>();

const emit = defineEmits<{
  (e: 'open-search'): void;
  (e: 'open-changer'): void;
  (e: 'toggle-expand'): void;
}>();

function onOpenSearch() {
  emit('open-search');
}

function onOpenChanger() {
  emit('open-changer');
}
</script>

<template>
  <GridLayout row="0" col="0" colSpan="2">
    <!-- Collapsed Search Icon -->
    <Button
      v-if="!isSearchExpanded"
      text="&#xebf7;"
      class="bx w-12 h-12 bg-white text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-gray-150 m-3 mt-10"
      style="elevation: 5;"
      @tap="onOpenSearch"
    />

    <!-- Expanded Search Bar -->
    <GridLayout
      v-if="isSearchExpanded"
      columns="auto, *, auto, auto"
      class="bg-white rounded-full p-2 shadow-lg border border-gray-100 m-3 mt-10"
      horizontalAlignment="stretch"
    >
      <Label col="0" text="&#xebf7;" class="bx text-xl align-middle px-3 text-blue-600 font-bold" verticalAlignment="center" />
      <StackLayout col="1" class="justify-center" @tap="onOpenChanger">
        <Label :text="currentPlace.name" class="font-bold text-gray-800 text-base" maxLines="1" />
        <Label :text="currentPlace.province ? `${currentPlace.province}, ${currentPlace.country}` : 'Select a location'" class="text-gray-500 text-xs" maxLines="1" />
      </StackLayout>
      <StackLayout col="2" class="justify-center px-2">
        <Label :text="isGPSConnected ? '● GPS' : '○ Offline'" :class="isGPSConnected ? 'text-green-600 font-bold text-xs' : 'text-red-500 font-bold text-xs'" />
        <Label v-if="isGPSConnected && gpsAccuracy" :text="gpsAccuracy" class="text-gray-400 text-[10px]" />
      </StackLayout>
      <Label col="3" text="✕" class="text-lg text-gray-400 font-bold px-3" verticalAlignment="center" @tap="emit('toggle-expand')" />
    </GridLayout>
  </GridLayout>
</template>

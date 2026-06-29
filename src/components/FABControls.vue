<script lang="ts" setup>
import { useGPS } from '../composables/useGPS';

const { isLocating, reCenterGPS } = useGPS();

defineProps<{
  activeTheme: 'light' | 'dark';
  showSettingsDrawer: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-theme'): void;
  (e: 'toggle-orientation'): void;
  (e: 'open-changer'): void;
  (e: 'toggle-settings'): void;
}>();
</script>

<template>
  <!-- Left Side FABs Button (used by parent via slot or positioned) -->
  <Button
    @tap="emit('open-changer')"
    text="&#xeb56;"
    class="bx w-12 h-12 bg-white text-2xl text-blue-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3"
    style="elevation: 5;"
  />
  <Button
    @tap="emit('toggle-orientation')"
    text="&#xeb8f;"
    class="bx w-12 h-12 bg-white text-2xl text-gray-700 font-bold rounded-full shadow-lg border border-gray-150"
    style="elevation: 5;"
  />
  
  <!-- Right Side FABs -->
  <Button
    @tap="emit('toggle-theme')"
    :text="activeTheme === 'light' ? '&#xeb94;' : '&#xec34;'"
    class="bx w-12 h-12 bg-white text-2xl text-purple-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3"
    style="elevation: 5;"
  />
  <Button
    @tap="reCenterGPS"
    text="&#xea7f;"
    :class="isLocating ? 'bx w-12 h-12 bg-blue-50 text-2xl text-green-600 font-bold rounded-full shadow-lg border border-blue-200 mb-3 animate-pulse' : 'bx w-12 h-12 bg-white text-2xl text-green-600 font-bold rounded-full shadow-lg border border-gray-150 mb-3'"
    style="elevation: 5;"
  />
</template>

<style scoped>
.animate-pulse {
  animation: pulse 1s infinite;
}
</style>

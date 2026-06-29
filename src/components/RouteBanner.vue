<script lang="ts" setup>
import { routeInfo } from '../composables/useMapBridge';

const emit = defineEmits<{
  (e: 'clear-directions'): void;
}>();
</script>

<template>
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
      <Label col="0" text="📡" class="text-lg px-2" verticalAlignment="center" />
      <StackLayout col="1" class="justify-center">
        <Label :text="`Distance: ${routeInfo.distance}`" class="text-white font-bold text-sm" />
        <Label text="Straight-line route" class="text-blue-200 text-xs" />
      </StackLayout>
      <Button col="2" text="✕" class="bg-blue-500 border-0 text-white rounded-full w-8 h-8 text-sm font-bold" @tap="emit('clear-directions')" />
    </GridLayout>
  </GridLayout>
</template>

<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import { usePlacesIndex, Place } from '../composables/usePlacesIndex';

const { searchPlaces } = usePlacesIndex();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm', place: Place): void;
  (e: 'close'): void;
}>();

const changerSearchQuery = ref('');
const changerSelectedPlace = ref<Place | null>(null);
const filteredPlaces = ref<Place[]>([]);

function onSearchChange() {
  const query = changerSearchQuery.value.trim().toLowerCase();
  if (query.length < 2) {
    filteredPlaces.value = [];
    return;
  }
  filteredPlaces.value = searchPlaces(query, 15);
}

function selectPlace(place: Place) {
  changerSelectedPlace.value = place;
}

function confirm() {
  if (changerSelectedPlace.value) {
    emit('confirm', changerSelectedPlace.value);
  }
}

function close() {
  emit('close');
}
</script>

<template>
  <GridLayout v-if="show" row="0" rowSpan="2" rows="auto, auto, *, auto, auto" class="bg-[#f4f3f0] p-6 w-full h-full">
    <GridLayout row="0" columns="*, auto" class="mt-4 mb-4">
      <Label text="🔄 Change Map Area" class="text-2xl font-bold text-gray-800" />
      <Button col="1" text="✕" class="bg-gray-200 border-0 text-gray-600 rounded-full w-8 h-8 font-bold" @tap="close" />
    </GridLayout>

    <TextField
      row="1"
      v-model="changerSearchQuery"
      hint="🔍 Search city or village name..."
      class="bg-white rounded-full p-4 mb-4 shadow-sm border border-gray-200 text-base"
      @textChange="onSearchChange"
    />

    <ListView row="2" :items="filteredPlaces" class="bg-white rounded-2xl shadow-sm border border-gray-100">
      <template #default="{ item }">
        <GridLayout
          columns="*, auto"
          :class="changerSelectedPlace && changerSelectedPlace.id === item.id ? 'p-4 border-b border-gray-100 bg-blue-50' : 'p-4 border-b border-gray-100 active:bg-gray-100'"
          @tap="selectPlace(item)"
        >
          <StackLayout>
            <Label :text="`${item.name} (${item.type})`" class="text-lg font-semibold text-gray-800" />
            <Label :text="item.name_ur || ''" class="text-sm text-gray-400 mt-0.5" />
          </StackLayout>
          <Label col="1" :text="`${item.province}, ${item.country}`" class="text-gray-400 text-xs align-middle mr-2" />
        </GridLayout>
      </template>
    </ListView>

    <StackLayout row="3" class="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-gray-100" v-if="changerSelectedPlace">
      <Label text="Selected Area Info:" class="text-gray-400 text-xs font-bold uppercase mb-2" />
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

    <Button
      row="4"
      text="Switch Offline Map Area"
      :isEnabled="changerSelectedPlace !== null"
      :class="changerSelectedPlace !== null ? 'bg-blue-600 text-white font-bold rounded-full py-4 mt-4 border-0 shadow-lg' : 'bg-gray-300 text-gray-500 font-bold rounded-full py-4 mt-4 border-0'"
      @tap="confirm"
    />
  </GridLayout>
</template>

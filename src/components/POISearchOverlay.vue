<script lang="ts" setup>
import { useSearch } from '../composables/useSearch';
import { loadPlace, loadedPlacePOICount } from '../composables/useMapBridge';
import { Place } from '../composables/useSavedLocation';

const { searchQuery, searchResults, searchSelectedItem, onQueryChange, selectResult, getDirectionsToResult, clearDirections, clearSearch } = useSearch();

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'load-place', place: Place): void;
}>();

function openSearch() {
  clearSearch();
  onQueryChange();
}

function closeSearch() {
  clearSearch();
  emit('close');
}

function getDirections() {
  getDirectionsToResult();
  emit('close');
}

function getCategoryEmoji(item: any) {
  if (item.category === 'road') return '🛣️';
  if (item.category === 'place') return item.subcategory === 'city' ? '🏙️' : '🏡';
  if (item.subcategory === 'restaurant' || item.subcategory === 'fast_food') return '🍽️';
  if (item.subcategory === 'hospital' || item.subcategory === 'clinic') return '🏥';
  if (item.subcategory === 'pharmacy') return '💊';
  if (item.subcategory === 'cafe') return '☕';
  if (item.subcategory === 'bank') return '🏦';
  if (item.subcategory === 'fuel') return '⛽';
  if (item.category === 'shop') return '🛍️';
  if (item.subcategory === 'school' || item.subcategory === 'college' || item.subcategory === 'university') return '🏫';
  return '📍';
}
</script>

<template>
  <GridLayout v-if="show" row="0" rowSpan="2" rows="auto, auto, *, auto" class="bg-[#f4f3f0] p-4 w-full h-full">
    <GridLayout row="0" columns="auto, *, auto" class="mt-6 mb-3">
      <Label col="0" text="🔍" class="text-2xl mr-2" verticalAlignment="center" />
      <Label col="1" :text="`Search Places (${loadedPlacePOICount} Total Places)`" class="text-2xl font-bold text-gray-800" verticalAlignment="center" />
      <Button col="2" text="✕" class="bg-gray-200 border-0 text-gray-600 rounded-full w-8 h-8 font-bold" @tap="closeSearch" />
    </GridLayout>

    <TextField
      row="1"
      v-model="searchQuery"
      hint="Search POIs, shops, roads..."
      class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200 text-base"
      @textChange="onQueryChange"
      returnKeyType="search"
    />

    <GridLayout row="2" rows="*">
      <StackLayout v-if="searchResults.length === 0" class="justify-center items-center">
        <Label text="🗺️" class="text-5xl mb-4" />
        <Label text="No results found" class="text-gray-500 text-lg font-semibold" />
        <Label text="Try a different search term" class="text-gray-400 text-sm mt-1" />
      </StackLayout>

      <ListView v-if="searchResults.length > 0" :items="searchResults" class="bg-white rounded-2xl shadow-sm border border-gray-100">
        <template #default="{ item }">
          <GridLayout
            columns="auto, *, auto"
            :class="searchSelectedItem && searchSelectedItem.id === item.id ? 'p-4 border-b border-gray-100 bg-blue-50' : 'p-4 border-b border-gray-100 active:bg-gray-100'"
            @tap="selectResult(item)"
          >
            <Label col="0" :text="getCategoryEmoji(item)" class="text-xl mr-3" verticalAlignment="center" />
            <StackLayout col="1">
              <Label :text="item.name" class="text-base font-semibold text-gray-800" maxLines="1" />
              <Label :text="item.distance !== undefined ? `${item.category} • ${item.subcategory} • ${item.distance.toFixed(1)} km away` : `${item.category} • ${item.subcategory}`" class="text-gray-400 text-xs capitalize mt-0.5" />
            </StackLayout>
            <Label col="2" :text="searchSelectedItem && searchSelectedItem.id === item.id ? '✓' : ''" class="text-blue-600 font-bold text-xl" verticalAlignment="center" />
          </GridLayout>
        </template>
      </ListView>
    </GridLayout>

    <GridLayout row="3" columns="*, *" class="mt-3 gap-3" v-if="searchSelectedItem">
      <Button col="0" text="📍 View on Map" class="bg-gray-200 text-gray-700 font-bold rounded-full py-3 border-0" @tap="closeSearch" />
      <Button
        v-if="!searchSelectedItem.placeData"
        col="1"
        text="🚨 Get Directions"
        class="bg-blue-600 text-white font-bold rounded-full py-3 border-0 shadow-lg"
        @tap="getDirections"
      />
      <Button
        v-else
        col="1"
        text="🔄 Load Map Area"
        class="bg-green-600 text-white font-bold rounded-full py-3 border-0 shadow-lg"
        @tap="loadPlace(searchSelectedItem.placeData, true); closeSearch()"
      />
    </GridLayout>
  </GridLayout>
</template>

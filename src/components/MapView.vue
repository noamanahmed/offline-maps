<script lang="ts" setup>
import { watch } from 'nativescript-vue';
import { initBridge, callWebView } from '../composables/useMapBridge';

const props = defineProps<{
  activeTheme: 'light' | 'dark';
}>();

const emit = defineEmits<{
  (e: 'webview-ready'): void;
}>();

function onWebViewLoaded(args: any) {
  initBridge(args.object);
  emit('webview-ready');
}

watch(() => props.activeTheme, (theme) => {
  callWebView('setTheme', theme);
});
</script>

<template>
  <WebView
    src="~/assets/map.html"
    @loadFinished="onWebViewLoaded"
    class="w-full h-full"
  />
</template>

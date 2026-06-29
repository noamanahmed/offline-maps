# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# vue
- Use debounce on search input fields to avoid rapid repeated queries. Confidence: 0.70

# shell
- Use multi-threaded design for data generation scripts with 4 threads by default. Confidence: 0.75

# nativescript
- Do not use symlinks for `src/maps` — instead keep actual map data files copied into `src/maps/countries/` for bundling. Confidence: 0.70
- For `ns preview`: copy map data files once on initial build but exclude them from webpack watching and IPC asset notifications to avoid crashing the serializer. Confidence: 0.75
- Load map assets (PBF, POI JSON) directly in WebView via XHR/fetch from the app bundle rather than piping through NativeScript filesystem → base64 → WebView bridge, which is unreliable on Android. Confidence: 0.75
- Do not use a zip archive (maps.zip) for bundling map data — keep map files as individual files in the app bundle. Confidence: 0.70
- Scan the filesystem dynamically at runtime to discover available places instead of using a static places_index.json file. Confidence: 0.80


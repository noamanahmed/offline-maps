# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# flutter
- Prefer Flutter/Dart packages (e.g., flutter_map) over JavaScript/webview-based approaches for map rendering and PBF parsing. Confidence: 0.70
- Use dart_osmpbf package for OSM PBF parsing; do not custom-build PBF parsers. Confidence: 0.75

# error-handling
- Add verbose logging during OSM PBF parsing to aid debugging. Confidence: 0.65
- Capture all exceptions explicitly and surface error messages to the user via the UI. Confidence: 0.65

# architecture
- Load maps in a background thread/isolate to avoid blocking the main UI thread. Confidence: 0.65
- Use per-platform symlinks (android/ios/web) for large static map assets instead of Flutter's wildcard asset bundling, which silently drops directories with many files. Confidence: 0.70

# web
- Flutter web (Chrome PWA) has no isolate support; parsing runs on the main thread. Use conditional exports to provide a web-compatible synchronous parser path. Confidence: 0.65


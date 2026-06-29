import 'dart:html' as html;
import 'dart:ui_web' as ui_web;
import 'package:flutter/material.dart';

class MapController {
  html.IFrameElement? _iframe;

  void callMapFn(String fn, [List<dynamic> args = const []]) {
    _iframe?.contentWindow?.postMessage({'fn': fn, 'args': args}, '*');
  }

  void loadMapData(String pbfB64, String poisJson, double lat, double lon, int zoom) =>
      callMapFn('loadMapData', [pbfB64, poisJson, lat, lon, zoom, false]);
  void setTheme(String theme) => callMapFn('setTheme', [theme]);
  void updateUserLocation(double lat, double lng, bool connected) =>
      callMapFn('updateUserLocation', [lat, lng, connected]);
  void centerOnUser() => callMapFn('centerOnUser');
  void centerOnCoords(double lat, double lng, [int? z]) =>
      callMapFn('centerOnCoords', [lat, lng, z]);
  void focusPoi(double lat, double lng, String name) =>
      callMapFn('focusPoi', [lat, lng, name]);
  void drawRoute(double fl, double fg, double tl, double tg) =>
      callMapFn('drawRoute', [fl, fg, tl, tg]);
  void clearRoute() => callMapFn('clearRoute');
  void clearSelectedPin() => callMapFn('clearSelPin');
  void runSearch(String q, double al, double ag) =>
      callMapFn('runSearch', [q, al, ag]);
}

class MapWidget extends StatefulWidget {
  final MapController controller;
  final void Function(dynamic)? onMessage;
  const MapWidget({super.key, required this.controller, this.onMessage});

  @override
  State<MapWidget> createState() => _MapWidgetState();
}

class _MapWidgetState extends State<MapWidget> {
  late final String _viewType;

  @override
  void initState() {
    super.initState();
    _viewType = 'map-frame-${identityHashCode(this)}';
    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int id) {
      final iframe = html.IFrameElement()
        ..src = 'assets_web/map.html'
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%';
      widget.controller._iframe = iframe;
      html.window.addEventListener('message', _onMessage);
      return iframe;
    });
  }

  void _onMessage(html.Event e) {
    if (e is html.MessageEvent) {
      final data = e.data;
      if (data is Map && data['type'] != 'call') {
        widget.onMessage?.call(data);
      }
    }
  }

  @override
  void dispose() {
    html.window.removeEventListener('message', _onMessage);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      HtmlElementView(viewType: _viewType);
}

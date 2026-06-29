import 'package:flutter/material.dart';

class MapController {
  void callMapFn(String fn, [List<dynamic> args = const []]) {}
  void loadMapData(String pbfB64, String poisJson, double lat, double lon, int zoom) {}
  void setTheme(String theme) {}
  void updateUserLocation(double lat, double lng, bool connected) {}
  void centerOnUser() {}
  void centerOnCoords(double lat, double lng, [int? z]) {}
  void focusPoi(double lat, double lng, String name) {}
  void drawRoute(double fl, double fg, double tl, double tg) {}
  void clearRoute() {}
  void clearSelectedPin() {}
  void runSearch(String q, double al, double ag) {}
}

class MapWidget extends StatelessWidget {
  final MapController controller;
  final void Function(dynamic)? onMessage;
  const MapWidget({super.key, required this.controller, this.onMessage});

  @override
  Widget build(BuildContext context) =>
      const Center(child: Text('Map unavailable on this platform'));
}

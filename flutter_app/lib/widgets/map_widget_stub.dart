import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:webview_flutter/webview_flutter.dart';

class MapController {
  WebViewController? _controller;

  Future<void> _init(WebViewController c) async {
    _controller = c;
  }

  void callMapFn(String fn, [List<dynamic> args = const []]) {
    final argsJson = args.map((a) => a is String ? '"${a.replaceAll('"', '\\"')}"' : '$a').join(',');
    _controller?.runJavaScript('if(window.$fn) window.$fn($argsJson)');
  }

  void loadMapData(String pbfB64, String poisJson, double lat, double lon, int zoom) =>
      callMapFn('loadMapData', [pbfB64, poisJson, lat, lon, zoom, false]);
  void setTheme(String t) => callMapFn('setTheme', [t]);
  void updateUserLocation(double lat, double lng, bool c) =>
      callMapFn('updateUserLocation', [lat, lng, c]);
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
  late final WebViewController _webCtrl;

  @override
  void initState() {
    super.initState();
    _webCtrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (_) {
            widget.controller._init(_webCtrl);
          },
          onWebResourceError: (_) {},
        ),
      )
      ..addJavaScriptChannel('MapMessage', onMessageReceived: (msg) {
        try {
          final data = jsonDecode(msg.message);
          widget.onMessage?.call(data);
        } catch (_) {}
      });

    _loadMapHtml();
  }

  Future<void> _loadMapHtml() async {
    final htmlContent = await rootBundle.loadString('assets_web/map.html');
    await _webCtrl.loadHtmlString(htmlContent);
  }

  @override
  Widget build(BuildContext context) =>
      WebViewWidget(controller: _webCtrl);
}

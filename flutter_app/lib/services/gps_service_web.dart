import 'dart:html' as html;
import 'dart:async';

class GpsService {
  GpsService._();
  static final _i = GpsService._();
  factory GpsService() => _i;

  final _locCtrl = StreamController<({double lat, double lng, double accuracy})>.broadcast();
  final _errCtrl = StreamController<String>.broadcast();
  StreamSubscription<html.Geoposition>? _sub;

  Stream<({double lat, double lng, double accuracy})> get onLocation =>
      _locCtrl.stream;
  Stream<String> get onError => _errCtrl.stream;

  bool get isActive => _sub != null;

  Future<bool> requestPermission() async {
    return true;
  }

  void start() {
    stop();
    final geo = html.window.navigator.geolocation;
    if (geo == null) return;
    try {
      _sub = geo.watchPosition().listen(
        (pos) {
          final c = pos.coords;
          final la = c!.latitude;
          final lo = c.longitude;
          final ac = c.accuracy;
          if (la != null && lo != null) {
            _locCtrl.add((lat: la.toDouble(), lng: lo.toDouble(), accuracy: (ac ?? 0).toDouble()));
          }
        },
        onError: (err) => _errCtrl.add('$err'),
      );
    } catch (_) {}
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
  }

  void dispose() {
    _locCtrl.close();
    _errCtrl.close();
  }
}

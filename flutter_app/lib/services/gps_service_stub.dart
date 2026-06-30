import 'dart:async';
import 'package:geolocator/geolocator.dart';

class GpsService {
  GpsService._();
  static final _i = GpsService._();
  factory GpsService() => _i;

  final _locCtrl = StreamController<({double lat, double lng, double accuracy})>.broadcast();
  final _errCtrl = StreamController<String>.broadcast();
  StreamSubscription<Position>? _sub;

  Stream<({double lat, double lng, double accuracy})> get onLocation => _locCtrl.stream;
  Stream<String> get onError => _errCtrl.stream;

  bool get isActive => _sub != null;

  Future<bool> requestPermission() async {
    LocationPermission perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied) {
        _errCtrl.add('Location permission denied');
        return false;
      }
    }
    if (perm == LocationPermission.deniedForever) {
      _errCtrl.add('Location permission permanently denied');
      return false;
    }
    return true;
  }

  void start() {
    stop();
    Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 10,
      ),
    ).listen(
      (pos) {
        _locCtrl.add((lat: pos.latitude, lng: pos.longitude, accuracy: pos.accuracy));
      },
      onError: (err) {
        _errCtrl.add('$err');
        stop();
      },
    );
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
  }

  void dispose() {
    _sub?.cancel();
    _locCtrl.close();
    _errCtrl.close();
  }
}

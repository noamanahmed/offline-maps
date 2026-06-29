import 'dart:async';

class GpsService {
  GpsService._();
  static final _i = GpsService._();
  factory GpsService() => _i;

  final _locCtrl = StreamController<({double lat, double lng, double accuracy})>.broadcast();
  final _errCtrl = StreamController<String>.broadcast();

  Stream<({double lat, double lng, double accuracy})> get onLocation =>
      _locCtrl.stream;
  Stream<String> get onError => _errCtrl.stream;

  void start() {}
  void stop() {}
  void dispose() {
    _locCtrl.close();
    _errCtrl.close();
  }
}

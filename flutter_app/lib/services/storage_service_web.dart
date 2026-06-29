import 'dart:html' as html;

class StorageService {
  StorageService._();
  static final _i = StorageService._();
  factory StorageService() => _i;

  String getString(String key, {String defaultValue = ''}) =>
      html.window.localStorage[key] ?? defaultValue;
  void setString(String key, String value) =>
      html.window.localStorage[key] = value;
  int getInt(String key, {int defaultValue = 0}) =>
      int.tryParse(getString(key)) ?? defaultValue;
  void setInt(String key, int value) => setString(key, '$value');
  double getDouble(String key, {double defaultValue = 0}) =>
      double.tryParse(getString(key)) ?? defaultValue;
  void setDouble(String key, double value) => setString(key, value.toString());
  bool getBool(String key, {bool defaultValue = false}) =>
      getString(key) == 'true';
  void setBool(String key, bool value) => setString(key, value.toString());
}

class StorageService {
  StorageService._();
  static final _i = StorageService._();
  factory StorageService() => _i;

  final Map<String, String> _store = {};

  String getString(String key, {String defaultValue = ''}) =>
      _store[key] ?? defaultValue;
  void setString(String key, String value) => _store[key] = value;
  int getInt(String key, {int defaultValue = 0}) =>
      int.tryParse(_store[key] ?? '') ?? defaultValue;
  void setInt(String key, int value) => _store[key] = '$value';
  double getDouble(String key, {double defaultValue = 0}) =>
      double.tryParse(_store[key] ?? '') ?? defaultValue;
  void setDouble(String key, double value) => _store[key] = value.toString();
  bool getBool(String key, {bool defaultValue = false}) =>
      _store[key] == 'true';
  void setBool(String key, bool value) => _store[key] = value.toString();
}

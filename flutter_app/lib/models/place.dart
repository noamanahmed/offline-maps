class Place {
  final int id;
  final String name;
  final String nameUr;
  final String type;
  final double lat;
  final double lon;
  final String province;
  final String country;
  final String path;

  const Place({
    required this.id,
    required this.name,
    this.nameUr = '',
    required this.type,
    required this.lat,
    required this.lon,
    required this.province,
    required this.country,
    required this.path,
  });

  factory Place.fromJson(Map<String, dynamic> json, {String path = ''}) {
    final rawType = (json['type'] as String? ?? '');
    final singular = rawType.endsWith('ies')
        ? '${rawType.substring(0, rawType.length - 3)}y'
        : rawType.endsWith('s')
            ? rawType.substring(0, rawType.length - 1)
            : rawType;
    return Place(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] as String?) ?? '',
      nameUr: (json['name_ur'] as String?) ?? '',
      type: singular,
      lat: (json['latitude'] ?? json['lat'] ?? 0).toDouble(),
      lon: (json['longitude'] ?? json['lon'] ?? 0).toDouble(),
      province: (json['province'] as String?) ?? '',
      country: (json['country'] as String?) ?? '',
      path: (json['path'] as String?) ?? path,
    );
  }

  String get mbtilesFileName => '${path.split('/').last}.mbtiles';

  String get mbtilesPath => 'maps/countries/$path/$mbtilesFileName';
  String get poisPath => 'maps/countries/$path/pois.json';
}

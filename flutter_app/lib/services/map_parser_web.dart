import 'dart:convert';

class ParsedMapData {
  final List<({int id, double lat, double lon})> nodes;
  final List<({String highway, String name, List<int> refs})> ways;
  final List<
      ({
        String name,
        String category,
        String subcategory,
        double lat,
        double lon,
      })> pois;
  final List<
      ({
        String name,
        String placeType,
        double lat,
        double lon,
      })> placeLabels;

  ParsedMapData(this.nodes, this.ways, this.pois, this.placeLabels);
}

Future<ParsedMapData> parseMapData(
  String mbtilesPath,
  String poisJson,
) async {
  print('[map_parser_web] parseMapData called with: $mbtilesPath');
  
  final pois = <({String name, String category, String subcategory, double lat, double lon})>[];
  try {
    final decoded = jsonDecode(poisJson) as List<dynamic>;
    for (final item in decoded) {
      final d = item as Map<String, dynamic>;
      pois.add((
        name: d['name'] ?? '',
        category: d['category'] ?? '',
        subcategory: d['subcategory'] ?? '',
        lat: (d['latitude'] as num).toDouble(),
        lon: (d['longitude'] as num).toDouble(),
      ));
    }
  } catch (e) {
    print('[map_parser_web] Failed to parse POIs: $e');
  }

  // Web stub does not parse database tiles.
  return ParsedMapData([], [], pois, []);
}

import 'dart:convert';
import 'dart:isolate';
import 'dart:typed_data';
import 'package:dart_osmpbf/dart_osmpbf.dart';

class ParsedMapData {
  final List<({int id, double lat, double lon})> nodes;
  final List<({String highway, String name, List<int> refs})> ways;
  final List<({String name, String category, String subcategory, double lat, double lon})> pois;

  ParsedMapData(this.nodes, this.ways, this.pois);
}

ParsedMapData _parseInThread(List<dynamic> args) {
  final pbf = args[0] as Uint8List;
  final poisJson = args[1] as String;

  print('[map_parser] Starting PBF parse, size: ${pbf.length} bytes');
  final sw = Stopwatch()..start();

  final osmData = OsmData.fromBytes(pbf);
  sw.stop();
  print('[map_parser] OsmData.fromBytes complete in ${sw.elapsedMilliseconds}ms');
  print('[map_parser]   Nodes: ${osmData.nodes.length}');
  print('[map_parser]   Ways: ${osmData.ways.length}');
  print('[map_parser]   Relations: ${osmData.relations.length}');

  sw.reset();
  sw.start();
  final nodeMap = <int, ({double lat, double lon})>{};
  for (final node in osmData.nodes) {
    nodeMap[node.id] = (lat: node.lat, lon: node.lon);
  }
  sw.stop();
  print('[map_parser] Node map built in ${sw.elapsedMilliseconds}ms, entries: ${nodeMap.length}');

  sw.reset();
  sw.start();
  final ways = <({String highway, String name, List<int> refs})>[];
  int withHighwayCount = 0;
  int refMatchFailCount = 0;
  int tooFewRefsCount = 0;
  int prevWayLastRef = 0;
  for (final way in osmData.ways) {
    final highway = way.tags['highway'];
    if (highway == null || highway.isEmpty) continue;
    withHighwayCount++;
    // Workaround for dart_osmpbf refDelta bug: per-way delta reset
    int cumulative = 0;
    final refs = <int>[];
    for (var i = 0; i < way.refs.length; i++) {
      final rawDelta = (i == 0) ? way.refs[i] - prevWayLastRef : way.refs[i] - cumulative;
      cumulative += rawDelta;
      if (nodeMap.containsKey(cumulative)) refs.add(cumulative);
    }
    prevWayLastRef = cumulative;
    if (refs.length < 2) { tooFewRefsCount++; continue; }
    if (refs.length < way.refs.length) refMatchFailCount++;
    ways.add((highway: highway, name: way.tags['name'] ?? '', refs: refs));
  }
  sw.stop();
  print('[map_parser] Ways filtered: total=${osmData.ways.length}, withHighway=$withHighwayCount, result=${ways.length}, refFail=$refMatchFailCount, tooFew=$tooFewRefsCount');

  final pois = <({String name, String category, String subcategory, double lat, double lon})>[];
  try {
    final poisList = jsonDecode(poisJson) as List<dynamic>;
    for (final p in poisList) {
      final d = p as Map<String, dynamic>;
      pois.add((
        name: d['name'] ?? '',
        category: d['category'] ?? '',
        subcategory: d['subcategory'] ?? '',
        lat: (d['latitude'] as num).toDouble(),
        lon: (d['longitude'] as num).toDouble(),
      ));
    }
    print('[map_parser] POIs parsed: ${pois.length}');
  } catch (e, st) {
    print('[map_parser] WARNING: Failed to parse POIs JSON: $e');
    print('[map_parser] $st');
  }

  final nodes = nodeMap.entries.map((e) => (id: e.key, lat: e.value.lat, lon: e.value.lon)).toList();

  return ParsedMapData(nodes, ways, pois);
}

Future<ParsedMapData> parseMapData(Uint8List pbf, String poisJson) async {
  try {
    print('[map_parser] Launching parse in isolate...');
    final result = await Isolate.run(() => _parseInThread([pbf, poisJson]));
    print('[map_parser] Isolate parse complete');
    return result;
  } catch (e, st) {
    print('[map_parser] ERROR: PBF parsing failed: $e');
    print('[map_parser] $st');
    rethrow;
  }
}

import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'dart:typed_data';

import 'package:dart_osmpbf/proto/fileformat.pb.dart';
import 'package:dart_osmpbf/proto/osmformat.pb.dart';

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

  ParsedMapData(this.nodes, this.ways, this.pois);
}

ParsedMapData _parseInThread(List<dynamic> args) {
  final pbf = args[0] as Uint8List;
  final poisJson = args[1] as String;

  print('[map_parser] Starting PBF parse (${pbf.length} bytes)');
  final sw = Stopwatch()..start();

  // ---------------------------------------------------------------------------
  // Parse PBF manually using dart_osmpbf's protobuf definitions.
  //
  // We don't use OsmData.fromBytes() because it has a critical bug:
  // dense node lat/lon are delta-encoded in the PBF spec, but dart_osmpbf
  // (v0.0.1) does not delta-decode them — only the id is delta-decoded.
  // Way refs and relation member IDs are also not delta-decoded.
  // ---------------------------------------------------------------------------

  final nodeMap = <int, ({double lat, double lon})>{};
  final ways = <({String highway, String name, List<int> refs})>[];

  var data = pbf;
  var iter = 0;

  while (data.isNotEmpty && iter++ < 500) {
    // Read blob header length (4-byte big-endian)
    final blobHeaderLength = ByteData.sublistView(data, 0, 4).getUint32(0);
    data = data.sublist(4);

    // Read and parse blob header
    final blobHeaderData = data.sublist(0, blobHeaderLength);
    data = data.sublist(blobHeaderLength);
    final blobHeader = BlobHeader.fromBuffer(blobHeaderData);
    final blobLength = blobHeader.datasize;

    // Read and parse blob
    final blobData = data.sublist(0, blobLength);
    data = data.sublist(blobLength);
    final blob = Blob.fromBuffer(blobData);
    final blobOutput = Uint8List.fromList(zlib.decode(blob.zlibData));

    if (blobHeader.type != 'OSMData') {
      continue;
    }

    final block = PrimitiveBlock.fromBuffer(blobOutput);
    final stringTable =
        block.stringtable.s.map((s) => utf8.decode(s)).toList();
    final latOffset = block.latOffset.toInt();
    final lonOffset = block.lonOffset.toInt();
    final granularity = block.granularity;

    for (final primitiveGroup in block.primitivegroup) {
      // --- Regular (non-dense) nodes ---
      for (final node in primitiveGroup.nodes) {
        final id = node.id.toInt();
        final lat = 1e-9 * (latOffset + granularity * node.lat.toInt());
        final lon = 1e-9 * (lonOffset + granularity * node.lon.toInt());
        nodeMap[id] = (lat: lat, lon: lon);
      }

      // --- Dense nodes (delta-encoded id, lat, lon) ---
      if (primitiveGroup.dense.id.isNotEmpty) {
        final dense = primitiveGroup.dense;
        var id = 0;
        var rawLat = 0;
        var rawLon = 0;

        for (var i = 0; i < dense.id.length; i++) {
          id += dense.id[i].toInt();
          rawLat += dense.lat[i].toInt();
          rawLon += dense.lon[i].toInt();

          final lat = 1e-9 * (latOffset + granularity * rawLat);
          final lon = 1e-9 * (lonOffset + granularity * rawLon);

          nodeMap[id] = (lat: lat, lon: lon);
        }
      }

      // --- Ways (delta-encoded refs) ---
      for (final way in primitiveGroup.ways) {
        final tags = _parseTags(way.keys, way.vals, stringTable);
        final highway = tags['highway'];

        if (highway == null || highway.isEmpty) {
          continue;
        }

        // Delta-decode refs
        var cumulative = 0;
        final refs = <int>[];

        for (final delta in way.refs) {
          cumulative += delta.toInt();

          if (nodeMap.containsKey(cumulative)) {
            refs.add(cumulative);
          }
        }

        if (refs.length < 2) {
          continue;
        }

        ways.add((
          highway: highway,
          name: tags['name'] ?? '',
          refs: refs,
        ));
      }
    }
  }

  sw.stop();
  print(
    '[map_parser] Parsed PBF in ${sw.elapsedMilliseconds}ms: '
    '${nodeMap.length} nodes, ${ways.length} ways',
  );

  // ---------------------------------------------------------------------------
  // Parse POIs
  // ---------------------------------------------------------------------------

  final pois =
      <({
        String name,
        String category,
        String subcategory,
        double lat,
        double lon,
      })>[];

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
  } catch (e, st) {
    print('[map_parser] Failed to parse POIs: $e');
    print(st);
  }

  print('[map_parser] Parsed ${pois.length} POIs');

  // ---------------------------------------------------------------------------
  // Export nodes
  // ---------------------------------------------------------------------------

  final nodes = nodeMap.entries
      .map(
        (e) => (
          id: e.key,
          lat: e.value.lat,
          lon: e.value.lon,
        ),
      )
      .toList();

  print(
    '[map_parser] Finished: '
    '${nodes.length} nodes, '
    '${ways.length} ways, '
    '${pois.length} POIs',
  );

  return ParsedMapData(nodes, ways, pois);
}

Map<String, String> _parseTags(
  List<int> keys,
  List<int> values,
  List<String> stringTable,
) {
  final tags = <String, String>{};
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] == 0) continue;
    tags[stringTable[keys[i]]] = stringTable[values[i]];
  }
  return tags;
}

Future<ParsedMapData> parseMapData(
  Uint8List pbf,
  String poisJson,
) async {
  try {
    print('[map_parser] Launching parser isolate...');

    final result = await Isolate.run(
      () => _parseInThread([pbf, poisJson]),
    );

    print('[map_parser] Parsing complete');

    return result;
  } catch (e, st) {
    print('[map_parser] ERROR: $e');
    print(st);
    rethrow;
  }
}
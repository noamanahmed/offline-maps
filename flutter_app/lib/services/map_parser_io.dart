import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'dart:math';
import 'dart:typed_data';

import 'package:sqlite3/sqlite3.dart';
import 'package:vector_tile/vector_tile.dart';

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

ParsedMapData _parseInThread(List<dynamic> args) {
  final mbtilesPath = args[0] as String;
  final poisJson = args[1] as String;

  print('[map_parser] Opening MBTiles database at $mbtilesPath');
  final sw = Stopwatch()..start();

  final db = sqlite3.open(mbtilesPath);

  // We query zoom level 14 because that's our design target for detailed streets and places
  final rows = db.select(
    'SELECT tile_column, tile_row, tile_data FROM tiles WHERE zoom_level = 14',
  );

  print('[map_parser] Query returned ${rows.length} tiles in ${sw.elapsedMilliseconds}ms');

  final nodeMap = <String, int>{};
  final parsedNodes = <({int id, double lat, double lon})>[];
  
  final tempWays = <_TempWay>[];
  final tempLabels = <_TempLabel>[];
  final placeLabels = <({String name, String placeType, double lat, double lon})>[];

  int nodeIdCounter = 1;
  const extent = 4096;
  final numTiles14 = pow(2, 14).toInt(); // 16384

  // Helper functions inside isolate scope
  double sinh(double x) => (exp(x) - exp(-x)) / 2.0;

  for (final row in rows) {
    final xTMS = row['tile_column'] as int;
    final yTMS = row['tile_row'] as int;
    final tileData = row['tile_data'] as Uint8List;

    // Convert TMS coordinates to XYZ
    final tileX = xTMS;
    final tileY = numTiles14 - 1 - yTMS;

    Uint8List decompressed;
    try {
      decompressed = Uint8List.fromList(gzip.decode(tileData));
    } catch (_) {
      try {
        decompressed = Uint8List.fromList(zlib.decode(tileData));
      } catch (e) {
        print('[map_parser] Decompression failed for tile ($xTMS, $yTMS): $e');
        continue;
      }
    }

    VectorTile tile;
    try {
      tile = VectorTile.fromBytes(bytes: decompressed);
    } catch (e) {
      print('[map_parser] VectorTile parse failed for tile ($xTMS, $yTMS): $e');
      continue;
    }

    Map<String, double> tileToLatLng(double localX, double localY) {
      final px = (tileX + localX / extent) / numTiles14;
      final py = (tileY + localY / extent) / numTiles14;
      final lon = px * 360.0 - 180.0;
      final latRad = atan(sinh(pi * (1.0 - 2.0 * py)));
      final lat = latRad * 180.0 / pi;
      return {'lat': lat, 'lon': lon};
    }

    int getOrRegisterNode(double lat, double lon) {
      final latR = (lat * 1e6).round();
      final lonR = (lon * 1e6).round();
      final key = '${latR}_${lonR}';
      
      final existingId = nodeMap[key];
      if (existingId != null) {
        return existingId;
      }
      
      final id = nodeIdCounter++;
      nodeMap[key] = id;
      parsedNodes.add((id: id, lat: lat, lon: lon));
      return id;
    }

    // Process Transportation Layer (Road Geometry)
    final roadLayer = tile.layers.where((l) => l.name == 'transportation').firstOrNull;
    if (roadLayer != null) {
      for (final feature in roadLayer.features) {
        final props = feature.decodeProperties();
        if (props == null) continue;
        
        final classVal = props['class'];
        if (classVal == null) continue;
        final highway = classVal.value.toString();

        final geom = feature.decodeGeometry();
        if (geom == null) continue;

        final lines = _extractLines(geom);
        for (final line in lines) {
          if (line.length < 2) continue;

          final refs = <int>[];
          for (final pt in line) {
            final latLng = tileToLatLng(pt[0], pt[1]);
            final nodeId = getOrRegisterNode(latLng['lat']!, latLng['lon']!);
            refs.add(nodeId);
          }

          tempWays.add(_TempWay(
            highway: highway,
            refs: refs,
          ));
        }
      }
    }

    // Process Transportation Name Layer (Road Labels/Names)
    final nameLayer = tile.layers.where((l) => l.name == 'transportation_name').firstOrNull;
    if (nameLayer != null) {
      for (final feature in nameLayer.features) {
        final props = feature.decodeProperties();
        if (props == null) continue;

        final nameVal = props['name:latin'] ?? props['name'];
        if (nameVal == null) continue;
        final name = nameVal.value.toString();
        if (name.isEmpty) continue;

        final geom = feature.decodeGeometry();
        if (geom == null) continue;

        final lines = _extractLines(geom);
        for (final line in lines) {
          if (line.length < 2) continue;

          final refs = <int>[];
          for (final pt in line) {
            final latLng = tileToLatLng(pt[0], pt[1]);
            final nodeId = getOrRegisterNode(latLng['lat']!, latLng['lon']!);
            refs.add(nodeId);
          }

          tempLabels.add(_TempLabel(
            name: name,
            refs: refs,
          ));
        }
      }
    }

    // Process Place Layer (Place Labels)
    final placeLayer = tile.layers.where((l) => l.name == 'place').firstOrNull;
    if (placeLayer != null) {
      for (final feature in placeLayer.features) {
        final props = feature.decodeProperties();
        if (props == null) continue;

        final nameVal = props['name:latin'] ?? props['name'];
        final classVal = props['class'];
        if (nameVal == null || classVal == null) continue;

        final name = nameVal.value.toString();
        final placeType = classVal.value.toString();
        if (name.isEmpty) continue;

        final geom = feature.decodeGeometry();
        if (geom == null) continue;

        final points = _extractPoints(geom);
        for (final pt in points) {
          final latLng = tileToLatLng(pt[0], pt[1]);
          placeLabels.add((
            name: name,
            placeType: placeType,
            lat: latLng['lat']!,
            lon: latLng['lon']!,
          ));
        }
      }
    }
  }

  db.dispose();
  print('[map_parser] Database parsing closed. Extracted ${tempWays.length} raw ways, ${tempLabels.length} raw labels in ${sw.elapsedMilliseconds}ms');

  // Associate road names from transportation_name features to the closest/most overlapping transportation way
  final nodeToWays = <int, List<_TempWay>>{};
  for (final way in tempWays) {
    for (final ref in way.refs) {
      nodeToWays.putIfAbsent(ref, () => []).add(way);
    }
  }

  for (final label in tempLabels) {
    final wayVotes = <_TempWay, int>{};
    for (final ref in label.refs) {
      final waysAtNode = nodeToWays[ref];
      if (waysAtNode != null) {
        for (final way in waysAtNode) {
          wayVotes[way] = (wayVotes[way] ?? 0) + 1;
        }
      }
    }

    if (wayVotes.isNotEmpty) {
      _TempWay? bestWay;
      int maxVotes = -1;
      wayVotes.forEach((way, votes) {
        if (votes > maxVotes) {
          maxVotes = votes;
          bestWay = way;
        }
      });
      
      if (bestWay != null) {
        bestWay!.name = label.name;
      }
    }
  }

  final finalWays = tempWays.map((tw) => (
    highway: tw.highway,
    name: tw.name,
    refs: tw.refs,
  )).toList();

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
    print('[map_parser] Failed to parse POIs: $e');
  }

  sw.stop();
  print(
    '[map_parser] Finished parsing in ${sw.elapsedMilliseconds}ms: '
    '${parsedNodes.length} nodes, ${finalWays.length} ways, ${pois.length} POIs, ${placeLabels.length} placeLabels',
  );

  return ParsedMapData(parsedNodes, finalWays, pois, placeLabels);
}

List<List<List<double>>> _extractLines(dynamic geom) {
  if (geom == null) return [];
  final String typeName = geom.runtimeType.toString();
  if (typeName == 'GeometryLineString') {
    final coords = (geom as dynamic).coordinates;
    if (coords is List) {
      final line = <List<double>>[];
      for (final pt in coords) {
        if (pt is List && pt.length >= 2) {
          line.add([ (pt[0] as num).toDouble(), (pt[1] as num).toDouble() ]);
        }
      }
      return [line];
    }
  } else if (typeName == 'GeometryMultiLineString') {
    final coordsList = (geom as dynamic).coordinates;
    if (coordsList is List) {
      final lines = <List<List<double>>>[];
      for (final coords in coordsList) {
        if (coords is List) {
          final line = <List<double>>[];
          for (final pt in coords) {
            if (pt is List && pt.length >= 2) {
              line.add([ (pt[0] as num).toDouble(), (pt[1] as num).toDouble() ]);
            }
          }
          if (line.isNotEmpty) lines.add(line);
        }
      }
      return lines;
    }
  }
  return [];
}

List<List<double>> _extractPoints(dynamic geom) {
  if (geom == null) return [];
  final String typeName = geom.runtimeType.toString();
  if (typeName == 'GeometryPoint') {
    final coords = (geom as dynamic).coordinates;
    if (coords is List && coords.isNotEmpty) {
      if (coords[0] is List) {
        final list = <List<double>>[];
        for (final pt in coords) {
          if (pt is List && pt.length >= 2) {
            list.add([(pt[0] as num).toDouble(), (pt[1] as num).toDouble()]);
          }
        }
        return list;
      } else if (coords.length >= 2) {
        return [[(coords[0] as num).toDouble(), (coords[1] as num).toDouble()]];
      }
    }
  } else if (typeName == 'GeometryMultiPoint') {
    final coordsList = (geom as dynamic).coordinates;
    if (coordsList is List) {
      final list = <List<double>>[];
      for (final pt in coordsList) {
        if (pt is List && pt.length >= 2) {
          list.add([(pt[0] as num).toDouble(), (pt[1] as num).toDouble()]);
        }
      }
      return list;
    }
  }
  return [];
}

class _TempWay {
  final String highway;
  final List<int> refs;
  String name = '';
  _TempWay({required this.highway, required this.refs});
}

class _TempLabel {
  final String name;
  final List<int> refs;
  _TempLabel({required this.name, required this.refs});
}

Future<ParsedMapData> parseMapData(
  String mbtilesPath,
  String poisJson,
) async {
  try {
    print('[map_parser] Launching parser isolate...');

    final result = await Isolate.run(
      () => _parseInThread([mbtilesPath, poisJson]),
    );

    print('[map_parser] Parsing complete');

    return result;
  } catch (e, st) {
    print('[map_parser] ERROR: $e');
    print(st);
    rethrow;
  }
}
import 'dart:convert';
import 'dart:typed_data';
import 'package:archive/archive.dart';

class ParsedMapData {
  final List<({int id, double lat, double lon})> nodes;
  final List<({String highway, String name, List<int> refs})> ways;
  final List<({String name, String category, String subcategory, double lat, double lon})> pois;

  ParsedMapData(this.nodes, this.ways, this.pois);
}

class _Reader {
  final Uint8List _buf;
  int _pos = 0;
  _Reader(this._buf);

  int u8() => _buf[_pos++];
  int u32be() => (_buf[_pos++] << 24) | (_buf[_pos++] << 16) | (_buf[_pos++] << 8) | _buf[_pos++];
  int varint() { int v = 0, shift = 0, b; do { b = _buf[_pos++]; v |= (b & 0x7F) << shift; shift += 7; } while ((b & 0x80) != 0); return v; }
  int zigzag() { final v = varint(); return (v >> 1) ^ -(v & 1); }
  Uint8List subview(int len) { final s = Uint8List.sublistView(_buf, _pos, _pos + len); _pos += len; return s; }
  int peekTag() { final saved = _pos; final v = varint(); _pos = saved; return v; }
  int subMsg() => varint() + _pos;
  void skip(int type) {
    switch (type) { case 0: varint(); case 1: _pos += 8; case 2: _pos = varint() + _pos; case 5: _pos += 4; }
  }
  bool get eof => _pos >= _buf.length;
}

ParsedMapData parseMapDataSync(Uint8List pbf, String poisJson) {
  print('[map_parser_web] Starting sync PBF parse, size: ${pbf.length} bytes');
  final sw = Stopwatch()..start();

  final nodeMap = <int, ({double lat, double lon})>{};
  final ways = <({String highway, String name, List<int> refs})>[];
  int blockCount = 0;

  final r = _Reader(pbf);
  while (!r.eof) {
    final bhLen = r.u32be();
    final hEnd = r._pos + bhLen;
    String? type;
    while (r._pos < hEnd) {
      final tag = r.peekTag(); final fn = tag >> 3;
      if (fn == 1) { r._pos++; type = utf8.decode(r.subview(r.varint())); }
      else if (fn == 3) { r._pos++; r.varint(); }
      else r.skip(tag & 7);
    }

    r._pos = hEnd;
    Uint8List? blob;
    while (true) {
      final tag = r.peekTag(); final fn = tag >> 3; final w = tag & 7;
      if (fn == 1) { r._pos++; blob = r.subview(r.varint()); break; }
      else if (fn == 3) { r._pos++; final z = r.subview(r.varint()); blob = ZLibDecoder().decodeBytes(z) as Uint8List; break; }
      else r.skip(w);
    }

    if (type == 'OSMData' && blob != null) {
      blockCount++;
      final br = _Reader(blob);
      final st = <String>[];
      double lO = 0, nO = 0; double g = 100;

      while (!br.eof) {
        final tag = br.peekTag(); final fn = tag >> 3; final w = tag & 7;
        if (fn == 1) { br._pos++; final end = br.subMsg(); while (br._pos < end) { st.add(utf8.decode(br.subview(br.varint()))); } }
        else if (fn == 2) { br._pos++; final end = br.subMsg();
          while (br._pos < end) {
            final gt = br.peekTag(); final gf = gt >> 3; final gw = gt & 7;
            if (gf == 1) { br._pos++; final me = br.subMsg(); int id = 0; double la = 0, lo = 0;
              while (br._pos < me) { final nt = br.peekTag(); final nf = nt >> 3;
                if (nf == 1) { br._pos++; id = br.zigzag(); } else if (nf == 8) { br._pos++; la = lO + br.zigzag() / g; }
                else if (nf == 9) { br._pos++; lo = nO + br.zigzag() / g; } else br.skip(nt & 7); }
              nodeMap[id] = (lat: la, lon: lo);
            } else if (gf == 2) { br._pos++; final me = br.subMsg(); var iD = <int>[], lT = <int>[], lN = <int>[];
              while (br._pos < me) { final nt = br.peekTag(); final nf = nt >> 3;
                if (nf == 1) { br._pos++; while (br._pos < br.subMsg()) iD.add(br.zigzag()); }
                else if (nf == 8) { br._pos++; while (br._pos < br.subMsg()) lT.add(br.zigzag()); }
                else if (nf == 9) { br._pos++; while (br._pos < br.subMsg()) lN.add(br.zigzag()); }
                else br.skip(nt & 7); }
              int ci = 0, cl = 0, cn = 0;
              for (var i = 0; i < iD.length; i++) { ci += iD[i]; cl += lT[i]; cn += lN[i]; nodeMap[ci] = (lat: lO + cl / g, lon: nO + cn / g); }
            } else if (gf == 3) { br._pos++; final me = br.subMsg();
              var kS = <int>[], vL = <int>[], rF = <int>[];
              while (br._pos < me) { final nt = br.peekTag(); final nf = nt >> 3;
                if (nf == 1) { br.zigzag(); } else if (nf == 2) { br._pos++; while (br._pos < br.subMsg()) kS.add(br.varint()); }
                else if (nf == 3) { br._pos++; while (br._pos < br.subMsg()) vL.add(br.varint()); }
                else if (nf == 8) { br._pos++; while (br._pos < br.subMsg()) rF.add(br.zigzag()); }
                else br.skip(nt & 7); }
              String hw = '', nm = '';
              for (var k = 0; k < kS.length && k < vL.length; k++) { if (st[kS[k]] == 'highway') hw = st[vL[k]]; else if (st[kS[k]] == 'name') nm = st[vL[k]]; }
              if (hw.isEmpty) continue;
              int cum = 0; final nrs = <int>[];
              for (final ref in rF) { cum += ref; if (nodeMap.containsKey(cum)) nrs.add(cum); }
              if (nrs.length >= 2) ways.add((highway: hw, name: nm, refs: nrs));
            } else br.skip(gw);
          }
        }
        else if (fn == 17) { br._pos++; g = 1e9 / br.varint(); }
        else if (fn == 19) { br._pos++; lO = br.zigzag() / 1e9; }
        else if (fn == 20) { br._pos++; nO = br.zigzag() / 1e9; }
        else br.skip(w);
      }
    }
  }

  sw.stop();
  print('[map_parser_web] OSMData blocks: $blockCount, parse took ${sw.elapsedMilliseconds}ms');

  final nodes = nodeMap.entries.map((e) => (id: e.key, lat: e.value.lat, lon: e.value.lon)).toList();
  final pois = <({String name, String category, String subcategory, double lat, double lon})>[];
  try {
    for (final p in jsonDecode(poisJson)) {
      pois.add((name: p['name'] ?? '', category: p['category'] ?? '', subcategory: p['subcategory'] ?? '',
        lat: (p['latitude'] as num).toDouble(), lon: (p['longitude'] as num).toDouble()));
    }
  } catch (e) { print('[map_parser_web] WARNING: POI parse failed: $e'); }

  print('[map_parser_web]   Nodes: ${nodes.length}, Ways: ${ways.length}, POIs: ${pois.length}');
  return ParsedMapData(nodes, ways, pois);
}

Future<ParsedMapData> parseMapData(Uint8List pbf, String poisJson) async {
  try {
    return parseMapDataSync(pbf, poisJson);
  } catch (e, st) {
    print('[map_parser_web] ERROR: PBF parsing failed: $e');
    print('[map_parser_web] $st');
    rethrow;
  }
}

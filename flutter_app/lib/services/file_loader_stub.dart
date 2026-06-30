import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  Directory? _mapDir;

  Future<Directory> _getMapDir() async {
    if (_mapDir != null) return _mapDir!;
    final dir = Directory('${(await getApplicationDocumentsDirectory()).path}/maps');
    if (!await dir.exists()) await dir.create(recursive: true);
    _mapDir = dir;
    return _mapDir!;
  }

  Future<String?> readText(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return await f.readAsString();
    try {
      return await rootBundle.loadString('assets/maps/$path');
    } catch (_) {}
    try {
      return await rootBundle.loadString('assets_web/maps/$path');
    } catch (_) {}
    return null;
  }

  Future<Uint8List?> readBinary(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return await f.readAsBytes();
    try {
      final d = await rootBundle.load('assets/maps/$path');
      return d.buffer.asUint8List();
    } catch (_) {}
    try {
      final d = await rootBundle.load('assets_web/maps/$path');
      return d.buffer.asUint8List();
    } catch (_) {}
    return null;
  }

  String toBase64(Uint8List bytes) => base64Encode(bytes);

  Future<bool> checkFileExists(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    return f.exists();
  }
}

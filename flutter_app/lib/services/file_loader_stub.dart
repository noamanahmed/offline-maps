import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart' show MethodChannel, rootBundle;
import 'package:path_provider/path_provider.dart';

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  static const _channel = MethodChannel('offline_maps/assets');
  bool _rawAvailable = false;
  bool _rawChecked = false;

  Directory? _mapDir;

  Future<Directory> _getMapDir() async {
    if (_mapDir != null) return _mapDir!;
    final dir = Directory('${(await getApplicationDocumentsDirectory()).path}/maps');
    if (!await dir.exists()) await dir.create(recursive: true);
    _mapDir = dir;
    return _mapDir!;
  }

  Future<bool> get _hasRawAssets async {
    if (_rawChecked) return _rawAvailable;
    try {
      _rawAvailable = await _channel.invokeMethod<bool>('assetExists', {'path': 'maps'}) ?? false;
    } catch (_) {
      _rawAvailable = false;
    }
    _rawChecked = true;
    return _rawAvailable;
  }

  Future<String?> readText(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return await f.readAsString();

    if (await _hasRawAssets) {
      try {
        final bytes = await _channel.invokeMethod('readAsset', {'path': 'maps/$path'});
        if (bytes is List<int>) return utf8.decode(bytes);
      } catch (_) {}
    }

    try {
      return await rootBundle.loadString('assets_web/$path');
    } catch (_) {}
    return null;
  }

  Future<Uint8List?> readBinary(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return await f.readAsBytes();

    if (await _hasRawAssets) {
      try {
        final result = await _channel.invokeMethod('readAsset', {'path': 'maps/$path'});
        if (result is Uint8List) return result;
        if (result is List<int>) return Uint8List.fromList(result);
      } catch (_) {}
    }

    try {
      final d = await rootBundle.load('assets_web/$path');
      return d.buffer.asUint8List();
    } catch (_) {}
    return null;
  }

  String toBase64(Uint8List bytes) => base64Encode(bytes);

  Future<bool> checkFileExists(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return true;

    if (await _hasRawAssets) {
      try {
        return await _channel.invokeMethod<bool>('assetExists', {'path': 'maps/$path'}) ?? false;
      } catch (_) {}
    }

    try {
      await rootBundle.load('assets_web/$path');
      return true;
    } catch (_) {}
    return false;
  }
}

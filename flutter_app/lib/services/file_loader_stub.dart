import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  Future<String?> readText(String path) async {
    try {
      return await rootBundle.loadString('assets_web/$path');
    } catch (_) {
      return null;
    }
  }

  Future<Uint8List?> readBinary(String path) async {
    try {
      final data = await rootBundle.load('assets_web/$path');
      return data.buffer.asUint8List();
    } catch (_) {
      return null;
    }
  }

  String toBase64(Uint8List bytes) => base64Encode(bytes);
}

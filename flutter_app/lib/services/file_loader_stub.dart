import 'dart:convert';
import 'dart:typed_data';

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  Future<String?> readText(String path) async => null;
  Future<Uint8List?> readBinary(String path) async => null;
  String toBase64(Uint8List bytes) => base64Encode(bytes);
}

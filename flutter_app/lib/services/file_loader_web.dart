import 'dart:html' as html;
import 'dart:typed_data';
import 'dart:convert';

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  Future<String?> readText(String path) async {
    try {
      final resp = await html.HttpRequest.request(path);
      return resp.responseText;
    } catch (_) {
      return null;
    }
  }

  Future<Uint8List?> readBinary(String path) async {
    try {
      final resp = await html.HttpRequest.request(path,
          responseType: 'arraybuffer');
      return Uint8List.view(resp.response as ByteBuffer);
    } catch (_) {
      return null;
    }
  }

  String toBase64(Uint8List bytes) => base64Encode(bytes);

  Future<bool> checkFileExists(String path) async {
    try {
      final resp = await html.HttpRequest.request(path, method: 'HEAD');
      return resp.status == 200;
    } catch (_) {
      return false;
    }
  }
}

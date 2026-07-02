import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart' show MethodChannel, rootBundle;
import 'package:path_provider/path_provider.dart';

class FileLoader {
  FileLoader._();
  static final _i = FileLoader._();
  factory FileLoader() => _i;

  static const _channel = MethodChannel('pakistan_offline_map_explorer/assets');
  bool _loggedAssets = false;

  Directory? _mapDir;

  Future<Directory> _getMapDir() async {
    if (_mapDir != null) return _mapDir!;
    final dir = Directory('${(await getApplicationDocumentsDirectory()).path}/maps');
    if (!await dir.exists()) await dir.create(recursive: true);
    _mapDir = dir;
    return _mapDir!;
  }

  Future<void> dumpAvailableAssets() async {
    if (_loggedAssets) return;
    _loggedAssets = true;
    if (Platform.isLinux) {
      print('[file_loader] Skipping listAssets on Linux desktop');
      return;
    }
    try {
      final files = await _channel.invokeMethod<List<dynamic>>('listAssets', {'path': 'maps'});
      print('[file_loader] === RAW ASSETS DUMP (${files?.length ?? 0} files) ===');
      if (files != null && files.isNotEmpty) {
        for (final f in files.take(20)) print('[file_loader]   $f');
        if (files.length > 20) print('[file_loader]   ... and ${files.length - 20} more');
      } else {
        print('[file_loader]   *** NO FILES FOUND in raw assets ***');
      }
      print('[file_loader] ===============================');
    } catch (e) {
      print('[file_loader] listAssets failed: $e');
    }
  }

  Future<bool> _tryRawExists(String path) async {
    if (Platform.isLinux) {
      return await File('../$path').exists() || await File(path).exists();
    }
    try {
      final ok = await _channel.invokeMethod<bool>('assetExists', {'path': path});
      return ok ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<String?> readText(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) {
      print('[file_loader] Read text from filesystem: $path');
      return await f.readAsString();
    }

    if (Platform.isLinux) {
      final parentFile = File('../$path');
      if (await parentFile.exists()) {
        print('[file_loader] Linux: Read text from parent filesystem: $path');
        return await parentFile.readAsString();
      }
      final localFile = File(path);
      if (await localFile.exists()) {
        print('[file_loader] Linux: Read text from local filesystem: $path');
        return await localFile.readAsString();
      }
      final assetsWebFile = File('assets_web/$path');
      if (await assetsWebFile.exists()) {
        print('[file_loader] Linux: Read text from assets_web: $path');
        return await assetsWebFile.readAsString();
      }
    }

    try {
      final bytes = await _channel.invokeMethod('readAsset', {'path': path});
      if (bytes is List<int>) {
        print('[file_loader] Read text from raw assets: $path, ${bytes.length} bytes');
        return utf8.decode(bytes);
      }
    } catch (e) {
      print('[file_loader] Raw asset readText failed for $path: $e');
    }

    try {
      return await rootBundle.loadString('assets_web/$path');
    } catch (_) {}
    return null;
  }

  Future<Uint8List?> readBinary(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) {
      final bytes = await f.readAsBytes();
      print('[file_loader] Read binary from filesystem: $path, ${bytes.length} bytes');
      return bytes;
    }

    if (Platform.isLinux) {
      final parentFile = File('../$path');
      if (await parentFile.exists()) {
        print('[file_loader] Linux: Read binary from parent filesystem: $path');
        return await parentFile.readAsBytes();
      }
      final localFile = File(path);
      if (await localFile.exists()) {
        print('[file_loader] Linux: Read binary from local filesystem: $path');
        return await localFile.readAsBytes();
      }
    }

    try {
      final result = await _channel.invokeMethod('readAsset', {'path': path});
      if (result is Uint8List) {
        print('[file_loader] Read binary from raw assets: $path, ${result.length} bytes');
        return result;
      }
      if (result is List<int>) {
        print('[file_loader] Read binary from raw assets (List<int>): $path, ${result.length} bytes');
        return Uint8List.fromList(result);
      }
      if (result != null) {
        print('[file_loader] Raw asset readBinary unexpected type for $path: ${result.runtimeType}');
      }
    } catch (e) {
      print('[file_loader] Raw asset readBinary failed for $path: $e');
    }

    try {
      final d = await rootBundle.load('assets_web/$path');
      print('[file_loader] rootBundle loaded: $path, ${d.lengthInBytes} bytes');
      return d.buffer.asUint8List();
    } catch (_) {}
    return null;
  }

  String toBase64(Uint8List bytes) => base64Encode(bytes);

  Future<bool> checkFileExists(String path) async {
    final f = File('${(await _getMapDir()).path}/$path');
    if (await f.exists()) return true;

    if (Platform.isLinux) {
      if (await File('../$path').exists() || await File(path).exists()) {
        return true;
      }
    }

    if (await _tryRawExists(path)) return true;

    try {
      await rootBundle.load('assets_web/$path');
      return true;
    } catch (_) {}
    return false;
  }

  Future<String> getAbsoluteFilePath(String path) async {
    final dir = await _getMapDir();
    final f = File('${dir.path}/$path');
    if (await f.exists()) {
      return f.path;
    }

    if (Platform.isLinux) {
      final parentFile = File('../$path');
      if (await parentFile.exists()) {
        return parentFile.absolute.path;
      }
      final localFile = File(path);
      if (await localFile.exists()) {
        return localFile.absolute.path;
      }
    }

    await f.parent.create(recursive: true);

    try {
      final result = await _channel.invokeMethod('readAsset', {'path': path});
      if (result is Uint8List) {
        await f.writeAsBytes(result);
        print('[file_loader] Copied asset to filesystem: ${f.path}');
        return f.path;
      }
      if (result is List<int>) {
        await f.writeAsBytes(result);
        print('[file_loader] Copied asset (List<int>) to filesystem: ${f.path}');
        return f.path;
      }
    } catch (e) {
      print('[file_loader] Failed to copy raw asset to filesystem: $e');
    }

    try {
      final d = await rootBundle.load('assets_web/$path');
      await f.writeAsBytes(d.buffer.asUint8List(d.offsetInBytes, d.lengthInBytes));
      print('[file_loader] Copied assets_web asset to filesystem: ${f.path}');
      return f.path;
    } catch (e) {
      print('[file_loader] Failed to copy rootBundle asset to filesystem: $e');
    }

    return f.path;
  }
}

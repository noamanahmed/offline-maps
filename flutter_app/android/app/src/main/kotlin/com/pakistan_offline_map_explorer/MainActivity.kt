package com.pakistan_offline_map_explorer

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.util.Log

class MainActivity : FlutterActivity() {
    private val CHANNEL = "pakistan_offline_map_explorer/assets"
    private val TAG = "PakOfflineMaps"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "readAsset" -> {
                    val path = call.argument<String>("path") ?: ""
                    try {
                        val stream = assets.open(path)
                        val bytes = stream.readBytes()
                        stream.close()
                        result.success(bytes)
                    } catch (e: Exception) {
                        Log.e(TAG, "readAsset failed for: $path", e)
                        result.success(null)
                    }
                }
                "assetExists" -> {
                    val path = call.argument<String>("path") ?: ""
                    try {
                        val list = assets.list(path)
                        if (list != null && list.isNotEmpty()) {
                            result.success(true)
                        } else {
                            try { assets.open(path).close(); result.success(true) }
                            catch (_: Exception) { result.success(false) }
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "assetExists failed for: $path", e)
                        result.success(false)
                    }
                }
                "listAssets" -> {
                    val path = call.argument<String>("path") ?: ""
                    try {
                        val files = mutableListOf<String>()
                        fun walk(dir: String) {
                            val list = assets.list(dir) ?: return
                            for (name in list) {
                                val full = if (dir.isEmpty()) name else "$dir/$name"
                                try {
                                    assets.open(full).close()
                                    files.add(full)
                                } catch (_: Exception) {
                                    walk(full)
                                }
                            }
                        }
                        walk(path)
                        Log.i(TAG, "listAssets '$path': ${files.size} files, first: ${files.take(5)}")
                        result.success(files)
                    } catch (e: Exception) {
                        Log.e(TAG, "listAssets failed for: $path", e)
                        result.success(emptyList<String>())
                    }
                }
                else -> result.notImplemented()
            }
        }
    }
}

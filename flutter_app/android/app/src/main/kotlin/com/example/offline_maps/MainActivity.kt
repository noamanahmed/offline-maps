package com.example.offline_maps

import android.content.res.AssetManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "offline_maps/assets"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "readAsset" -> {
                    val path = call.argument<String>("path") ?: ""
                    try {
                        val bytes = assets.open(path).readBytes()
                        result.success(bytes)
                    } catch (e: Exception) {
                        result.success(null)
                    }
                }
                "assetExists" -> {
                    val path = call.argument<String>("path") ?: ""
                    try {
                        assets.open(path).close()
                        result.success(true)
                    } catch (e: Exception) {
                        result.success(false)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }
}

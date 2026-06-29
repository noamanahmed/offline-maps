const webpack = require("@nativescript/webpack");
const path = require("path");
const fs = require("fs");

module.exports = (env) => {
	webpack.init(env);

	const mapsDir = path.resolve(__dirname, "maps");

	// One-shot copy of map data to output — done outside webpack's asset tracking
	// so the WatchStatePlugin doesn't try to IPC-serialize 1,600+ filenames.
	class CopyMapsPlugin {
		apply(compiler) {
			compiler.hooks.beforeCompile.tapAsync("CopyMapsPlugin", (params, callback) => {
				const outputPath = compiler.options.output.path;
				const dest = path.join(outputPath, "maps");
				if (!fs.existsSync(dest)) {
					console.log("[CopyMaps] Copying map data to output directory...");
					fs.cpSync(mapsDir, dest, { recursive: true });
					console.log("[CopyMaps] Done.");
				} else {
					console.log("[CopyMaps] Map data already present, skipping copy.");
				}
				callback();
			});
		}
	};

	const config = webpack.resolveConfig();

	config.plugins.push(new CopyMapsPlugin());

	// Exclude maps directory from watch/hot-reload
	config.watchOptions = config.watchOptions || {};
	config.watchOptions.ignored = [
		...(Array.isArray(config.watchOptions.ignored)
			? config.watchOptions.ignored
			: config.watchOptions.ignored
			? [config.watchOptions.ignored]
			: []),
		mapsDir
	];

	return config;
};

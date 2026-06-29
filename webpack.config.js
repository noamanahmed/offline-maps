const webpack = require("@nativescript/webpack");
const path = require("path");

module.exports = (env) => {
	webpack.init(env);

	// Copy city/village directories but exclude the large country-level .osm.pbf files
	webpack.Utils.addCopyRule({
		from: "countries/*/*/{cities,villages}/**/*",
		to: "maps",
		context: "maps"
	});

	const config = webpack.resolveConfig();

	// Ignore changes in the maps directory for hot reloading
	config.watchOptions = config.watchOptions || {};
	config.watchOptions.ignored = [
		...(Array.isArray(config.watchOptions.ignored)
			? config.watchOptions.ignored
			: config.watchOptions.ignored
			? [config.watchOptions.ignored]
			: []),
		path.resolve(__dirname, "maps")
	];

	return config;
};

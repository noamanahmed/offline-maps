const webpack = require("@nativescript/webpack");
const path = require("path");

module.exports = (env) => {
	webpack.init(env);

	// Bundle individual map data files for direct XHR loading in webview
	webpack.Utils.addCopyRule({
		from: "**/*",
		to: "maps/",
		context: "src/maps"
	});

	const config = webpack.resolveConfig();

	// Exclude maps directories from watch/hot-reload
	config.watchOptions = config.watchOptions || {};
	config.watchOptions.ignored = [
		...(Array.isArray(config.watchOptions.ignored)
			? config.watchOptions.ignored
			: config.watchOptions.ignored
			? [config.watchOptions.ignored]
			: []),
		path.resolve(__dirname, "src", "maps"),
		path.resolve(__dirname, "maps")
	];

	return config;
};

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	"mode": "development",
	entry: {
		main: "./src/main.ts",
	},
	output: {
		publicPath: "/",
		path: path.resolve(__dirname, './build'),
		filename: "[name]-bundle.js"
	},
	resolve: {
		extensions: [".ts"],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	},
	plugins: [new HtmlWebpackPlugin({
		template: "./src/index.html",
		inlineSource: ".(js|css)$",
		"inject": "body"
	}), new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)],
	//optimization: {
	//	minimize: true,
	//	minimizer: [new TerserPlugin({
	//		terserOptions: {
	//			mangle: {
	//				properties: {
	//					keep_quoted: true,
	//					reserved: ["Application", "Container", "Graphics", "view", "stage", "on", "off", "drawPolygon", "beginFill", "endFill", "hitArea", "eventMode", "eventFeatures", "globalMove", "wheel", "addChild", "ticker"]
	//				}
	//			}
	//		}
	//	})],
	//},
	"externals": {
		"pixi.js": "PIXI"
	}
};
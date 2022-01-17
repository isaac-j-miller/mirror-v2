const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

console.log(
  `API Key: ${
    process.env.WEATHER_API_KEY
      ? process.env.WEATHER_API_KEY.replace(/./g, "*")
      : undefined
  }`
);
module.exports = {
  entry: "./src/index.tsx",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  target: "web",

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    chunkFilename: "[id].js",
    filename: "[hash].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    allowedHosts: "all",
    liveReload: true,
    hot: true,
    static: {
      directory: path.join(__dirname, "dist"),
      watch: false,
    },
    compress: true,
    host: "127.0.0.1",
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Magic Mirror V2",
      filename: "index.html",
      inject: "head",
    }),
    new webpack.DefinePlugin({
      "process.env.WEATHER_API_KEY": JSON.stringify(
        process.env.WEATHER_API_KEY
      ),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public/icons",
          to: "icons",
        },
      ],
    }),
  ],
};

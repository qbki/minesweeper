const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

function root(...args) {
  return path.resolve(__dirname, ...args);
}

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: root("dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      }
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(['src/index.html'])
  ],
};

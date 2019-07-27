const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

function root(...args) {
  return path.resolve(__dirname, ...args);
}

module.exports = {
  entry: './src/index.ts',
  output: {
    path: root('dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: root('assets'),
  },
  mode: 'development',
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/index.html', to: 'index.html', toType: 'file' },
      { from: 'assets/images', to: 'images', toType: 'dir' },
    ]),
  ],
};

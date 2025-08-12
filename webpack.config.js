const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    filename: 'mqtt-react.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'mqtt-react',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: {
    react: 'react',
  },
  plugins: [],
  optimization: {
    minimize: process.env.NODE_ENV !== 'development',
  },
};

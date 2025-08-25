const path = require('path');
const webpack = require('webpack');

let config = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    filename: 'mqtt-react.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'mqtt-react',
      type: 'umd',
      // export: 'default',
    },
    globalObject: 'this',
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib")
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  externals: {
    react: 'react',
  },
  plugins: [],
};

if (config.mode === 'production') {
  config.optimization = {
    minimize: true,
  };
}

module.exports = config;
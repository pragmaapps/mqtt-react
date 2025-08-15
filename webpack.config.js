const path = require('path');
const webpack = require('webpack');

let config = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    filename: 'mqtt-react.js',
    path: path.resolve(__dirname, 'dist'),
    // Yahan libraryTarget ko `umd` ke bajaye `commonjs2` aur `umd` dono ke liye configure kiya gaya hai
    // isse ye `require` aur `import` dono me kaam karega.
    library: {
      name: 'mqtt-react',
      type: 'umd',
      // export: 'default', // Default export ko ensure karne ke liye
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
            presets: ['@babel/preset-env', '@babel/preset-react'], // React support ke liye
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

// UglifyJsPlugin ab purana ho chuka hai. Webpack 4+ mein `optimization.minimize` ka use hota hai.
// To ab iski jagah ye code use hoga:
if (config.mode === 'production') {
  config.optimization = {
    minimize: true,
  };
}

module.exports = config;
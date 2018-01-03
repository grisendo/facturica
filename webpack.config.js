const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './js/app.jsx',
  output: {path: __dirname, filename: 'js/bundle.js' },

  resolve: {
    extensions: [".js", ".jsx", ".json"]
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
};

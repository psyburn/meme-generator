'use strict'; // eslint-disable-line strict

// Webpack and node related dependencies
const path = require('path');
const webpack = require('webpack');

// Plugins and modules
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const DEV = process.env.NODE_ENV === 'development';
let styleLoader = 'css?minimize!postcss!sass';

if (DEV) {
  styleLoader = `style!${styleLoader}`;
} else {
  styleLoader = ExtractTextPlugin.extract(styleLoader);
}

const config = {
  plugins: [
    new ExtractTextPlugin('style.min.css'),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '..', 'app/index.html')
    })
  ],

  target: 'web', // https://webpack.github.io/docs/configuration.html#target

  entry: {
    app: [
      'babel-polyfill',
      path.join(__dirname, '..', 'app/script/application.js')
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'script.min.js',
    publicPath: './'
  },

  resolve: {
    root: [
      path.join(__dirname, '..', 'app/script'),
      path.join(__dirname, '..', 'app/style'),
      path.join(__dirname, '..', 'app/assets')
    ],
    modulesDirectories: [
      'node_modules'
    ]
  },

  postcss: [autoprefixer],

  sassLoader: {
    includePaths: [
      path.resolve(__dirname, '..', 'app/assets')
    ]
  },

  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|vendor)/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'stage-3']
      }
    }, {
      test: /\.(scss|css)$/,
      loader: styleLoader
    }, {
      test: /\.html$/,
      loader: 'html'
    }, {
      test: /manifest.json$/,
      loader: 'file-loader?name=manifest.json!web-app-manifest-loader'
    }, {
      test: /\.(png|svg|eot|ttf|woff|jpg)$/,
      loader: 'file-loader'
    }]
  }
};

if (DEV) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.entry.app.push('webpack/hot/dev-server');
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
  config.plugins.push(new SWPrecacheWebpackPlugin({
    cacheId: 'over-engineereed-meme-generator',
    filename: 'sw.js',
    maximumFileSizeToCacheInBytes: 4194304
  }));
}

module.exports = config;

'use strict';

const VueLoaderPlugin      = require('vue-loader/lib/plugin');
const HtmlPlugin           = require('html-webpack-plugin');
const CopyWebpackPlugin    = require('copy-webpack-plugin')
const helpers              = require('./helpers');
const isDev                = process.env.NODE_ENV !== 'production';
var MiniCSSExtractPlugin
if (!isDev) { // since this plugin breaks dev build if required but not used
  MiniCSSExtractPlugin = require('mini-css-extract-plugin');
}

const webpackConfig = {
  entry: {
    polyfill: '@babel/polyfill',
    main: helpers.root('src', 'main'),
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias: {
      'vue$': isDev ? 'vue/dist/vue.runtime.js' : 'vue/dist/vue.runtime.min.js',
      '@': helpers.root('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [ helpers.root('src') ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ helpers.root('src') ]
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: isDev } },
        ]
      },
      {
        test: /\.scss$/,
        use: [
          isDev ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: isDev } },
          { loader: 'sass-loader', options: { sourceMap: isDev } }
        ]
      },
      {
        test: /\.sass$/,
        use: [
          isDev ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: isDev } },
          { loader: 'sass-loader', options: { sourceMap: isDev } }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader?limit=100000',
        options: {
          esModule: false,
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlPlugin({ template: 'index.html', filename: 'index.html', chunksSortMode: 'dependency' }),
    new HtmlPlugin({ template: 'embed.html', filename: 'embed.html', chunksSortMode: 'dependency' }),
    new HtmlPlugin({ template: 'test.html', filename: 'test.html', chunksSortMode: 'dependency' }),
    new CopyWebpackPlugin([{from: 'static', to: 'static'}])
  ]
};

module.exports = webpackConfig;
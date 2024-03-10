const { VueLoaderPlugin } = require('vue-loader');
const HtmlPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

// Assuming `helpers.root` is a utility function you've defined. Ensure its compatibility.
const helpers = require('./helpers')
const isDev = process.env.NODE_ENV !== 'production';

const webpackConfig = {
  entry: {
    main: [helpers.root('src', 'main.js')],
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: isDev ? 'vue/dist/vue.runtime.js' : 'vue/dist/vue.runtime.min.js',
      '@': helpers.root('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.m?js$/,
        loader: 'babel-loader',
        include: [/node_modules\/keycloak-js/, /src/],
      },
      {
        test: /\.s?css$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg|md)(\?[a-z0-9=.]+)?$/,
        type: 'asset', // Use Webpack 5 asset modules instead of 'url-loader'
        parser: {
          dataUrlCondition: {
            maxSize: 100000, // 100kb
          },
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlPlugin({ template: 'index.html', filename: 'index.html', chunksSortMode: 'auto' }),
    new HtmlPlugin({ template: 'embed.html', filename: 'embed.html', chunksSortMode: 'auto' }),
    new HtmlPlugin({ template: 'test.html', filename: 'test.html', chunksSortMode: 'auto' }),
    new CopyWebpackPlugin({ patterns: [{ from: 'static', to: 'static' }] }),
  ],
};

module.exports = webpackConfig;
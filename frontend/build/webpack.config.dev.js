'use strict';

const webpack = require('webpack');
const {merge} = require('webpack-merge');
const helpers = require('./helpers');
const commonConfig = require('./webpack.config.common');
const environment = { NODE_ENV: 'development' }
const path = require('path')

const webpackConfig = merge(commonConfig, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    output: {
        path: helpers.root('dist'),
        publicPath: '/',
        filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[id].chunk.js'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new webpack.EnvironmentPlugin(environment),
    ],
    devServer: {
        compress: true,
        historyApiFallback: true,
        open: true,
        client: {
          overlay: true, // Moved into the client object
        },
        host: 'localhost',
        port: 8080,
        allowedHosts: 'all', // Use allowedHosts: 'all' to replace disableHostCheck
        static: { // For serving static files, specify directories under static
          directory: path.join(__dirname, 'public'), // Example: path to your static files directory
        },
        devMiddleware: {
          stats: 'normal', // Moved into devMiddleware
        },
    }
});

module.exports = webpackConfig;
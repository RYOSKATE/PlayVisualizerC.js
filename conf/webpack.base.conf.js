const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FailPlugin = require('webpack-fail-plugin');

const rules = require('./webpack.rules');

module.exports = {
    performance: { hints: false },
    module: {
        rules
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        FailPlugin,
        new HtmlWebpackPlugin({
            template: conf.path.page('index.html')
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                resolve: {},
                ts: {
                    configFile: 'tsconfig.json'
                },
                tslint: {
                    configuration: require('../tslint.json')
                }
            },
            debug: true
        })
    ],
    node: {
        fs: "empty"
    },
    resolve: {
        extensions: [
            '.webpack.js',
            '.web.js',
            '.js',
            '.ts'
        ],
        alias: {
            src: path.resolve(__dirname, '../src'),
            gen: path.resolve(__dirname, '../generated'),
        }
    }
};

const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FailPlugin = require('webpack-fail-plugin');

const rules = require('./webpack.rules');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?quiet=true',
    `./${conf.path.src('index')}`
  ],
  output: {
    path: path.join(process.cwd(), conf.paths.tmp),
    filename: 'index.js'
  },
  mode: 'development',
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
    new webpack.HotModuleReplacementPlugin(),
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
  },
  devtool: 'source-map'
};

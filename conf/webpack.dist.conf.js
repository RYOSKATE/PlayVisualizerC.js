const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FailPlugin = require('webpack-fail-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const rules = require('./webpack.rules');

module.exports = {
  entry: [
    `./${conf.path.src('index')}`
  ],
  output: {
    path: path.join(process.cwd(), conf.paths.dist),
    filename: 'index.js'
  },
  mode: 'production',
  module: {
    rules
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          output: { comments: false },
          compress: {
            unused: true,
            dead_code: true,
            warnings: false,
            drop_console: true
          } // eslint-disable-line camelcase
        },
      }),
    ],
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
      }
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
      generated: path.resolve(__dirname, '../generated'),
    }
  }
};

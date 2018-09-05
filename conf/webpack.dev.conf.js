const webpack = require('webpack');
const conf = require('./gulp.conf');
const path = require('path');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf.js');

module.exports = merge(baseConfig, {
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client?quiet=true',
  ],
  output: {
    path: path.join(process.cwd(), conf.paths.tmp),
  },
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],
  devtool: 'source-map'
});

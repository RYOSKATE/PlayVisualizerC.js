const conf = require('./gulp.conf');
const path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf.js');

module.exports = merge(baseConfig, {
  output: {
    path: path.join(process.cwd(), conf.paths.dist),
  },
  mode: 'production',
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
  }
});

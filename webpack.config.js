const webpack = require('webpack');
// optimization.minimizerを上書きするために必要なプラグイン
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env, argv) => {
  const IS_DEVELOPMENT = argv.mode === 'development';
  return {
    entry: {
      index: './src/index.js',
    },
    output: {
      path: require("path").resolve("./docs/js/"),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    target: "node",
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'cache-loader' },
          {
            loader: 'thread-loader',
            options: {
              workers: require('os').cpus().length - 1,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            }
          },
        ]
      }
      ]
    },
    devtool: IS_DEVELOPMENT ? 'inline-source-map' : 'none',
    optimization: {
      // developmentモードでビルドした場合
      // minimizer: [] となるため、consoleは残されたファイルが出力される
      // puroductionモードでビルドした場合
      // minimizer: [ new UglifyJSPlugin({... となるため、consoleは削除したファイルが出力される
      minimizer: IS_DEVELOPMENT
        ? []
        : [
          new UglifyJSPlugin({
            uglifyOptions: {
              compress: {
                drop_console: true
              }
            }
          })
        ]
    }
  }
}

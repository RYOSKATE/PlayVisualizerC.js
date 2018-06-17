const path = require('path');
const threadLoader = {
  loader: 'thread-loader',
  options: {
    workers: require('os').cpus().length - 1,
  },
};

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
  }
};

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: require("path").resolve("./docs/"),
    filename: '[name].js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
  target: "node",
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      use: [
        { loader: 'cache-loader' },
        threadLoader,
        babelLoader
      ]
    }
    ]
  },
  devtool: 'inline-source-map'
}

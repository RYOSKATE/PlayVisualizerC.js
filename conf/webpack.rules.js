const threadLoader = {
    loader: 'thread-loader',
    options: {
        workers: require('os').cpus().length + 1,
    },
};

const babelLoader = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: true,
        compact: false
    }
};

const tsLoader = {
    loader: 'ts-loader',
    options: {
        happyPackMode: true
    }
};

module.exports = [
    {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
            'cache-loader',
            threadLoader,
            babelLoader,
            tsLoader
        ]
    },
    {
        test: /\.js$/,
        use: [
            'cache-loader',
            threadLoader,
            babelLoader
        ],
        exclude: /(node_modules(?!(\/|\\)antlr4ts)|scripts|libs)/,
        enforce: 'post'
    },
];
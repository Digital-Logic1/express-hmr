const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.common');
//const StartServerPlugin = require('start-server-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = merge.strategy({
    output: "replace"
})(common, {
//    entry: ['webpack/hot/poll?1000'],
    // output: {
    //     path: path.resolve(__dirname, './.hmr'),
    //     filename: 'server.js',
    //     publicPath: '/'
    // },
    mode: "development",
    devtool: 'sourcemap',
    watch: true,
    plugins: [
       // new StartServerPlugin('server.js'),
        new webpack.NamedModulesPlugin(),
        //new webpack.HotModuleReplacementPlugin(),
        new NodemonPlugin({
            watch: path.resolve('./build'),
            ignore: ['*.js.map'],
            verbose: true,
        }),
        new Dotenv({
            defaults: true
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify('development'),
            "process.env.DB_CONNECT_RETRY": JSON.stringify(false),
            "process.env.PORT": JSON.stringify(4000)
        })
    ]
});
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackCriticalCSSPlugin = require('../lib/index');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist-after'),
        filename: '[name].[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
        new WebpackCriticalCSSPlugin({
            base: path.resolve(__dirname, 'dist-after'),
            src: 'index.html',
            dest: 'index.html',
            inline: true,
            extract: true,
            width: 1300,
            height: 900,
            target: {
                css: 'critical.css',
                uncritical: 'uncritical.css'
            },
            ignore: {
                atrule: ['@font-face'],
                rule: [/some-unused-class/]
            },
            penthouse: {
                blockJSRequests: false,
                timeout: 30000
            }
        })
    ]
}; 
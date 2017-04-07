var path = require("path");
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const shortBuildDescription = 'isEqual and deepClone';

const tsconfig = path.resolve(__dirname, './tsconfig.json');

module.exports = {
    entry: {
        app: ['./src/index.ts'],
        vendor: ['./vendor.ts']
    },
    devtool: 'inline-source-map',
    devServer: {
        inline: true,
        port: 333,
        colors: true,
        displayErrorDetails: true,
        historyApiFallback: true
    },
    output: {
        libraryTarget: 'var',
        path: path.resolve(__dirname, `build/${shortBuildDescription}`),
        filename: '[name].js',
        chunkFilename: '[id].js'
    },
    resolve: {
        modules: [
            'src',
            'node_modules'
        ],
        enforceExtension: false,
        enforceModuleExtension: false,
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: tsconfig
                        }
                    },
                    'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html',
                options: {
                    minimize: false,
                    removeAttributeQuotes: false,
                    caseSensitive: true,
                    customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
                    customAttrAssign: [/\)?\]?=/]
                }
            },
            {
                test: /response\.(?:\w+)\.json$/,
                loader: 'file'
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'app'].reverse()
        }),
        new HtmlWebpackPlugin({
            title: 'Angular 2 Test',
            hash: true,
            // faviconhash: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            // favicon: './favicon.ico',
            template: './index.ejs',
            inject: 'body',
            chunksSortMode: (chunk1, chunk2) => {
                let chunkOrder = ['commons', 'polyfills', 'vendor', 'app'],
                    name1 = chunk1.names[0],
                    name2 = chunk2.names[0],
                    idx1 = chunkOrder.indexOf(name1),
                    idx2 = chunkOrder.indexOf(name2);
                return idx1 - idx2;
            }
        }),
        new webpack.DefinePlugin({
            __BUILD_DESCRIPTION__:  JSON.stringify(shortBuildDescription)
        }),
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname // location of your src
        ),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
};
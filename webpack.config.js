
// great tutorial: https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460#.trt9jq3ie

var webpack = require( 'webpack' );

var path = require( 'path' );

// ExtendedDefinePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
// added from npm

var ExtendedDefinePlugin = require('extended-define-webpack-plugin');

module.exports = {

    entry: [ './src/js/app.js', './src/es6/app.es6' ],

    output: {

        path: './dist/js',

        filename: 'webvr-mini.js'

    },

    module: {

        preLoaders: [

            {
                test: /\.js$/,

                exclude: /node_modules/,

                loader: 'jshint-loader'

            }

        ],

        loaders: [

            {

                test: /\.es6$/,

                exclude: /node_modules/,

                loader: 'babel-loader',

                query: {

                    cacheDirectory: true,

                    presets: ['react', 'es2015']

                }

            }

        ]

    },

    resolve: {

        extensions: ['', '.js', '.es6', '.scss']

    },

    plugins: [

        new ExtendedDefinePlugin({

            __VERSION__: JSON.stringify( '0.0.1' ),

            __DEV__: JSON.stringify( JSON.parse( process.env.BUILD_DEV || 'true' ) ),

            __RELEASE__: JSON.stringify( JSON.parse( process.env.BUILD_RELEASE || 'false' ) )

        }),

        // conditionally load polyfills from npm

        new webpack.ProvidePlugin({
            Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
            fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ],

    watch: true

};
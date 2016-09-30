
// great tutorial: https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460#.trt9jq3ie

var webpack = require( 'webpack' );

/* 
 * if there are problems in windows, try
 * http://stackoverflow.com/questions/37552861/webpack-dev-server-not-updating-file-which-is-out-of-context
 * webpack-dev-server --watch-poll
 */

var CopyWebpackPlugin = require( 'copy-webpack-plugin' );

var path = require( 'path' );

// ExtendedDefinePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
// added from npm

var ExtendedDefinePlugin = require( 'extended-define-webpack-plugin' );

module.exports = {

    entry: [ './src/js/app.js', './src/es6/app.es6' ],

    output: {

        path: './dist/js',

        filename: 'webvr-mini.js'

    },

    devServer: {
        // This is required for webpack-dev-server. The path should  
        // be an absolute path to your build destination. 
        outputPath: path.join(__dirname, 'build')
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

        ],



    },

    resolve: {

        extensions: ['', '.js', '.jsx', '.es6', '.scss', '.html']

    },

    plugins: [

        // Define DEV and RELEASE variables from command-line (in package.json)

        new ExtendedDefinePlugin({

            __VERSION__: JSON.stringify( '0.0.1' ),

            __DEV__: JSON.stringify( JSON.parse( process.env.BUILD_DEV || 'true' ) ),

            __RELEASE__: JSON.stringify( JSON.parse( process.env.BUILD_RELEASE || 'false' ) )

        }),

        new CopyWebpackPlugin([

            { 
                from: './src/html/index.html', to: '../index.html'
            }

        ])


    ],

    watch: true

};
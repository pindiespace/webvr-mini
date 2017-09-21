
// great tutorial: https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460#.trt9jq3ie
// NOTE: webpack 2

var webpack = require( 'webpack' );

var NormalModuleReplace = require( 'webpack-module-replacement' );

var WebpackStrip = require( 'strip-loader' );

/* 
 * if there are problems with updates in windows, try
 * http://stackoverflow.com/questions/37552861/webpack-dev-server-not-updating-file-which-is-out-of-context
 * webpack-dev-server --watch-poll
 */

var CopyWebpackPlugin = require( 'copy-webpack-plugin' );

var path = require( 'path' );

// ExtendedDefinePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
// added from npm

var ExtendedDefinePlugin = require( 'extended-define-webpack-plugin' );

module.exports = {

    entry: [ __dirname + '/src/es6/app.es6' ],

    output: {

        path: path.resolve( __dirname, 'dist/js' ),

        filename: 'webvr-mini.js'

    },

    module: {

        rules: [

            { 

                test: [ /(\.js?$|\.es6?$)/ ],

                exclude: /(node_modules)/,

                loader: WebpackStrip.loader( 'debug', 'console.log', 'console.warn' )

            },

            {

                //test: /\.es6?$/,
                test: [ /(\.js?$|\.es6?$)/ ],

                exclude: /(node_modules)/,

                use: [{

                    loader: 'babel-loader',

                    options: { presets: ['es2015'] }

                }]

            }

        ],

    },

    resolve: {

        extensions: ['*', '.js', '.jsx', '.es6', '.scss', '.html']

    },

    plugins: [

        new webpack.optimize.AggressiveMergingPlugin({minSizeReduce: 1.0}),
        new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
        new webpack.SourceMapDevToolPlugin({ filename: 'webvr-mini.js.map' }),
        //new webpack.optimize.OccurenceOrderPlugin(),
        //new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false, drop_console: true },
            comments: false,
            sourceMapUrl: '/dist/js/webvr-mini.js.map',
            sourceMap: true,
            mangle: true,
            minimize: true
        }),

        // Define DEV and RELEASE variables from command-line (in package.json)

        new ExtendedDefinePlugin( {

            __VERSION__: JSON.stringify( '0.0.1' ),

            __DEV__: JSON.stringify( JSON.parse( process.env.BUILD_DEV || 'true' ) ),

            __RELEASE__: JSON.stringify( JSON.parse( process.env.BUILD_RELEASE || 'false' ) )

        } ),

        /** 
         * WebPack just builds the main app JavaScript library.
         * In more complex workflows, you would have gulp or grunt fire webpack. Here, a 
         * WebPack plugin copies a few minimal assets to the /dist folder
         */

        new CopyWebpackPlugin( [

            {

                from: './src/html/index.html', to: '../index.html'

            }

        ] )

    ],

    watch: true

};
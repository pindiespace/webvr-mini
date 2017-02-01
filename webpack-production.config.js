var WebpackStripLoader = require( 'strip-loader' );

var devConfig = require('./webpack.config.js');

// remove console.log statements from production

var stripLoaderSettings = {

        test: [ /(\.js$|\.es6$)/ ],

        exclude: /node_modules/,

        loader: WebpackStripLoader.loader( 'console.log', 'console.error', 'console.warn', 'debugger' )

}

devConfig.module.loaders.push( stripLoaderSettings );

module.exports = devConfig;

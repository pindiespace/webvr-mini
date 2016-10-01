var WebpackStripLoader = require( 'strip-loader' );

var devConfig = require('./webpack.config.js');

// remove console.log statements from production

var stripLoader = {

        test: [ /\.js$/, /\.es6$/ ],

        exclude: /node_modules/,

        loader: WebpackStripLoader.loader( 'console.log ')

}

devConfig.module.loaders.push( stripLoader );

module.exports = devConfig;
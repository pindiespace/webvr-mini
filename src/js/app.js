/*
 * app.js
 * main entry point for this application.
 */

// DEV ENVIRONMENT

var env = process.env.WEBPACK_ENV;

/* 
 * these variables are defined by webpack inputs in package.json, 
 * and processed to __DEV__ and __RELEASE__
 * "build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p -p",
 * "dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",
 */

if ( __DEV__ === 'true' ) {

    console.warn('in development mode...');

}

if ( __RELEASE__ === 'true' ) {

    console.warn('in release mode');

}

console.log( 'in app.js' );

/* 
 * DEBUGGING OPTIONS
 */

if ( __DEV__ === 'true' ) {

    // Webpack parses the inside of require.ensure at build time to know that intl
    // should be bundled separately. You could get the same effect by passing
    // ['intl'] as the first argument.

    //require.ensure( [], function () {

        /* 
         * Ensure only makes sure the module has been downloaded and parsed.
         * Now we actually need to run it to install the polyfill.
         */

        // require kronos webgl debug from node_modules

        require( 'webgl-debug' );

        // our own output ui

        require( './webgl-report.js' );

        // Carry on
        //run();

    //} );

} else {

    // Polyfill wasn't needed, carry on
    // run();

}

// POLYFILLS
// Check if polyfill required

if (!window.Intl) {

    // Webpack parses the inside of require.ensure at build time to know that intl
    // should be bundled separately. You could get the same effect by passing
    // ['intl'] as the first argument.

    require.ensure( [], function () {

        /* 
         * Ensure only makes sure the module has been downloaded and parsed.
         * Now we actually need to run it to install the polyfill.
         */

        //require('intl');

        // Carry on
        //run();

    } );

} else {

    // Polyfill wasn't needed, carry on
    // run();

}
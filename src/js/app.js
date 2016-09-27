/*
 * app.js
 * main entry point for this application. Uses 
 * ES5 syntax (es6 will be transpiled). Central 
 * point for including both ES5 and ES6 libraries.
 */

// DEV ENVIRONMENT

var env = process.env.WEBPACK_ENV;

// REQUIRE ALL .es6 files

var vrmini = require( '../es6/app.es6' );

console.log("VR:" + vrmini);

for (var i in vrmini ) {

    console.log( i + ":" + vrmini[i] );
}

/* 
 * these variables are defined by webpack inputs in package.json, 
 * and processed to __DEV__ and __RELEASE__
 * "build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p -p",
 * "dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",
 */


console.log( 'in app.js' );

/* 
 * DEBUGGING OPTIONS FOR MAIN PROGRAM.
 */

if ( __DEV__ === 'true' ) {

    console.warn('app.js: in development mode...');

} else if ( __RELEASE__ === 'true' ) {

    console.warn('in release mode');

}

// POLYFILLS LOADED IN WEBPACK.CONFIG

// ADD REFERENCE TO WINDOW OBJECT

window.vrmini = vrmini;

console.log("Window.vrmini:" + vrmini );

// CODE



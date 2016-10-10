/*
 * app.js
 * main entry point for this application. Uses 
 * ES5 syntax (es6 will be transpiled). Central 
 * point for including both ES5 and ES6 libraries.
 */
console.log( 'in app.js' );

// DEV ENVIRONMENT.

var env = process.env.WEBPACK_ENV;

// REQUIRE ALL .es6 files.

var vrmini = require( '../es6/app.es6' );

// Check ES6 module structure.

for (var i in vrmini ) {

    console.log( i + ":" + vrmini[i] );
}

/* 
 * these variables are defined by webpack inputs in package.json, 
 * and processed to __DEV__ and __RELEASE__ here.
 * "build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p -p",
 * "dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",
 */

if ( __DEV__ === 'true' ) {

    console.warn('app.js: in development mode...');

} else if ( __RELEASE__ === 'true' ) {

    console.warn('in release mode');

}

// EXPOSE IN BROWSER WINDOW OBJECT

window.vrmini = vrmini;

console.log("Window.vrmini:" + vrmini );




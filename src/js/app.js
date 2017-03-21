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

    // Done in app.es6
    ///////////////////////////vrmini.world.init();

// Check ES6 module structure.

for (var i in vrmini ) {

    console.log( i + ":" + vrmini[i] );

}

/* 
 * these variables are defined by webpack inputs in package.json.
 * "build": "cross-env __RELEASE__=true __DEV__=false webpack --config webpack-production.config.js -p -p",
 * "dev": "cross-env __RELEASE__=false __DEV__=true webpack",
 */

if ( __DEV__ === 'true' ) {

    console.warn('app.js: in development mode...');

} else if ( __RELEASE__ === 'true' ) {

    console.warn('in release mode');

}

// EXPOSE IN BROWSER WINDOW OBJECT

window.vrmini = vrmini;

console.log("Window.vrmini:" + vrmini );




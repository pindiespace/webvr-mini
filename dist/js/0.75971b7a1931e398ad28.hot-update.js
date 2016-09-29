webpackHotUpdate(0,[
/* 0 */,
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	 * app.js
	 * main entry point for this application. Uses 
	 * ES5 syntax (es6 will be transpiled). Central 
	 * point for including both ES5 and ES6 libraries.
	 */

	console.log( 'in app.js' );

	// DEV ENVIRONMENT.

	var env = process.env.WEBPACK_ENV;

	// REQUIRE ALL .es6 files

	var vrmini = __webpack_require__( 3 );

	for (var i in vrmini ) {

	    console.log( i + ":" + vrmini[i] );
	}

	/* 
	 * these variables are defined by webpack inputs in package.json, 
	 * and processed to __DEV__ and __RELEASE__
	 * "build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p -p",
	 * "dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",
	 */

	if ( true ) {

	    console.warn('app.js: in development mode...');

	} else if ( __RELEASE__ === 'true' ) {

	    console.warn('in release mode');

	}

	// POLYFILLS LOADED IN WEBPACK.CONFIG

	// ADD REFERENCE TO WINDOW OBJECT

	window.vrmini = vrmini;

	console.log("Window.vrmini:" + vrmini );

	// CODE



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }
])
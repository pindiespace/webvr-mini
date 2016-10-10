/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

console.log( 'in es6' ); 

// DEV ENVIRONMENT

var env = process.env.WEBPACK_ENV;

// REQUIRE ALL POLYFILLS

// WebGL math library.

var glMatrix = require( 'gl-matrix' );

if ( ! glMatrix ) {

    console.error( 'gl-matrix could\'nt be loaded...' );

} else {

    console.log( 'loaded gl-matrix' );

}

// Import WebVR-Mini libraries.

import Util from  './util';

import WebGL from './webgl';

import Loader from './load-pool';

import LoadTexture from './load-texture';

import LoadModel from './load-model';

import LoadAudio from './load-audio';

import LoadVideo from './load-video';

import WebVR from './webvr';

import Prim from './prim';

// Import the world (variable).

import World from './world';

// Init Util first to create shortcuts.

let util = new Util();

// If we are in dev mode, load any special libraries.

let configGL = { init: true, glMatrix: glMatrix, util: util };

if ( __DEV__ === 'true' ) {

    console.log( 'app.es6: in development mode' );

    // require kronos webgl debug from node_modules
    // https://github.com/vorg/webgl-debug

    configGL.debug = require( 'webgl-debug' );

    window.debug = configGL.debug;

    if( configGL.debug ) {

        console.log( 'Loading webgl-debug' );

    } else {

        console.log( 'Error loading webgl-debug' );

    }

} else if ( __RELEASE__ === 'true' ) {

    // Code only added to release.

}

// Create our library.

let webgl = new WebGL( configGL );

// Common initialization.

let config = { init: true, util: util, webgl: webgl };

let loadModel = new LoadModel( config );

let loadTexture = new LoadTexture( config );

let loadAudio = new LoadAudio( config );

let loadVideo = new LoadVideo( config );

let prim = new Prim ( config );

let webvr = new WebVR( config );

// Create the world.

let world = null;

window.addEventListener( 'DOMContentLoaded', function () {

    console.log( 'loading the world...' );

    world = new World( webgl, prim );

    world.init();

}, false );

// Export our classes to app.js.

export { util, webgl, loadModel, loadTexture, loadAudio, loadVideo, prim, webvr, world };

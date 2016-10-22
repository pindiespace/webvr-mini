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

// Import WebVR-Mini libraries. Note: if you don't use super() imports will fail!

import Util from  './util';

import WebGL from './webgl';

import WebVR from './webvr';

//import Loader from './load-pool';

import LoadTexture from './load-texture';

import LoadModel from './load-model';

import LoadAudio from './load-audio';

import LoadVideo from './load-video';

import LoadFont from './load-font';

// import Shader from './Shader';

import ShaderTexture from './shader-texture';

import ShaderColor from './shader-color';

import ShaderDirlightTexture from './shader-dirlight-texture';

import ShaderWater from './shader-water';

import ShaderMetal from './shader-metal';

// Collects the shaders in one place.

import Renderer from './renderer';

// All objects.

import Prim from './prim';

// Import the world (variable object, changes with each VR world).

import World from './world';

// Init Util first to create shortcuts.

let util = new Util();

// If we are in dev mode, load any special libraries.

let webgl = null;

if ( __DEV__ === 'true' ) {

    console.log( 'app.es6: in development mode' );

    // require kronos webgl debug from node_modules
    // https://github.com/vorg/webgl-debug

    let debug = require( 'webgl-debug' );

    webgl = new WebGL( false, glMatrix, util, debug );


    if( debug ) {

        console.log( 'Loading webgl-debug' );

    } else {

        console.log( 'Error loading webgl-debug' );

    }

} else if ( __RELEASE__ === 'true' ) {

    // Code only added to release.

    webgl = new WebGL( false, glMatrix, util );

}

// WebVR needs WebGL.

let webvr = new WebVR( false, util, glMatrix, webgl );

// The Prim object needs Loaders.

let loadModel = new LoadModel( true, util, glMatrix, webgl );

let loadTexture = new LoadTexture( true, util, glMatrix, webgl );

let loadAudio = new LoadAudio( true, util, glMatrix, webgl );

let loadVideo = new LoadVideo( true, util, glMatrix, webgl );

let loadFont = new LoadFont( true, util, glMatrix, webgl );

let prim = new Prim ( true, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo );

let shaderTexture = new ShaderTexture ( true, util, glMatrix, webgl, prim );

let shaderColor = new ShaderColor ( true, util, glMatrix, webgl, prim );

let shaderDirlightTexture = new ShaderDirlightTexture( true, util, glMatrix, webgl, prim );

let renderer = new Renderer ( true, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirlightTexture );

// Create the world, which needs WebGL, WebVR, and Prim.

let world = new World( webgl, prim, renderer, shaderTexture, shaderColor );

// Export our classes to app.js.

export { util, webgl, loadModel, loadTexture, loadAudio, loadVideo, prim, webvr, world };

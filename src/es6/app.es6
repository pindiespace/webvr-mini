/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

'use strict'

console.log( 'in es6' ); 

// DEV ENVIRONMENT

let env = process.env.WEBPACK_ENV;



// REQUIRE ALL POLYFILLS

// WebGL math library.

let glMatrix = require( 'gl-matrix' );

if ( ! glMatrix ) {

    console.error( 'gl-matrix could\'nt be loaded...' );

} else {

    console.log( 'loaded gl-matrix' );

}

// Import WebVR-Mini libraries. Note: if you don't use super() imports will fail!

import Util from './util'; // NOTE: imports Emitter class

import GamePad from './gamepad';

import WebGL from './webgl';

import WebVR from './webvr';

import Ui from './ui';

//import Loader from './load-pool';

import LoadTexture from './load-texture';

import LoadModel from './load-model';

import LoadAudio from './load-audio';

import LoadVideo from './load-video';

import LoadFont from './load-font';

// import Shader from './Shader';

import ShaderTexture from './shader-texture';

import ShaderColor from './shader-color';

import shaderDirLightTexture from './shader-dirlight-texture';

import ShaderWater from './shader-water';

import ShaderMetal from './shader-metal';

// Collects the shaders in one place.

import ShaderPool from './shader-pool';

// All objects.

// import Map2d from './map2d';
// import Map3d from './map3d';
// import Morph from './morph';

// Object primitives.

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

let webvr, ui, loadModel, loadTexture, loadAudio, loadVideo, loadFont, prim, shaderPool, world;

// WebGL can take some time to init.

var promise = new Promise( ( resolve, reject ) => {

  // do a thing, possibly async, then…

    if ( webgl.init( 'webvr-mini-canvas' ) ) {

        webvr = new WebVR( true, util, glMatrix, webgl );

        // Load our (minimal) 2d user interface.

        ui = new Ui( false, util, webgl, webvr );

        // The Prim object needs Loaders. LoadModel might need the Texture loader.

        loadTexture = new LoadTexture( true, util, glMatrix, webgl );

        loadModel = new LoadModel( true, util, glMatrix, webgl, loadTexture );

        loadAudio = new LoadAudio( true, util, glMatrix, webgl );

        loadVideo = new LoadVideo( true, util, glMatrix, webgl );

        loadFont = new LoadFont( true, util, glMatrix, webgl );

        prim = new Prim ( true, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo );

        // Add shaders to ShaderPool.

        shaderPool = new ShaderPool ( true, util, glMatrix, webgl );

        shaderPool.addShader( new ShaderTexture ( true, util, glMatrix, webgl, webvr, 'shaderTexture' ) );

        shaderPool.addShader( new ShaderColor ( true, util, glMatrix, webgl, webvr, 'shaderColor' ) );

        shaderPool.addShader( new shaderDirLightTexture( true, util, glMatrix, webgl, webvr, 'shaderDirLightTexture' ) );

        // Create the world, which needs WebGL, WebVR, and Prim.

        world = new World( webgl, webvr, prim, shaderPool );

        // Initialize our Ui.

        ui.init();

        resolve( 'Stuff worked!' );

    }

    else {

        reject( Error( 'It broke' ) );

    }

}).then( ( result ) => {

        // TODO: Call ui to create a wait icon here.

        world.init();

});


window.vrmin = world;

//.catch( ( err ) => {

//    // error

//    console.error( 'app.es6 load error:' + err );

//} );


// TODO: don't automatically update webgl
// TODO: enclose in a promise, then update ShaderPool and Shaders.
// TODO: then call world

// Export our classes to app.js.

export { util, webgl, loadModel, loadTexture, loadAudio, loadVideo, prim, webvr, world };

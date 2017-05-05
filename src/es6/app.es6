/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

'use strict'

console.log( 'in es6' ); 

// DEV ENVIRONMENT

let env = process.env.WEBPACK_ENV;

// REQUIRE ALL POLYFILLS

// WebGL matrix math library.

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

// TODO: decide whether to import model, texture, audio, video, font loaders.

import ShaderFader from './shader-fader';

import ShaderTexture from './shader-texture';

import ShaderColor from './shader-color';

import shaderDirLightTexture from './shader-dirlight-texture';

import ShaderTerrain from './shader-terrain';

import ShaderWater from './shader-water';

import ShaderMetal from './shader-metal';

// Lights

import Lights from './lights';

// Collects the shaders in one place.

import ShaderPool from './shader-pool';

// Object primitives.

import PrimFactory from './prim-factory';

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

let webvr, ui, shaderPool, light, world;

// WebGL can take some time to init.

var promise = new Promise( ( resolve, reject ) => {

  // do a thing, possibly async, then…

    if ( webgl.init( 'webvr-mini-canvas' ) ) {

        webvr = new WebVR( true, util, glMatrix, webgl );

        // Load our (minimal) 2d user interface.

        ui = new Ui( false, util, webgl, webvr );

        // Add shaders to ShaderPool.

        light = new Lights( glMatrix );

        shaderPool = new ShaderPool ( true, util, glMatrix, webgl );

        // Define the default Shaders used by this app.

        shaderPool.addShader( new ShaderFader ( true, util, glMatrix, webgl, webvr, 'shaderFader', light ) );

        shaderPool.addShader( new ShaderTexture( true, util, glMatrix, webgl, webvr, 'shaderTexture' ) );

        shaderPool.addShader( new ShaderColor( true, util, glMatrix, webgl, webvr, 'shaderColor' ) );

        shaderPool.addShader( new shaderDirLightTexture( true, util, glMatrix, webgl, webvr, 'shaderDirLightTexture', light ) );

        // Create the world, which needs WebGL, WebVR, the Shader list and world Lights.

        world = new World( true, glMatrix, webgl, webvr, shaderPool, light );

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


// Commented out since all errors end up here if we don't

//.catch( ( err ) => {

//    // error

//    console.error( 'app.es6 load error:' + err );

//} );


// TODO: don't automatically update webgl
// TODO: enclose in a promise, then update ShaderPool and Shaders.
// TODO: then call world

// Export our classes to app.js.

export { util, webgl, webvr, world };

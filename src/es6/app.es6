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

// Import Shaders.

import ShaderFader from './shader-fader';

import ShaderTexture from './shader-texture';

import ShaderColor from './shader-color';

import ShaderTerrain from './shader-terrain';

import ShaderSky from './shader-sky';

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

// Create sub-objects.

let webvr, gamepad, ui, shaderPool, lights, world;

// WebGL can take some time to init.

var promise = new Promise( ( resolve, reject ) => {

    // do a thing, possibly async, then…

    if ( webgl.init( 'webvr-mini-canvas' ) ) {

        webvr = new WebVR( true, util, glMatrix, webgl );

        // Load Gamepad support.

        gamepad = new GamePad( true, util );

        // Load our (minimal) 2d user interface.

        ui = new Ui( false, util, webgl, webvr );

        // Add shaders to ShaderPool.

        lights = new Lights( glMatrix );

        shaderPool = new ShaderPool ( true, util, glMatrix, webgl );

        // Define the default Shaders used by this app.

        // REQUIRED Shader, used for fadeins on Prim creation.

        shaderPool.addAsset( new ShaderFader ( true, util, glMatrix, webgl, webvr, 'shaderFader', lights ) );

        // Basic one-texture Shader, without lighting.

        shaderPool.addAsset( new ShaderTexture( true, util, glMatrix, webgl, webvr, 'shaderTexture', lights ) );        

        // Basic color array Shader, without lighting.

        shaderPool.addAsset( new ShaderColor( true, util, glMatrix, webgl, webvr, 'shaderColor', lights ) );

        // Terrain.

        shaderPool.addAsset( new ShaderTerrain( true, util, glMatrix, webgl, webvr, 'shaderTerrain', lights ) );

        // Sky.

        shaderPool.addAsset( new ShaderSky( true, util, glMatrix, webgl, webvr, 'shaderSky', lights ) );

        // Water simulation.

        shaderPool.addAsset( new ShaderWater( true, util, glMatrix, webgl, webvr, 'shaderWater', lights ) );

        // Metallic, reflective mirrors.

        shaderPool.addAsset( new ShaderMetal( true, util, glMatrix, webgl, webvr, 'shaderMetal', lights ) );

        // Create the world, which needs WebGL, WebVR, GamePad, the Shader list and world Lights.

        world = new World( true, glMatrix, webgl, webvr, gamepad, shaderPool, lights );

        // Initialize our Ui after other elements.

        ui.init();

        resolve( 'Stuff worked!' );

    } else {

        reject( Error( 'It broke' ) );

        // TODO: Write 'WebGL not available across canvas';

        ui = new Ui(  false, util, webgl, webvr );

        ui.initBadGL();

    }

}).then( ( result ) => {

        // TODO: Call ui to create a wait icon here.

        world.init();

});

// DEBUG
// TODO: remove

window.world = world;

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

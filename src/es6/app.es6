/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

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

import Util from  './util';

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

import Renderer from './renderer';

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

let webvr, ui, loadModel, loadTexture, loadAudio, loadVideo, loadFont, prim, renderer, world;

// WebGL can take some time to init.
///////////////////////////////////////////////////////
var promise = new Promise( ( resolve, reject ) => {

  // do a thing, possibly async, then…

    if ( webgl.init( 'webvr-mini-canvas' ) ) {

        webvr = new WebVR( true, util, glMatrix, webgl );

        // Load our (minimal) 2d user interface.

        ui = new Ui( false, util, webgl, webvr );

        // The Prim object needs Loaders.

        loadModel = new LoadModel( true, util, glMatrix, webgl );

        loadTexture = new LoadTexture( true, util, glMatrix, webgl );

        loadAudio = new LoadAudio( true, util, glMatrix, webgl );

        loadVideo = new LoadVideo( true, util, glMatrix, webgl );

        loadFont = new LoadFont( true, util, glMatrix, webgl );

        prim = new Prim ( true, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo );

        // Add shaders to Renderer.

        renderer = new Renderer ( true, util, glMatrix, webgl );

        renderer.addShader( new ShaderTexture ( true, util, glMatrix, webgl, 'shaderTexture' ) );

        renderer.addShader( new ShaderColor ( true, util, glMatrix, webgl, 'shaderColor' ) );

        renderer.addShader( new shaderDirLightTexture( true, util, glMatrix, webgl, 'shaderDirLightTexture' ) );

        // Create the world, which needs WebGL, WebVR, and Prim.

        world = new World( webgl, prim, renderer );

        // Initialize our Ui.

        ui.init();

        resolve("Stuff worked!");

    }

    else {

        reject( Error("It broke") );

    }

}).then( ( result ) => {

        // TODO: Call ui to create a wait icon here.

        world.init();

}) 


/*

.catch( ( err ) => {

    // error

    console.error( 'app.es6 load error:' + err );

} );

*/



///////////////////////////////////////////////////////

// WebVR needs WebGL.

/*
let webvr = new WebVR( false, util, glMatrix, webgl );

// The Prim object needs Loaders.

let loadModel = new LoadModel( true, util, glMatrix, webgl );

let loadTexture = new LoadTexture( true, util, glMatrix, webgl );

let loadAudio = new LoadAudio( true, util, glMatrix, webgl );

let loadVideo = new LoadVideo( true, util, glMatrix, webgl );

let loadFont = new LoadFont( true, util, glMatrix, webgl );

let prim = new Prim ( true, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo );

let shaderTexture = new ShaderTexture ( true, util, glMatrix, webgl, 'shaderTexture' );

let shaderColor = new ShaderColor ( true, util, glMatrix, webgl, 'shaderColor' );

let shaderDirLightTexture = new shaderDirLightTexture( true, util, glMatrix, webgl, 'shaderDirLightTexture' );

let renderer = new Renderer ( true, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirLightTexture );

renderer.addShader( shaderTexture );

renderer.addShader( shaderColor );

renderer.addShader( shaderDirLightTexture );

// Create the world, which needs WebGL, WebVR, and Prim.

let world = new World( webgl, prim, renderer );

*/

// TODO: don't automatically update webgl
// TODO: enclose in a promise, then update renderer and shaders.
// TODO: then call world

// Export our classes to app.js.

export { util, webgl, loadModel, loadTexture, loadAudio, loadVideo, prim, webvr, world };

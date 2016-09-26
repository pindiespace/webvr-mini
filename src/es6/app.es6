/*
 * app.es6
 * es6 entry point, transpiled (via BabelJS) to ES5.
 */

console.log( 'in es6' ); 

// DEV ENVIRONMENT

var env = process.env.WEBPACK_ENV;

// WebGL math library.

var glMatrix = require('gl-matrix');

if ( ! glMatrix ) {

    console.error( 'gl-matrix could\'nt be loaded...' );

} else {

    console.log( 'loaded gl-matrix' );

}

import Util from  './util';
import WebGLTexture from './webgl-texture';
import WebGL from './webgl';
import WebVR from './webvr';


// Init immediately.

let configGL = { init: true, glMatrix: glMatrix };

let configTexture = { init: true };

// Init immediately.

let configVR = { init: true };

if ( __DEV__ === 'true' ) {

    // require kronos webgl debug from node_modules
    // https://github.com/vorg/webgl-debug

    configGL.debugUtils = require( 'webgl-debug' );

    if( configGL.debugUtils ) {

        console.log( 'Loading webgl-debug' );

    } else {

        console.log( 'Error loading webgl-debug' );

    }

} else if ( __RELEASE__ === 'true' ) {

    // release code

}

// Import our es6 classes.

let util = new Util();

let webgl = new WebGL( configGL );

let textureLoader = new WebGLTexture( configTexture );

let webvr = new WebVR( configVR );

// Export our classes

export { util, webgl, textureLoader, webvr };


// sample vertex and fragment shaders

// sample code 
// http://sethlakowske.com/articles/webgl-using-gl-mat4-browserify-shader-and-browserify/


//gl.useProgram(shaderProgram); 
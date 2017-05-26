import AssetPool from './asset-pool';
import GeometryPool from './geometry-pool';
import TexturePool from './texture-pool';
import MaterialPool from './material-pool';
import ModelPool from './model-pool';
import AudioPool from './audio-pool';
import Lights from './lights';
import PrimFactory from './prim-factory';

'use strict'

class World extends AssetPool {

    /** 
     * The World class creates the scene, and should be uniquely 
     * written for each instance using the WebVR-Mini library.
     * Required functions:
     * getVS() - the vertex shader.
     * getFS() - get the fragment shader.
     * rer() - update on rer of <canvas>.
     * render() - rendering loop.
     * init() - create the world for this first time.
     * constructor() - initialize, passing in WebVR-Mini object.
     * 
     * TODO: add some standard world objects (e.g. 360 video player by default)
     * @link https://github.com/flimshaw/Valiant360/blob/master/src/valiant.jquery.js
     */

    /** 
     * constructor for World.
     * @param {WebGL} gl the webgl module.
     * @param {WebVR} webvr the webvr module.
     * @param {Prim} prim the object/mesh primitives module.
     * @param {ShaderPool} shaderPool the GLSL rendering module.
     */
    constructor ( init, glMatrix, webgl, webvr, shaderPool, lights ) {

        // Initialize AssetLoader superclass.

        super( webgl.util );

        console.log( 'in World class' );

        this.glMatrix = glMatrix,

        this.webgl = webgl,

        this.util = webgl.util,

        this.vr = webvr,

        this.shaderPool = shaderPool,

        // Attach 1 copy of Texture loader.

        this.texturePool = new TexturePool( init, this.util, webgl );

        // Materials file can find a material, or a texture used as material.

        this.materialPool = new MaterialPool( init, this.util, webgl, this.texturePool );

        // Attach 1 copy of the Model loader. NOTE: passing in TexturePool and MaterialPool.

        this.modelPool = new ModelPool( init, this.util, webgl, this.texturePool, this.materialPool );

        // Attach 1 copy of geometry loader, with ModelPool (which contains TexturePool and MaterialPool).

        this.geometryPool = new GeometryPool( init, this.util, glMatrix, webgl, this.modelPool );

        // Create the Prim factory (no Prim class).

        this.primFactory = new PrimFactory ( true, this );

        // Add a simple point of view, instead of Cameram 1st 3 values = postion, 2nd 3 values = rotation.

        this.position = [ 0, 0, -5 ]; // TODO: X and Z MOVE CORRECTLY. Y MOVES IN REVERSE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        this.rotation = [ 0, 0, 0 ];

        // Add World Lights (Prims may have their own).

        this.lights = lights;

        // default dimensions.

        this.dimensions = {

            width: 100,

            height: 100,

            depth: 100

        };

        // Matrix operations.

        this.canvas = webgl.getCanvas();

        this.glMatrix = webgl.glMatrix;

        this.vMatrix = glMatrix.mat4.create();

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.last = performance.now();

        this.counter = 0;

        // Bind the render loop (best current method)

        this.render = this.render.bind( this );

    }

    /** 
     * Set the POV position (simple camera).
     * @param {Number} x coordinate in World space.
     * @param {Number} y coordinate in World space.
     * @param {Number} z coordinate in World space.
     */
    setPosition ( x, y, z ) {

        this.position = [ x, y, z ];

    }

    /**  
     * Set the POV rotation (simple camera).
     * @param {Number} x coordinate in World space.
     * @param {Number} y coordinate in World space.
     * @param {Number} z coordinate in World space.
     */
    setRotation ( rx, ry, rz ) {

        this.rotation = [ rx, ry, rz ];

    }

    /** 
     * Get the POV (simple camera).
     * @returns {Object} an object containing vec3 position and rotation arrays.
     */
    getPOV () {

        return { 

            position: this.position, 

            rotation: this.rotation 

        };

    }

    /**
     * Handle resize event for the World dimensions.
     * @param {Number} width world width (x-axis) in units.
     * @param {Number} height world height (y-axis) in units.
     * @param {Number} depth world depth (z-axis) in units.
     */
    resize ( width, height, depth ) {

        console.error( 'world::resize(): not implemented yet!' );

    }

    /** 
     * load a World from a JSON file description.
     */
    load () {

        // TODO: use fetch

        console.error( 'world::load(): not implemented yet!' );

    }

    /** 
     * save a World to a JSON file description.
     * use Prim.toJSON() for indivdiual prims.
     */
    save () {

        // TODO: output in editor interface.

        console.error( 'world::save(): not implemented yet!' );

    }

    /** 
     * Create the world. Load Shader objects, and 
     * create objects to render in the world.
     */
    init () {

        const vec3 = this.glMatrix.vec3;

        const vec4 = this.glMatrix.vec4;

        const vec5 = this.primFactory.geometryPool.vec5;

        const typeList = this.primFactory.geometryPool.typeList;

        const directions = this.primFactory.geometryPool.directions;

        const util = this.util;

        // Put some media into our asset pools.

        // Get the shaders (not initialized with update() and render() yet!).
        // NOTE: pass 'world' in so we can get the World POV.

        this.s0 = this.shaderPool.getAssetByName( 'shaderFader' );

        this.s1 = this.shaderPool.getAssetByName( 'shaderTexture' );

        this.s2 = this.shaderPool.getAssetByName( 'shaderColor' );

        this.s3 = this.shaderPool.getAssetByName( 'shaderDirLightTexture' );

//////////////////////////////////
// TEXTURED SHADER.
//////////////////////////////////

/*

            // TODO: MAKE SURE CAP IS ACTUALLY BEING DRAWN!!!!

            this.primFactory.createPrim(
            
                this.s1,                      // callback function
                typeList.CAP, // CAP DEFAULT, AT WORLD CENTER (also a UV polygon)
                'CAP',
                vec5( 3, 3, 3, 0 ),         // dimensions INCLUDING start radius or torus radius(last value)
                vec5( 15, 15, 15 ),         // divisions MUST BE CONTROLLED TO < 5
                //vec3.fromValues(-3.5, -3.5, -1 ),    // position (absolute)
                vec3.fromValues(-0.0, 0, 2.0),
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo1.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            ); 
*/

        // Create a UV skydome.

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.SKYDOME,          // type
                'skydome',                           // name (not Id)
                vec5( 18, 18, 18, 0 ),               // dimensions
                vec5( 10, 10, 10 ),                  // divisions MAKE SMALLER
                vec3.fromValues( 0, 0, 0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),          // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/panorama_01.png' ],           // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0) // color
            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CUBE,
                'first cube',                                        // name
                vec5( 1, 1, 1 ),            // dimensions
                vec5( 10, 10, 10, 0 ),            // divisions, pass curving of edges as 4th parameter
                vec3.fromValues( 1, 0, 2 ),            // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 1 ), util.degToRad( 1 ), util.degToRad( 1 ) ), // angular velocity in x, y, x
                [ 'img/crate.png', 'img/webvr-logo1.png' ],          // texture image
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // RGBA color

            );


            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CUBE,
                'toji cube',
                vec5( 1, 1, 1, 0 ),            // dimensions
                vec5( 1, 1, 1, 0 ),            // divisions, pass curving of edges as 4th parameter
                vec3.fromValues( 5.5, 1.5, -3 ),           // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 40 ), util.degToRad( 0  ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo2.png' ],
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color

            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.TORUS,
                'torus2',
                vec5( 1, 1, 0.5, 0 ),         // dimensions (first is width along x, second  width along y, diameter of torus tube)
                vec5( 9, 9, 9, 1 ),            // divisions (first is number of rings, second is number of sides)
                vec3.fromValues( -1.8, 3, -3.5 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color

            );

             //DIMENSIONS INDICATE ANY X or Y CURVATURE.
             //DIVISIONS FOR CUBED AND CURVED PLANE INDICATE SIDE TO DRAW

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CURVEDINNERPLANE,
                'CurvedPlaneBack',
                vec5( 2, 1, 1, directions.BACK, 1 ),         // pass orientation ONE UNIT CURVE
                vec5( 10, 10, 10 ),        // divisions
                vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo2.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CURVEDINNERPLANE,
                'CurvedPlaneLeft',
                vec5( 2, 1, 1, directions.LEFT, 1 ),         // pass orientation ONE UNIT CURVE
                vec5( 10, 10, 10 ),        // divisions
                vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo3.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CURVEDINNERPLANE,
                'CurvedPlaneRight',
                vec5( 2, 1, 1, directions.RIGHT, 1 ),         // pass orientation ONE UNIT CURVE
                vec5( 10, 10, 10 ),        // divisions
                vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo4.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.CURVEDOUTERPLANE,
                'CurvedPlaneOut',
                vec5( 2, 1, 1, directions.RIGHT, 1 ),         // dimensions NOTE: pass radius for curvature (also creates orbit) 
                vec3.fromValues( 10, 10, 10 ),        // divisions
                vec3.fromValues(-1.2, 0.0, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo2.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.ICOSPHERE,
                'icosphere',
                vec5( 3, 3, 3, 0 ),            // dimensions
                vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
                vec3.fromValues(4.5, 3.5, -2 ),        // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );


            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.SKYICODOME,
                'icoSkyDome',
                vec5( 3, 3, 3, 0 ),            // dimensions
                vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
                vec3.fromValues(-4.5, 0.5, -2 ),        // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(
            
                this.s1,                      // callback function
                typeList.BOTTOMICODOME,
                'bottomicodome',
                vec5( 3, 3, 3, 0 ),            // dimensions
                vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
                vec3.fromValues(4.5, 0.5, -2 ),        // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(
            
                this.s1,                      // callback function
                typeList.CONE,
                'TestCone',
                vec5( 1, 1, 1, 0.0, 0.0 ),         // dimensions (4th dimension is truncation of cone, none = 0, flat circle = 1.0)
                vec5( 10, 10, 10  ),        // divisions MAKE SMALLER
                vec3.fromValues(-0, -1.5, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
            
            );

            this.primFactory.createPrim(
            
                this.s1,                      // callback function
                typeList.CYLINDER,
                'TestCylinder',
                vec5( 1, 1, 1, 0.3, 0.7 ),       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 40  ),        // divisions MAKE SMALLER
                vec3.fromValues(-1.5, -1.5, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
            
            );

            this.primFactory.createPrim(
            
                this.s3,                      // callback function
                typeList.CAPSULE,
                'TestCapsule',
                vec5( 0.5, 1, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
                vec3.fromValues(-2.0, -1.5, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            );

            this.primFactory.createPrim(
            
                this.s1,                      // callback function
                typeList.TEARDROP,
                'TestTearDrop',
                vec5( 1, 2, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
                vec3.fromValues(-2.0, 1.5, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/uv-test.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            );

            // TODO: DOES THIS ACTUALLY BECOME TRANSPARENT????

            this.primFactory.createPrim(
            
                this.s3,                      // callback function
                typeList.DODECAHEDRON,
                'Dodecahedron',
                vec5( 1, 1, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
                vec3.fromValues(-1.0, 0.5, 3.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/crate.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
                true                                    // if true, apply texture to each face

            );



            this.primFactory.createPrim(

                this.s1,                      // callback function
                typeList.REGULARTETRAHEDRON,
                'regulartetrahedron',
                vec5( 3, 3, 3, 0 ),            // dimensions
                vec5( 18, 18, 18 ),               // divisions
                vec3.fromValues(6.7, 1.5, -4 ),       // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo2.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );


///////////////////////////////////////
// TEXTURED MESH
///////////////////////////////////////

            // NOTE: MESH OBJECT WITH DELAYED LOAD - TEST WITH LOW BANDWIDTH
            // TODO: INVALID TEXTURING

            this.primFactory.createPrim(

                this.s1,                               // callback function
                typeList.MESH,
                'capsule',
                vec5( 2, 2, 2 ),                       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 0  ),                    // divisions MAKE SMALLER
                vec3.fromValues( 0.0, 1.0, 0.0 ),      // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'obj/capsule/capsule1.png' ],               // texture present. TODO::: FIGURE OUT NUMBERING.
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
                true,                                   // if true, apply texture to each face,
                [ 'obj/capsule/capsule.obj' ] // object files (.obj, .mtl)

            );



            this.primFactory.createPrim(

                this.s3,                               // callback function
                typeList.MESH,
                'objfile',
                vec5( 2, 2, 2 ),                       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 40  ),                    // divisions MAKE SMALLER
                vec3.fromValues( -6.5, -1, -1.0 ),      // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                //[ 'img/crate.png' ],               // texture present. TODO::: FIGURE OUT NUMBERING.
                '', // texture loaded directly
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
                true,                                   // if true, apply texture to each face,
                //[ 'obj/mountains/mountains.obj' ] // ok
                //[ 'obj/landscape/landscape.obj'] // ok?
                //[ 'obj/toilet/toilet.obj' ] // works with texture, multiple groups wrap texture!
                //[ 'obj/naboo/naboo.obj' ] // works fine, but needs to load additional images.
                //[ 'obj/star/star.obj'] // ok, gets generic grey texture
                //[ 'obj/robhead/robhead.obj'] // no texcoords or normals
                //[ 'obj/soccerball/soccerball.obj'] // no texcoords or normals
                //[ 'obj/basketball/basketball.obj'] // needs TGA translation
                //[ 'obj/rock1/rock1.obj'] // rock plus surface, works
                //[ 'obj/cherries/cherries.obj'] // rendering indices error
                [ 'obj/banana/banana.obj' ] // works great
            );

            this.primFactory.createPrim(

                this.s3,                               // callback function
                typeList.MESH,
                'objfile2',
                vec5( 2, 2, 2 ),                       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 40  ),                    // divisions MAKE SMALLER
                vec3.fromValues( -6.5, 2, -1.0 ),      // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                //[ 'img/crate.png' ],               // texture present. TODO::: FIGURE OUT NUMBERING.
                '', // texture loaded directly
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
                true,                                   // if true, apply texture to each face,
                //[ 'obj/mountains/mountains.obj' ] // ok
                //[ 'obj/landscape/landscape.obj'] // ok?
                //[ 'obj/toilet/toilet.obj' ] // works with texture, multiple groups wrap texture!
                //[ 'obj/naboo/naboo.obj' ] // works fine, but needs to load additional images.
                //[ 'obj/star/star.obj'] // ok, gets generic grey texture
                //[ 'obj/robhead/robhead.obj'] // no texcoords or normals
                //[ 'obj/soccerball/soccerball.obj'] // no texcoords or normals
                //[ 'obj/basketball/basketball.obj'] // needs TGA translation
                //[ 'obj/rock1/rock1.obj'] // rock plus surface, works
                [ 'obj/cherries/cherries.obj'] // rendering indices error > 64k
                // 'obj/banana/banana.obj' ] // works great
            );


//////////////////////////////////
// COLOR SHADER.
//////////////////////////////////

            this.primFactory.createPrim(

                this.s2,                      // callback function
                typeList.CUBE,
                'colored cube',
                vec5( 0.7, 0.7, 0.7, 0 ),            // dimensions
                vec5( 3, 3, 3 ),            // divisions
                vec3.fromValues( 3.2, -0.3, 2 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo3.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color

            );

            this.primFactory.createPrim(

                this.s2,                               // callback function
                typeList.MESH,
                'teapot',
                vec5( 1, 1, 1 ),                       // dimensions (4th dimension doesn't exist for cylinder)
                vec5( 40, 40, 40  ),                    // divisions MAKE SMALLER
                vec3.fromValues( 0.0, 1.0, 2.0 ),      // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [],               // no texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // color,
                false,                                 // if true, apply texture to each face,
                [ 'obj/teapot/teapot.obj' ] // object files (.obj, .mtl)

            );

//////////////////////////////////
// LIT TEXTURE SHADER.
//////////////////////////////////


            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.TERRAIN,
                'terrain',
                vec5( 2, 2, 2, directions.TOP, 0.1 ),       // NOTE: ORIENTATION DESIRED vec5[3], waterline = vec5[4]
                vec5( 100, 100, 100 ),           // divisions
                vec3.fromValues( 1.5, -1.5, 2 ),       // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 1 ), util.degToRad( 0 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo1.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0),  // color
                null //heightMap                       // heightmap

            );


            this.primFactory.createPrim(
            
                this.s3,                      // callback function
                typeList.SPHERE,
                'texsphere',
                vec5( 1.5, 1.5, 1.5, 0 ),   // dimensions
                vec5( 6, 6, 6 ), // at least 8 subdividions to smooth!
                //vec3.fromValues(-5, -1.3, -1 ),       // position (absolute)
                vec3.fromValues( -0, -1.0, 3.5 ),
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo1.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            );

            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.CUBESPHERE,
                'cubesphere',
                vec5( 3, 3, 3 ),            // dimensions
                vec5( 10, 10, 10, 0 ),         // divisions 4th parameter is degree of rounding.
                vec3.fromValues(3, -0.7, -1 ),       // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 10 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo1.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            ); 

            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.CUBE,
                'lit cube',
                vec5( 1, 1, 1, 0 ),            // dimensions
                vec5( 1, 1, 1 ),            // divisions
                vec3.fromValues( -3, -2, -3 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo4.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color

            );

            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.CURVEDINNERPLANE,
                'CurvedPlaneFront',
                vec5( 2, 1, 1, directions.FRONT, 1 ),         // pass orientation ONE UNIT CURVE
                vec5( 10, 10, 10 ),        // divisions
                vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/webvr-logo1.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            );

            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.ICOSOHEDRON,
                'icosohedron',
                vec5( 3, 3, 3, 0 ),            // dimensions
                vec5( 18, 18, 18 ),               // divisions
                vec3.fromValues(0.5, 3.5, -2 ),       // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo2.png' ],               // texture present, NOT USED
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        
            );

            this.primFactory.createPrim(

                this.s3,                      // callback function
                typeList.BOTTOMDOME,
                'TestDome',
                vec5( 1, 1, 1, 0 ),            // dimensions
                vec5( 10, 10, 10  ),            // divisions MAKE SMALLER
                vec3.fromValues(-4, 0.5, -0.5 ),        // position (absolute)
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo2.png' ],               // texture present
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );

            this.primFactory.createPrim(

                this.s3,                  // callback function
                typeList.TORUS, // TORUS DEFAULT
                'TORUS1',
                vec5( 1, 1, 0.5, 0 ),            // dimensions INCLUDING start radius or torus radius(last value)
                vec5( 15, 15, 15 ),            // divisions MUST BE CONTROLLED TO < 5
                //vec3.fromValues(-3.5, -3.5, -1 ),        // position (absolute)
                vec3.fromValues(-0.0, 0, 2.0),
                vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
                vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
                vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
                [ 'img/mozvr-logo1.png', 'ew9ruqwdfhfw' ],               // texture present
                //[ 'sld;fkjasfd'], // test default procedural texture pixel
                vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color

            );


    window.prims = this.primFactory.prims;

    window.lights = this.lights.getPos();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // NOTE: the init() method sets up the update() and render() methods for the Shader.

        this.r0 = this.s0.init();

        this.r1 = this.s1.init();

        this.r2 = this.s2.init();

        this.r3 = this.s3.init();

        // Fire world update. 

        this.render();

    }

    /** 
     * Create multiple Prims from an OBJ file. Load the file, then parse out individual 
     * OBJs to ModelPool via PrimFactory. Each 'o' and 'usemtl' defines a new Prim.
     */
    initFromFile( path ) {

         if ( path ) {

            // Get the image mimeType.

            let mimeType = this.modelPool.modelMimeTypes[ this.util.getFileExtension( path ) ];

            // check if mimeType is OK.

            if( mimeType ) {

                this.doRequest( path, i, 

                    ( updateObj ) => {

                        /* 
                         * updateObj returned from GetAssets has the following structure:
                         * { 
                         *   pos: pos, 
                         *   path: requestURL, 
                         *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                         *   error: false|response 
                         * } 
                         */

                        // load a Model file. Only the first object in the file will be read.

                        if ( updateObj.data ) {

                            // TODO: IS MTL ALWAYS OVER O?

                            // Split by usemtl

                            // Split by obj within usemtl

                                   

                        } else {

                            console.error( 'ModelPool::getModels(): no data found for:' + updateObj.path );

                        }

                }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

            }

        }

    }

    /**
     * Create a default World.
     */
    create ( width, height, depth ) {

        // TODO: not implemented yet

    }

    /** 
     * Update the World. Called occsionally.
     */
    housekeep () {

// TODO: initPrimMaterial is just picking the first material as default. Find the material with the lowest start.

// TODO: sort materials by starting position using object.keys function

// TODO: detect if a texture is too big, and try to load a smaller one!
// Error: WebGL: texImage2D: Requested size at this level is unsupported.

// TODO: make light ambient and material ambient consistent!!!!!!!!!!!!!!!!

// TODO: investigate why >64k isn't working on windows system

// TODO: smoothing groups

// TODO: make camera work in mouselook only.

// TODO: SUPPORT FOR SMOOTHING GROUPS. STARTED IN MODELPOOL DIRECTORY.

// TODO: make shader-texture and shader-color handle basic materials. But use shader-dirlight-texture 

// TODO: be choosen if there are multiple materials in the file.

// TODO: ANIMATION CLASS FOR PRIM IN UPDATEMV ROUTINE.

// TODO: PRIM CONCATENATE SEVERAL PRIMS TOGETHER INTO ONE ARRAY??? CHECK HOW TO DO

// NOTE: WebWorker for OBJ file parsing

// TODO: JSON FILE FOR PRIMS (loadable) use this.load(), this.save()

// TODO: DEFAULT MINI WORLD IF NO JSON FILE (just a skybox and ground grid)

// TODO: PRIM ORBIT FUNCTION

    }

    /** 
     * Update the World, called with each animation frame.
     */
    update () {

        // Check for VR mode.

        // fps calculation.

        let now = performance.now();

        let delta = now - this.last;

        this.last = now;

        this.counter++;

        if ( this.counter > 300 ) {

            this.counter = 0;

            /////////console.log( 'delta:' + parseInt( 1000 / delta ) + ' fps' );

        }

        // Update Lights

        let lightPos = this.lights.getPos();

        //this.glMatrix.vec3.rotateX( lightPos, lightPos, [ 0, 0, 0 ], 0.01 );

        //this.glMatrix.vec3.rotateY( lightPos, lightPos, [ 0, 0, 0 ], 0.01 );

        // Update atmosphere

        // Update Skydome/Stardome

    }

    /** 
     * Get the World view matrix.
     */
    getWorldViewMatrix ( vMatrix ) {

        let mat4 = this.glMatrix.mat4,

        pov = this.getPOV();

        mat4.rotate( vMatrix, vMatrix, pov.rotation[ 1 ], [ 0, 1, 0 ] ); // rotate on Y axis only (for mouselook).

        mat4.rotate( vMatrix, vMatrix, pov.rotation[ 0 ], [ 1, 0 , 0 ] ); // rotate on X axis only (for mouselook).

        mat4.translate( vMatrix, vMatrix, pov.position ); // putting this first rotates around world center!

    }

    /** 
     * Render the World for a mono or a VR display.
     * Update Prims locally, then call Shader. objects to do rendering. Individual renderers 
     * (this.r#) were bound (ES5 method) in the constructor. 
     * NOTE: Our scene graph is just the rendering order shown here.
     * NOTE: we can call Shaders indivdually, or use the global 
     * this.shaderPool.renderVR() or this.shaderPool.renderMono() will will render everything.
     */
    render () {

        let mat4 = this.glMatrix.mat4,

        vMatrix = this.vMatrix;

        this.update();

        this.webgl.clear();

        let vr = this.vr, 

        pov = this.getPOV();

// TODO: DEBUG TEMPORARY.
//pov.rotation[ 0 ] += 0.003;
//pov.rotation[ 1 ] += 0.003;
        // Render for mono or WebVR stereo.

        let display = vr.getDisplay();

        // Clear the View matrix for the World.

        mat4.identity( vMatrix );

        // Toggle between VR and mono view modes.
            
        if ( display && display.isPresenting ) {

            // Get FrameData (with matrices for left and right eye).

            let frameData = this.vr.getFrameData();

            // Get any world transforms (translation, rotation).

            this.getWorldViewMatrix( vMatrix );

            this.r3.renderVR( vr, display, frameData, vMatrix, pov );  // directional light texture

            this.r2.renderVR( vr, display, frameData, vMatrix, pov );  // color

            this.r1.renderVR( vr, display, frameData, vMatrix, pov );  // textured, no lighting

            this.r0.renderVR( vr, display, frameData, vMatrix, pov );  // REQUIRED alpha (Prim appearing or disappearing), drawn in front

            display.submitFrame();

            display.requestAnimationFrame( this.render );

        } else {

            // Render mono view.

            this.getWorldViewMatrix( vMatrix );

            this.r3.renderMono( vMatrix, pov ); // directional light texture

            this.r2.renderMono( vMatrix, pov ); // color

            this.r1.renderMono( vMatrix, pov ); // textured, no lighting

            this.r0.renderMono( vMatrix, pov ); // REQUIRED alpha (Prim appearing or disappearing), drawn in front

            requestAnimationFrame( this.render );

        }

    }

}

export default World;
/** 
 * Loads objects and renderers and runs the rendering loop.
 */
class World {

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
     * @param {WebGL} webgl the webgl module.
     * @param {Prim} prim the object/mesh primitives module.
     * @param {Renderer} renderer the GLSL rendering module.
     */
    constructor ( webgl, prim, renderer ) {

        console.log( 'in World class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.prim = prim;

        this.renderer = renderer;

        this.canvas = webgl.getCanvas();

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.last = performance.now();

        this.counter = 0;

        // Bind the render loop (best current method)

        this.render = this.render.bind( this );

    }

    /**
     * Handle resize event for the World dimensions.
     * @param {Number} width world width (x-axis) in units.
     * @param {Number} height world height (y-axis) in units.
     * @param {Number} depth world depth (z-axis) in units.
     */
    resize ( width, height, depth ) {


    }

    /** 
     * Create the world. Load shader/renderer objects, and 
     * create objects to render in the world.
     */
    init () {

        const vec3 = this.glMatrix.vec3;

        const vec4 = this.glMatrix.vec4;

        const vec5 = this.prim.vec5;

        const util = this.util;

// TEXTURED SHADER.

        this.textureObjList = [];

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'first cube',                                        // name
            vec5( 1, 1, 1 ),            // dimensions
            vec5( 10, 10, 10, 0 ),            // divisions, pass curving of edges as 4th parameter
            vec3.fromValues( 1, 0, 2 ),            // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 1 ), util.degToRad( 1 ), util.degToRad( 1 ) ), // angular velocity in x, y, x
            [ 'img/crate.png', 'img/webvr-logo1.png' ],          // texture image
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // RGBA color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'toji cube',
            vec5( 1, 1, 1, 0 ),            // dimensions
            vec5( 1, 1, 1, 0 ),            // divisions, pass curving of edges as 4th parameter
            vec3.fromValues( 5, 1, -3 ),           // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 40 ), util.degToRad( 0  ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo2.png' ],
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color
        ) );

        // PRIMARY (BIG) SKYDOME

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.SKYDOME,
            'SkyDome',
            vec5( 18, 18, 18, 0 ),            // dimensions
            vec5( 10, 10, 10 ),            // divisions MAKE SMALLER
            vec3.fromValues( 0, 0, 0 ),        // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/panorama_01.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0)  // color
        ) );

         this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.TORUS,
            'torus2',
            vec5( 1, 1, 0.5, 0 ),         // dimensions (first is width along x, second  width along y, diameter of torus tube)
            vec5( 9, 9, 9, 1 ),            // divisions (first is number of rings, second is number of sides)
            vec3.fromValues( -1.8, 3, -3.5 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color
        ) );

        this.vs1 = this.renderer.shaderTexture.init( this.textureObjList );

// COLORED SHADER.

// TODO: add shaders to Renderer

// TODO: add Prims to renderer, using a specific shader renderer[shaderName].list.push( prim )

        this.colorObjList = [];

         this.colorObjList.push( this.prim.createPrim(
         //this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'colored cube',
            vec5( 1, 1, 1, 0 ),            // dimensions
            vec5( 3, 3, 3 ),            // divisions
            vec3.fromValues( 0.2, 0.5, 1 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo3.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color
        ) );

///OBJ MESH

        this.colorObjList.push( this.prim.createPrim(
            this.prim.typeList.MESH,
            'teapot',
            vec5( 1, 1, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
            vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
            vec3.fromValues(0.0, 1.0, 2.0 ),      // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [],               // no texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
            false,                                   // if true, apply texture to each face,
            [ 'obj/teapot/teapot.obj' ] // object files (.obj, .mtl)
        ) );

        this.vs2 = this.renderer.shaderColor.init( this.colorObjList );

// LIT TEXTURE SHADER.

        this.dirlightTextureObjList = [];

         this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'lit cube',
            vec5( 1, 1, 1, 0 ),            // dimensions
            vec5( 1, 1, 1 ),            // divisions
            vec3.fromValues( -3, -2, -3 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo4.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.TERRAIN,
            'terrain',
            vec5( 2, 2, 44, this.prim.directions.TOP, 0.1 ),            // NOTE: ORIENTATION DESIRED vec5[3], waterline = vec5[4]
            vec5( 100, 100, 100 ),           // divisions
            vec3.fromValues( 1.5, -1.5, 2 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 1 ), util.degToRad( 0 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo1.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0),  // color
            null //heightMap                       // heightmap

        ) );

///////////////////////////
// PLANE

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CURVEDINNERPLANE,
            'CurvedPlaneFront',
            vec5( 2, 1, 1, this.prim.directions.FRONT, 1 ),         // pass orientation ONE UNIT CURVE
            vec5( 10, 10, 10 ),        // divisions
            vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo1.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CURVEDINNERPLANE,
            'CurvedPlaneBack',
            vec5( 2, 1, 1, this.prim.directions.BACK, 1 ),         // pass orientation ONE UNIT CURVE
            vec5( 10, 10, 10 ),        // divisions
            vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo2.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CURVEDINNERPLANE,
            'CurvedPlaneLeft',
            vec5( 2, 1, 1, this.prim.directions.LEFT, 1 ),         // pass orientation ONE UNIT CURVE
            vec5( 10, 10, 10 ),        // divisions
            vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo3.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CURVEDINNERPLANE,
            'CurvedPlaneRight',
            vec5( 2, 1, 1, this.prim.directions.RIGHT, 1 ),         // pass orientation ONE UNIT CURVE
            vec5( 10, 10, 10 ),        // divisions
            vec3.fromValues(-1, 0.0, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/webvr-logo4.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

//////////////////////////////////////////////////////////////////////

       // DIMENSIONS INDICATE ANY X or Y CURVATURE.
        // DIVISIONS FOR CUBED AND CURVED PLANE INDICATE SIDE TO DRAW

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CURVEDOUTERPLANE,
            'CurvedPlaneOut',
            vec5( 2, 1, 1, this.prim.directions.RIGHT, 1 ),         // dimensions NOTE: pass radius for curvature (also creates orbit) 
            vec3.fromValues( 10, 10, 10 ),        // divisions
            vec3.fromValues(-1.2, 0.0, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo2.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.SPHERE,
            'texsphere',
            vec5( 1.5, 1.5, 1.5, 0 ),   // dimensions
            //vec5( 30, 30, 30 ),         // divisions
            vec5( 6, 6, 6 ), // at least 8 subdividions to smooth!
            //vec3.fromValues(-5, -1.3, -1 ),       // position (absolute)
            vec3.fromValues( -0, -1.0, 3.5 ),
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo1.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );


        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBESPHERE,
            'cubesphere',
            vec5( 3, 3, 3 ),            // dimensions
            vec5( 10, 10, 10, 0 ),         // divisions 4th parameter is degree of rounding.
            vec3.fromValues(3, -0.7, -1 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 10 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo1.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.REGULARTETRAHEDRON,
            'regulartetrahedron',
            vec5( 3, 3, 3, 0 ),            // dimensions
            vec5( 18, 18, 18 ),               // divisions
            vec3.fromValues(6.7, 1.5, -4 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo2.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.ICOSOHEDRON,
            'icosohedron',
            vec5( 3, 3, 3, 0 ),            // dimensions
            vec5( 18, 18, 18 ),               // divisions
            vec3.fromValues(0.5, 3.5, -2 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo2.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.ICOSPHERE,
            'icosphere',
            vec5( 3, 3, 3, 0 ),            // dimensions
            vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
            vec3.fromValues(4.5, 3.5, -2 ),        // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

//////////////////////////
        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.SKYICODOME,
            'icoSkyDome',
            vec5( 3, 3, 3, 0 ),            // dimensions
            vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
            vec3.fromValues(-4.5, 0.5, -2 ),        // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.BOTTOMICODOME,
            'bottomicodome',
            vec5( 3, 3, 3, 0 ),            // dimensions
            vec5( 32, 32, 32 ),            // 1 for icosohedron, 16 for good sphere
            vec3.fromValues(4.5, 0.5, -2 ),        // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );
//////////////////////////


        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.BOTTOMDOME,
            'TestDome',
            vec5( 1, 1, 1, 0 ),            // dimensions
            vec5( 10, 10, 10  ),            // divisions MAKE SMALLER
            vec3.fromValues(-4, 0.5, -0.5 ),        // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo2.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.TORUS, // TORUS DEFAULT
            'TORUS1',
            vec5( 1, 1, 0.5, 0 ),            // dimensions INCLUDING start radius or torus radius(last value)
            vec5( 15, 15, 15 ),            // divisions MUST BE CONTROLLED TO < 5
            //vec3.fromValues(-3.5, -3.5, -1 ),        // position (absolute)
            vec3.fromValues(-0.0, 0, 2.0),
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/mozvr-logo1.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CAP, // CAP DEFAULT, AT WORLD CENTER (also a UV polygon)
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
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CONE,
            'TestCone',
            vec5( 1, 1, 1, 0.0, 0.0 ),         // dimensions (4th dimension is truncation of cone, none = 0, flat circle = 1.0)
            vec5( 10, 10, 10  ),        // divisions MAKE SMALLER
            vec3.fromValues(-0, -1.5, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CYLINDER,
            'TestCylinder',
            vec5( 1, 1, 1, 0.3, 0.7 ),       // dimensions (4th dimension doesn't exist for cylinder)
            vec5( 40, 40, 40  ),        // divisions MAKE SMALLER
            vec3.fromValues(-1.5, -1.5, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );


        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CAPSULE,
            'TestCapsule',
            vec5( 0.5, 1, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
            vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
            vec3.fromValues(-2.0, -1.5, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );


        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.TEARDROP,
            'TestTearDrop',
            vec5( 1, 2, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
            vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
            vec3.fromValues(-2.0, 1.5, 2.0 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'img/uv-test.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );


        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.DODECAHEDRON,
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
        ) );


        this.vs3 = this.renderer.shaderDirlightTexture.init( this.dirlightTextureObjList );

        ///////////////
/*
        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.MESH,
            'obj capsule',
            vec5( 1, 1, 1 ),       // dimensions (4th dimension doesn't exist for cylinder)
            vec5( 40, 40, 0  ),        // divisions MAKE SMALLER
            vec3.fromValues(0.0, 1.0, 2.0 ),      // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.2 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            [ 'obj/capsule/capsule.png' ],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),  // color,
            true,                                   // if true, apply texture to each face,
            [ 'obj/capsule/capsule.obj', 'obj/capsule/capsule.mtl' ] // object files (.obj, .mtl)
        ) );
*/
        ///////////////

        // Finished object creation, start rendering...

        this.render();

    }

    /**
     * Create objects specific to this world.
     */
    create () {

    }

    /** 
     * Update world.related properties, e.g. a HUD or framrate readout.
     */
    update () {

        // fps calculation.

        let now = performance.now();

        let delta = now - this.last;

        this.last = now;

        this.counter++;

        if ( this.counter > 300 ) {

            this.counter = 0;

            /////////console.log( 'delta:' + parseInt( 1000 / delta ) + ' fps' );

        }

    }

    /** 
     * render the world. Update Prims locally, then call shader/renderer 
     * objects to do rendering. this.render was bound (ES5 method) in 
     * the constructor.
     */
    render () {

        this.update();

        this.webgl.clear();

        // Render Prims attached to each renderer object.

        // TODO: Don't render until we update in the correct order.

        this.vs3.render();

        this.vs2.render();

        this.vs1.render();

        requestAnimationFrame( this.render );

    }

}

export default World;
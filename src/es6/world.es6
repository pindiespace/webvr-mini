export default class World {

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
     */

    /** 
     * constructor.
     * @param {WeVRMini} webvr the webvr module.
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

        let vec3 = this.glMatrix.vec3;

        let vec4 = this.glMatrix.vec4;

        let util = this.util;

// TEXTURED SHADER.

        this.textureObjList = [];

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'first cube',                                        // name
            1.0,                                                 // scale
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 1, 1, 1 ),            // divisions
            vec3.fromValues( 0, 0, 0 ),            // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 1 ), util.degToRad( 1 ), util.degToRad( 1 ) ), // angular velocity in x, y, x
            [ 'img/crate.png', 'img/webvr-logo1.png' ],          // texture image
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // RGBA color
        ) );

        this.textureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'toji cube',
            1.0,
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 1, 1, 1 ),            // divisions
            vec3.fromValues( 5, 1, -3 ),           // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 40 ), util.degToRad( 0  ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo2.png'],
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.vs1 = this.renderer.shaderTexture.init( this.textureObjList );

// COLORED SHADER.

        this.colorObjList = [];

         this.colorObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'colored cube',
            1.0,
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 1, 1, 1 ),            // divisions
            vec3.fromValues( -1, 2, -3 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo3.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.vs2 = this.renderer.shaderColor.init( this.colorObjList );

// LIT TEXTURE SHADER.

        this.dirlightTextureObjList = [];

         this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBE,
            'lit cube',
            1.0,
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 1, 1, 1 ),            // divisions
            vec3.fromValues( -3, -2, -3 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo4.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.TERRAIN,
            'terrain',
            1.0,
            vec3.fromValues( 2, 2, 2 ),            // dimensions
            vec3.fromValues( 130, 5, 130 ),           // divisions
            vec3.fromValues(1.5, -1.5, 2 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 1 ), util.degToRad( 0 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo1.png'],               // texture present
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0),  // color
            null //heightMap                       // heightmap
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.PLANE,
            'a plane',
            1.0,
            vec3.fromValues( 2, 2, 2 ),            // dimensions
            vec3.fromValues( 50, 0, 50 ),          // divisions
            vec3.fromValues( 0, -2, 0 ),           // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0  ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0.5 ), util.degToRad( 0.0 ), util.degToRad( 0.0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo2.png'],
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.SPHERE,
            'texsphere',
            1.0,
            vec3.fromValues( 3, 3, 3 ),            // dimensions
            vec3.fromValues( 10, 10, 10 ),         // divisions
            vec3.fromValues(-6, -0.3, -4 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo1.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0)  // color
        ) );


        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.CUBESPHERE,
            'cubesphere',
            1.0,
            vec3.fromValues( 3, 3, 3 ),            // dimensions
            vec3.fromValues( 10, 10, 10 ),         // divisions
            vec3.fromValues(2.5, -1.5, -2 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 10 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo1.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0)  // color
        ) );

        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.ICOSOHEDRON,
            'icophere',
            1.0,
            vec3.fromValues( 3, 3, 3 ),            // dimensions
            vec3.fromValues( 4, 4, 4 ),         // divisions
            vec3.fromValues(-2.5, 1.5, -1 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo2.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0)  // color
        ) );


        this.dirlightTextureObjList.push( this.prim.createPrim(
            this.prim.typeList.ICOSPHERE,
            'icophere',
            1.0,
            vec3.fromValues( 3, 3, 3 ),            // dimensions
            vec3.fromValues( 4, 4, 4 ),         // divisions
            vec3.fromValues(-1.5, 2.5, -1 ),       // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0.5 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo2.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0)  // color
        ) );


        window.terrain =  this.dirlightTextureObjList[1];

        this.vs3 = this.renderer.shaderDirlightTexture.init( this.dirlightTextureObjList );

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

        // TODO: Don't render until we update in the correct order.

        this.vs3.render();

        this.vs2.render();

        this.vs1.render();

        requestAnimationFrame( this.render );

    }

}
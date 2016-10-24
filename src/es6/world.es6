export default class world {

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

        this.timeOld = this.time = 0;

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

        ///////////////////////////////////////////////
        // Add objects to the basic 'textured' shader.

        this.textureObjList = [];

        this.textureObjList.push( this.prim.createCube(
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

        this.textureObjList.push( this.prim.createCube(
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

        ///////////////////////////////////////
        // Add objects to the 'colored' shader.

        this.colorObjList = [];

         this.colorObjList.push( this.prim.createCube(
            'colored cube',
            1.0,
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 1, 1, 1 ),            // divisions
            vec3.fromValues( -5, 1, -3 ),          // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo3.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

        this.vs2 = this.renderer.shaderColor.init( this.colorObjList );

        this.dirlightTextureObjList = [];

         this.dirlightTextureObjList.push( this.prim.createCube(
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

        this.vs3 = this.renderer.shaderDirlightTexture.init( this.dirlightTextureObjList );

        //////////////////////
        // Terrain generation.

        let heightMap = [
            39,  159, 227, 15,  211, 206, 250, 110,
            26,  6,   144, 71,  7,   117, 97,  46,
            239, 14,  249, 13,  225, 26,  28,  197,
            174, 58,  79,  25,  88,  236, 45,  243,
            203, 240, 195, 100, 187, 12,  202, 167,
            207, 209, 138, 33,  219, 152, 154, 55,
            137, 238, 196, 209, 37,  27,  240, 97,
            46,  220, 114, 52,  193, 78,  170, 163
        ];


        this.prim.createTerrain(
            'lit cube',
            1.0,
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 8, 255, 8 ),          // divisions
            vec3.fromValues( 0, -5, 0 ),           // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/mozvr-logo1.png'],               // texture present, NOT USED
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        )

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
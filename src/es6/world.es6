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

        this.renderList = {};

        // Get the available renderers.

        for ( let i in this.renderer.renderNames ) {

            this.renderList[  i ] = [];

        }

        this.canvas = webgl.getCanvas();

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.timeOld = this.time = 0;

    }

   /* 
     * MATRIX OPERATIONS
     * Mostly with glMatrix
     */

    mvPushMatrix() {

        let mat4 = this.glMatrix.mat4;

        let copy = mat4.create();

        mat4.set( this.mvMatrix, copy );

        mvMatrixStack.push( copy );

    }

    mvPopMatrix() {

        if ( this.mvMatrixStack.length == 0 ) {

            throw 'Invalid popMatrix!';

        }

        mvMatrix = this.mvMatrixStack.pop();

    }

    /**
     * Handle resize event for the World.
     * @param {Number} width world width (x-axis).
     * @param {Number} depth world depth (z-axis).
     */
    resize ( width, depth ) {


    }

    init2222222 () {

        this.textureObjList = [];

        let vec3 = this.glMatrix.vec3;

        let vec4 = this.glMatrix.vec4;

        let util = this.util;

        this.textureObjList.push( this.prim.createCube(
            'first cube',                                        // name
            1.0,                                                 // scale
            vec3.fromValues( 1, 1, 1 ),            // dimensions
            vec3.fromValues( 0, 0, 0 ),            // position (absolute)
            vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            vec3.fromValues( util.degToRad( 1 ), util.degToRad( 1 ), util.degToRad( 1 ) ), // angular velocity in x, y, x
            [ 'img/crate.png', 'img/webvr-logo1.png' ],          // texture image
            vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // RGBA color
        ) );

        let program = this.renderer.shaderTexture.init( this.textureObjList );

        window.program = program; /////////////////////////////////////////////////

    }

    /** 
     * Start building the world for the first time.
     */
    init () {


        let gl = this.webgl.getContext();

        let prim = this.prim;

        let util = this.util;

        let objs = this.renderList[ this.renderer.renderNames.vs1 ]

        objs.push( this.prim.createCube(
            'first cube',                                        // name
            1.0,                                                 // scale
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),            // dimensions
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),            // position (absolute)
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            this.glMatrix.vec3.fromValues( util.degToRad( 0 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            this.glMatrix.vec3.fromValues( util.degToRad( 1 ), util.degToRad( 1 ), util.degToRad( 1 ) ), // angular velocity in x, y, x
            [ 'img/crate.png', 'img/webvr-logo1.png' ],          // texture image
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ), // RGBA color
        ) );



        objs.push( this.prim.createCube(
            'toji cube',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),            // dimensions
            this.glMatrix.vec3.fromValues( 5, 1, -3 ),           // position (absolute)
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            this.glMatrix.vec3.fromValues( util.degToRad( 40 ), util.degToRad( 0  ), util.degToRad( 0 ) ), // rotation (absolute)
            this.glMatrix.vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo1.png'],
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );


////////////////////////////////////////////////////

        let objs2 = this.renderList[ this.renderer.renderNames.vs2 ];

        objs2.push( this.prim.createCube(
            'icosphere',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),            // dimensions
            this.glMatrix.vec3.fromValues( -5, 1, -3 ),           // position (absolute)
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),            // acceleration in x, y, z
            this.glMatrix.vec3.fromValues( util.degToRad( 20 ), util.degToRad( 0 ), util.degToRad( 0 ) ), // rotation (absolute)
            this.glMatrix.vec3.fromValues( util.degToRad( 0 ), util.degToRad( 1 ), util.degToRad( 0 ) ),  // angular velocity in x, y, x
            ['img/webvr-logo2.png'],
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )  // color
        ) );

/*
        objs.push( this.prim.createCube(
            'red cube',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),
            this.glMatrix.vec3.fromValues( 1, 0, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            'img/webvr-logo2.png',
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ) 
        ) );

        objs.push( this.prim.createCube(
            'orange cube',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),
            this.glMatrix.vec3.fromValues( -1, 0, 0 ),
            this.glMatrix.vec3.fromValues( 0, 1, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            'img/webvr-logo3.png',
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 )

        ) );

        objs.push( this.prim.createCube(
            'red triangle cube',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),
            this.glMatrix.vec3.fromValues( -1, 0, 0 ),
            this.glMatrix.vec3.fromValues( -1, 1, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            'img/webvr-logo4.png',
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        objs.push( this.prim.createIcoSphere(
            'icosphere',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),
            this.glMatrix.vec3.fromValues( -1, 0, 0 ),
            this.glMatrix.vec3.fromValues( 0, -1, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            'img/webvr-logo-chrome1.png',
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        objs.push( this.prim.createCube(
            'w3c cube',
            1.0,
            this.glMatrix.vec3.fromValues( 1, 1, 1 ),
            this.glMatrix.vec3.fromValues( -1, -1, 0 ),
            this.glMatrix.vec3.fromValues( -1, -1, 0 ),
            this.glMatrix.vec3.fromValues( 0, 0, 0 ),
            'img/webvr-w3c.png',
            this.glMatrix.vec4.fromValues( 0.5, 1.0, 0.2, 1.0 ),

        ) );

        */

        /////////////////////////
        // VS2 render test

        //this.renderer.initVS2( objs );
        //this.render();
        //return;
        //////////////////////////

        //////////////////////////
        // VS1 render test
        // TODO:
        //let programVS1 = this.renderer.initVS1( objs );
        let programVS1 = this.renderer.initVS1();

        programVS1.renderList = objs;

        let programVS2 = this.renderer.initVS2();

        programVS2.renderList = objs2;

        window.objs2 = objs2;


        this.render();
        return;

        // TODO: use this method for storing multiple arrays.

        //////////////////////////



    }


    /** 
     * WORLD-SPECIFIC FUNCTIONS GO HERE.
     */

    /**
     * Create objects specific to this world.
     */
    create () {


    }

    /** 
     * Update the world's objects in time increments, e.g. motion and 
     * animation.
     */
    update () {

        // fps calculation.

    }

    render () {

        // update the world.

        this.update();

        this.renderer.clear();

        this.renderer.renderVS1();

        this.renderer.renderVS2();

        requestAnimationFrame( () => { this.render() } );

    }

}
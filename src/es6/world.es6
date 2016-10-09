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
    constructor ( webgl, prim ) {

        this.webgl = webgl;

        this.prim = prim;

        this.canvas = webgl.getCanvas();

        this.gl = webgl.getContext();

        this.glMatrix = webgl.glMatrix;

        this.objVertices = [];

        this.objIndices = [];

        this.objColors = [];

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.timeOld = this.time = 0;

    }

    /**
     * Handle resize event for the World.
     * @param {Number} width world width (x-axis).
     * @param {Number} depth world depth (z-axis).
     */
    resize ( width, depth ) {


    }

    /** 
     * Start building the world for the first time.
     */
    init () {

        let gl = this.gl;

        let prim = this.prim;

        this.shaderProgram = this.webgl.createProgram( prim.objVS1(), prim.objFS1() )

        let program = this.shaderProgram.program;

        // use the program

        gl.useProgram( program );

        // Get location of attributes

        // Start rendering loop.

        this.render();

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

    }

    /**
     * Render the World.
     */
   render () {

        requestAnimationFrame( () => { this.render() } );

    }

}
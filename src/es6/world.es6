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

        this.program = this.webgl.createProgram( prim.objVS1(), prim.objFS1() );

        // use the program

        let shaderProgram = this.program.shaderProgram;

        gl.useProgram( shaderProgram );

        // USE THIS AS A BASE:
        // https://github.com/gpjt/webgl-lessons/blob/master/lesson06/index.html

        /* 
         * Get location of attribute names. Stored separately for vertex and fragment shaders.
         * vsvars = {
                attribute {
                    vec2: {
                        uvMatrix: null (until filled)
                        mvMatris: null (until filled)
                    }
                }
         }
         */
/*
        let attributes = this.program.vsVars.attribute;

        for ( let i in attributes ) {

            let attb = attributes[ i ];

            console.log('PGGGG:' + attb );

            for ( let j in attb ) {

                attb[ j ] = gl.getAttribLocation( shaderProgram, j );

                gl.enableVertexAttribArray( attb[ j ] );

                console.log("ATTRIB J:" + j + ":" + attb[ j ] );

            }

        }
    */

        this.program.vsVars.attribute = this.webgl.setAttributeLocations( this.program.vsVars.attribute );

        this.program.vsVars.uniform = this.webgl.setUniformLocations( this.program.vsVars.uniform );

        window.vsVars = this.program.vsVars;

/*
        let uniforms = this.program.vsVars.uniform;

        for ( let i in uniforms ) {

            let unif = uniforms[ i ];

            console.log('UGGGG:' + unif );

            for ( let j in unif ) {

                unif[ j ] = gl.getUniformLocation( shaderProgram, j );

                console.log("UNIF J:" + j + ":" + unif[ j ] );

            }

        }
*/

/*
        let varying = this.program.vsVars.varying;

        for ( let i in varying ) {

            let varg = varying[ i ];

            console.log('VGGGG:' + varg );

            for ( let j in varg ) {

                varg[ j ] = gl.getUniformLocation( shaderProgram, j ); // TODO: IS THIS ALWAYS TRUE????

                console.log("UNIF J:" + j + ":" + varg[ j ] );

            }

        }
*/

        //shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        //shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        //shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

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
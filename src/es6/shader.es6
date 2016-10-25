export default class Shader {

    /* 
     * Renderers.
     * GREAT description of model, view, projection matrix
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
     * 
     * Using vertex arrays:
     * @link http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
     * 
     * WebGL Stack
     * @link https://github.com/stackgl
     * 
     * Superfast Advanced Batch Processing
     * http://max-limper.de/tech/batchedrendering.html
     * 
     * GLSL Sandbox
     * http://mrdoob.com/projects/glsl_sandbox/
     * 
     * Basic MVC
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
     */

    constructor ( init, util, glMatrix, webgl, prim ) {

        console.log( 'In Shader class' );

        this.webgl = webgl;

        this.util = util;

        this.prim = prim;

        this.glMatrix = glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.mvMatrixStack = this.glMatrix.mat4.create();

        this.floatp = ''

        if ( this.webgl.stats.highp ) {

            this.floatp = 'precision highp float;';

        } else {

            this.floatp = 'precision mediump float;';

        }

        // If we need to load a vertext and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

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
     * set up our program object, using WebGL. We wrap the 'naked' WebGL 
     * program object, and add additional properties to the wrapper. 
     * 
     * Individual shaders use these variables to construct a program wrapper 
     * object containing the GLProgram, plus properties, plus update() and 
     * render() functions.
     */
    setup () {

        // Compile shaders and create WebGL program using webgl object.

        let program = null;

        if ( this.vertexShaderFile && this.this.fragmentShaderFile ) {

            program = this.webgl.createProgram( 
                this.webgl.fetchVertexShader( this.vertexShaderFile ), 
                this.webgl.fetchFragmentShader( this.fragmentShaderFile ) 
            );

        } else {

            program = this.webgl.createProgram( this.vsSrc(), this.fsSrc() );

        }

        // Return references to our properties, and assign uniform and attribute locations using webgl object.

        return [ 

            this.webgl.getContext(),

            this.webgl.getCanvas(),

            this.glMatrix.mat4,

            this.glMatrix.mat3,

            this.glMatrix.vec3,

            this.glMatrix.mat4.create(),  // perspective

            this.glMatrix.mat4.create(),  // model-view

            program,

            {
                attribute: this.webgl.setAttributeArrays( program.shaderProgram, program.vsVars.attribute ),

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform )

            },

            {

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform )

            }

        ];

    }

}
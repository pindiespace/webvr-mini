export default class Shader {

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'In Shader class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        // If we need to load a vertext and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

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

            this.glMatrix.vec3,

            this.glMatrix.mat4.create(),

            this.glMatrix.mat4.create(),

            program,

            {
                attribute: this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute ),

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform )

            },

            {

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform )

            }

        ];

    }

}
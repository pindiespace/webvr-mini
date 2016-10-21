export default class Shader {

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'In Shader class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

    }

    /** 
     * set up our program object, using WebGL. We wrap the 'naked' WebGL 
     * program object, and add additional properties to the wrapper.
     */
    setup () {

        let program = this.webgl.createProgram( this.vsSrc(), this.fsSrc() );

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
import Shader from './shader'

'use strict'

class ShaderTerrain extends Shader {



    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 5
     * For semi-transparent object in fading animation only. Objects placed  
     * here are moved to their regular shader when alpha = 1.0. It 
     * draws the object with the first texture defined in its texture array, 
     * dropping back to the color array if the texture isn't defined.
     * --------------------------------------------------------------------
     */
    constructor ( init, util, glMatrix, webgl, webvr, shaderName, lights ) {

        super( init, util, glMatrix, webgl, webvr, shaderName, lights );

        console.log( 'In ShaderFader class' );

        this.required.buffer.indices = true,

        this.required.buffer.texCoords = true,

        this.required.buffer.normals = true,

        this.required.lights = 1,

        this.required.textures = 1;

    }

    /* 
     * Vertex and Fragment Shaders. We use the internal 'program' object from the webgl object to compile these. 
     * Alternatively, They may be defined to load from HTML or and external file.
     * @return {Object{code, varList}} an object, with internal elements
     * code: The shader code.
     * varList: A scanned list of all the variables in the shader code (created by webgl object).
     */
    vsSrc () {

        let s = [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            'attribute vec3 ' + this.webgl.attributeNames.aVertexPosition[ 0 ] + ';',
            //'attribute vec4 ' + this.webgl.attributeNames.aVertexColor[ 0 ] + ';',
            'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',
            'attribute vec3 ' + this.webgl.attributeNames.aVertexNormal[ 0 ] + ';',

            'void main(void) {',

            // View-Model-Position-Projection matrix.

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',


            '}'

        ];

        return {

            code: s.join( '\n' ),

            varList: this.webgl.createVarList( s )

        };

    }


    /** 
     * terrain fragment shader.
     * - varying texture coordinate
     * - texture 2D sampler
     */
    fsSrc () {

        let s = [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            'void main(void) {',

                'gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);',

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} primList a list of initializing Prims (optional).
     */
     init ( primList ) {

        let arr = this.setup(),

        gl = arr[ 0 ],

        canvas = arr[ 1 ],

        mat4 = arr[ 2 ],

        mat3 = arr[ 3 ],

        vec3 = arr[ 4 ],

        program = arr[ 5 ],

        vsVars = arr[ 6 ],

        fsVars = arr[ 7 ], 

        stats = arr[ 8 ],

        near = arr[ 9 ],

        far = arr[ 10 ],

        vr = arr[ 11 ],

        iSize = arr[ 12 ];

        // Shorter reference.

        let shaderProgram = program.shaderProgram;

        // If we init with primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }

        // Local reference to our matrices.

        //let pMatrix = this.pMatrix,

        mvMatrix = this.mvMatrix,
        
        vMatrix = this.vMatrix,

        mMatrix = this.mMatrix;

        /** 
         * POLYMORPHIC METHODS
         */

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM, updatePrim ) => {

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( mvMatrix );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, mvMatrix );

            // Update coordinates every time for mono, but only one time for stereo.

            if ( updatePrim ) prim.updateCoords();

        }

        // Create a save matrix.

        let saveMV = mat4.create();

        /*
         * Prim rendering. We pass in a the Projection Matrix so we can render in mono and stereo, and 
         * the position of the camera/eye (POV) for some kinds of rendering (e.g. specular).
         * @param {glMatrix.mat4} PM projection matrix, either mono or stereo.
         * @param {glMatrix.vec3} pov the position of the camera in World space.
         * @param {Boolean} updatePrim if true, adjust Prim coordinates. Do every time for mono, but only 
         * one time for stereo.
         */

        program.render = ( PM, pov, updatePrim ) => {

            if ( ! program.renderList.length ) return;

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            mat4.copy( saveMV, mvMatrix );

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we are visible, and have at least one texture loaded.

                if ( ! prim || prim.alpha === 0 || ! prim.defaultMaterial || ! prim.defaultMaterial.map_Kd ) continue;

                // Update Model-View matrix with standard Prim values.

                program.update( prim, mvMatrix, updatePrim );

                // TODO: bind buffers

                // TODO: Set fragment shader sampler uniform.

                // TODO: drawElements()

                // Copy back the original for the next Prim. 

                mat4.copy( mvMatrix, saveMV );

            } // end of renderList for Prims.

        } // end of program.render()

    } // end of init()

}

export default ShaderTerrain;
import Shader from './shader'

class ShaderMetal extends Shader {

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 3
     * a directionally-lit textured object vertex shader.
     * @link http://learningwebgl.com/blog/?p=684
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */
    constructor ( init, util, glMatrix, webgl, webvr, shaderName ) {

        super( init, util, glMatrix, webgl, webvr, shaderName );

        console.log( 'In ShaderMetal class' );

        this.needIndices = true;

        this.needTexCoords = true;

        this.needColors = false;

        this.needNormals = false;

        this.needTangents = false;

    }


    /* 
     * Vertex and Fragment Shaders. We use the internal 'program' object from the webgl object to compile these. 
     * Alternatively, They may be defined to load from HTML or and external file.
     * @return {Object{code, varList}} an object, with internal elements
     * code: The shader code.
     * varList: A scanned list of all the variables in the shader code (created by webgl object).
     */
    vsSrc () {

        let s = [];

        return {

            code: s.join( '\n' ),

            varList: this.webgl.createVarList( s )

        };

    }


    /** 
     * water fragment shader.
     * - varying texture coordinate
     * - texture 2D sampler
     */
    fsSrc () {

        let s =  [];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} objList a list of initializing Prims (optional).
     */
     init ( objList ) {

        let arr = this.setup(),

        gl = arr[ 0 ],

        canvas = arr[ 1 ],

        mat4 = arr[ 2 ],

        mat3 = arr[ 3 ],

        vec3 = arr[ 4 ],

        pMatrix = arr[ 5 ],

        mvMatrix = arr[ 6 ],

        program = arr[ 7 ],

        vsVars = arr[ 8 ],

        fsVars = arr[ 9 ], 

        stats = arr[ 10 ],

        near = arr[ 11 ],

        far = arr[ 12 ],

        vr = arr[ 13 ];

        // Shorter reference.

        let shaderProgram = program.shaderProgram;

        // If we init with object, add them here.

        if ( objList ) {

            program.renderList = this.util.concatArr( program.renderList, objList );

        }

        /** 
         * POLYMORPHIC METHODS
         */

        // Update object position, motion - given to World object.

        program.update = ( obj ) => {

            mat4.identity( mvMatrix );

            // Standard mvMatrix updates.

            obj.setMV( mvMatrix );

            // Compute lighting normals.

            vec3.normalize( adjustedLD, lightingDirection );

            vec3.scale( adjustedLD, adjustedLD, -1 );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, mvMatrix );

        }

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( shaderProgram );

            // Reset perspective matrix.

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, near, far ); // right

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let obj = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! obj.textures[ 0 ] || ! obj.textures[ 0 ].texture ) continue;

                // Update Model-View matrix with standard Prim values.

                program.update( obj, mvMatrix );

                // TODO: bind buffers

                // TODO: Set fragment shader sampler uniform.

                // TODO: drawElements()

            } // end of renderList for Prims

        } // end of program.render()

    } // end of init()

}

export default ShaderMetal;
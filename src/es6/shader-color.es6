import Shader from './shader'

'use strict'

class ShaderColor extends Shader {

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 2
     * colorized, non-lit shader.
     * @link http://learningwebgl.com/blog/?p=684
     * StackGL
     * @link https://github.com/stackgl
     * phong lighting
     * @link https://github.com/stackgl/glsl-lighting-walkthrough
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */

    constructor ( init, util, glMatrix, webgl, webvr, shaderName ) {

        super( init, util, glMatrix, webgl, webvr, shaderName );

        // Define arrays that are needed for this shader.

        this.required.buffer.indices = true,

        this.required.buffer.colors = true,

        this.required.textures = 0;

        console.log( 'In ShaderColor class' );

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
            'attribute vec4 ' + this.webgl.attributeNames.aVertexColor[ 0 ] + ';',

            //'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',

            'varying lowp vec4 vColor;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vColor = aVertexColor;',

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    fsSrc () {

        let s = [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            'uniform vec3 uMatEmissive;', // no lighting, but can glow...

            'varying lowp vec4 vColor;',

            'void main(void) {',

                'float uAlpha = 1.0;',

                'float vLightWeighting = 1.0;',

                //'gl_FragColor = vec4(vColor.rgb * vLightWeighting, uAlpha);',

                'gl_FragColor = vec4( vColor.r + uMatEmissive.r, vColor.g + uMatEmissive.g, vColor.b + uMatEmissive.b, uAlpha);',

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 2, using color buffer but not texture.
     * --------------------------------------------------------------------
     */

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} primList a list of initializing Prims (optional).
     */
    init ( primList ) {

        // DESTRUCTING DID NOT WORK!
        //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

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

        vr = arr[ 11 ];

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        // If we init with a primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }

        // Local reference to our matrices.

        //let pMatrix = this.pMatrix,

        let mvMatrix = this.mvMatrix,
        
        vMatrix = this.vMatrix,

        mMatrix = this.mMatrix;

        /** 
         * POLYMORPHIC PROPERTIES AND METHODS
         */

        // Shorten names of attributes, uniforms for rendering.

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aVertexColor = vsVars.attribute.vec4.aVertexColor,

        uPMatrix = uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = uMVMatrix = vsVars.uniform.mat4.uMVMatrix,

        uMatEmissive = fsVars.uniform.vec3.uMatEmissive;

        // No transparency, always opaque.

        // Lights not used, but material may have ambient and emissive lighting.

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

        }

        /*
         * Prim rendering. We pass in a the Projection Matrix so we can render in mono and stereo, and 
         * the position of the camera/eye (POV) for some kinds of rendering (e.g. specular).
         * @param {glMatrix.mat4} PM projection matrix, either mono or stereo.
         * @param {glMatrix.vec3} pov the position of the camera in World space.
         */

        program.render = ( PM, pov ) => {

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            let saveMV = mat4.clone( mvMatrix );

            // Reset perspective matrix.

            //mat4.perspective( PM, Math.PI*0.4, canvas.width / canvas.height, near, far ); // right

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! prim ) continue; // could be null

                // Individual prim update

                program.update( prim, mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( aVertexPosition );
                gl.vertexAttribPointer( aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

                // Bind color buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.colors.buffer );
                gl.enableVertexAttribArray( aVertexColor );
                gl.vertexAttribPointer( aVertexColor, 4, gl.FLOAT, false, 0, 0 );

                // default material (other Shaders might use multiple materials).

                let m = prim.defaultMaterial;

                // Set the emissive quality of the Prim.

                gl.uniform3fv( uMatEmissive, m.emissive ); // NOTE: transparent objects go in their own Shader.

                // Bind perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( uPMatrix, false, PM );
                gl.uniformMatrix4fv( uMVMatrix, false, mvMatrix );

                // Bind indices buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, prim.geometry.indices.buffer );

                if ( stats.uint32 ) {

                    // Draw elements, 0 -> 2e9

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_INT, 0 );


                } else {

                    // Draw elements, 0 -> 65k (old platforms).

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0 );

                }

                // Copy back the original for the next Prim. 

                mat4.copy( mvMatrix, saveMV, mvMatrix );

            } // end of renderList for Prims

            // Disable buffers that might cause problems in another Shader.

            //gl.bindBuffer( gl.ARRAY_BUFFER, null );
            //gl.disableVertexAttribArray( vsVars.attribute.vec4.aVertexColor ); 

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderColor;
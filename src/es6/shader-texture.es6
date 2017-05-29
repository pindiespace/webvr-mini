import Shader from './shader'

'use strict'

class ShaderTexture extends Shader {

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 1
     * textured, no lighting.
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

        this.required.buffer.indices = true,

        this.required.buffer.colors = true,

        this.required.buffer.normals = true,

        this.required.lights = 0,

        this.required.textures = 1;

        console.log( 'In ShaderTexture class' );

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
            'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'varying vec2 vTextureCoord;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vTextureCoord = aTextureCoord;',

            '}'

            ];

        return {

            code: s.join( '\n' ),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * a default-lighting textured object fragment shader.
     * - varying texture coordinate
     * - texture 2D sampler
     */
    fsSrc () {

        let s =  [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            //'uniform vec3 uMatAmbient;',  // default material brightness
            //'uniform vec3 uMatDiffuse;',  // diffuse color
            'uniform vec3 uMatEmissive;', // no lighting, but can glow...

            'varying vec2 vTextureCoord;',

            'uniform sampler2D uSampler;',

            'void main(void) {',

            '   vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

            '   textureColor.rgb *= (1.0 + uMatEmissive.rgb);',

            '    gl_FragColor =  vec4(textureColor.r, textureColor.g, textureColor.b, textureColor.a);',

            '}'

            ];


        return {
        
            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 1, using texture buffer.
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

        gl = arr[0],

        canvas = arr[1],

        mat4 = arr[2],

        mat3 = arr[3],

        vec3 = arr[4],

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
         * POLYMORPHIC PROPERTIES AND METHODS.
         */

        // Shorten names of attributes, uniforms for rendering.

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aTextureCoord = vsVars.attribute.vec2.aTextureCoord,

        uSampler = fsVars.uniform.sampler2D.uSampler,

        uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = vsVars.uniform.mat4.uMVMatrix,

        uMatAmbient = fsVars.uniform.vec3.uMatAmbient,

        uMatDiffuse = fsVars.uniform.vec3.uMatDiffuse,

        uMatEmissive = fsVars.uniform.vec3.uMatEmissive;

        // No transparency, always opaque.

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

            if ( ! program.renderList.length ) return;

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            let saveMV = mat4.clone( mvMatrix );

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we are visible, and have at least one texture loaded.

                if ( ! prim || prim.alpha === 0 || ! prim.textures[ 0 ] || ! prim.textures[ 0 ].texture ) continue;

                // Individual Prim update.

                program.update( prim, mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( aVertexPosition );
                gl.vertexAttribPointer( aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

                // Bind Textures buffer (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( aTextureCoord );
                gl.vertexAttribPointer( aTextureCoord, 2, gl.FLOAT, false, 0, 0 );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, prim.textures[ 0 ].texture );

                // Bind additional texture units.

                // Set fragment shader sampler uniform.

                gl.uniform1i( uSampler, 0 );

                // Default material (other Shaders might use multiple materials).

                let m = prim.defaultMaterial;

                // Set the material quality of the Prim.

                gl.uniform3fv( uMatAmbient, m.ambient );
                gl.uniform3fv( uMatDiffuse, m.diffuse );
                gl.uniform3fv( uMatEmissive, m.emissive ); // NOTE: transparent objects go in their own Shader.

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( uPMatrix, false, PM );
                gl.uniformMatrix4fv( uMVMatrix, false, mvMatrix );

                // Bind index buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, prim.geometry.indices.buffer );

                // Draw elements.

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

            // Disable buffers that might cause problems in another Prim.

            //gl.bindBuffer( gl.ARRAY_BUFFER, null );
            //gl.disableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderTexture;
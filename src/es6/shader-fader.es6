import Shader from './shader'

'use strict'

class ShaderFader extends Shader {

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 0
     * Prims with varying alpha values during creation and deletion.
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
    constructor ( init, util, glMatrix, webgl, webvr, shaderName, lights ) {

        super( init, util, glMatrix, webgl, webvr, shaderName, lights );

        this.required.buffer.indices = true,

        this.required.buffer.colors = true,

        this.required.buffer.normals = false,

        this.required.lights = 0,

        this.required.textures = 0;

        this.sortByDistance = true;

        console.log( 'In ShaderFader class' );

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

            // Note: ALWAYS name the vertex attribute using the default!

            'attribute vec3 ' + this.webgl.attributeNames.aVertexPosition[ 0 ] + ';',
            'attribute vec4 ' + this.webgl.attributeNames.aVertexColor[ 0 ] + ';',

            'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',
            'attribute vec3 ' + this.webgl.attributeNames.aVertexNormal[ 0 ] + ';',

            // render flags

            'uniform bool uUseLighting;',
            'uniform bool uUseTexture;',
            'uniform bool uUseColor;',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'uniform mat3 uNMatrix;',

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;',
            'uniform vec3 uDirectionalColor;',

            'varying vec2 vTextureCoord;',
            'varying lowp vec4 vColor;',
            'varying vec3 vLightWeighting;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vLightWeighting = vec3(1.0, 1.0, 1.0);',

            '    if (uUseTexture) { ',

            '      vTextureCoord = aTextureCoord;',

            '    } else { ',

            '      vTextureCoord = vec2(0.0, 0.0);', // Prim has no textures

            '    }',

            '    vColor = aVertexColor;', // we always read this, so always bind it

            '    if(uUseLighting) {',

            '       vec3 transformedNormal = uNMatrix * aVertexNormal;',

            // TODO: experiment until we get a good value here...

            '       float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);',

            '       vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;',


            '    } else {',

            '       vLightWeighting = vec3(1.0, 1.0, 1.0);',

            '    }',

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    fsSrc () {

        let s = [

            this.floatp,

            'uniform bool uUseLighting;',
            'uniform bool uUseTexture;',
            'uniform bool uUseColor;',

            'uniform sampler2D uSampler;',
            'uniform float uAlpha;',

            'varying vec2 vTextureCoord;',
            'varying lowp vec4 vColor;',

            'varying vec3 vLightWeighting;',

            'void main(void) {',

                'if (uUseColor) {',

                // TODO: ADD LIGHTING HERE

                    'gl_FragColor = vec4(vColor.rgb * vLightWeighting, uAlpha);',

                '}',

                'else if(uUseTexture) {',

                    'vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

                    'gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);',

                '}',

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

        pMatrix = arr[ 5 ],

        mvMatrix = arr[ 6 ],

        program = arr[ 7 ],

        vsVars = arr[ 8 ],

        fsVars = arr[ 9 ],

        stats = arr[ 10 ],

        near = arr[ 11 ],

        far = arr[ 12 ],

        vr = arr[ 13 ];

        // Attach our VBO program.

        let shaderProgram = program.shaderProgram;

        // If we init with a primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }

        /** 
         * POLYMORPHIC PROPERTIES AND METHODS.
         */

        // Shorten names of attributes, uniforms for rendering.

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aVertexColor = vsVars.attribute.vec4.aVertexColor,

        aTextureCoord = vsVars.attribute.vec2.aTextureCoord,

        aVertexNormal = vsVars.attribute.vec3.aVertexNormal,

        uAlpha = fsVars.uniform.float.uAlpha,

        uUseLighting = fsVars.uniform.bool.uUseLighting,

        uUseColor = fsVars.uniform.bool.uUseColor,

        uUseTexture = fsVars.uniform.bool.uUseTexture,

        uSampler = fsVars.uniform.sampler2D.uSampler,

        uAmbientColor = vsVars.uniform.vec3.uAmbientColor,

        uLightingDirection = vsVars.uniform.vec3.uLightingDirection, 

        uDirectionalColor = vsVars.uniform.vec3.uDirectionalColor,

        uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = vsVars.uniform.mat4.uMVMatrix;

        // Local link to easing function

        let easeIn = this.util.easeIn;

        let easeType = 0;

        // Set up directional lighting with the primary World light (see lights.es6 for defaults).

        let lighting = false;

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 );

        let ambient = light0.ambient;

        let lightingDirection = light0.lightingDirection;

        let directionalColor = light0.directionalColor;

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = vec3.create(); // TODO: redo

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

                let fade = prim.fade;

                let dir = fade.endAlpha - fade.startAlpha;

                let inc = 0.005;

                if ( dir > 0 ) {

                    prim.alpha += inc;

                    if ( prim.alpha >= fade.endAlpha ) {

                        prim.alpha = fade.endAlpha;

                        // This turns off this Shader!

                        prim.shader.movePrim( prim, prim.defaultShader );

                    }

                } else if ( dir < 0 ) {

                    prim.alpha -= inc;

                    if ( prim.alpha <= fade.endAlpha ) {

                        prim.alpha = fade.endAlpha;

                        // This turns off this Shader!

                        prim.shader.movePrim( prim, prim.defaultShader );

                    }

                }

            // Compute lighting normals.

            vec3.normalize( adjustedLD, lightingDirection );

            vec3.scale( adjustedLD, adjustedLD, -1 );

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, MVM );

        }

       // Prim rendering - Shader in ShaderPool, rendered by World.

        program.render = ( PM, MVM ) => {

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            let saveMV = mat4.clone( MVM );

            // Reset perspective matrix.

            //mat4.perspective( PM, Math.PI*0.4, canvas.width / canvas.height, near, far ); // right

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! prim ) continue; // could be null

                // Individual prim update

                program.update( prim, MVM );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( aVertexPosition );
                gl.vertexAttribPointer( aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

                // NOTE: We always bind the color buffer, even if we don't draw with it (prevents 'out of range' errors).

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.colors.buffer );
                gl.enableVertexAttribArray( aVertexColor );
                gl.vertexAttribPointer( aVertexColor, 4, gl.FLOAT, false, 0, 0 ); // NOTE: prim.geometry.colors.itemSize for param 2

                // NOTE: we always bind the texture buffer, even if we don't used it (prevent 'out of range' errors).

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( aTextureCoord );
                gl.vertexAttribPointer( aTextureCoord, 2, gl.FLOAT, false, 0, 0 );

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.normals.buffer );
                gl.enableVertexAttribArray( aVertexNormal );
                gl.vertexAttribPointer( aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

                // Alpha, with easing animation (in this.util).

                gl.uniform1f( uAlpha, easeIn( prim.alpha, 0 ) );

                // Conditionally set lighting, based on default Shader the Prim was assigned to.

                if ( prim.defaultShader.required.lights > 0 ) {

                    gl.uniform1i( uUseLighting, 1 );

                } else {

                    gl.uniform1i( uUseLighting, 0 );

                }

                // Draw using either the texture[0] or color array.

                if ( prim.defaultShader.required.textures > 0 && prim.textures[ 0 ] && prim.textures[ 0 ].texture ) {

                    // Conditionally set use of color and texture arrays.

                    gl.uniform1i( uUseColor, 0 );
                    gl.uniform1i( uUseTexture, 1 );

                   // Bind the first texture.

                    gl.activeTexture( gl.TEXTURE0 );

                    gl.bindTexture( gl.TEXTURE_2D, prim.textures[ 0 ].texture );

                    // Other texture units below.

                    // Set fragment shader sampler uniform.

                    gl.uniform1i( uSampler, 0 );

                } else {

                    // Conditionally set use of color and texture array.

                    gl.uniform1i( uUseColor, 1 );
                    gl.uniform1i( uUseTexture, 0 );

                }

                // Normals matrix uniform

                gl.uniformMatrix3fv( vsVars.uniform.mat3.uNMatrix, false, nMatrix );

                // Lighting (always bound)

                gl.uniform3f( uAmbientColor, ambient[ 0 ], ambient[ 1 ], ambient[ 2 ] );
                gl.uniform3fv( uLightingDirection, adjustedLD );
                gl.uniform3f( uDirectionalColor, directionalColor[ 0 ], directionalColor[ 1 ], directionalColor[ 2 ] );

                // Bind perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( uPMatrix, false, PM );
                gl.uniformMatrix4fv( uMVMatrix, false, MVM );

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

                mat4.copy( MVM, saveMV, MVM );

            } // end of renderList for Prims

            // Don't have to disable buffers that might cause problems in another Shader.

            //gl.bindBuffer( gl.ARRAY_BUFFER, null );
            //gl.disableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
            //gl.disableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
            //gl.disableVertexAttribArray( vsVars.attribute.vec3.aVertexNormal );

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderFader;
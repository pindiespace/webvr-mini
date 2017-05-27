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
            'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',
            'attribute vec3 ' + this.webgl.attributeNames.aVertexNormal[ 0 ] + ';',

            //'uniform mat4 uMMatrix;',   // Model matrix
            //'uniform mat4 uVMatrix;',  // View matrix
            'uniform mat4 uMVMatrix;',  // Model-View matrix
            'uniform mat4 uPMatrix;',   // Perspective matrix
            'uniform mat3 uNMatrix;',   // Inverse-transpose of Model-View matrix

            // World position.

            'uniform vec3 uPOV;',

            // Adjusted positions and normals.

            'varying vec3 vPOV;',
            'varying vec4 vPositionW;',
            'varying vec4 vNormalW;',

            // Texture coordinates.

            'varying vec2 vTextureCoord;',

            'varying vec4 vVertexColor;',

            'void main(void) {',

            // View-Model-Position-Projection matrix.

                'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

                'vTextureCoord = aTextureCoord;',

                'vVertexColor = aVertexColor;',

                'vPOV = -uPOV;',

                'vPositionW = uMVMatrix * vec4(aVertexPosition, 1.0);', // Model-View Matrix (including POV / camera).

                'vNormalW =  normalize(vec4(uNMatrix*aVertexNormal, 0.0));', // Inverse-transpose-normal matrix rotates object normals.

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

            // Uniforms.

            'uniform bool uUseLighting;',
            'uniform bool uUseTexture;',
            'uniform bool uUseColor;',

            // Lighting values.

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;', // uLightingDirection
            'uniform vec3 uDirectionalColor;',

            // Material properties (includes specular highlights).

            'uniform vec3 uMatEmissive;',
            'uniform vec3 uMatAmbient;',
            'uniform vec3 uMatDiffuse;',
            'uniform vec3 uMatSpecular;',
            'uniform float uMatSpecExp;',

            // Alpha value

            'uniform float uAlpha;',

            // Varying.

            'varying vec3 vPOV;', // World point of view (camera)
            'varying vec4 vPositionW;',
            'varying vec4 vNormalW;',

            'varying vec2 vTextureCoord;',

            'varying vec4 vVertexColor;',

            // Texture sampler.

            'uniform sampler2D uSampler;',

            // Main program.

            'void main(void) {',

                'vec4 vColor;',

                'if(uUseTexture) {',

                    'vColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

                '} else {',

                    'vColor = vVertexColor;', // we always read this, so always bind it

                '}',

                // Emissive.

                'vec4 Emissive = vec4(uMatEmissive, 1.0);',

                // Ambient.

                'vec4 Ambient = vec4(uAmbientColor, 1.0) * vec4(uMatAmbient, 1.0);',

                'vec4 Diffuse = vec4(uDirectionalColor * uMatDiffuse, 1.0);',

                'vec4 Specular = vec4(uDirectionalColor * uMatSpecular, 1.0);',

                // Diffuse.

                'if (uUseLighting) {',

                    'vec4 N = normalize(vNormalW);',

                    'vec4 LL = normalize(vec4(uLightingDirection, 1.0));',

                    'float NdotL = max( dot(N, LL), 0.0);',

                    'Diffuse =  NdotL * Diffuse;',

                    // Specular. Changing 4th parameter to 0.0 instead of 1.0 improved results.

                    'vec4 L = normalize(vec4(uLightingDirection, 1.0) - vPositionW);',

                    'vec4 EyePosW = vec4(vPOV, 0.0);', // world = eye = camera position

                    'vec4 V = normalize(EyePosW - vPositionW);', // if this is just vPositionW we get a highlight around edges in right place

                    'vec4 H = normalize(L + V);',

                    'vec4 R = reflect(-L, N);', // -L needed to bring to center. +L gives edges highlighted

                    'float RdotV = max(dot(R, V), 0.0);',

                    'float NdotH = max(dot(N, H), 0.0);',

                    'Specular = pow(RdotV, uMatSpecExp) * pow(NdotH, uMatSpecExp) * Specular;',

                    // TODO: Specular isn't focused to a dot - it is everywhere!!!!

                '}', 

                // Final fragment color.

                'gl_FragColor = (Emissive + Ambient + Diffuse) * vec4(vColor.rgb, uAlpha);',

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

        // Attach our VBO program.

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

        aVertexColor = vsVars.attribute.vec4.aVertexColor,

        aTextureCoord = vsVars.attribute.vec2.aTextureCoord,

        aVertexNormal = vsVars.attribute.vec3.aVertexNormal,

        uAlpha = fsVars.uniform.float.uAlpha,

        uUseLighting = fsVars.uniform.bool.uUseLighting,

        uUseTexture = fsVars.uniform.bool.uUseTexture,

        uUseColor = fsVars.uniform.bool.uUseColor,

        uSampler = fsVars.uniform.sampler2D.uSampler,

        uMatEmissive = fsVars.uniform.vec3.uMatEmissive,

        uMatAmbient = fsVars.uniform.vec3.uMatAmbient,

        uMatDiffuse = fsVars.uniform.vec3.uMatDiffuse,

        uMatSpecular = fsVars.uniform.vec3.uMatSpecular,

        uMatSpecExp = fsVars.uniform.vec3.uMatSpecExp,

        uAmbientColor = fsVars.uniform.vec3.uAmbientColor, // ambient light color

        uLightingDirection = fsVars.uniform.vec3.uLightingDirection, 

        uDirectionalColor = fsVars.uniform.vec3.uDirectionalColor, // directional light color

        uPOV = vsVars.uniform.vec3.uPOV, // World Position (also position of camera/POV)

        uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = vsVars.uniform.mat4.uMVMatrix,

        uNMatrix = vsVars.uniform.mat3.uNMatrix; // Inverse-transpose normal matrix

        // Local link to easing function

        let easeIn = this.util.easeIn;

        let easeType = 0;

        // Set up directional lighting with the primary World light (see lights.es6 for defaults).

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 );

        let ambient = light0.ambient;

        let lightingDirection = light0.lightingDirection;

        let directionalColor = light0.directionalColor;

        // Inverse transpose matrix, created from Model-View matrix for lighting.

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = lightingDirection;

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

            let fade = prim.fade;

            let dir = fade.endAlpha - fade.startAlpha;

            let inc = 0.002;

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

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

            vec3.copy( adjustedLD, lightingDirection );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, MVM );

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

                    gl.uniform3fv( uAmbientColor, ambient );
                    gl.uniform3fv( uLightingDirection, adjustedLD );
                    gl.uniform3fv( uDirectionalColor, directionalColor );
                    gl.uniform3fv( uPOV, pov.position ); // used for specular highlight

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

                // Normals matrix (transpose inverse) uniform.

                gl.uniformMatrix3fv( vsVars.uniform.mat3.uNMatrix, false, nMatrix );

                // default material (other Shaders might use multiple materials).

                let m = prim.defaultMaterial;

                gl.uniform3fv( uMatEmissive, m.emissive );
                gl.uniform3fv( uMatAmbient, m.ambient ); // NOTE: transparent objects go in their own Shader
                gl.uniform3fv( uMatDiffuse, m.diffuse );
                gl.uniform3fv( uMatSpecular, m.specular );
                gl.uniform1f( uMatSpecExp, m.specularExponent );

                // Set normals matrix uniform (inverse transpose matrix).

                gl.uniformMatrix3fv( uNMatrix, false, nMatrix );

                // Set Perspective uniform.

                gl.uniformMatrix4fv( uPMatrix, false, PM );

                // Model-View matrix uniform.

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
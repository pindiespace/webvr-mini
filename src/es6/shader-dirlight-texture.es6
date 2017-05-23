import Shader from './shader'

'use strict'

class shaderDirLightTexture extends Shader {


    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 3
     * a directionally-lit textured object vertex shader.
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

        this.required.buffer.texCoords = true,

        this.required.buffer.normals = true,

        this.required.textures = 1,

        this.required.lights = 1;

        console.log( 'In ShaderDirLightTexture class' );

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

            'attribute vec3 ' + this.webgl.attributeNames.aVertexPosition[ 0 ] + ';',
            //'attribute vec4 ' + this.webgl.attributeNames.aVertexColor[ 0 ] + ';',
            'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',
            'attribute vec3 ' + this.webgl.attributeNames.aVertexNormal[ 0 ] + ';',

            //'uniform mat4 uMMatrix;',   // Model matrix
            'uniform mat4 uMVMatrix;',  // Model-View matrix
            'uniform mat4 uPMatrix;',   // Perspective matrix
            'uniform mat3 uNMatrix;',   // Inverse-transpose of Model-View matrix
            //'uniform mat4 uVMatrix;',  // View matrix

            // Directional lighting (from the World).

            'uniform bool uUseLighting;',

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;',
            'uniform vec3 uDirectionalColor;',

            // World position.

            'uniform vec3 uPOV;',

            // Material ambient, diffuse, specular (added in Fragment shader)

            //'uniform vec3 uMatAmbient;',
            //'uniform vec3 uMatDiffuse;',
            //'uniform vec3 uMatSpecular;',
            //'uniform float uMatSpecExp;',

            'varying vec3 vAmbientColor;',
            'varying vec3 vLightingDirection;',
            'varying vec3 vDirectionalColor;',

            'varying vec3 vPOV;',

            'varying vec4 vPositionW;',
            'varying vec4 vNormalW;',

            'varying mat4 vMVMatrix;',
            'varying vec3 vPosition;',

            // Holds result of lighting computations.

            'varying vec3 vLightWeighting;',


            // Texture coordinates.

            'varying vec2 vTextureCoord;',

            'void main(void) {',

            '    vAmbientColor = uAmbientColor;',
            '    vLightingDirection = uLightingDirection;',
            '    vDirectionalColor = uDirectionalColor;',

            // View-Model-Position-Projection matrix.

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            // Texture coordinate.

            '    vTextureCoord = aTextureCoord;',

            '    vPositionW = uMVMatrix * vec4(aVertexPosition, 1.0);', // Model-View Matrix (including POV / camera).

            '    vNormalW =  normalize(vec4(uNMatrix*aVertexNormal, 0.0));', // Inverse-transpose-normal matrix rotates object normals.

            '   if(!uUseLighting) {',

            '       vLightWeighting = vec3(1.0, 1.0, 1.0);',

            '   } else {',

            '       vec3 transformedNormal = uNMatrix * aVertexNormal;',

            '       float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);',

            '       vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;',

            '   }',

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

            // Enables some extensions in WebGL 1.0 (default in 2.0).

            //'#extension GL_EXT_shader_texture_lod : enable',
            //'#extension GL_OES_standard_derivatives : enable',

            // Set precision.

            this.floatp,

            // Uniforms.

            'uniform vec3 uMatEmissive;',
            'uniform vec3 uMatAmbient;',
            'uniform vec3 uMatDiffuse;',
            'uniform vec3 uMatSpecular;',
            'uniform float uMatSpecExp;',

            // Varying.

            'varying mat4 vMVMatrix;', // Model-View matrix.

            'varying vec4 vPositionW;',
            'varying vec4 vNormalW;',

            'varying vec3 vAmbientColor;',
            'varying vec3 vLightingDirection;', // uLightingDirection
            'varying vec3 vDirectionalColor;',

            'varying vec3 vPOV;', // world point of view (camera)

            'varying vec2 vTextureCoord;',

            'varying vec3 vLightWeighting;',

            'uniform sampler2D uSampler;',

            'vec3 fn ( vec3 invec ) {',
            ' return invec;',
            '}',

            // Main program.

            'void main(void) {',

            // Default texture color.

            '    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

            // Emissive.

            '    vec4 Emissive = vec4( uMatEmissive, 1.0);',

            // Ambient.

            '    vec4 Ambient = vec4(vAmbientColor, 1.0);',


            // Diffuse.

            '    vec4 N = normalize( vNormalW );',

            '    vec4 L = normalize( vec4(vLightingDirection, 1.0) - vPositionW );',
            '    vec4 LL = normalize( vec4(vLightingDirection, 1.0));',

            '    float NdotL = max( dot( N, LL ), 0.0 );',

            '    vec4 Diffuse =  NdotL * vec4( vDirectionalColor * uMatDiffuse, 1.0);',

            // Specular.

            '  vec4 EyePosW = vec4( vPOV, 1.0);', // world = eye = camera position.

            '   vec4 V = normalize( EyePosW - vPositionW  );', // if this is just vPositionW we get a highlight around edges in right place

            '   vec4 H = normalize( L + V );',

            '   vec4 R = reflect( -L, N );', // -L needed to bring to center. +L gives edges highlighted

            '   float RdotV = max( dot( R, V ), 0.0 );',
            '   float NdotH = max( dot( N, H ), 0.0 );',
            '   vec4 Specular = pow( RdotV, uMatSpecExp ) * pow(NdotH, uMatSpecExp) * vec4(vDirectionalColor * uMatSpecular, 1.0);',

            // Final fragment color.

            //'    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);',

            '    gl_FragColor =  ( Emissive + Ambient + Diffuse + Specular ) * vec4(textureColor.rgb, textureColor.a);',

            '}'

            ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 3, using texture buffer and lighting.
     * --------------------------------------------------------------------
     */

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} primList a list of initializing Prims (optional).
     */
    init ( primList ) {

        // DESTRUCTING DID NOT WORK!
        //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

        // TODO: since we are in Shader, we should be able to make local copies upon init.
        // TODO: don't pass in the shader-specific stuff, make local here.

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

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aTextureCoord = vsVars.attribute.vec2.aTextureCoord,

        aVertexNormal = vsVars.attribute.vec3.aVertexNormal, 

        uSampler = fsVars.uniform.sampler2D.uSampler,

        uUseLighting = vsVars.uniform.bool.uUseLighting,

        uAmbientColor = vsVars.uniform.vec3.uAmbientColor,

        uLightingDirection = vsVars.uniform.vec3.uLightingDirection, 

        uDirectionalColor = vsVars.uniform.vec3.uDirectionalColor,

        uNMatrix = vsVars.uniform.mat3.uNMatrix, // Inverse-transpose normal matrix

        uPMatrix = vsVars.uniform.mat4.uPMatrix, // Projection

        uMVMatrix = vsVars.uniform.mat4.uMVMatrix, // Model-View

        //uMMatrix = vsVars.uniform.mat4.uMMatrix, // Model matrix

        //uVMatrix = vsVars.uniform.mat4.uVMatrix, // View matrix

        uPOV = vsVars.uniform.vec3.uPOV; // World Position (also position of camera/POV)

        // Set up directional lighting with the primary World light.

        let lighting = !! this.required.lights;

        // Use just one light, diffuse illumination from World ( see lights.es6 for defaults).

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 );

        let ambient = light0.ambient;

        let lightingDirection = light0.lightingDirection;

        let directionalColor = light0.directionalColor;

        // Inverse transpose matrix, created from Model-View matrix for lighting.

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = lightingDirection;

        // Update prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

            // Update the model-view matrix for current Prim position, rotation, etc.

            prim.setMV( MVM ); // Model-View

            // Copy and adjust the World light.

            vec3.copy( adjustedLD, lightingDirection );

            // Calculates a 3x3 normal matrix (transpose inverse) from the Model-View matrix, so we don't have to in the Shader.

            mat3.normalFromMat4( nMatrix, MVM );

            // Custom updates go here, make local references to vsVars and fsVars.

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

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! prim || ! prim.textures[ 0 ] || ! prim.textures[ 0 ].texture ) continue;

                // Update Model-View matrix with standard Prim values.

                program.update( prim, mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( aVertexPosition );
                gl.vertexAttribPointer( aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

                // Bind textures buffer (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( aTextureCoord );
                gl.vertexAttribPointer( aTextureCoord, 2, gl.FLOAT, false, 0, 0 );

                // Bind normals buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.normals.buffer );
                gl.enableVertexAttribArray( aVertexNormal );
                gl.vertexAttribPointer( aVertexNormal, 3, gl.FLOAT, false, 0, 0);

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, prim.textures[ 0 ].texture );

                // Bind additional texture units.

                // Send the DEFAULT material to the Shader (other Shaders might use multiple materials).

                let m = prim.defaultMaterial;

                gl.uniform3fv( fsVars.uniform.vec3.uMatEmissive, m.emissive );
                gl.uniform3fv( fsVars.uniform.vec3.uMatAmbient, m.ambient );
                gl.uniform3fv( fsVars.uniform.vec3.uMatDiffuse, m.diffuse );
                gl.uniform3fv( fsVars.uniform.vec3.uMatSpecular, m.specular );
                gl.uniform1f( fsVars.uniform.float.uMatSpecExp, m.specularExponent )
                //console.log('prim.defaultMaterial.specularExponent:' + prim.defaultMaterial.specularExponent)

                // Set fragment shader sampler uniform.

                gl.uniform1i( uSampler, 0 );

                // Lighting flag.

                gl.uniform1i( uUseLighting, lighting );

                // World lighting

                if ( lighting ) {

                    gl.uniform3fv( uAmbientColor, ambient );
                    gl.uniform3fv( uLightingDirection, adjustedLD );
                    /////gl.uniform3fv( uLightingDirection, lightingDirection );
                    gl.uniform3fv( uDirectionalColor, directionalColor );

                    gl.uniform3fv( uPOV, pov.position ); /////////ADDED POV POSITON TO SHADER.

                }

                // Set normals matrix uniform (inverse transpose matrix).

                gl.uniformMatrix3fv( uNMatrix, false, nMatrix );

                // Set Perspective uniform.

                gl.uniformMatrix4fv( uPMatrix, false, PM );

                // Model-View matrix uniform.

                gl.uniformMatrix4fv( uMVMatrix, false, mvMatrix );

                // Set View matrix uniform.

                //gl.uniformMatrix4fv( uVMatrix, false, vMatrix );

                // Set Model matrix uniform.

                //gl.uniformMatrix4fv( uMMatrix, false, mMatrix );

                // Bind indices buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, prim.geometry.indices.buffer );

                if ( stats.uint32 ) { 

                    // Draw elements, 0 -> 2e9

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_INT, 0 );


                } else {

                    // Draw elements, 0 -> 65k (old platforms).

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0 );

                }

                // Copy back the original MVM (with no local Prim transforms) for the next Prim. 

                mat4.copy( mvMatrix, saveMV, mvMatrix );

            } // end of renderList for Prims

            // Disable buffers that might cause problems in another Prim.


        } // end of program.render()

        return program;

    } // end if init()

}

export default shaderDirLightTexture;
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

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'uniform mat3 uNMatrix;',

            'uniform bool uUseLighting;',

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;',
            'uniform vec3 uDirectionalColor;',

            'varying vec2 vTextureCoord;',
            'varying vec3 vLightWeighting;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vTextureCoord = aTextureCoord;',

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

            this.floatp,

            'varying vec2 vTextureCoord;',

            'varying vec3 vLightWeighting;',

            'uniform sampler2D uSampler;',

            'void main(void) {',

            '    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

            '    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);',

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

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aTextureCoord = vsVars.attribute.vec2.aTextureCoord,

        aVertexNormal = vsVars.attribute.vec3.aVertexNormal, 

        uSampler = fsVars.uniform.sampler2D.uSampler,

        uUseLighting = vsVars.uniform.bool.uUseLighting,

        uAmbientColor = vsVars.uniform.vec3.uAmbientColor,

        uLightingDirection = vsVars.uniform.vec3.uLightingDirection, 

        uDirectionalColor = vsVars.uniform.vec3.uDirectionalColor,

        uNMatrix = vsVars.uniform.mat3.uNMatrix,

        uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = vsVars.uniform.mat4.uMVMatrix;

        // Set up directional lighting with the primary World light.

        let lighting = true;

        // Use just one light, diffuse illumination from World ( see lights.es6 for defaults).

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 );

        let ambient = light0.ambient;

        let lightingDirection = light0.lightingDirection;

        let directionalColor = light0.directionalColor;

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = vec3.create(); // TODO: redo

        // Update prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

            // Compute lighting normals.

            vec3.normalize( adjustedLD, lightingDirection );

            vec3.scale( adjustedLD, adjustedLD, -1 );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, MVM );

            // Custom updates go here, make local references to vsVars and fsVars.

        }

        // Prim rendering - Shader in ShaderPool, rendered by World.

        program.render = ( PM, MVM ) => {

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            let saveMV = mat4.clone( MVM );

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! prim || ! prim.textures[ 0 ] || ! prim.textures[ 0 ].texture ) continue;

                // Update Model-View matrix with standard Prim values.

                program.update( prim, MVM );

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

                // Set fragment shader sampler uniform.

                gl.uniform1i( uSampler, 0 );

                // Lighting flag.

                gl.uniform1i( uUseLighting, lighting );

                if ( lighting ) {

                    gl.uniform3f( uAmbientColor, ambient[ 0 ], ambient[ 1 ], ambient[ 2 ] );
                    gl.uniform3fv( uLightingDirection, adjustedLD );
                    gl.uniform3f( uDirectionalColor, directionalColor[ 0 ], directionalColor[ 1 ], directionalColor[ 2 ] );

                }

                // Set normals matrix uniform.

                gl.uniformMatrix3fv( uNMatrix, false, nMatrix );

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( uPMatrix, false, PM );
                gl.uniformMatrix4fv( uMVMatrix, false, MVM );

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

            // Disable buffers that might cause problems in another Prim.



        } // end of program.render()

        //gl.bindBuffer( gl.ARRAY_BUFFER, null );
        //gl.disableVertexAttribArray( vsVars.attribute.vec3.aVertexNormal );
        //gl.disableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );

        return program;

    } // end if init()

}

export default shaderDirLightTexture;
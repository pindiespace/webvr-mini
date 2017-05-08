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

            'attribute vec3 aVertexPosition;',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',

            // texture 

            'attribute vec2 aTextureCoord;',
            'attribute vec4 aVertexColor;',

            // color

            'varying lowp vec4 vColor;',

            // lighting 

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;',
            'uniform vec3 uDirectionalColor;',

            // passed to fragment shader

            'varying vec2 vTextureCoord;',
            'varying vec3 vLightWeighting;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vTextureCoord = aTextureCoord;',

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

            this.floatp,

            // render flags

            'uniform bool uUseLighting;',
            'uniform bool uUseTexture;',
            'uniform bool uUseColor;',

            // texture

            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',

            // lighting

            'varying vec3 vLightWeighting;',

            // alpha fade value

            'uniform float uAlpha;',

            // passed in from vertex shader

            'varying lowp vec4 vColor;',

            'void main(void) {',

                'float vLightWeighting = 1.0;',

                'if (uUseColor) {',

                    'gl_FragColor = vec4(vColor.rgb * vLightWeighting, uAlpha);',

                '}',

                'else if(uUseTexture) {',

                    'vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

                    'gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);',

                '}',


                //'gl_FragColor = vec4(vColor.rgb * vLightWeighting, uAlpha);',

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

        // We received webgl in the constructor, and gl above is referenced from it.

        // Make additional locals references.

        // TODO: MAKE THEM, AND CHECK IF PERFORMANCE IS IMPROVED....

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        // If we init with a primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }


        /** 
         * POLYMORPHIC METHODS
         */

        // Set our global (to the Prim) alpha value.

        let alpha = 0.01;

        // Use just the primary World light (see lights.es6 for defaults).

        let lighting = true; // DEFAULT ONLY

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 );

        let ambient = light0.ambient;

        let lightingDirection = light0.lightingDirection;

        let directionalColor = light0.directionalColor;

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = vec3.create(); // TODO: redo

        let altRender = 0;

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

                let fade = prim.fade;

                let dir = fade.endAlpha - fade.startAlpha;

                let inc = 0.005;

                if ( dir > 0 ) {

                    prim.alpha += inc;

                    if ( prim.alpha >= fade.endAlpha ) {

                        prim.alpha = fade.endAlpha;

                        //////console.log("ShaderFader::update(): faded UP, switch shader from:" + prim.shader.name + ' to:' + prim.defaultShader.name ) 

                        prim.shader.movePrim( prim, prim.defaultShader );

                    }

                } else if ( dir < 0 ) {

                    prim.alpha -= inc;

                    if ( prim.alpha <= fade.endAlpha ) {

                        prim.alpha = fade.endAlpha;

                        //////console.log("ShaderFader::update(): faded DOWN, switch shader from:" + prim.shader.name + ' to:' + prim.defaultShader.name ) 

                        prim.shader.movePrim( prim, prim.defaultShader );

                    }

                }

                alpha = prim.alpha;

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

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
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, prim.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                // Set our alpha.

                gl.uniform1f( fsVars.uniform.float.uAlpha, alpha );

                if ( prim.defaultShader.required.textures > 0 ) {

                    gl.uniform1i( fsVars.uniform.bool.uUseColor, 0 );
                    gl.uniform1i( fsVars.uniform.bool.uUseTexture, 1 );
                    gl.uniform1i( fsVars.uniform.bool.uUseLighting, 0 );

                    // Bind the texture buffer (could have multiple bindings here).

                    gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.texCoords.buffer );
                    gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                    gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, prim.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                    // Bind the first texture.

                    gl.activeTexture( gl.TEXTURE0 );
                    gl.bindTexture( gl.TEXTURE_2D, null );
                    gl.bindTexture( gl.TEXTURE_2D, prim.textures[ 0 ].texture );

                    // Other texture units below.

                    // Set fragment shader sampler uniform.

                    gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 );


                } else if ( prim.defaultShader.required.textures === 0 ) {

                    // Drawing flags for color array.

                    gl.uniform1i( fsVars.uniform.bool.uUseColor, 1 );
                    gl.uniform1i( fsVars.uniform.bool.uUseTexture, 0 );
                    gl.uniform1i( fsVars.uniform.bool.uUseLighting, 0 );

                    // Bind color buffer.

                    gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.colors.buffer );
                    gl.enableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
                    gl.vertexAttribPointer( vsVars.attribute.vec4.aVertexColor, prim.geometry.colors.itemSize, gl.FLOAT, false, 0, 0 );

                }

                // Bind perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, PM );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, MVM );

                // Bind indices buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, prim.geometry.indices.buffer );

                if ( stats.uint32 ) {

                    // Draw elements, 0 -> 2e9

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_INT, 0 );


                } else {

                    // Draw elements, 0 -> 65k (old platforms).

                    gl.drawElements( gl.TRIANGLES, prim.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0 );

                }

                // NOTE: since we bound BOTH texture and color arrays, we MUST clear them both!

                gl.bindBuffer( gl.ARRAY_BUFFER, null );
                gl.disableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                gl.disableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );              

                // Copy back the original for the next Prim. 

                mat4.copy( MVM, saveMV, MVM );

            } // end of renderList for Prims

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderFader;
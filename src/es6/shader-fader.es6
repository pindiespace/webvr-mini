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

        super( init, util, glMatrix, webgl, webvr, shaderName );

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
            'attribute vec2 aTextureCoord;',
            'attribute vec4 aVertexColor;',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',

            'varying vec2 vTextureCoord;',
            'varying lowp vec4 vColor;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vTextureCoord = aTextureCoord;',

            '    vColor = aVertexColor;',

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

            // 'precision mediump float;',

            this.floatp,

            'varying vec2 vTextureCoord;',
            'uniform sampler2D uSampler;',

            'uniform float uAlpha;',

            'uniform bool uUseLighting;',
            'uniform bool uUseTexture;',
            'uniform bool uUseColor;',

            'float vLightWeighting = 1.0;',

            'varying lowp vec4 vColor;',

            'void main(void) {',

            '   if (uUseColor) {',

                  'gl_FragColor = vec4(vColor.rgb * vLightWeighting, uAlpha);',

            '   } ',

            'else if(uUseTexture) {',

            '      vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

            '      gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);',

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

        pMatrix = arr[5],

        mvMatrix = arr[6],

        program = arr[7],

        vsVars = arr[8],

        fsVars = arr[9], 

        stats = arr[ 10 ],

        near = arr[ 11 ],

        far = arr[ 12 ],

        vr = arr[ 13 ];

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        // If we init with a primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }

        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
        // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
        // TODO: http://max-limper.de/tech/batchedrendering.html

        /** 
         * POLYMORPHIC METHODS
         */

        // Set our global (to the Prim) alpha value.

        let alpha = 0.01;

        // Check if Prim is ready to be rendered using this shader.

        program.isReady =  ( prim ) => {

            // Need 1 WebGL texture for rendering, no Lights.

            if ( ! prim.geometry.checkBuffers() && ( prim.textures[ 0 ] && prim.textures[ 0 ].texture || prim.geometry.colors.buffer ) ) {

                return true;

            }

            return false;

        }

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM ) => {

                let fade = prim.fade;

                //////console.log('alpha:' + alpha + ' startAlpha:' + fade.startAlpha + ' endAlpha:' + fade.endAlpha );

                //////console.log('shader:' + prim.shader.name + ' default:' + prim.defaultShader.name)

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

        // Rendering.

        program.render = ( PM, MVM ) => {

            gl.useProgram( shaderProgram );

            gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );

            //gl.depthFunc( gl.NEVER );      // Ignore depth values (Z) to cause drawing bottom to top

            //gl.disable( gl.DEPTH_TEST );

            // Save the model-view supplied by the shader. Mono and VR return different MV matrices.

            let saveMV = mat4.clone( MVM );

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];


                // Only render if we have at least one texture loaded.

                if ( ! prim ) continue;

                // Individual Prim update.

                program.update( prim, MVM );

                // Bind vertex buffer.

                if ( prim.name == 'regulartetrahedron' ) {

                    //console.log( prim.name + ' atexturecoord:' + vsVars.attribute.vec2.aTextureCoord + ' acolorcoord:' + vsVars.attribute.vec4.aVertexColor)
                    //console.log( 'texCoords:' + prim.geometry.texCoords.buffer + ' len:' + prim.geometry.texCoords.data.length )
                    //console.log( 'colors:' + prim.geometry.colors.buffer + ' len:' + prim.geometry.colors.data.length )
                    //console.log("test numVertices:" + prim.geometry.numVertices() + ' colors:' + prim.geometry.numColors() + ' texcoords:' + prim.geometry.numTexCoords() )
                    
                }

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, prim.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                if ( prim.textures[ 0 ] && prim.textures[ 0 ].texture ) {

                    // Set conditional uniforms for rendering different kinds of Prims (e.g. only color array defined)

                    gl.uniform1i( fsVars.uniform.bool.uUseColor, 0 );
                    gl.uniform1i( fsVars.uniform.bool.uUseTexture, 1 );
                    gl.uniform1i( fsVars.uniform.bool.uUseLighting, 0 );

                    // Bind Textures buffer (could have multiple bindings here).

                    gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.texCoords.buffer );
                    gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                    gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, prim.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                    gl.activeTexture( gl.TEXTURE0 );
                    gl.bindTexture( gl.TEXTURE_2D, null );
                    gl.bindTexture( gl.TEXTURE_2D, prim.textures[ 0 ].texture );

                    // Set fragment shader sampler uniform.

                    gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 );

                }  else {

                    // Bind color buffer.

                    //console.log('binding color buffer for:' + prim.name + ' vertex attribute:' + vsVars.attribute.vec4.aVertexColor + ' vertices:' + prim.geometry.vertices.data.length + ' vertices buffer:' + prim.geometry.vertices.buffer + ' color glbuffer:' + prim.geometry.colors.buffer)

                    gl.uniform1i( fsVars.uniform.bool.uUseColor, 1 );
                    gl.uniform1i( fsVars.uniform.bool.uUseTexture, 0 );
                    gl.uniform1i( fsVars.uniform.bool.uUseLighting, 0 );

                    gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.colors.buffer );
                    gl.enableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
                    gl.vertexAttribPointer( vsVars.attribute.vec4.aVertexColor, prim.geometry.colors.itemSize, gl.FLOAT, false, 0, 0 );

                }

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, PM );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, MVM );

                // Set our alpha.

                gl.uniform1f( fsVars.uniform.float.uAlpha, alpha );

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

                mat4.copy( MVM, saveMV, MVM );

            } // end of renderList for Prims

            // Reset the rendering defaults.

            this.webgl.glDefaults();

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderFader;
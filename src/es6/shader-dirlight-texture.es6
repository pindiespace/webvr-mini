import Shader from './shader'

class shaderDirLightTexture extends Shader {

    constructor ( init, util, glMatrix, webgl, shaderName ) {

        super( init, util, glMatrix, webgl, shaderName );

        this.needIndices = true;

        this.needTexCoords = true;

        this.needColors = false;

        this.needNormals = true;

        this.needTangents = false;

        this.needLights = true;

        console.log( 'In ShaderTexture class' );

    }

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
    vsSrc () {

        let s = [

            'attribute vec3 aVertexPosition;',
            'attribute vec3 aVertexNormal;',
            'attribute vec2 aTextureCoord;',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'uniform mat3 uNMatrix;',

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;',
            'uniform vec3 uDirectionalColor;',

            'uniform bool uUseLighting;', // TODO: remove?

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

            varList: this.gl.createVarList( s )

        };

    }


    /** 
     * a default-lighting textured object fragment shader.
     * - varying texture coordinate
     * - texture 2D sampler
     */
    fsSrc () {

        let s =  [

            //'precision mediump float;',

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

            varList: this.gl.createVarList( s )

        };

    }

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 3, using texture buffer and lighting.
     * --------------------------------------------------------------------
     */

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} objList a list of initializing Prims (optional).
     */
    init ( objList ) {

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

        far = arr[ 12 ];

        // Shorter reference.

        let shaderProgram = program.shaderProgram;

        // If we init with object, add them here.

        if ( objList ) {

            program.renderList = this.util.concatArr( program.renderList, objList );

        }

        // TODO: TEMPORARY ADD LIGHTING CONTROL

        let lighting = true;

        let ambient = [ 0.1, 0.1, 0.1 ]; // ambient colors WORKING

        let lightingDirection = [  //TODO: REDO
            -0.25,
            -0.5,
            -0.1
        ];

        let directionalColor = [ 0.7, 0.7, 0.7];

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = vec3.create(); // TODO: redo

        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
        // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
        // TODO: http://max-limper.de/tech/batchedrendering.html

        /** 
         * POLYMORPHIC METHODS
         */

        // Update object position, motion - given to World object.

        program.update = ( obj ) => {

            // Standard mvMatrix updates.

            obj.setMV( mvMatrix );

            // Compute lighting normals.

            vec3.normalize( adjustedLD, lightingDirection );

            vec3.scale( adjustedLD, adjustedLD, -1 );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, mvMatrix );

            // glmat3 library
            //mat4.normalFromMat4( nMatrix, mvMatrix );

            // Custom updates go here, make local references to vsVars and fsVars.

        }

        // Rendering - given to Renderer object, executed by World.

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( shaderProgram );

            // Reset perspective matrix.

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, near, far ); // right

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let obj = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! obj.textures[0] || ! obj.textures[0].texture ) continue;

                // Update Model-View matrix with standard Prim values.

                program.update( obj, mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.vertices.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                // Bind normals buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.normals.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexNormal );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexNormal, obj.geometry.normals.itemSize, gl.FLOAT, false, 0, 0);

                // Bind textures buffer (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, obj.textures[0].texture );

                // Set fragment shader sampler uniform.

                gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 );

                // Lighting flag.

                gl.uniform1i( vsVars.uniform.bool.uUseLighting, lighting );

                if ( lighting ) {

                    gl.uniform3f(
                        vsVars.uniform.vec3.uAmbientColor,
                        ambient[0],
                        ambient[1],
                        ambient[2]
                    );

                    gl.uniform3fv( 
                        vsVars.uniform.vec3.uLightingDirection, 
                        adjustedLD 
                    );

                    gl.uniform3f(
                        vsVars.uniform.vec3.uDirectionalColor,
                        directionalColor[0],
                        directionalColor[1],
                        directionalColor[2]
                    );

                }

                // Normals matrix uniform

                gl.uniformMatrix3fv( vsVars.uniform.mat3.uNMatrix, false, nMatrix );

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, mvMatrix );

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

                if ( stats.uint32 ) { 

                    // Draw elements, 0 -> 2e9

                    gl.drawElements( gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_INT, 0 );


                } else {

                    // Draw elements, 0 -> 65k (old platforms).

                    gl.drawElements( gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0 );

                }

            }

        }

        return program;

    }

}

export default shaderDirLightTexture;
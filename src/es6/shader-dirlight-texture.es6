import Shader from './shader'

export default class ShaderDirlightTexture extends Shader {

    constructor ( init, util, glMatrix, webgl, prim ) {

        super( init, util, glMatrix, webgl, prim );

        console.log( 'In ShaderTexture class' );

    }

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

            '   if(uUseLighting) {',

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

            'precision mediump float;',

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
    init ( objList ) {

        // DESTRUCTING DID NOT WORK!
        //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

        let arr = this.setup();
        let gl = arr[0];
        let canvas = arr[1];
        let mat4 = arr[2];
        let mat3 = arr[3];
        let vec3 = arr[4];
        let pMatrix = arr[5];
        let mvMatrix = arr[6];
        let program = arr[7];
        let vsVars = arr[8];
        let fsVars = arr[9];

        window.vsVars = vsVars; ////////////////////////////
        window.fsVars = fsVars;

        // TODO: TEMPORARY ADD LIGHTING CONTROL

        let lighting = true;

        let ambient = [ 100, 10, 20 ]; // ambient colors

        let direction = [ 1, 1, 1 ]; // light direction

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let lightingDirection = [  //TODO: REDO
            1,
            1,
            1
        ];

        let adjustedLD = vec3.create(); // TODO: redo

        vec3.normalize( lightingDirection, adjustedLD );

        vec3.scale( adjustedLD, -1 );

        // Attach objects.

        program.renderList = objList || [];

        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
        // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
        // TODO: http://max-limper.de/tech/batchedrendering.html

        // Update object position, motion.

        program.update = ( obj ) => {

            // Standard mvMatrix updates.

            obj.setMV( mvMatrix );

            mat4.toInverseMat3( mvMatrix, nMatrix );

            mat3.transpose( nMatrix );

            // Custom updates go here.

        }

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( program.shaderProgram );

            // Reset perspective matrix.

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

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

                gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.normals.buffer );
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, obj.geometry.normals.itemSize, gl.FLOAT, false, 0, 0);

                // Bind Textures buffer (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, obj.textures[0].texture );

                // Set fragment shader sampler uniform.

                gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 );

                // Lighting flag.

                gl.uniform1i( vsVars.attribute.bool.useLightingUniform, lighting );

                if ( lighting ) {

                    // Lighting color uniform.

                    gl.uniform3f(
                        vsVars,attribute.vec3.ambientColorUniform,
                        ambient[0],
                        ambient[1],
                        ambient[2]
                    );

                    gl.uniform3f(
                        vsVars.attribute.vec3.directionalColorUniform,
                        direction[0],
                        direction[1],
                        direction[2]
                        );

                    vec3.normalize( lightingDirection, adjustedLD );
                    vec3.scale( adjustedLD, -1 );
                    gl.uniform3fv( vsVars.attribute.vec3.lightingDirectionUniform, adjustedLD );

                }

                // Normals matrix uniform

                gl.uniformMatrix3fv( vsVars.attribute.vec3.nMatrixUniform, false, nMatrix );

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, mvMatrix );

                // Bind index buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

                // Draw elements.

                gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);

            }

        }

        return program;

    }

}
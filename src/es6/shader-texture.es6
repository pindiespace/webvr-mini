import Shader from './shader'

class ShaderTexture extends Shader {

    constructor ( init, util, glMatrix, webgl, shaderName ) {

        super( init, util, glMatrix, webgl, shaderName );

        console.log( 'In ShaderTexture class' );

    }

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 1
     * a default-lighting textured object vertex shader.
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */
    vsSrc () {

        let s = [

            'attribute vec3 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

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

            // 'precision mediump float;',

            this.floatp,

            'varying vec2 vTextureCoord;',

            'uniform sampler2D uSampler;',

            'void main(void) {',

            '    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

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

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        window.vs1Vars = vsVars; /////////////////////////////////////////////////////////

        program.renderList = program.renderList || objList || [];

        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
        // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
        // TODO: http://max-limper.de/tech/batchedrendering.html

        // Update object position, motion.

        program.update = ( obj ) => {

            // Standard Model-View (mvMatrix) updates, per Prim.

            obj.setMV( mvMatrix );

            // Custom updates go here.

        }

        // Rendering.

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( shaderProgram );

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

                // Bind Textures buffer (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, obj.textures[0].texture );

                // Set fragment shader sampler uniform.

                gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 ); //STRANGE

                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, mvMatrix );

                // Bind index buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

                // Draw elements.

                if ( webgl.stats.uint32 ) {

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

export default ShaderTexture;
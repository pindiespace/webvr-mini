import Shader from './shader'

export default class ShaderTexture extends Shader {

    constructor ( init, util, glMatrix, webgl ) {

        super( init, util, glMatrix, webgl );

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

            'precision mediump float;',

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
        let vec3 = arr[3];
        let pMatrix = arr[4];
        let mvMatrix = arr[5];
        let program = arr[6];
        let vsVars = arr[7];
        let fsVars = arr[8];

        // Attach objects.

        program.renderList = objList || [];

        program.update = ( obj ) => {

            if ( ! obj ) {

                console.error( 'ShaderTexture: no object supplied for update' );

                return;

            }

            // Reset.

            mat4.identity( mvMatrix );

            // Translate.

            vec3.add( obj.position, obj.position, obj.acceleration );

            mat4.translate( mvMatrix, mvMatrix, [ obj.position[ 0 ], obj.position[ 1 ], z + obj.position[ 2 ] ] );

            // If orbiting, set orbit.

            // Rotate.

            vec3.add( obj.rotation, obj.rotation, obj.angular );

            mat4.rotate( mvMatrix, mvMatrix, obj.rotation[ 0 ], [ 1, 0, 0 ] );
            mat4.rotate( mvMatrix, mvMatrix, obj.rotation[ 1 ], [ 0, 1, 0 ] );
            mat4.rotate( mvMatrix, mvMatrix, obj.rotation[ 2 ], [ 0, 0, 1 ] );

        }

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( program.shaderProgram );

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

            // Begin program loop

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let obj = program.renderList[ i ];

                // Only render if we have at least one texture loaded.

                if ( ! obj.textures[0] || ! obj.textures[0].texture ) continue;

                this.update( obj, this.mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.vertices.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                // Bind Textures (could have multiple bindings here).

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec2.aTextureCoord );
                gl.vertexAttribPointer( vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0 );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, null );
                gl.bindTexture( gl.TEXTURE_2D, obj.textures[0].texture );

                // Set fragment shader sampler uniform.

                gl.uniform1i( fsVars.uniform.sampler2D.uSampler, 0 ); //STRANGE

                // Set matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, this.pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, this.mvMatrix );

                // Bind index buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

                // Draw elements.

                gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);

            }

        }

        return program;

    }

}
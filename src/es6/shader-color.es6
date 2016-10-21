import Shader from './shader'

export default class ShaderColor extends Shader {

    constructor ( init, util, glMatrix, webgl, prim ) {

        super( init, util, glMatrix, webgl, prim );

        console.log( 'In ShaderColor class' );

    }

    vsSrc () {

        let s = [

            'attribute vec3 aVertexPosition;',
            'attribute vec4 aVertexColor;',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',

            'varying lowp vec4 vColor;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

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

            'varying lowp vec4 vColor;',

            'void main(void) {',

                //'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',

                'gl_FragColor = vColor;',

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

        // Get locations of shader variables.

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

        // Update object position, motion.

        program.update = ( obj ) => {

            // Standard mvMatrix updates.

            obj.setMV( mvMatrix );

            // Custom updates go here.

        }

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( program.shaderProgram );

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let obj = program.renderList[ i ];

                program.update( obj, mvMatrix );

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.vertices.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                // Bind color buffer.

                gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.colors.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
                gl.vertexAttribPointer(vsVars.attribute.vec4.aVertexColor, obj.geometry.colors.itemSize, gl.FLOAT, false, 0, 0);

                // Bind indices buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

                // Set matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, this.pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, this.mvMatrix );

                // Draw elements.

                gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);

            }

        }

        return program;

    }

}
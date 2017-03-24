import Shader from './shader'

class ShaderColor extends Shader {

    constructor ( init, util, glMatrix, webgl, shaderName ) {

        super( init, util, glMatrix, webgl, shaderName );

        // Define arrays that are needed for this shader.

        this.needIndices = true;

        this.needTexCoords = false;

        this.needColors = true;

        this.needNormals = false;

        this.needTangents = false;

        console.log( 'In ShaderColor class' );

    }

    /* 
     * Vertex and Fragment Shaders. We use the internal 'program' object to compile these. Alternatively,
     * They may be defined to load from HTML or and external file.
     * @return {Object} an object, with
     * code: The shader code.
     * varList: A scanned list of all the variables in the shader code.
     */
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

        stats = arr[ 10 ];

        // We received webgl in the constructor, and gl above is referenced from it.

        // Make additional locals references.

        // TODO: MAKE THEM, AND CHECK IF PERFORMANCE IS IMPROVED....

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        // If we init with object, add them here.

        if ( objList ) {

            program.renderList = this.util.concatArr( program.renderList, objList );

        }


        // TODO: ADD CHECK ROUTINE TO ENSURE THAT PRIM IS VALID HERE!!!!!!!!!!!!!!!!

        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html

        /** 
         * POLYMORPHIC METHODS
         */

        // Update object position, motion - given to World object.

        program.update = ( obj ) => {

            // Standard mvMatrix updates.

            obj.setMV( mvMatrix );

            // Custom updates go here.

        }

        // Rendering.

        program.render = () => {

            //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

            gl.useProgram( shaderProgram );

            // Reset perspective matrix.

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

            // Loop through assigned objects.

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let obj = program.renderList[ i ];

                // Update Model-View matrix with standard Prim values.

                program.update( obj, mvMatrix );

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, obj.geometry.vertices.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
                gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

                // Bind color buffer.

                gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.colors.buffer );
                gl.enableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
                gl.vertexAttribPointer(vsVars.attribute.vec4.aVertexColor, obj.geometry.colors.itemSize, gl.FLOAT, false, 0, 0);
                //gl.disableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );


                // Set perspective and model-view matrix uniforms.

                gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, pMatrix );
                gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, mvMatrix );

                // Bind indices buffer.

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

export default ShaderColor;
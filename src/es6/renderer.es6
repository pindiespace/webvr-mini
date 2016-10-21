export default class Renderer {

    constructor ( init, util, glMatrix, webgl, shaderTexture, shaderColor ) {

        console.log( 'In Renderer class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.shaderTexture = shaderTexture;

        window.shaderTexture = shaderTexture;

        this.shaderColor = shaderColor;

        // Constants.

        this.renderNames = {

            vs1: 'vs1',             // textured',

            vs2: 'vs2',             // colored',

            vs3: 'vs3',             // directional texturedLight',

            vs4: 'vs4',             //water'

        }

        if( this.init ) {

        }

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
    objVS1 () {

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
    objFS1 () {

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
     * VS2 - COLOR BUT NO TEXTURE
     * a default-lighting colored object vertex shader.
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */
    objVS2 () {

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

    objFS2 () {

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

    /* 
     * Renderers.
     * GREAT description of model, view, projection matrix
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
     * 
     * Using vertex arrays:
     * @link http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
     * 
     * WebGL Stack
     * @link https://github.com/stackgl
     * 
     * Superfast Advanced Batch Processing
     * http://max-limper.de/tech/batchedrendering.html
     * 
     * GLSL Sandbox
     * http://mrdoob.com/projects/glsl_sandbox/
     * 
     * Basic MVC
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
     */

    clear () {

        let gl = this.webgl.getContext();

         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: these can be set once unless window resize

        gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

    }

    /** 
     * this function handles all the rotation and translations
     */
    update ( obj, mvMatrix ) {

        let mat4 = this.glMatrix.mat4;

        let vec3 = this.glMatrix.vec3;

        let z = -5; // TODO: CONSTANT SO IT IS DRAWN CORRECTLY

        // Reset.

        mat4.identity( this.mvMatrix );

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

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 1, using texture buffer.
     * --------------------------------------------------------------------
     */
    initVS1 ( objList ) {

        let gl = this.webgl.getContext();

        this.vs1 = {};

        this.vs1.program = this.webgl.createProgram( this.objVS1(), this.objFS1() );

        let program = this.vs1.program;

        // Attach objects.

        program.renderList = objList || [];

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

        return program;

    }

    renderVS1 ( objList ) {

        // Common to all renderers.

        let gl = this.webgl.getContext();

        let canvas = this.webgl.getCanvas();

        let mat4 = this.glMatrix.mat4;

        let vec3 = this.glMatrix.vec3;

        let program = this.vs1.program;

        let vsVars = program.vsVars;

        let fsVars = program.fsVars;

        gl.useProgram( program.shaderProgram );

        ///////////////gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: these can be set once unless window resize

        /////////////////////gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

        mat4.perspective( this.pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

        // Begin program loop

        let len = program.renderList.length;

        for ( let i = 0; i < len; i++ ) {

            let obj = program.renderList[ i ];

            // If the texture isn't loaded yet, continue.

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

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 2, using color buffer but not texture.
     * --------------------------------------------------------------------
     */
    initVS2 ( objList ) {

        let gl = this.webgl.getContext();

        this.vs2 = {};

        this.vs2.program = this.webgl.createProgram( this.objVS2(), this.objFS2() );

        let program = this.vs2.program;

        // Attach objects.

        program.renderList = objList || [];

        // Get locations of shader variables.

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

        return program;

    }

    renderVS2 () {

        // Common to all renderers.

        let gl = this.webgl.getContext();

        let canvas = this.webgl.getCanvas();

        let mat4 = this.glMatrix.mat4;

        let vec3 = this.glMatrix.vec3;

        let program = this.vs2.program;

        let vsVars = program.vsVars;

        let fsVars = program.fsVars;

        gl.useProgram( program.shaderProgram );

        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: these can be set once unless window resize

       // gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

        mat4.perspective( this.pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

        // Begin program loop

        let len = program.renderList.length;

        for ( let i = 0; i < len; i++ ) {

            let obj = program.renderList[ i ];

            // If the texture isn't loaded yet, continue.

            this.update( obj, this.mvMatrix );

            // Bind vertex buffer.

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

        } // end of loop.

        //requestAnimationFrame( () => { this.renderVS2() } );

    }

}
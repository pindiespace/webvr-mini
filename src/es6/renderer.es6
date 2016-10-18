export default class Renderer {

	constructor ( init, util, glMatrix, webgl ) {

		console.log( 'In Renderer class' );

		this.webgl = webgl;

        this.util = webgl.util;

        this.glMatrix = webgl.glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        // Constants

        this.shaders = {

            vs1: 'VS1',

            vs2: 'VS2'

        }

        if( this.init ) {

        	// do something

        }

	}

    /** 
     * Set up a rendering array of objects, based on available shaders. Objects 
     * are added to the render list by the Prim object, with World specifying 
     * the Prims to use.
     */
    setRenderArray () {

        let i, shaders = this.shaders, renderList = this.renderList;

        for ( i in shaders ) {

            renderList[ i ] = [];

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

            varList: this.webgl.createVarList( s ),

            render: function () {}

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

            varList: this.webgl.createVarList( s ),

            render: function () {}

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
     */

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 1, using texture buffer.
     * --------------------------------------------------------------------
     */
    initVS1 ( objs ) {


        let gl = this.webgl.getContext();

        this.vs1 = {};

        this.vs1.program = this.webgl.createProgram( this.objVS1(), this.objFS1() );

        let program = this.vs1.program;

        program.renderList = objs;

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

       // temporary rotation
        this.xRot = 0.0001;
        this.yRot = 0.0001;
        this.zRot = 0.0001;

    }

    renderVS1 () {

        let gl = this.webgl.getContext();

        let canvas = this.webgl.getCanvas();

        let mat4 = this.glMatrix.mat4;

        let vec3 = this.glMatrix.vec3;

        let program = this.vs1.program;

        gl.useProgram( program.shaderProgram );

        let vsVars = program.vsVars;

        let fsVars = program.fsVars;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: these can be set once unless window resize

        gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

        mat4.perspective( this.pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

        let dX = 1;
        let dY = 1;
        let dZ = 1;

        //this.xRot += dX;
        this.yRot += dY;
        this.zRot += dZ;

        let z = -5; //TODO: NOT RENDERING AT 0 or 2, INVISIBLE BEYOND A CERTAIN DISTANCE INTO SCREEN!!!!!

        // Update world information.

        /////////////this.update();

        //console.log('.')

        let len = program.renderList.length;

        for ( let i = 0; i < len; i++ ) {

            let obj = program.renderList[ i ];

            // If the texture isn't loaded yet, continue.

            // Only render if we have at least one texture loaded.

            if ( ! obj.textures[0] || ! obj.textures[0].texture ) continue;
 
            //////////////////////////////////////////////////////////////////////////////////////

            mat4.identity( this.mvMatrix );
            // TODO: this belongs in update
            //TRANSLATE, move model view into the screen (-z)
            //mat4.translate( this.mvMatrix, this.mvMatrix, [0.0, 0.0, z] );

            mat4.translate( this.mvMatrix, this.mvMatrix, [ obj.position[ 0 ], obj.position[ 1 ], z + obj.position[ 2 ] ] );

           
            //this.mvPushMatrix();
            //ROTATE
            // TODO: store in radians, use getters and setters
            //mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.xRot), [1, 0, 0] );
            //mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.yRot), [0, 1, 0] );
            //mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.zRot), [0, 0, 1] );

            vec3.add( obj.rotation, obj.rotation, obj.angular );

            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad( this.util.degToRad( obj.rotation[ 0 ] ) ), [ 1, 0, 0 ] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad( this.util.degToRad( obj.rotation[ 1 ] ) ), [ 0, 1, 0 ] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad( this.util.degToRad( obj.rotation[ 2 ] ) ), [ 0, 0, 1 ] );

            //////////////////////////////////////////////////////////////////////////////////////

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
    initVS2 ( objs ) {

        let gl = this.webgl.getContext();

        this.vs2 = {};

        this.vs2.program = this.webgl.createProgram( this.objVS2(), this.objFS2() );

        let program = this.vs2.program;

        // Assign multiple prims to this specific renderer.

        program.renderList = objs;

        // Get locations of shader variables.

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

        // initial enable
        // TODO: NOT NEEDED???

        //gl.enableVertexAttribArray( program.vsVars.attribute.vec3.aVertexPosition );

       // gl.enableVertexAttribArray( program.vsVars.attribute.vec4.aVertexColor );


        //INITIALIZE PRIM VALUES
        //TODO: should be specific to Prim

        // temporary rotation
        this.xRot = 0.0001;
        this.yRot = 0.0001;
        this.zRot = 0.0001;

    }

    renderVS2 () {

        let gl = this.webgl.getContext();

        let canvas = this.webgl.getCanvas();

        let mat4 = this.glMatrix.mat4;

        let program = this.vs2.program;

    	gl.useProgram( program.shaderProgram );

        let vsVars = program.vsVars;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

        mat4.perspective( this.pMatrix, Math.PI*0.4, canvas.width / canvas.height, 0.1, 100.0 ); // right

        mat4.identity( this.mvMatrix );


        let dX = 1;
        let dY = 1;
        let dZ = 1;

        //this.xRot += dX;
        this.yRot += dY;
        this.zRot += dZ;

        let z = -5; //TODO: NOT RENDERING AT 0 or 2, INVISIBLE BEYOND A CERTAIN DISTANCE INTO SCREEN!!!!!

        // Update world information.

        /////////////this.update();

        //console.log('.')

        let len = program.renderList.length;

        for ( let i = 0; i < len; i++ ) {

            let obj = program.renderList[ i ];

            //////////////////////////////////////////////////////////////////////////////////////
            // TODO: belongs in update
            //TRANSLATE, move model view into the screen (-z)
            mat4.translate( this.mvMatrix, this.mvMatrix, [0.0, 0.0, z] );
            /////////////////////////////////////////////////////////////////this.mvPushMatrix();
            //ROTATE
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.xRot), [1, 0, 0] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.yRot), [0, 1, 0] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.zRot), [0, 0, 1] );
            ///////////////////////////////////////////////////////////////////////////////////////

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
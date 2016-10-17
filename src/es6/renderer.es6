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

        // Array of objects rendered with a specific shader.

        this.renderList = {};

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
     * VS2 - COLOR BUT NO TEXTURE
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

    initVS1 () {

    }

    renderVS1 () {

    }

    initVS2 () {

    	let gl = this.webgl.getContext();

        this.renderer.vs2.program = this.webgl.createProgram( prim.renderer.objVS2(), prim.renderer.objFS2() );

        let program = this.renderer.vs1.program;

        program.vsVars.attribute = this.webgl.setAttributeLocations( program.shaderProgram, program.vsVars.attribute );

        program.vsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform );

        program.fsVars.uniform = this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform );

        // get locations of attributes.

        gl.enableVertexAttribArray( program.vsVars.attribute.vec3.aVertexPosition );

        gl.enableVertexAttribArray( program.vsVars.attribute.vec4.aVertexColor );


    }

    renderVS2 () {

    	gl.useProgram( this.renderer.vs2.program.shaderProgram );

        let vsVars = this.render.vs2.program.vsVars;

        let objs = this.vs2.renderList;

        let len = this.vs2.renderList.length;

        let gl = this.webgl.getContext();

        let canvas = this.webgl.getCanvas();

        let mat4 = this.glMatrix.mat4;

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

        for ( let obj of objs ) {

            //TRANSLATE, move model view into the screen (-z)
            mat4.translate( this.mvMatrix, this.mvMatrix, [0.0, 0.0, z] );

            /////////////////////////////////////////////////////////////////this.mvPushMatrix();

            //ROTATE
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.xRot), [1, 0, 0] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.yRot), [0, 1, 0] );
            mat4.rotate( this.mvMatrix, this.mvMatrix, this.util.degToRad(this.zRot), [0, 0, 1] );

            ////////console.log( 'BINDING VERTEX:'+ this.program.vsVars.attribute.vec3.aVertexPosition )

            gl.bindBuffer( gl.ARRAY_BUFFER, objs.geometry.vertices.buffer );
            gl.enableVertexAttribArray( vsVars.attribute.vec3.aVertexPosition );
            gl.vertexAttribPointer( vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0 );

            ////////// console.log( 'BINDING COLORS:' + this.program.vsVars.attribute.vec4.aVertexColor );

            gl.bindBuffer(gl.ARRAY_BUFFER, objs.geometry.colors.buffer );
            gl.enableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );
            gl.vertexAttribPointer(vsVars.attribute.vec4.aVertexColor, obj.geometry.colors.itemSize, gl.FLOAT, false, 0, 0);

            /////////console.log('bound texturesddfsdsfsdfsfsf')

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer );

            // Set matrix uniforms

            gl.uniformMatrix4fv( vsVars.uniform.mat4.uPMatrix, false, this.pMatrix );
            gl.uniformMatrix4fv( vsVars.uniform.mat4.uMVMatrix, false, this.mvMatrix );

            /////////console.log(">>>>>>>>>>>>>>>>>>>>>DRAWELEMENTS")

            gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);

            requestAnimationFrame( () => { this.renderVS2() } );

        } // end of loop.

    }

}
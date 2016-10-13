export default class world {

    /** 
     * The World class creates the scene, and should be uniquely 
     * written for each instance using the WebVR-Mini library.
     * Required functions:
     * getVS() - the vertex shader.
     * getFS() - get the fragment shader.
     * rer() - update on rer of <canvas>.
     * render() - rendering loop.
     * init() - create the world for this first time.
     * constructor() - initialize, passing in WebVR-Mini object.
     */

    /** 
     * constructor.
     * @param {WeVRMini} webvr the webvr module.
     */
    constructor ( webgl, prim ) {

        this.webgl = webgl;

        this.util = webgl.util;

        this.prim = prim;

        this.canvas = webgl.getCanvas();

        this.glMatrix = webgl.glMatrix;

        this.objs = []; // scene objects

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.timeOld = this.time = 0;

    }

   /* 
     * MATRIX OPERATIONS
     * Mostly with glMatrix
     */

    mvPushMatrix() {

        let mat4 = this.glMatrix.mat4;

        let copy = mat4.create();

        mat4.set( this.mvMatrix, copy );

        mvMatrixStack.push( copy );

    }

    mvPopMatrix() {

        if ( this.mvMatrixStack.length == 0 ) {

            throw "Invalid popMatrix!";

        }

        mvMatrix = this.mvMatrixStack.pop();

    }

    /**
     * Handle resize event for the World.
     * @param {Number} width world width (x-axis).
     * @param {Number} depth world depth (z-axis).
     */
    resize ( width, depth ) {


    }

    /** 
     * Start building the world for the first time.
     */
    init () {


        let gl = this.webgl.getContext();

        let prim = this.prim;

        this.program = this.webgl.createProgram( prim.objVS1(), prim.objFS1() );

        // use the program

        let shaderProgram = this.program.shaderProgram;

        gl.useProgram( shaderProgram );

        // USE THIS AS A BASE:
        // https://github.com/gpjt/webgl-lessons/blob/master/lesson06/index.html

        /* 
         * Get location of attribute names. Stored separately for vertex and fragment shaders.
         * vsvars = { 
                attribute {
                    vec2: {
                        uvMatrix: null (until filled)
                        mvMatris: null (until filled)
                    }
                },
                uniform {
                    ...
                },
                varying {
                    ...
                }
         }
         */

///////////
// DEBUG
        window.pgm = this.program;
        window.vsVars = this.program.vsVars;
        window.fsVars = this.program.fsVars;
///////////

        // Populate the attribute and uniform variables. Needs to be done again in the render loop.

        this.program.vsVars.attribute = this.webgl.setAttributeLocations( this.program.shaderProgram, this.program.vsVars.attribute );

        this.program.vsVars.uniform = this.webgl.setUniformLocations( this.program.shaderProgram, this.program.vsVars.uniform );

        this.program.fsVars.uniform = this.webgl.setUniformLocations( this.program.shaderProgram, this.program.fsVars.uniform );

        this.objs.push( this.prim.createCube(
            'first cube',
            1.0,
            this.glMatrix.vec3.create( 0, 0, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/crate.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'toji cube',
            1.0,
            this.glMatrix.vec3.create( 0, 1, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-logo1.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'red cube',
            1.0,
            this.glMatrix.vec3.create( 1, 0, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-logo2.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'orange cube',
            1.0,
            this.glMatrix.vec3.create( -1, 0, 0 ),
            this.glMatrix.vec3.create( 0, 1, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-logo3.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'red triangle cube',
            1.0,
            this.glMatrix.vec3.create( -1, 0, 0 ),
            this.glMatrix.vec3.create( -1, 1, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-logo4.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'red cube',
            1.0,
            this.glMatrix.vec3.create( -1, 0, 0 ),
            this.glMatrix.vec3.create( 0, -1, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-logo-chrome1.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        this.objs.push( this.prim.createCube(
            'w3c cube',
            1.0,
            this.glMatrix.vec3.create( -1, -1, 0 ),
            this.glMatrix.vec3.create( -1, -1, 0 ),
            this.glMatrix.vec3.create( 0, 0, 0 ),
            'img/webvr-w3c.png',
            this.glMatrix.vec4.create( 0.5, 1.0, 0.2, 1.0 ) 

        ) );

        window.cube = this.objs[0]; ////////////////////////

        // Start rendering loop.

        //////////////////this.render();

    }


    /** 
     * WORLD-SPECIFIC FUNCTIONS GO HERE.
     */

    /**
     * Create objects specific to this world.
     */
    create () {


    }

    /** 
     * Update the world's objects in time increments, e.g. motion and 
     * animation.
     */
    update () {

        // fps calculation.



    }

    /**
     * Render the World.
     */
   render () {

        let gl = this.webgl.getContext();

        let mat4 = this.glMatrix.mat4;

        let xRot = 0.0001;
        let yRot = 0.0001;
        let ySpeed = 0;
        let z = -5.0;

        gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, this.pMatrix);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [0.0, 0.0, z]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.util.degToRad(xRot), [1, 0, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.util.degToRad(yRot), [0, 1, 0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.objs[0].geometry.vertices.buffer);
        gl.vertexAttribPointer(this.program.vsVars.attribute.aVertexPosition, this.objs[0].geometry.vertices.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.objs[0].geometry.texCoords.buffer);
        gl.vertexAttribPointer(this.program.vsVars.attribute.aTextureCoord, this.objs[0].geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.objs[0].texture); ///////////////
        gl.uniform1i(this.program.vsVars.uniform.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.objs[0].geometry.indices.buffer);

        gl.uniformMatrix4fv(this.program.vsVars.uniform.uPMatrix, false, this.pMatrix);
        gl.uniformMatrix4fv(this.program.vsVars.uniform.uMVMatrix, false, this.mvMatrix);

        gl.drawElements(gl.TRIANGLES, this.objs[0].geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);


        requestAnimationFrame( () => { this.render() } );

    }

}
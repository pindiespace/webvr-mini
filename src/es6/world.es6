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

        this.prim = prim;

        this.canvas = webgl.getCanvas();

        this.gl = webgl.getContext();

        this.glMatrix = webgl.glMatrix;

        this.objVertices = [];

        this.objIndices = [];

        this.projectionMat = this.glMatrix.mat4.create();

        this.modelViewMat = this.glMatrix.mat4.create();

        this.ready = false;

    }

    /** 
     * vertex shader.
     * sample vertex and fragment shaders
     * @link http://sethlakowske.com/articles/webgl-using-gl-mat4-browserify-shader-and-browserify/
     */
    getVS () {

        return [

            'uniform mat4 projectionMat;',

            'uniform mat4 modelViewMat;',

            'attribute vec3 position;',

            'attribute vec2 texCoord;',

            'varying vec2 vTexCoord;',

            'varying vec4 vColor;',


            'void main() {',

            '  vTexCoord = texCoord;',

            /////////////////'  gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );',

            '  gl_Position = vec4( 0., 0., 0., 1.);',

            '}'

        ].join('\n');
    }

    /**
     * fragment shader.
     */
    getFS () {

        return [

            'precision mediump float;',

            'uniform sampler2D diffuse;',

            'varying vec2 vTexCoord;',

            'void main() {',

            ////////////////'  gl_FragColor = texture2D( diffuse, vTexCoord );',

            '  gl_FragColor = vec4(1.0, 0.1, 0.2, 1.);',

            '}',

        ].join('\n');

    }

    /** 
     * Create associative array with shader varyings.
     */
    setVarying ( program ) {


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

http://learningwebgl.com/blog/?p=28

https://www.tutorialspoint.com/webgl/webgl_colors.htm

some fixes for glmatrix
https://github.com/kpreid/cubes/blob/master/util.js

http://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html


     */
    init () {

        let gl = this.gl;

        this.create();

        let vs = this.webgl.createVertexShader( this.getVS() );

        let fs = this.webgl.createFragmentShader( this.getFS() );

        this.objVertices = this.prim.setVertexData( this.objVertices );

        this.objIndices = this.prim.setIndexData( this.objIndices );

        let program = webgl.createProgram( vs, fs );

        // Create and bind the vertex and index buffer.

        let vbo = webgl.createVBO( this.objVertices, gl.STATIC_DRAW );

        let ibo = webgl.createIBO( this.objIndices, gl.STATIC_DRAW );


        // TODO: also use - function fixedmultiplyVec3(matrix, vector) {...
        
        // Get attributes and uniforms from the WebGL program.

        // TODO: only returning the textcoord!!

        /* 
        let name = '';
        for (let i = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES) - 1; i >= 0; i--) {
            name = gl.getActiveAttrib(program, i).name;
            attribs[name] = gl.getAttribLocation(program, name);
        }
     */ 

        var attributes = this.webgl.getAttributes( program );

        var uniforms = this.webgl.getUniforms( program );


        console.log("ATTRIBUTES LENGTH:", attributes.length)
        for ( let i = 0; i < attributes.length; i++ ) {
        //    gl.enableVertexAttribArray( attributes[i] );
            console.log("AAAAAAttribute:" + i + attributes[i]);
        }

        console.log("UNIFORMS LENGTH:" + uniforms.length)
        for (let i = 0; i < uniforms.length; i++ ) {
            console.log("UUUUUinform:" + i + uniforms[i]);
        }


        // Assign the attributes, uniform, varying.

        gl.uniformMatrix4fv( uniforms.projectionMat, false, this.projectionMat );

        gl.uniformMatrix4fv( uniforms.modelViewMat, false, this.modelViewMat );





        gl.enableVertexAttribArray( attributes.position );

        // gl.enableVertexAttribArray( attributes.texCoord );

        gl.vertexAttribPointer( 
            attributes.position, 
            3,                    // size = 3d
            gl.FLOAT,             // type
            false,                // don't normalize
            20,                   // 0 = move forward size * sizeof(type) each iteration to get the next position
            0                     // start at beginning of buffer
        );

        // gl.vertexAttribPointer( attributes.texCoord, 2, gl.FLOAT, false, 20, 12 );


        this.ready = true;

        this.render();

    }

    ready () {

        return this.ready;

    }

    /** 
     * WORLD-SPECIFIC FUNCTIONS GO HERE.
     */

    /**
     * Create objects specific to this world.
     * TODO: "EXTENDS"
     */
    create () {

        window.cube = this.prim.createCube( 0, 0, 0, 1, 'First' );

    }

    /** 
     * update the world in time increments, e.g. motion and 
     * animation.
     */
    update () {


    }

    /**
     * Render the World.
     */
   render () {

        // Update on time increment.

        this.update();

        let gl = this.gl;

        // do any drawing

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

        gl.drawElements( gl.TRIANGLES, this.objIndices.length, gl.UNSIGNED_SHORT, 0 );

        requestAnimationFrame( () => { this.render() } );

    }

}
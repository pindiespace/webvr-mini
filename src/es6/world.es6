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

            'void main() {',

            '  vTexCoord = texCoord;',

            '  gl_Position = projectionMat * modelViewMat * vec4( position, 1.0 );',

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

            '  gl_FragColor = texture2D( diffuse, vTexCoord );',

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
     */
    init () {

        let gl = this.gl;

        this.create();

        let vs = webgl.createShaderFromTag( 'vertex' );

        let fs = webgl.createShaderFromTag( 'fragment' );

        this.objVertices = this.prim.setVertexData( this.objVertices );

        this.objIndices = this.prim.setIndexData( this.objIndices );

        let program = webgl.createProgram( vs, fs );

        var attributes = this.webgl.getAttributes( program );

        var uniforms = this.webgl.getUniforms( program );

        // Use the program.

        gl.useProgram( program );

        // set attributes, uniform, varying.

        gl.uniformMatrix4fv( uniforms.projectionMat, false, this.projectionMat );

        gl.uniformMatrix4fv( uniforms.modelViewMat, false, this.modelViewMat );

        // bind the vertex and index buffer.

        let vbo = webgl.createVBO( this.objVertices, gl.STATIC_DRAW );

        let ibo = webgl.createIBO( this.objIndices, gl.STATIC_DRAW );

        gl.enableVertexAttribArray( attributes.position );

        // gl.enableVertexAttribArray( attributes.texCoord );

        gl.vertexAttribPointer( attributes.position, 3, gl.FLOAT, false, 20, 0 ); // TODO: MAY NEED ADJUSTING HERE

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

        requestAnimationFrame( this.render );

    }

}
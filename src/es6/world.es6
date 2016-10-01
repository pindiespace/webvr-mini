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

        this.gl = webgl.getContext();

        this.glMatrix = webgl.glMatrix;

        // Buffers

        this.objVertices = [];

        this.objIndices = [];

        prim.setBuffers( this.objVertices, this.objIndices );

        // this.init();

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
     * Handle resize event for the World.
     * @param {Number} width world width (x-axis).
     * @param {Number} depth world depth (z-axis).
     */
    resize ( width, depth ) {


    }

    /**
     * Render the World.
     */
   render () {

        // Update on time increment.

        update();

        // do any drawing

        requestAnimationFrame( this.render );

    }

    /** 
     * WORLD-SPECIFIC FUNCTIONS GO HERE.
     */

    /** 
     * Start building the world for the first time.
     */
    init () {



        let c = this.prim.createCube( 0, 0, 0, 1, 'First' );

    }

    /** 
     * update the world in time increments, e.g. motion and 
     * animation.
     */
    update () {


    }


}
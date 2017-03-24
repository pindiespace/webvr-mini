class Shader {

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
     * Some shaders
     * https://github.com/jwagner/terrain
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
    constructor ( init, util, glMatrix, webgl, shaderName ) {

        console.log( 'In Shader class' );

        this.name = shaderName;

        // class name = this.constructor.name

        this.webgl = webgl;

        this.util = util;

        this.glMatrix = glMatrix;

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.mvMatrixStack = this.glMatrix.mat4.create();

        this.floatp = ''

        if ( this.webgl.stats.highp ) {

            this.floatp = 'precision highp float;';

        } else {

            this.floatp = 'precision mediump float;';

        }

        // Define the arrays needed for shaders to work. Subclasses override these values.

        this.needVertices = true;

        this.needIndices = false;

        this.needTexCoords = false;

        this.needColors = false;

        this.needNormals = false;

        this.needTangents = false;

        this.needLights = false;

        // If we need to load a vertex and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

        this.NOT_IN_LIST = util.NOT_IN_LIST; // for indexOf tests.

        // Get the WebGL program we will use to render.

        this.createProgram();

    }

    /* 
     * ============ PRIM OPERATIONS ============
     */

    /**
     * prims are added to the webgl program.
     */
    addObj( obj ) {

        if ( this.objInList( obj ) === this.NOT_IN_LIST ) {

            this.program.renderList.push ( obj );

        } else {

            console.error( obj.name + ' already added to shader::' + this.name );

        }

    }

    /** 
     * Check for Prim in list of drawn objects in webgl program.
     */
    objInList ( obj ) {

        let renderList = this.program.renderList;

        let pos = renderList.indexOf( obj );

        return pos;

    }

    /** 
     * Prims are removed from the webgl program. 
     * NOTE: removing from the array messes up JIT optimization, so slows things down!
     */
    removeObj( obj ) {

        if ( this.objInList( obj ) !== this.NOT_IN_LIST ) {

            this.program.renderList.splice( pos, 1 );

        } else {

            console.warn( obj.name + ' not found in shader::' + this.name );

        }

    }

    /** 
     * Create the rendering program that will use our Shaders. Initially created 
     * by WebGL module, then each Shader adds update() and render() methods specific to 
     * the shader program.
     */
    createProgram () {

        let program = null;

        if ( this.vertexShaderFile && this.this.fragmentShaderFile ) {

            program = this.webgl.createProgram( 
                this.webgl.fetchVertexShader( this.vertexShaderFile ), 
                this.webgl.fetchFragmentShader( this.fragmentShaderFile ) 
            );

        } else {

            // vsSrc() and fsSrc() are defined in derived Shader objects.

            program = this.webgl.createProgram( this.vsSrc(), this.fsSrc() );

        }

        if ( ! program ) {

            console.error( 'error creating WebGL program using Shader ' + this.constructor.name );

        } else {

            /* 
             * Add stuff that all Shaders share (non-polymorphic properties and methods).
             * Individual Shader derivatives define an init() method, which in turn attaches 
             * 
             * program.update()
             * program.render() 
             * 
             * To the program object. The Renderer grabs the Shader.program.update() and Shader.program.render()
             * methods when rendering.
             *
             */

            //program.renderList = [];

        }

        // Rendering uses a more direct program reference. we save a reference here for manipulating objects.

        return ( this.program = program );

    }

    /** 
     * get the WebGL Program (which contains the indivdiual update() and render() 
     * methods for this particular shader).
     * @returns {Object} returns the WebGL program from WebGL module, decorated with additional 
     * update() and render() methods by the specific shader.
     */
    getProgram () {

        return this.program;

    }

    /** 
     * set up our program object, using WebGL. We wrap the 'naked' WebGL 
     * program object, and add additional properties to the wrapper. 
     * 
     * Individual shaders use these variables to construct a program wrapper 
     * object containing the GLProgram, plus properties, plus update() and 
     * render() functions.
     */
    setup () {

        // The program is created by decorating an object provided by the WebGL object 
        // with additional methods.

        let program = this.program;

        /* Return references to our properties, and assign uniform and attribute locations using webgl object.
         * We do this return to provide local references for all the Shader and other objects
         * used by the WebGL program update() and render(). It could be provided in each init, but saves 
         * code to have each custom Shader init() method grab the local references from a common method. 
         */

        return [ 

            this.webgl.getContext(),

            this.webgl.getCanvas(),

            this.glMatrix.mat4,

            this.glMatrix.mat3,

            this.glMatrix.vec3,

            this.glMatrix.mat4.create(),  // perspective

            this.glMatrix.mat4.create(),  // model-view

            program,

            {
                attribute: this.webgl.setAttributeArrays( program.shaderProgram, program.vsVars.attribute ),

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform )

            },

            {

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform )

            },

            this.webgl.stats

        ];

    }

    /* 
     * ============ MATRIX OPERATIONS ============
     */

    mvPushMatrix () {

        let mat4 = this.glMatrix.mat4;

        let copy = mat4.create();

        mat4.set( this.mvMatrix, copy );

        mvMatrixStack.push( copy );

    }

    mvPopMatrix () {

        if ( this.mvMatrixStack.length == 0 ) {

            throw 'Invalid popMatrix!';

        }

        mvMatrix = this.mvMatrixStack.pop();

    }

}

export default Shader;
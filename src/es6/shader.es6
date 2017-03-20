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

        // If we need to load a vertex and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

        this.getProgram();

    }

    /* 
     * ============ PRIM OPERATIONS ============
     */

    /**
     * prims are added to the webgl program.
     */
    addObj( obj ) {

        let renderList = this.program.renderList;

        if ( renderList.indexOf( obj ) === -1 ) {

            renderList.push( obj );

        } else {

            console.error( obj.name + ' already added to shader::' + this.name );

        }

    }

    /** 
     * prims are removed from the webgl program. 
     * NOTE: removing from the array messes up JIT optimization, so slows things down!
     */
    removeObj( obj ) {

        let renderList = this.program.renderList;

        let pos = renderList.indexOf( obj );

        if ( pos > -1 ) {

            array.splice( pos, 1 );

        } else {

            console.warn( obj.name + ' not found in shader::' + this.name );

        }

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

    /** 
     * Add a list of Prim objects to be rendered. They can also be 
     * added in Shader init( objList ).
     */
    setObjList ( objList ) {

        // TODO: THIS DOES NOT WORK!
        //this.program.renderList = objList;

    }

    getProgram () {

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

        // Rendering uses a more direct program reference. we save a reference here for manipulating objects.

        this.program = program;

        return program;

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

        // Compile shaders and create WebGL program using webgl object.

        let program = this.program;

        // Return references to our properties, and assign uniform and attribute locations using webgl object.

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

}

export default Shader;
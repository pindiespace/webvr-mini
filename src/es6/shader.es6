'use strict' 

class Shader {

    /* 
     * Shaders used for rendering.
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
    constructor ( init, util, glMatrix, webgl, webvr, shaderName, lights ) {

        console.log( 'In Shader class' );

        this.name = shaderName;

        // class name = this.constructor.name // doesn't work with Babel 3/2017

        this.util = util,

        this.glMatrix = glMatrix,

        this.webgl = webgl,

        this.vr = webvr;

        // Perspective and model-view matrix.

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.mvMatrixStack = this.glMatrix.mat4.create();

        // Floating precision (determined by WebGL object).

        this.floatp = ''

        if ( this.webgl.stats.highp ) {

            this.floatp = 'precision highp float;';

        } else {

            this.floatp = 'precision mediump float;';

        }

        // Add Lights, if present.

        if ( lights ) {

            console.log("ADDING LIGHT TO SHADER:" + this.name )

            this.lights = lights;

        }

        // Define the arrays needed for shaders to work. Subclasses override these values.

        this.required = {

            buffer: {

                vertices: true,

                indices: false,

                texCoords: false,

                texCoords1: false,

                texCoords2: false,

                texCoords3: false,

                texCoords4: false,

                texCoords5: false

            },

            bumpMap: false,

            colors: false,

            normals: false,

            tangents: false,

            lights: 0,

            textures: 0

        };

        // If we need to load a vertex and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

        this.NOT_IN_LIST = util.NOT_IN_LIST; // for indexOf tests.

        // Get the WebGL program we will use to render.

        this.createProgram();

    }

    /*
     * ---------------------------------------
     * PRIM OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Check for a Prim in list of drawn objects in this Shader.
     * NOTE: we store Prims as a numeric array only.s
     * @param {Prim} prim a Prim object.
     */
    primInList ( prim ) {

        let renderList = this.program.renderList;

        let pos = renderList.indexOf( prim );

        return pos;

    }

    /**
     * We add each Prim to our internal Program (returned from webgl).
     * NOTE: the prim must already be initialized
     * NOTE: we store Prims as numeric array only.
     * @param {Prim} prim a Prim object.
     * @param {Shader} shader an optional shader object.
     */
    addPrim( prim ) {

        if ( this.checkPrim( prim ) ) {

            if ( this.primInList( prim ) === this.NOT_IN_LIST ) {

                console.warn( prim.name + ' added to Shader::' + this.name );

                // Switch the Prim's default Shader, and remove it from its old Shader (there can only be one).

                if ( prim.shader && prim.shader !== this ) {

                    prim.shader.removePrim( prim );

                }

                prim.shader = this; // may already be the case

                // Add the Prim to the Shader program's renderList.

                this.program.renderList.push( prim );

                // Emit a PRIM_READY event.

                this.util.emitter.emit( this.util.emitter.events.PRIM_ADDED_TO_SHADER, prim );

            } else {

                console.warn( prim.name + ' already added to Shader::' + this.name );

            }

        }

    }

    /** 
     * Remove a Prim from the Shader so it isn't rendered (not from PrimFactor). 
     * NOTE: removing from the array messes up JIT optimization, so slows things down!
     * @param {Prim} obj a Prim object.
     */
    removePrim( prim ) {

        let pos = this.primInList( prim );

        if ( pos !== this.NOT_IN_LIST ) {

            // Remove a Prim from the Shader program's renderList (still in PrimList and World).

            this.shader = null;

            this.program.renderList.splice( pos, 1 );

            // Emit a Prim removal event.

            this.util.emitter.emit( this.util.emitter.events.PRIM_REMOVED_FROM_SHADER, prim );

        } else {

            console.warn( prim.name + ' not found in Shader::' + this.name );

        }

    }

    /**
     * Confirm that all required WebGL coordinate buffers are present.
     * @param {Prim} prim an object primitive.
     */
    checkPrimBuffers ( prim ) {

        let buffer = this.required.buffer,

        geo = prim.geometry, 

        valid = true;

        // Loop through geometry buffer objects, which are part of 'required' here.

        for ( let i in buffer ) {


            if ( buffer[ i ] ) {

                //console.log( prim.name + ' required i:' + i + ' value:' + buffer[ i ] + ' geo value:' + geo[ i ] + ' buffer:' + geo[ i ].buffer)

                if ( geo[ i ] && ! geo[ i ].buffer ) {

                    return false;

                }

            }

        }

        return true;

    }

    /** 
     * Check to see if any required material properties are available for the Shader.
     * TODO: 
     */
    checkPrimMaterial ( prim ) {

        console.log( 'Shader::checkPrimMaterial(): event MATERIAL_READY fired' );

        return true;

    }

    /** 
     * Check to confirm that the required number of textures is available for Shader.
     * @param {Prim} prim the primitive object.
     */
    checkPrimTextures ( prim ) {

        if ( prim.textures.length < this.required.textures ) {

            return false;

        }

        /* 
         * Loop through required number of textures. Textures are assigned sequentially. 
         * Textures added sequentially; 
         * prim.textures[0] corresponds to GeometryBuffer.textureCoords, 
         * prim.textures[1] corresponds to GeometryBuffer.textureCoords1...
         */

        for ( let i = 0; i < prim.textures.length; i++ ) {

            if (! prim.textures[ i ] || ! prim.textures[ i ].texture ) { // WebGL texture buffere created

                return false;

            }

        }

        return true;

    }

    /** 
     * Check if a given Prim has the elements to be rendered by this Shader.
     * Bound to Emitter.events.PRIM_READY events.
     * @param {Prim} prim the primitive object.
     * @returns {Boolean} if everything is there, return true, else false.
     */
    checkPrim ( prim ) {

        // Only check the Prim if this Shader is defined for it.

        if ( prim.shader === this ) { // Prim is using this Shader

            // Confirm Prim has WebGLBuffers and Textures needed to render.

            if ( this.checkPrimTextures( prim ) && this.checkPrimBuffers( prim ) ) {

                return true;

            }

        }

        return false;

    }

    /*
     * ---------------------------------------
     * WEBGL PROGRAM OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Create the rendering program that will use our Shaders. Initially created 
     * by WebGL module, then each Shader adds update() and render() methods specific to 
     * the shader program.
     */
    createProgram () {

        let program = null;

        if ( this.vertexShaderFile && this.fragmentShaderFile ) {

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
             * To the program object. The ShaderPool grabs the Shader.program.update() and Shader.program.render()
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

        let glMatrix = this.glMatrix;

        let mat4 = glMatrix.mat4;

        this.pMatrix = glMatrix.mat4.create(); // projection matrix (defaults to mono view)

        this.mvMatrix = glMatrix.mat4.create(); // model-view matrix

        let pMatrix = this.pMatrix;

        let mvMatrix = this.mvMatrix;

        let canvas = this.webgl.getCanvas();

        let gl = this.webgl.getContext();

        let near = this.webgl.near;

        let far = this.webgl.far;

        // Rendering mono view.

        program.renderMono = () => {

            mat4.identity( mvMatrix );

            mat4.perspective( pMatrix, Math.PI*0.4, canvas.width / canvas.height, near, far );

            program.render( pMatrix, mvMatrix );

        }


        // Rendering left and right eye for VR. Called once for each Shader by World.

        program.renderVR = ( vr, display, frameData ) => {

                // Framedata provided by calling function.

                // Left eye.

                mat4.identity( mvMatrix );

                gl.viewport( 0, 0, canvas.width * 0.5, canvas.height );

                // Multiply mvMatrix by our eye.leftViewMatrix, and adjust for height of VR viewer.

                vr.getStandingViewMatrix( mvMatrix, frameData.leftViewMatrix, frameData.pose );

                program.render( frameData.leftProjectionMatrix, mvMatrix );

                // Right eye.

                mat4.identity( mvMatrix );

                gl.viewport( canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height );

                // Multiply mvMatrix by our eye.rightViewMatrix, and adjust for height of VR viewer.

                vr.getStandingViewMatrix( mvMatrix, frameData.rightViewMatrix, frameData.pose ); // after Toji

                program.render( frameData.rightProjectionMatrix, mvMatrix );

                // Calling function submits rendered stereo view to device.

        }

        /* Return references to our properties, and assign uniform and attribute locations using webgl object.
         * We do this return to provide local references for all the Shader and other objects
         * used by the WebGL program update() and render(). It could be provided in each init, but saves 
         * code to have each custom Shader init() method grab the local references from a common method. 
         */

        return [ 

            gl, //this.webgl.getContext(),

            canvas, //this.webgl.getCanvas(),

            this.glMatrix.mat4,

            this.glMatrix.mat3,

            this.glMatrix.vec3,

            this.pMatrix,

            this.mvMatrix,

            program,

            {

                attribute: this.webgl.setAttributeArrays( program.shaderProgram, program.vsVars.attribute ),

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.vsVars.uniform )

            },

            {

                uniform: this.webgl.setUniformLocations( program.shaderProgram, program.fsVars.uniform )

            },

            this.webgl.stats,

            this.webgl.near,

            this.webgl.far,

            this.vr

        ];

    }

    /*
     * ---------------------------------------
     * MATRIX OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Get the perspective matrix.
     * @returns {glMatrix.mat4} the perspective matrix used in the Shader.
     */
    getpMatrix () {

        return this.pMatrix;

    }

    /**
     * Get the model-view matrix.
     * @returns {glMatrix.mat4} the model-view matrix used in the Shader.
     */
    getmvMatrix () {

        return this.mvMatrix;

    }

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
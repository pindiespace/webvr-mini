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

                texCoords: false

            },

            bumpMap: false,

            colors: false,

            normals: false,

            tangents: false,

            lights: 0,

            textures: 0

        };

        // If we need to sort by distance (translucent Prims), set to true.

        this.sortByDistance = false;

        // If we need to load a vertex and fragment shader files (in text format), put their paths in derived classes.

        this.vertexShaderFile = null;

        this.fragmentShaderFile = null;

        // For indexOf tests.

        this.NOT_IN_LIST = util.NOT_IN_LIST;

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
     * @param {Boolean} emit if true, broadcast the event, else false.
     */
    addPrim( prim, emit = true ) {

        if ( this.checkPrim( prim ) ) {

            if ( this.primInList( prim ) === this.NOT_IN_LIST ) {

                ///console.warn( 'Shader::addPrim():prim:'  + prim.name + ' not in list, adding to Shader::' + this.name );

                // Add the Prim to the Shader program's renderList. If a nulled position is present, use it.

                let pos = this.program.renderList.indexOf( null );

                if ( pos !== this.NOT_IN_LIST ) {

                    console.log( 'Shader::addPrim():filling NULL with:' + prim.name + ' to:' + this.name );

                    this.program.renderList[ pos ] = prim ;

                } else {

                    //console.log( 'Shader::addPrim():appending prim:' + prim.name + ' to:' + this.name )

                    this.program.renderList.push( prim );

                }

                // Sort by distance for translucent objects.

                if ( this.sortByDistance ) {

                    this.sortPrimsByDistance( [ 0, 0, 0 ] );

                }

                if ( prim.shader && prim.shader !== this ) {

                    //console.log( 'Shader::addPrim(): removing prim:' + prim.name + ' from old Shader:' + prim.shader.name)

                    prim.shader.removePrim( prim, emit );

                }

                // Switch the Prim's default Shader, and remove it from its old Shader (there can only be one).

                prim.shader = this; // may already be the case

                // Emit a PRIM_READY event.

                if ( emit ) {

                    this.util.emitter.emit( this.util.emitter.events.PRIM_ADDED_TO_SHADER, prim );

                }

                return true;

            } else {

                ////////console.warn( 'Shader::addPrim():' + prim.name + ' already added to Shader::' + this.name );

            }

        } else {

            //TODO: REMOVE THIS OPTION:

            //console.warn( 'Shader::addPrim():' + prim.name + ' did not pass Shader test for ' + this.name )

        }

        return false;

    }

    /** 
     * Remove a Prim from the Shader so it isn't rendered (not from PrimFactor). 
     * NOTE: removing from the array messes up JIT optimization, so slows things down!
     * @param {Prim} obj a Prim object.
     * @param {Boolean} emit if true, emit the event, else false.
     */
    removePrim( prim, emit = true ) {

        let pos = this.primInList( prim );

        if ( pos !== this.NOT_IN_LIST ) {

            // Remove a Prim from the Shader program's renderList (still in PrimList and World).

            ////////console.warn( 'Shader::removePrim():removing prim:' + prim.name );

            //////////////////////this.program.renderList.splice( pos, 1 );

            this.program.renderList[ pos ] = null;

            // Emit a Prim removal event.

            if ( emit ) {

                this.util.emitter.emit( this.util.emitter.events.PRIM_REMOVED_FROM_SHADER, prim );

            }

            return true;

        } else {

            console.warn( 'Shader::removePrim():' + prim.name + ' not found in Shader::' + this.name );

        }

        return false;

    }

    /** 
     * Move a Prim between Shaders.
     * @param {Prim} prim the Prim to move.
     * @param {Shader} newShader the Shader to move to.
     */
    movePrim( prim, newShader ) {

        if ( prim.shader && newShader && ( prim.shader !== newShader ) ) {

            /*
             * NOTE: emit MUST be false to prevent a race condition.
             */

            //////console.log("Shader::movePrim():" + prim.name )

            return newShader.addPrim( prim, false );

        }

    }

    /** 
     * Check if a given Prim has the elements to be rendered by this Shader.
     * Bound to Emitter.events.PRIM_READY events.
     * @param {Prim} prim the primitive object.
     * @returns {Boolean} if everything is there, return true, else false.
     */
    checkPrim ( prim ) {

        // Confirm Prim has WebGLBuffers and Textures needed to render.

        if ( this.checkPrimTextures( prim ) && this.checkPrimBuffers( prim ) ) {

            return true;

        }

        return false;

    }

    /**
     * Confirm that all required WebGL coordinate buffers are present.
     * @param {Prim} prim an object primitive.
     */
    checkPrimBuffers ( prim ) {

        let buffer = this.required.buffer,

        geo = prim.geometry; 

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

            if (! prim.textures[ i ] || ! prim.textures[ i ].texture ) { // WebGL texture buffer created

                return false;

            }

        }

        return true;

    }

    /**
     * Sort the list of rendered Prims furthest to closest to the viewer or Camera.
     * NOTE: don't use for large > 20 sorts.
     * @param {glMatrix.vec3} viewer position of viewer (camera).
     */
    sortPrimsByDistance( viewer ) {

        let vec3 = this.glMatrix.vec3;

        this.program.renderList.sort( ( a, b ) => {

            if ( a && b ) { // nulls possible

                return ( vec3.distance( a.position, viewer ) - vec3.distance( b.position, viewer ) );

            }

        } );

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

            /*
             * NOTE: webgl.createProgram adds the render array .renderList
             * vsSrc() and fsSrc() are defined in derived Shader objects.
             */

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
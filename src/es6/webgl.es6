'use strict'

class WebGL {

    /**
     * References:
     * LiteGL
     * @link https://github.com/jagenjo/litegl.js/tree/master/src
     * GL Tutorial: http://webglfundamentals.org
     * HTML5 Games code: http://www.wiley.com/WileyCDA/WileyTitle/productCd-1119975085.html
     * Best Practices
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
     * WebGL tests:
     * @link https://www.browserleaks.com/webgl
     * WebGL cross-browser:
     * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
     * Great WebGL Examples:
     * http://alteredqualia.com/
     * Toji: https://github.com/toji/webvr-samples
     * https://github.com/toji/webvr.info/blob/master/samples/05-room-scale.html
     * TWGL: @link http://twgljs.org/
     * perspective Matrix
     * @link http://www.rozengain.com/blog/2010/02/22/beginning-webgl-step-by-step-tutorial/ 
     * 
     * Google demos for kronos (including webworkers and particle systems)
     * https://www.khronos.org/registry/webgl/sdk/demos/google/
     * 
     * @constructor
     * @param {Object} config a configuration object, set in app.js.
     */

    constructor ( init, glMatrix, util, debug ) {

        console.log( 'in webGL class' );

        this.gl = null;

        this.contextCount = 0;

        this.version = 0; 

        this.glMatrix = glMatrix;

        this.util = util;

        this.NOT_IN_LIST = util.NOT_IN_LIST; // -1 value for .indexOf()

        // Default shader name for vertices (must always use in vertex and fragment shader).

        /*
         * All the Shaders MUST use the following names for common shader attributes. They are 
         * hard-coded to improve positioning.
         */

        this.attributeNames = {

            aVertexPosition: [ 'aVertexPosition', 0 ],

            aVertexColor: [ 'aVertexColor', 1 ],

            aTextureCoord: [ 'aTextureCoord', 2 ],

            aTextureCoord1: [ 'aTextureCoord1', 3 ],

            aTextureCoord2: [ 'aTextureCoord2', 4 ],

            aTextureCoord3: [ 'aTextureCoord3', 5 ],

            aTextureCoord4: [ 'aTextureCoord4', 6 ],

            aTextureCoord5: [ 'aTextureCoord5', 7 ],

            aVertexNormal: [ 'aVertexNormal', 8 ],

            aVertexTangent: [ 'aVertexTangent', 9 ]


        }

        //TODO: hard-code the attribute bindings, so they always have the same index.
        //TODO: use the above array.
        //TODO: otherwise, getting confusing errors when we try to assign arrays.
        //https://www.khronos.org/webgl/public-mailing-list/public_webgl/1003/msg00068.php
        //TODO:
        //TODO:

        // Perspective matrix in Shaders.

        this.near = 0.1;

        this.far = 100;

        // Statistics object.

        this.stats = {};

        if ( init === true ) {

            this.init( document.getElementById( 'webvr-mini-canvas' ) ); // Normally not called this way

        }

        // If we are running in debug mode, save the debug utils into this object.

        if ( debug ) {

            this.debug = debug;

        }

    }

    /**
     * initialize with a canvas context
     * @param {HTMLCanvasElement|String|undefined} canvas a HTML5 <canvas>, id for canvas, or undefined, 
     * in which case a <canvas> object is 
     * created and added to document.body, an ID value for a tag, or a CanvasDOMobject.
     * @param {Function} lostContext callback when WebGL context is lost.
     * @param {Function} restoredContext callback when WebGL context is restored.
     * @returns {WebGLContext} the WebGL context of the <canvas> object.
     */
    init ( canvas, lostContext, restoredContext ) {

        if ( ! canvas ) { 

            /* 
             * Create the minimal player wraparound.
             * <div class="webvr-mini-player">
             *     <nav class="webvr-mini-controls"></nav>
             *     <canvas id="webvr-mini-canvas" ></canvas>
             * </div>
             */

            canvas = document.createElement( 'canvas' );

            canvas.width = 480;

            canvas.height = 320;

            let player = document.createElement( 'div' );

            player.className = 'webvr-mini-player';

            let controls = document.createElement( 'div' );

            controls.className = 'webvr-mini-controls';

            player.appendChild( controls );

            player.appendChild( canvas );

            // This seems to fix a bug in IE 11. TODO: remove extra empty <canvas>.

            document.body.appendChild( player );

        } else if ( this.util.isString( canvas) ) {

            canvas = document.getElementById( canvas );

        } else {

            canvas = canvas;

        }

        if ( canvas ) {

            // This line will make the <canvas> element work for focus events.

            // canvas.addAttribute( 'tabindex', '1' );

            // NOTE: IE10 needs canvas bound to DOM for the following command to work.

            let r = canvas.getBoundingClientRect();

            canvas.width = r.width;

            canvas.height = r.height;

            // Save current window width and height (used in window resize).

            this.oldWidth = this.util.getWindowWidth();

            this.oldHeight = this.util.getWindowHeight();

            // Create the WebGL context for the <canvas>, trying to get the most recent version.

            this.gl = this.createContext( canvas );

            if ( this.gl ) {

                const gl = this.gl;

                // Default WebGL initializtion and stats, can be over-ridden in your world file.

                if( gl.getParameter && gl.getShaderPrecisionFormat ) {

                    let stats = this.stats;

                    // Check if high precision supported in fragment shader.

                    stats.highp = ( gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision );

                    // Max texture size, for gl.texImage2D.                

                    stats.maxTextureSize = gl.getParameter( gl.MAX_TEXTURE_SIZE );

                    // Max cubemap size, for gl.texImage2D.

                    stats.maxCubeSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE );

                    // Max texture size, for gl.renderbufferStorage and canvas width/height.

                    stats.maxRenderbufferSize = gl.getParameter( gl.MAX_RENDERBUFFER_SIZE );

                    // Max texture units.

                    stats.combinedUnits = gl.getParameter( gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS );

                    // Max vertex buffers.

                    stats.maxVSattribs = gl.getParameter( gl.MAX_VERTEX_ATTRIBS );

                    // Max 4-byte uniforms.

                    stats.maxVertexShader = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );

                    // Max 4-byte uniforms.

                    stats.maxFragmentShader = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS );

                } else {

                    this.stats = false;

                }

                /* 
                 * Set up listeners for context lost and regained.
                 * @link https://www.khronos.org/webgl/wiki/HandlingContextLost
                 * Simulate lost and restored context events with:
                 * @link https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/restoreContext
                 * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
                 * gl.isContextLost() also works to check
                 */

                canvas.addEventListener('webglcontextlost', ( e ) => {

                    console.error( 'error: webglcontextlost event, context count:' + this.contextCount );

                    if ( lostContext ) {

                        this.gl = null;

                        lostContext( e );

                    }

                    e.preventDefault();

                }, false );

                canvas.addEventListener( 'webglcontextrestored', ( e ) => {

                    console.error( 'error: webglcontextrestored event, context count:' + this.contextCount );

                    if ( restoredContext ) {

                        restoredContext( e );

                    }

                    e.preventDefault();

                }, false );

                // Do an initial set of our viewport width and height.

                gl.viewportWidth = canvas.width;

                gl.viewportHeight = canvas.height;

                // listen for <canvas> resize event.

                window.addEventListener( 'resize', ( e ) => {

                    this.resizeCanvas();

                    e.preventDefault();

                }, false );

                // If we're reloading, clear all current textures in the texture buffers.

                this.clearTextures();

                // Set our default rendering values.

                this.glDefaults();

                // Clear the screen to the clearColor by default.

                this.clear();

                return this.gl;

            } else {

            // We check prior to loading this module, so we shouldn't go here if not supported.

                console.error( 'no WebGL context' );

            } // end of have a gl context


        } else {

            console.error( ' no WebGL canvas' );

        } // end of if have a <canvas>

        return null;

    }

    /**
     * (re)set the defaults we draw with.
     */
    glDefaults() {

        let gl = this.getContext();

        if ( gl ) {

            // Default 3D enables.

            gl.enable( gl.DEPTH_TEST );

            gl.enable( gl.CULL_FACE );

            gl.clearDepth( 1.0 );             // Clear everything

            gl.depthFunc( gl.LEQUAL );        // Near things obscure far things

            gl.enable( gl.BLEND );            // Allow blending

            // Fog NOT in Webgl use shader
            //http://www.geeks3d.com/20100228/fog-in-glsl-webgl/
            // http://in2gpu.com/2014/07/22/create-fog-shader/

            gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

            /* 
             * IMPORTANT: tells WebGL to premultiply alphas for <canvas>
             * @link http://stackoverflow.com/questions/39251254/avoid-cpu-side-conversion-with-teximage2d-in-firefox
             */
            gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true );

            gl.clearColor( 0.1, 0.1, 0.1, 1.0 );

        }

    }

    /** 
     * Flag for supporting WebGL.
     * @returns {Boolean} if WebGL context is present, return true, else false.s
     */
    hasWebGL () {

        return ( !! this.getContext() );

    }

    /* 
     * ---------------------------------------
     * WEBGL EXTENSIONS
     * ---------------------------------------
     */

    /** 
     * Support indexed vertex drawing when there are more than 
     * 64k vertices in WebGL 1.0. Enabled by default in WebGL 2.0. No constant, so 
     * this should only be called in 1.0 context.
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    index32Support ( gl ) {

        return !! gl.getExtension( 'OES_element_index_uint' );

    }

    /** 
     * Add support for Shaders to use derivatives.
     * Have to add the following to the Shaders
     * #extension GL_EXT_shader_texture_lod : enable
     * #extension GL_OES_standard_derivatives : enable
     * @link https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    derivativeSupport( gl ) {

        let s = !! gl.FRAGMENT_SHADER_DERIVATIVE_HINT; // Should be present in WebGL 2.0

        if ( ! s ) {

            let ext = gl.getExtension( 'GL_OES_standard_derivatives' );

            if ( ext ) {

                s = true;

                gl.FRAGMENT_SHADER_DERIVATIVE_HINT = ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES;

            }

            if ( gl.FRAGMENT_SHADER_DERIVATIVE_HINT ) {

                this.stats.lodSupport = !! gl.getExtension( 'EXT_shader_texture_lod' );

            }

        }

        return s;

    }


    /** 
     * Add vertex buffer support to WebGL 1.0.
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    vertexArraySupport ( gl ) {

        let s = !! gl.VERTEX_ARRAY_BINDING;  // Should be present in WebGL 2.0

        if ( ! s ) {

            let ext = gl.getExtension( 'OES_vertex_array_object' );

            if ( ext ) {

                s = true;

                gl.VERTEX_ARRAY_BINDING = ext.VERTEX_ARRAY_BINDING_OES;

                gl.createVertexArray = () => { return ext.createVertexArrayOES(); }

                gl.deleteVertexArray = ( v ) => { ext.deleteVertexArrayOES( v ); }

                gl.isVertexArray = ( v ) => { return ext.isVertexArrayOES( v ); }

                gl.bindVertexArray = ( v ) => { ext.bindVertexArrayOES( v ); }

            }

        }

        return s;

    }

    /** 
     * Add support for depth textures, allows WebGLRenderingContext.texImage2D() format and internalformat parameters 
     * to accept accept gl.DEPTH_COMPONENT and gl.DEPTH_STENCIL. The type parameter now accepts gl.UNSIGNED_SHORT, 
     * gl.UNSIGNED_INT, and ext.UNSIGNED_INT_24_8_WEBGL. The pixels parameter now accepts an ArrayBufferView of type Uint16Array and Uint32Array.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    depthTextureSupport ( gl ) {

        let s = !! ( gl.DEPTH_COMPONENT && gl.DEPTH_STENCIL );

        if ( ! s ) {

            let ext = ( gl.getExtension( 'WEBGL_depth_texture' ) || 

            gl.getExtension( 'MOZ_WEBGL_depth_texture' ) || 

            gl.getExtension( 'WEBKIT_WEBGL_depth_texture' ) );

            if ( ext ) {

                s = true;

                gl.DEPTH_COMPONENT = ext.DEPTH_COMPONENT;

                gl.DEPTH_STENCIL = ext.DEPTH_STENCIL;

            }

        }

        return s;

    }

    /** 
     * Add support for anisotrophic texture filtering, improving mipmap quality. Used by 
     * both WebGL 1.0 and WebGL 2.0 contexts.
     * gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
     * @link http://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    anisotropicSupport ( gl ) {

        let s = !! gl.TEXTURE_MAX_ANISOTROPY_EXT;

        if ( ! s ) {

            let ext = ( gl.getExtension('EXT_texture_filter_anisotropic') || 

            gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || 

            gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' ) );

            if ( ext ) {

                s = true;

                gl.TEXTURE_MAX_ANISOTROPY_EXT = ext.TEXTURE_MAX_ANISOTROPY_EXT;

            }

        }

        return s;

    }

    /** 
     * Add support for S3 compressed textures.
     * @link http://blog.tojicode.com/2011/12/compressed-textures-in-webgl.html
     * @link https://en.wikipedia.org/wiki/S3_Texture_Compression
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    S3TCTextureSupport ( gl ) {

        let s = !! gl.COMPRESSED_RGB_S3TC_DXT1_EXT;

        if ( ! s ) {

            let ext = ( gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || 

            gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || 

            gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' ) );

            if ( ext ) {

                s = true,

                gl.COMPRESSED_RGB_S3TC_DXT1_EXT = ext.COMPRESSED_RGB_S3TC_DXT1_EXT,

                gl.COMPRESSED_RGBA_S3TC_DXT1_EXT = ext.COMPRESSED_RGBA_S3TC_DXT1_EXT,

                gl.COMPRESSED_RGBA_S3TC_DXT3_EXT = ext.COMPRESSED_RGBA_S3TC_DXT3_EXT,

                gl.COMPRESSED_RGBA_S3TC_DXT5_EXT = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;

            }

        }

        return s;

    }

    /** 
     * Add support for PVR compressed textures. 
     * Available in both WebGL 1.0 and WebGL 2.0 contexts.
     * Used on mobile devices, e.g.iPhone, iPod Touch and iPad and supported on certain Android devices 
     * using a PowerVR GPU.
     * @link http://blog.tojicode.com/2011/12/compressed-textures-in-webgl.html
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    PVRTCTextureSupport ( gl ) {

        let s = !! gl.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;

        if ( ! s ) {

            let ext = ( gl.getExtension('WEBGL_compressed_texture_pvrtc ') || 

                gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_pvrtc' ) );

            if ( ext ) {

                s = true,

                gl.COMPRESSED_RGB_PVRTC_4BPPV1_IMG = ext.COMPRESSED_RGB_PVRTC_4BPPV1_IMG,

                gl.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = ext.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,

                gl.COMPRESSED_RGB_PVRTC_2BPPV1_IMG = ext.COMPRESSED_RGB_PVRTC_2BPPV1_IMG,

                gl.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = ext.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

            }

        }

        return s;

    }

    /** 
     * Add support for Ericsson ETC1 compressed textures, RGB only, 6x compression of 24-bit data.
     * Can be used with gl.compressedTexImage2D() 
     * @link http://blog.tojicode.com/2011/12/compressed-textures-in-webgl.html
     * @link https://en.wikipedia.org/wiki/Ericsson_Texture_Compression
     * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only).
     */
    ETC1TextureSupport( gl ) {

        let s = !! ( gl.COMPRESSED_RGB_ETC1_WEBGL || gl.COMPRESSED_RGB_ETC1 );

        if ( ! s ) {

            let ext = gl.getExtension( 'WEBGL_compressed_texture_etc1' );

            if ( ext ) {

                s = true;

                gl.COMPRESSED_RGB_ETC1_WEBGL = ext.COMPRESSED_RGB_ETC1_WEBGL;

            }

        }

        return s;

    }

    /*
     * ---------------------------------------
     * OTHER WEBGL TESTS
     * ---------------------------------------
     */

    /** 
     * Wrapper for WebGL error reporting.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getError
     */
    getError ( ) {

        let fnName = 'webgl.glError():',

        gl = this.getContext();

        switch ( gl.getError() ) {

            case gl.NO_ERROR: // No error has been recorded. The value of this constant is 0.

                return fnName + 'gl.NO_ERROR';

            case gl.INVALID_ENUM: // An unacceptable value has been specified for an enumerated argument. The command is ignored and the error flag is set.

                return fnName + 'gl.INVALID_ENUM';
  
            case gl.INVALID_VALUE: // A numeric argument is out of range. The command is ignored and the error flag is set.

                return fnName + 'gl.INVALID_VALUE';
  
            case gl.INVALID_OPERATION: // The specified command is not allowed for the current state. The command is ignored and the error flag is set.

                return fnName + 'gl.INVALID_OPERATION';

            case gl.INVALID_FRAMEBUFFER_OPERATION: // The currently bound framebuffer is not framebuffer complete when trying to render to or to read from it.

                return fnName + 'gl.INVALID_FRAMEBUFFER_OPERATION';

            case gl.OUT_OF_MEMORY: //Not enough memory is left to execute the command.

                return fnName + 'gl.OUT_OF_MEMORY';

            case gl.CONTEXT_LOST_WEBGL:

                return fnName + 'gl.CONTEXT_LOST_WEBGL';    

        }

    }

     /** 
      * Check to see if the framebuffer is valid, must bind a frameBuffer 
      * first, using gl.createFramebuffer() with valid offscreen texture.
      * @param {WebGLRenderingContext} gl the WebGL rendering context.
      * @param {WebGLFrameBuffer} the bound frameBuffer.
      * @returns {String} error message.
      */
    checkFramebuffer ( gl, framebuffer ) {

        // assumes the framebuffer is bound

        let valid = gl.checkFramebufferStatus( gl.FRAMEBUFFER );

        switch ( valid ) {

            case gl.FRAMEBUFFER_UNSUPPORTED:

                return 'Framebuffer is unsupported';

            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:

                return 'Framebuffer incomplete attachment';

            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:

                return 'Framebuffer incomplete dimensions';

            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:

                return 'Framebuffer incomplete missing attachment';

        default:

            return true;

        }

    }

    /*
     * ---------------------------------------
     * WEBGL STATE TOGGLES
     * ---------------------------------------
     */

    enableBlending ( source, dest, eq ) {

        const gl = this.getContext();

        if( eq ) {

            gl.blendEquation( gl[ eq ] );

        }

        if( source && dest ) {

            gl.blendFunc( gl[ source ], gl[ dest ] );

        }

        gl.enable( gl.BLEND );

        gl.depthMask( false );

    }

    disableBlending () {

        const gl = this.getContext();

        gl.disable( gl.BLEND );

        gl.depthMask( true );

    }

    /* 
     * ---------------------------------------
     * CANVAS OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Get WebGL canvas only if we've created a gl context.
     * @returns {HTMLCanvasElement} canvas the rendering <canvas>.
     */
    getCanvas () {

        return this.gl ? this.gl.canvas : null;

    }

    /** 
     * Resize the canvas if the window changes size. 
     * @param {Boolean} force force a resize, even if window size has not changed. Use 
     * when exiting VR.
     */
    resizeCanvas ( force ) {

        if ( this.ready() ) {

            console.log('resize')

            let wWidth = this.util.getWindowWidth();

            let wHeight = this.util.getWindowHeight();

            if ( force || wWidth !== this.oldWidth ) {

                const f = Math.max( window.devicePixelRatio, 1 );

                const gl = this.getContext();

                let c = this.getCanvas();

                // Get the current size of the <canvas>

                const width  = c.clientWidth  * f | 0;

                const height = c.clientHeight * f | 0;

                // Set the <canvas> width and height property.

                c.width = width;

                c.height = height;

                // Set the WebGL viewport.

                gl.viewportWidth = width;

                gl.viewportHeight = height;

                gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

            }

            // Save the values.

            this.oldWidth = wWidth;

            this.oldHeight = wHeight;

        }

        return false;

    }

    /*
     * ---------------------------------------
     * WEBGL CONTEXT OPERATIONS
     * ---------------------------------------
     */

    /** 
     * get HTML5 canvas, and a WebGL context. We also scan for multiple 
     * contexts being created ( > 1 ) and delete if one is already present.
     * @param {Canvas} canvas the HTML5 <canvas> DOM element.
     * TODO: PROBLEM IF THERE ARE MULTIPLE CONTEXES ON THE PAGE???????
     * @param {HTMLCanvasElement} canvas the rendering <canvas>.
     * @returns {WebGLRenderingContext} gl a WebGLRenderingContext.
     */
    createContext ( canvas ) {

        if ( ! window.WebGLRenderingContext ) {

            console.error( 'this browser does not support webgl' );

            return null;

        }

        let gl = null;

        if ( gl && this.contextCount > 0 ) {

            // Contexts are normally in garbage, can't be deleted without this!

            console.warn( 'killing context' );

            this.killContext();

            this.contextCount--;

            this.gl = null; // just in case

        }

        let n = [ 'webgl2', 'experimental-webgl2', 'webgl', 'experimental-webgl' ];

        let i = 0;

        while ( i < n.length ) {

            try {

                if ( this.debug ) {

                    gl = this.debug.makeDebugContext( canvas.getContext( n[ i ] ) );

                    if ( gl ) {

                        console.warn( 'using debug context' );

                        if ( gl.getParameter !== 'function' ) {

                            gl = canvas.getContext( n[ i ] );

                            console.warn( 'unable to use debug context, trying release:' + n[ i ], ' getParameter:' + gl.getParameter );

                        }

                        break;

                    }

                } else {

                    gl = canvas.getContext( n[ i ] );

                    if ( gl ) {

                        console.warn ( 'using release context mode:' + n[ i ] );

                        break;

                    }

                }

            } catch( e ) {

                console.warn( 'failed to load context:' + n[ i ] );

            }

            i++;

        } // end of while loop


        /*
         * If we got a context, assign WebGL version. Note that some 
         * experimental versions don't have .getParameter
         */

        if ( gl && typeof gl.getParameter == 'function' ) {

            this.contextCount++;

            this.gl = gl;

            // Check if this is a full WebGL2 stack

            this.version = gl.getParameter( gl.VERSION ).toLowerCase();

            if ( i == 1 || i == 3 ) {

                console.warn( 'experimental context, .getParameter() may not work' );

            }

            console.log( 'version:' + gl.getParameter( gl.VERSION));

            // Supported extensions.

            this.stats.uint32 = true; // by default, but check if we have WebGL 1.0.

            this.stats.supported = gl.getSupportedExtensions();

            // Take action, depending on version (identified by pos in our test array n).

            switch ( i ) {

                // WebGL 2.0

                case 0:

                case 1:

                    this.version = 2.0;

                    break;

                // WebGL 1.0 

                case 2:

                case 3:

                default:

                    this.version = 1.0;

                    this.stats.uint32 = this.index32Support( gl ); // vertices > 64k, no constant exported. WebGL 1.0 only.

                    break;

            }

        }

        // These extensions expose constants, so we can test here.

        this.stats.anisotrophic = this.anisotropicSupport( gl );

        this.stats.vertexArrays = this.vertexArraySupport( gl ); // vertex buffers

        this.stats.derivatives = this.derivativeSupport( gl ); // shader derivatives

        this.stats.depthTextures = this.depthTextureSupport( gl ); // depth textures

        this.stats.pvrtcTextures = this.PVRTCTextureSupport( gl ); // PVRTC compressed texture support

        this.stats.etc1Textures = this.ETC1TextureSupport( gl ); // ETC1 compress texture support

        this.stats.setcTextures = this.S3TCTextureSupport( gl ); // S3 compressed texture support

        // Set the maximum draw elements, based on card capabilities.

        if ( ! this.stats.uint32) { 

            this.MAX_DRAWELEMENTS = 65534;

        } else {

            this.MAX_DRAWELEMENTS = 2e9;

        }

        return this.gl;

    }

    /** 
     * Return the current context. Note that we don't store a 
     * separate reference to the canvas.
     * @returns {WebGLRenderingContext} gl a WebGLRenderingContext.
     */
    getContext () {

        if ( ! this.gl ) {

            console.warn( 'warning webgl context not initialized' );

        }

        return this.gl;

    }

    /** 
     * Kill the current context (complete reset will be needed). Also use to debug 
     * when context is lost, and has to be rebuilt.
     * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext
     */
    killContext () {

        console.log('in killcontext, count:' + this.contextCount);

        if ( this.contextCount ) {

            console.log( 'killing WebGL context, count before:' + this.contextCount );

            this.gl.getExtension( 'WEBGL_lose_context' ).loseContext();

            this.contextCount--;

        }

    }

    /** 
     * check if we have a contex and are ready to render.
     */
    ready () {

        const gl = this.gl;

        return ( !! ( this.gl && this.glMatrix ) );

    }

    /*
     * ---------------------------------------
     * CLEAR/RESET OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Clear the screen prior to redraw.
     */
    clear () {

        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    }

    /** 
     * Clear textures from the videocard before the program starts.
     */
    clearTextures () {

        const gl = this.gl;

        let len = gl.getParameter( gl.MAX_TEXTURE_IMAGE_UNITS );

        for ( let i = 0; i < len; i++ ) {

            gl.activeTexture( gl.TEXTURE0 + i);

            gl.bindTexture( gl.TEXTURE_2D, null );

            gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

        }

        gl.bindBuffer( gl.ARRAY_BUFFER, null );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );

        gl.bindRenderbuffer( gl.RENDERBUFFER, null );

        gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    }

    /*
     * ---------------------------------------
     * SHADER VARIABLES AND UNIFORMS
     * ---------------------------------------
     */

    /** 
     * create a WeGL shader object.
     * @param {VERTEX_SHADER | FRAGMENT_SHADER} type type WebGL shader type.
     * @param {String} source the shader source, as plain text.
     * @returns {WebGLShader} a compiled WebGL shader object.
     */
    createShader ( type, source ) {

        let shader = null;

        if ( ! type || ! source ) {

            console.error( 'createShader: invalid params, type:' + type + ' source:' + source );

        } else if ( this.ready() ) {

            const gl = this.gl;

            /*
             * remove first EOL, which might come from using <script>...</script> tags,
             * to handle GLSL ES 3.00 (TWGL)
             */
            source.replace( /^[ \t]*\n/, '' );

            if ( type === gl.VERTEX_SHADER ) {

                shader = gl.createShader( type ); // assigned VS

            } else if ( type === gl.FRAGMENT_SHADER ) {

                shader = gl.createShader( type ); // assigned FS

            } else {

                console.error( 'createShader: type not recognized:' + type );
            }

            gl.shaderSource( shader, source );

            gl.compileShader( shader );

            // Detect shader compile errors.

            if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {

                console.error( 'createShader:' + gl.getShaderInfoLog( shader ) );

                shader = null;

            }

        }

        return shader;

    }

    createVertexShader ( source ) {

        return this.createShader( this.gl.VERTEX_SHADER, source );

    }

    createFragmentShader ( source ) {

        return this.createShader( this.gl.FRAGMENT_SHADER, source );

    }

    /** 
     * Use the Fetch API to get a shader file
     */
    fetchShader ( type, sourceURL ) {

        const self = this;

        fetch( sourceURL, {

            method: 'POST',

            mode: 'cors',

            redirect: 'follow',

            headers: new Headers({

                'Content-Type': 'text/plain'

            } )

        } ).then( ( response ) => { 

            console.log(text);

            if ( response.ok ) {

                return response.text();

            }

            return false;

        } ).then( ( source ) => { 

            if ( source ) {

                return this.createShader( type, source );

            }

        } );

        return null;

    }

    fetchVertexShader ( sourceURL ) {

        return this.fetchShader( this.gl.VERTEX_SHADER, sourceURL );

    }

    fetchFragmentShader ( sourceURL ) {

        return this.fetchShader( this.gl.FRAGMENT_SHADER, sourceURL );

    }

    /** 
     * create shader form script element
     * @param {String|DOMElement} tag the script element, or its id
     */
    createShaderFromTag ( tag ) {

        if ( this.util.isString( tag ) ) {

            tag = document.getElementById( tag );

        }

        if ( ! tag ) {

            console.error( 'createShaderFromTag: not found (' + tag + ')' );

            return false;

        } 

        let type = null;

        if ( tag.type ==  'x-shader/x-vertex' ) {

            type = this.gl.VERTEX_SHADER;

        } else if ( tag.type == 'x-shader/x-fragment' ) {

            type = this.gl.FRAGMENT_SHADER;

        } else {

            console.error( 'createShaderFromTag: type not found:(' + tag.type + ')');

            return null;

        }

        let source = "";

        let c = tag.firstChild;

        while ( c ) {

            if ( c.nodeType == 3 ) {

                source += c.textContent;

            }

            c = c.nextSibling;

        }

        return this.createShader( type, source );

    }

    /*
     * ---------------------------------------
     * COMPILE WEBGL PROGRAM
     * ---------------------------------------
     */

    /** 
     * Create WebGL program with shaders. Program not used until 
     * we apply gl.useProgram(program).
     * @param {gl.VERTEX_SHADER} vShader the vertex shader.
     * @param {gl.FRAGMENT_SHADER} fShader the fragment shader.
     * @returns {Object} an object containing the compiled shaders, the 
     * WebGL program, and a parsed list of all the varying and uniforms in 
     * the shader source code.
     * 
     * prg.shaderProgram = program; // the WebGL program
     * prg.vsVars = vs.varList,     // varying and uniform names in vertex shader.
     * prg.fsVars = fs.varList      // varying and uniform names in fragment shader.
     *
     */
    createProgram ( vs, fs ) {

        if ( ! vs || ! fs ) {

            console.error( 'createProgram: parameter error, vs:' + vs + ' fs:' + fs );

            return null;

        }

        // Wrap the VBO program object to keep V8 JIT happy.

        let prg = {};

        if ( this.ready() ) {

            const gl = this.gl;

            let vso = this.createVertexShader( vs.code );

            let fso = this.createFragmentShader( fs.code );

            let program = gl.createProgram();

            gl.attachShader( program, vso );

            gl.attachShader( program, fso );

            // Explicitly assign attribute names and indexes (0-32k) BEFORE linking.
            // http://stackoverflow.com/questions/4635913/explicit-vs-automatic-attribute-location-binding-for-opengl-shaders

            for ( let j in this.attributeNames ) {

                //console.log('gl.bindAttrib( shaderProgram, "' + this.attributeNames[ j ][ 1 ] + '", "' +  this.attributeNames[ j ][ 0 ] + '"' );

                gl.bindAttribLocation ( program, this.attributeNames[ j ][ 1 ], this.attributeNames[ j ][ 0 ] );

            }

            gl.linkProgram( program );

            if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {

                console.error( 'WebGL::createProgram():' + gl.getProgramInfoLog( program ) );

                this.checkShaders( vs, fs, program );

            } else {

                prg.shaderProgram = program;

                prg.vsVars = vs.varList,

                prg.fsVars = fs.varList,

                prg.renderList = []

            }

        }

        return prg;

    }


     /** 
      * Read shader code, and organize the variables in the shader 
      * into an object. Abstracts some of the tedious work in setting 
      * up shader variables.
      *
      * Called by individual Shader objects in vsSrc() and fsSrc().
      * 
      * @param {Array} sourceArr array of lines in the shader.
      * @returns {Object} an object organizing attribute, uniform, and 
      * varying variable names and datatypes.
      */
    createVarList ( source ) {

        const len = source.length;

        let NOT_IN_LIST = this.NOT_IN_LIST;

        let sp = ' ';

        let list = {};

        let varTypes = ['attribute', 'uniform', 'varying' ];

        if( len ) {

            for ( let i = 0; i < len; i++ ) {

                let s = source[ i ];

                if ( s.indexOf( 'void main' ) !== NOT_IN_LIST ) {
 
                    break;

                } else {

                    for ( let j = 0; j < varTypes.length; j++ ) {

                        let type = varTypes[j];

                        if( ! list[ type ] ) list[ type ] = {};

                        if ( s.indexOf( type ) > NOT_IN_LIST ) {

                            //////////////////////////////console.log("SSS1:" + s)

                            //s = s.slice(0, -1); // remove trailing ';'
                            s = s.replace(/;\s*$/, "");

                            ///////////////////////////////console.log("SSS:" + s)

                            s = s.split( sp );

                            //////////////////////////////console.log("FIRST: " + s)

                            let vType = s.shift(); // attribute, uniform, or varying

                            if ( ! list[ vType ] ) {

                                list[ vType ] = {};

                            }

                            /////////////////////////console.log("SECOND AFTER SHIFT:" + vType + " remainder:" + s)

                            let nType = s.shift(); // variable type

                            if ( ! list[ vType ][ nType ] ) {

                                list[ vType ][ nType ] = {};
                            }

                            let nName = s.shift(); // variable name

                            if ( ! list[ vType ][ nType ][ nName ] ) {

                                list[ vType ][ nType ][ nName ] = 'empty';

                            }

                            /////////////////////////console.log("THIRD AFTER SHIFT:" + nType + " remainder:" + s)

                        }

                    }

                }

            } 

        }

        return list;

    }

    /** 
     * Pass the pre-defined attribute indexes and names to individual Shader programs. 
     * The names and indexes are defined in the constructor.
     * @param {WebGLProgram} program a compiled WebGL program.
     * @param {Object} attributes the attributes we want to extract.
     */
    setAttributeArrays ( shaderProgram, attributes ) {

        const gl = this.gl;

        for ( let i in attributes ) {

            let attb = attributes[ i ];

            for ( let j in attb ) {

                //console.log('setAttributeNames for attb["' + j + '""],' + this.attributeNames[ j ][ 1 ] + '", "' +  this.attributeNames[ j ][ 0 ] + '"' );

                attb[ j ] = this.attributeNames[ j ][ 1 ];

            }

        }

        return attributes;

    }

    /** 
     * Store our uniform locations.
     * @param {WebGLProgram} program a compiled WebGL program.
     * @param {Object} uniforms array of uniforms.
     */
    setUniformLocations ( shaderProgram, uniforms ) {

        const gl = this.gl;

        for ( let i in uniforms ) {

            let unif = uniforms[ i ];

            for ( let j in unif ) {

                unif[ j ] = gl.getUniformLocation( shaderProgram, j );

                ////////console.log("gl.getUniformLocation( shaderProgram," + j + ") is:" + unif[ j ] );

            }

        }

        return uniforms;

    }

    /** 
     * Create associative array with shader attributes.
     * NOTE: Only attributes actually used in the shader show.
     * @param {WebGLProgram} program a compiled WebGL program.
     * @returns {Object} a collection of attributes, with .count = number.
     */
    getAttributes ( program ) {

        const gl = this.gl;

        let attrib = {};

        let attribCount = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );

        for ( let i = 0; i < attribCount; i++ ) {

            let attribInfo = gl.getActiveAttrib( program, i );

            /////////console.log("adding attribute:" + attribInfo.name );

            attrib[ attribInfo.name ] = gl.getAttribLocation( program, attribInfo.name );

        }

        // Store the number of attributes.

        attrib.count = attribCount;

        return attrib;

    }

    /** 
     * Create associative array with shader uniforms.
     * NOTE: Only attributes actually used in the Shader show.
     * @param {WebGLProgram} program a compiled WebGL program.
     * @returns {Object} a collection of attributes, with .count = number.
     */
    getUniforms ( program ) {

        const gl = this.gl;

        let uniform = {};

        let uniformCount = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );

        let uniformName = '';

        for ( let i = 0; i < uniformCount; i++ ) {

            let uniformInfo = gl.getActiveUniform( program, i );

            uniformName = uniformInfo.name.replace( '[0]', '' );

            //console.log("adding uniform:" + uniformName );

            uniform[ uniformName ] = gl.getUniformLocation( program, uniformName );

        }

        // Store the number of uniforms.

        uniform.count = uniformCount;

        return uniform;

    }

    /** 
     * Create associative array with shader varying variables.
     * @param {WebGLProgram} program a compiled WebGL program.
     */
    getVarying ( program ) {

    }

    /** 
     * check to see if we're ready to run, after supplying 
     * shaders.
     * @param {WebGLShader} vs the vertex shader.
     * @param {WebGLShader} fs the fragment shader.
     * @param {WebGLProgram} program a compiled WebGL program.
     */
    checkShaders ( vs, fs, program ) {

        const gl = this.gl;

        if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {

            // Test the vertex shader

             if ( vs && ! gl.getShaderParameter( vs, gl.COMPILE_STATUS ) ) {

                console.error( 'error creating the vertex shader, ' + gl.getShaderInfoLog( vs ) );

            } else if ( fs && !gl.getShaderParameter( fs, gl.COMPILE_STATUS ) ) {

                console.error(  'error creating the fragment shader, ' + gl.getShaderInfoLog( fs ) );

            } else {

                console.error( 'error in gl program linking' );

            }

            gl.deleteProgram( program );

            return false;

        }

        return true;

    }

    /** 
     * Check if our VBO or IBO are ok.
     */
    checkBufferObjects ( bo ) {

        return ( bo && bo instanceof ArrayBuffer );

    }

    /** 
     * Convert WebGL ENUM to string.
     */
    enumToString ( gl, val ) {

        for ( let i in gl ) {

            if ( gl[ i ] == val ) {

            return i;

            }
        }

        return '0x' + val.toString( 16 );

    }

    /** 
     * Provide statistics for display as JSON data.
     */
    stats () {

        return JSON.stringify( this.stats );

    }


}

export default WebGL;
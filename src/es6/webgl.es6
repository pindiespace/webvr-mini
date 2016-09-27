export default class WebGL {

    constructor ( config ) {

        console.log( 'in webGL class' );

        this.gl = this.canvas = null;

        if ( config ) {

            if ( config.glMatrix ) {

/////////////////////////////////
                for ( var i in config ) {
                    console.log( i + ":" + config[i] + "(" + typeof config[i] + ")" );
                }

/////////////////////////////////
                for ( var i in config.glMatrix ) {
                    console.log( i + ":" + config.glMatrix[i]);
                }
/////////////////////////////////

                this.glMatrix = config.glMatrix;

            }

            if ( config.util ) {

                this.util = config.util;

            }

            if ( config.init === true ) {

                this.init( config.canvas );

            }

        } 

    }

    /**
     * initialize with a canvas context
     * @param {Canvas} canvas
     */
    init ( canvas ) {

        if ( ! canvas ) {

            this.canvas = document.createElement( 'canvas' );

            this.canvas.width = 480;

            this.canvas.height = 320;

        } else {

            this.canvas = canvas;

        }

        if ( this.canvas ) {

            let r = this.canvas.getBoundingClientRect();

            this.canvas.width = r.width;

            this.canvas.height = r.height;

            this.gl = this.createContext();

            return true;

        }

        return false

    }

    /** 
     * check if we are ready to render
     */
    ready () {

        return ( !! ( this.canvas && this.glMatrix && this.gl ) );

    }

    /** 
     * get HTML5 canvas, and a WebGL context.
     */
    createContext () {

        if ( this.gl ) {

            this.gl = null;

        }

        this.gl = this.canvas.getContext( 'webgl' );

        if ( this.gl && typeof this.gl.getParameter == 'function' ) {

            this.glVers = this.gl.getParameter( this.gl.VERSION ).toLowerCase();

            return this.gl;

        }

        return null;

    }

    getContext () {

        return this.gl;

    }

    /** 
     * create a WeGL shader object.
     */
    createShader ( type, source ) {

        let shader = null;

        if ( ! type || ! source ) {

            console.error( 'createShader: invalid params, type:' + type + ' source:' + source );

        } else if ( this.ready() ) {

            let gl = this.gl;

            if ( type === gl.VERTEX_SHADER ) {

                shader = this.vs = gl.createShader( type ); // assigned VS

            } else if ( type === gl.FRAGMENT_SHADER ) {

                shader = this.fs = gl.createShader( type ); // assigned FS

            } else {

                console.error( 'createShader: type not recognized:' + type );
            }

            gl.shaderSource( shader, source );

            gl.compileShader( shader );

            // Detect shader compile errors.

            if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {

                console.error( 'createShader:' + gl.getShaderInfoLog( shader ) );

                if ( type === gl.VERTEX_SHADER ) {

                    this.vs = null;

                } else if ( type == gl.FRAGMENT_SHADER ) {

                    this.fs = null;

                }

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

        var self = this;

        fetch( sourceURL, {

            method: 'POST',

            mode: 'cors',

            redirect: 'follow',

            headers: new Headers({

                'Content-Type': 'text/plain'

            } )

        } ).then( function( response ) { 

            console.log(text);

            if ( response.ok ) {

                return response.text();

            }

            return false;

        } ).then( function( source ) { 

            if ( source ) {

                return self.createShader( type, source );

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

    /** 
     * Create WebGL program with shaders. Program not used until 
     * we apply gl.useProgram(program).
     * @param {gl.VERTEX_SHADER} vShader the vertex shader.
     * @param {gl.FRAGMENT_SHADER} fShader the fragment shader.
     */
    createProgram ( vs, fs ) {

        if ( ! vs || ! fs ) {

            console.error( 'createProgram: parameter error, vs:' + vs + ' fs:' + fs );

            return null;

        }

        let program = null;

        if ( this.ready() ) {

            let gl = this.gl;

            program = gl.createProgram();

            gl.attachShader( program, vs );

            gl.attachShader( program, fs );

            gl.linkProgram( program );

            if ( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {

                console.error( 'createProgram:' + gl.getProgramInfoLog( program ) );

                this.program = program = null;

            }

        }

        return program;

    }

    /** 
     * create a Vertex Buffer Object (VBO).
     * TODO: only one at a time
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    createVBO ( data, usage ) {

        if ( ! data ) {

            console.error( 'createVBO: empty data' );

            return null;
        }

        if ( ! usage ) {

            usage = gl.STATIC_DRAW;

        }

        let vbo = null;

        if ( this.ready() ) {

            let gl = this.gl;

            vbo = gl.createBuffer(); // can only be bound once

            gl.bindBuffer( gl.ARRAY_BUFFER, vbo );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( data ), usage );

            this.vbo = vbo;

        }

        return vbo;

    }

    /** 
     * Create an Index Buffer Object. 
     * TODO: only one at a time in this instance.
     */
    createIBO ( data, usage ) {

        if ( ! data ) {

            console.error( 'createVBO: empty data' );

            return null;
        }

        if ( ! usage ) {

            usage = gl.STATIC_DRAW;

        }

        let ibo = null;

        if ( this.ready() ) {

            let gl = this.gl;

            ibo = gl.createBuffer();

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, ibo ); // can only be bound once

            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( data ), usage );

            this.ibo = ibo;

        }

        return ibo;

    }

    /** 
     * Create a texture from an image object.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
     * @param {Image} image an image object.
     */
    createTexture ( img ) {

        let gl = this.gl;

        var tex = gl.createTexture();
  
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

        gl.generateMipmap( gl.TEXTURE_2D);

        gl.bindTexture( gl.TEXTURE_2D, null );

        return texture;

    }

    /* 
     * MATRIX OPERATIONS
     * Mostly with glMatrix
     */


    createMat4Perspective () {

    }

    setToMat3 () {

    }

    setModelView () {

    }

    setProjection () {

    }

    setNormals () {

    }

    loadModel () {

    }

    /** 
     * check to see if we're ready to run, after supplying 
     * shaders.
     */
    checkShaders () {

        let gl = this.gl;

        if ( ! gl.getProgramParameter( this.program, gl.LINK_STATUS ) ) {

            // Test the vertex shader

             if ( this.vs && ! gl.getShaderParameter( this.vs, gl.COMPILE_STATUS ) ) {

                console.error( 'error creating the vertex shader, ' + gl.getShaderInfoLog( this.vs ) );

            } else if (this._fragmentShader && !gl.getShaderParameter(this._fragmentShader, gl.COMPILE_STATUS ) ) {

                console.error(  'error creating the fragment shader, ' + gl.getShaderInfoLog( this.fs ) );

            } else {

                console.error( 'error in gl program linking' );

            }

            gl.deleteProgram( this.program );

            gl.deleteShader( this.vs );

            gl.deleteShader( this.fs );

            this.program = this.vs = this.fs = null;

            return false;

        }

        return true;

    }

    /** 
     * Check if our VBO and IBO are ok.
     */
    checkObjects () {


    }

    /** 
     * Setup the scene.
     */
    run () {

        if ( this.check() ) {




        }

    }

    render () {

        let gl = this.gl;

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

        // gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo );



    }

}
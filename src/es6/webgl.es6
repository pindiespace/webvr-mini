export default class WebGL {

    constructor ( config ) {

        console.log( 'in webGL class' );

        this.ready = this.gl = this.canvas = null;

        if ( config ) {

            if ( config.glMatrix ) {

                for ( var i in config.glMatrix ) {
                    console.log( i + ":" + config.glMatrix[i]);
                }

                this.glMatrix = config.glMatrix;

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

        if( ! canvas ) {

            this.canvas = document.createElement( 'canvas' );

        }

        if( this.canvas ) {

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

        this.canvas.getContext( 'webgl' );

        if ( this.gl && typeof this.gl.getParameter == 'function' ) {

            this.glVers = this.gl.getParameter( this.gl.VERSION ).toLowerCase();

            return this.gl;

        }

        return null;

    }

    getContext () {

        return this.gl;

    }

    createShader ( type, source ) {

        if ( this.ready() ) {

            let gl = this.gl;

            let shader = gl.createShader( this.gl.VERTEX_SHADER );

            gl.shaderSource( shader, source );

            gl.compileShader( shader );

            if( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {

                throw gl.getShaderInfoLog( shader );
            }

            return shader;

        }

        return null;

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

                self.createShader( type, source );

            }

        } );

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

        if ( tag && (tag.prototype.toString.call(obj) === '[object String]') ) {

            tag = document.getElementById( tag );

        }

        if ( ! tag ) {

            return false;

        }

        if ( tag.type ==  'x-shader/x-vertex' ) {

            let type = this.gl.VERTEX_SHADER;

        } else if ( tag.type == '"x-shader/x-fragment' ) {

            let type = this.gl.FRAGMENT_SHADER;

        } else {

            return false;

        }

        var source = "";

        var c = shaderTag.firstChild;

        while ( c ) {

            if ( c.nodeType == 3 ) {

                src += c.textContent;

            }

            c = c.nextSibling;

        }

        this.createShader( source, type );

    }

    createVertexShader ( source ) {

        return this.createShader( this.gl.VERTEX_SHADER, source );

    }

    createFragmentShader ( source ) {

        return this.createShader( this.gl.FRAGMENT_SHADER, source );

    }

    /** 
     * Create WebGL program with shaders. Program not used until 
     * we apply gl.useProgram(program).
     * @param {gl.VERTEX_SHADER} vShader the vertex shader.
     * @param {gl.FRAGMENT_SHADER} fShader the fragment shader.
     */
    createProgram ( vShader, fShader ) {

        if( this.ready() ) {

            let gl = this.gl;

            let program = gl.createProgram();

            gl.attachShader( program, vShader );

            gl.attachShader( program, fshader );

            gl.linkProgram( program );

            if ( ! gl.getProgramparameter( program, gl.LINK_STATUS ) ) {

                throw gl.getProgramInfoLog( program );

            }

            return program;

        }

        return null;

    }

    useProgram ( program ) {

        this.gl.useProgram( program );

    }

    /** 
     * create a Vertex Buffer Object (VBO)
     */
    createVBO ( data ) {

        if ( this.ready() ) {

            let gl = this.gl;

            let buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( data ), gl.STATIC_DRAW );

            return buffer;

        }

        return buffer;

    }

    /** 
     * Create an Index Buffer Object
     */
    createIBO ( data ) {

        if( this.ready() ) {

            let gl = this.gl;

            let buffer = gl.createBuffer();

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );

            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( data ), gl.STATIC_DRAW );

            return buffer;

        }

        return null;

    }

    createTexture ( image ) {

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

}
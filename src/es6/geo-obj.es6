class GeoObj {

    /** 
     * @class
     * Create WebGL buffers from flattened vertex, index, texture 
     * and other coordinate data.
     * @constructor
     * @param {Util} util shared utility methods, patches, polyfills.
     * @param {WebGL} webgl object holding the WebGLRenderingContext.
     */
    constructor ( util, webgl ) {

        this.webgl = webgl;

        this.util = util;

        this.FLOAT32 = 'float32',

        this.UINT32 = 'uint32';

        this.makeBuffers = true,

        this.ssz = false, // super-sized, > 65k vertices

        this.vertices = {

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

        },

        this.indices = { // where to start drawing GL_TRIANGLES.

                data: [],

                buffer: null,

                itemSize: 1,

                numItems: 0

        },

        this.sides = { // a collection of triangles creating a side on the shape.

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

        },

        this.normals = {

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

        },

        this.tangents = {

                data: [],

                buffer: null,

                itemSize: 4,

                numItems: 0

        },

        this.texCoords = {

                data: [],

                buffer: null,

                itemSize: 2,

                numItems: 0

        },

        this.colors = {

                data: [],

                buffer: null,

                itemSize: 4,

                numItems: 0

        }

    } // end of constructor

    /** 
     * Add data to create buffers, works if existing data is present. However, 
     * indices must be consistent!
     */
    addBufferData( vertices, indices, normals, texCoords, tangents = [], colors = [] ) {

        const concat = this.util.concatArr;

        this.vertices.data = concat( this.vertices.data, vertices ),

        this.indices.data = concat( this.indices.data, indices ),

        this.normals.data = concat( this.normals.data, normals ),

        this.texCoords.data = concat( this.texCoords.data, texCoords ),

        this.tangents.data = concat( this.tangents.data, tangents ),

        this.colors.data = concat( this.colors.data, colors );

        if ( this.vertices.data.length > webgl.MAX_DRAWELEMENTS ) {

            this.ssz = true;

        } else {

            this.ssz = false;
        }

        return this;

    }

    /** 
     * Bind a WebGL buffer
     * @param {Object} o the bufferObj for for particular array (e.g. vertex, tangent).
     * @param {String} type the typed-array type.
     */
    bindGLBuffer( o, type ) {

        const gl = this.webgl.getContext();

        o.buffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

        switch( type ) {

            case this.FLOAT32:

                if (  o.data instanceof Float32Array ) {

                        gl.bufferData( gl.ARRAY_BUFFER, o.data, gl.STATIC_DRAW );

                    } else {

                        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

                    }

                o.numItems = o.data.length / o.itemSize;

                break;

            case this.UINT16:

                o.buffer = gl.createBuffer();

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

                gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( o.data ), gl.STATIC_DRAW );

                o.numItems = o.data.length / o.itemSize;

                break;

            default:

                console.error( 'GeoObj::bindGLBuffer(): invalid WebGL buffer type ' + type );

                break;

        }

    }

    /** 
     * Create WebGL buffers using geometry data. Note that the 
     * size is for flattened arrays.
     * an array of vertices, in glMatrix.vec3 objects.
     * an array of indices for the vertices.
     * an array of texture coordinates, in glMatrix.vec2 format.
     * an array of normals, in glMatrix.vec3 format.
     * an array of tangents, in glMatrix.vec3 format.
     * an array of colors, in glMatrix.vec4 format.
     */
    createGLBuffers() {

            const gl = this.webgl.getContext();

            // Vertex Buffer Object.

            let o = this.vertices;

            if ( ! o.data.length ) {

                console.log( 'GeoObj::createGLBuffers(): no vertices present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0 ] );

            }

            // Flag buffers that are too big to use with gl.drawElements()

            if ( o.data.length > this.webgl.MAX_DRAWELEMENTS ) {

                this.ssz = true;

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Index buffer.

            o = this.indices;

            if ( ! o.data.length ) {

                console.log( 'GeoObj::createGLBuffers(): no indices present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            this.bindGLBuffer( o, this.UINT16 );

            // Create the Sides buffer, a kind of indices buffer.

            o = this.sides;

            if ( ! o.data.length ) {

                console.warn( 'GeoObj::createGLBuffers(): no sides present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            this.bindGLBuffer( o, this.UINT16 );

            // create the Normals buffer.

            o = this.normals;

            if ( ! o.data.length ) {

                console.log( 'GeoObj::createGLBuffers(): no normals, present, creating default' );

                o.data = new Float32Array( [ 0, 1, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the primary Texture buffer.

            o = this.texCoords;

            if ( ! o.data.length ) {

                console.warn( 'GeoObj::createGLBuffers(): no texture present, creating default' );

                o.data = new Float32Array( [ 0, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // create the Tangents Buffer.

            o = this.tangents;

            if ( ! o.data.length ) {

                console.warn( 'GeoObj::createGLBuffers(): no tangents present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Colors buffer.

            o = this.colors;

            if ( ! o.data.length ) {

                console.warn( 'GeoObj::createGLBuffers(): no colors present, creating default color' );

                o.data = new Float32Array( this.computeColors( this.normals.data, o.data ) );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Set the flag.

            this.makeBuffers = false;

        return this;

    }

        /** 
     * Create default colors for Prim color array.
     */
    computeColors( normals, colors ) {

        for ( let i = 0; i < normals.length; i += 3 ) {

            colors.push( normals[ i ], normals[ i + 1 ], normals[ i + 2 ], 1.0 );

        }

        return colors;

    }

}

export default GeoObj;

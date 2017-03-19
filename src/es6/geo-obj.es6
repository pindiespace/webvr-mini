class GeoObj {

    /** 
     * @class
     * Create WebGL buffers from flattened vertex, index, texture 
     * and other coordinate data.
     * @constructor
     * @param {Util} util shared utility methods, patches, polyfills.
     * @param {WebGL} webgl object holding the WebGLRenderingContext.
     */
    constructor ( name, util, webgl ) {

        this.primName = name,

        this.webgl = webgl,

        this.util = util,

        this.FLOAT32 = 'float32',

        this.UINT   = 'uint';

        this.UINT32 = 'uint32';

        this.UINT16 = 'uint16';

        this.makeBuffers = true,

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

        };

        // Save the max allowed drawing size. For WebGL 1.0 with extension, vertices must be < 65k.

        this.MAX_DRAWELEMENTS = this.webgl.MAX_DRAWELEMENTS;

        this.mName = 'geo-obj for ' + this.primName + '::';

    } // end of constructor

    /** 
     * Confirm that data is a number.
     */
    confirmNumericalData ( data, dataType, arrName ) {

        for ( let i = 0; i < len; i++ ) {

            let d = this.data[ i ];


            switch( dataType ) {

                case this.FLOAT32:

                    if ( ! this.util.isFinite( parseFloat( d ) ) ) {

                        console.error( mName +  'confirmNumericalData(): invalid float32 at pos:' + i );

                        return false;

                    }

                    break;

                case this.UINT16:
                case this.UINT32:
                case this.UINT:

                    if ( ! this.util.isFinite( parseInt( d ) ) ) {

                        console.error( mName +  'confirmNumericalData(): invalid Uint at pos:' + i );

                        return false;

                    }

                    break;

                default:

                    console.error( mName +  ' confirmNumericalData(): unknown data type ' + dataType );

                    return false;

                    break;

            }

        }

        return true;

    }

    /** 
     * Check validity of buffer data.
     * @param {Boolean} complete if true, do extra checks.
     * @returns {Boolean} if buffers ok to use, return true, else false.
     */
    checkBufferData ( complete ) {

        let valid = true;

        let fnName = this.mName + ' checkBufferData():'; // so many error messages we use this.

        // Vertex check.

        let len = this.vertices.data.length;

        let vLen = len;

        let numVertices = len / this.vertices.itemSize;

        if ( len < this.vertices.itemSize || this.util.frac( numVertices ) !== 0 ) {

            console.error( fnName + ' invalid vertex size, ' + this.vertices.data.length );

            valid = false;

        } else if ( len > this.MAX_DRAWELEMENTS ) {

            console.error( fnName + ' vertex size exceeds 64k on hardware not supporting it' );

            valid = false;
        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.vertices.data, this.FLOAT32, 'vertices' ) ) {

                valid = false;

            }

        }

        // Index check. 

        len = this.indices.data.length;

        if ( len < this.indices.itemSize ) { // can be fractional

            console.error( fnName + ' invalid index size, ' + this.indices.data.length );

            valid = false;

        }

        if ( complete ) {

            // Make sure we have a valid number

              if ( ! this.confirmNumericalData( this.indices.data, this.UINT, 'indices' ) ) {

                valid = false;

            }

            // Make sure indices point to valid vertex.

            let d = this.indices.data;


            for ( let i = 0; i < len; i++ ) {

                let di = d[ i ];

                if ( di <= 0 || di > vLen ) {

                    console.error ( fnName + ' index at ' + i + ' points to invalid postion in vertices ' + di + ', max:' + vLen );

                    valid = false;

                }

            }

        }

        // Normals check (should always be present).

        len = this.normals.data.length;

        if ( len < this.normals.itemSize || this.util.frac( len / this.normals.itemSize ) !== 0 ) {

            console.error( fnName + ' invalid normals size, ' + this.normals.data.length );

            valid = false;

        } else if ( len !== this.vertices.data.length ) {

            console.error( fnName + ' normals length: ' + len + ' does not match vertices length: ' + vLen );

            valid = false;

        }

        if ( complete ) {

          if ( ! this.confirmNumericalData( this.normals.data, this.FLOAT32, 'normals' ) ) {

                valid = false;

            }

        }

        // Texture coords check.

        len = this.texCoords.data.length;

        if ( len > 0 ) {

            let aLen = len / this.texCoords.itemSize;

            if ( len < ( this.texCoords.itemSize ) ||  this.util.frac( aLen ) !== 0 ) {

                console.error( fnName + ' invalid texCoords size, ' + this.texCoords.data.length );

                valid = false;

            } else if ( aLen !== numVertices ) {

                console.error( fnName + ' texCoords length: ' + len + ' does not match vertices length: ' + vLen );

                valid = false;

            }

        } else {

            console.warn( fnName + ' no texCoords data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.texCoords.data, this.FLOAT32, 'texCoords' ) ) {

                valid = false;

            }

        }

        // Tangents check.

        len = this.tangents.data.length;

        if ( len > 0 ) {

            if ( len < ( this.tangents.itemSize ) || this.util.frac( len / this.tangents.itemSize  !== 0 ) ) {

                console.error(fnName + ' invalid tangents size, ' + this.tangents.data.length );

                valid = false;

            } else if ( len !== this.vertices.data.length ) {

                console.error( fnName + ' tangents length ' + len + ' does not match vertices length: ' + vLen );

                valid = false;

            }

        } else {

            console.warn( fnName + ' no tangents data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.tangents.data, this.FLOAT32, 'tangents' ) ) {

                valid = false;

            }

        }

        // Texture coords check.

        len = this.colors.data.length;

        if ( len > 0 ) {

            let aLen = len / this.colors.itemSize;

            if ( len < ( this.colors.itemSize ) || this.util.frac( aLen ) !== 0 ) {

                console.error( fnName + ' invalid texCoords size, ' + this.texCoords.data.length );

                valid = false;

            } else if ( aLen !== numVertices ) {

                console.error( fnName + ' colors length: ' + len + ' does not match vertices length:' + vLen );

                valid = false;

            }

        } else {

            console.warn( fnName + ' no colors data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.colors.data, this.FLOAT32, 'colors' ) ) {

                valid = false;

            }

        }


        // All ok?

        return valid;

    }

    /** 
     * Add data to existing data (e.g. combine two Prims into one)
     */
    addBufferData ( vertices, indices, normals, texCoords, tangents = [], colors = [] ) {

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

            case this.UINT32:

                o.buffer = gl.createBuffer();

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

                gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array( o.data ), gl.STATIC_DRAW );

                o.numItems = o.data.length / o.itemSize;

                break;

            case this.UINT16:

                o.buffer = gl.createBuffer();

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

                gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( o.data ), gl.STATIC_DRAW );

                o.numItems = o.data.length / o.itemSize;

                break;

            default:

                console.error( this.mName + 'bindGLBuffer(): invalid WebGL buffer type ' + type );

                break;

        }

    }

    setVertices ( vertices ) {

        let o = this.vertices;

        if ( this.util.isArray( vertices ) ) {

            o.data = new Float32Array( vertices );

            o.numItems = vertices.length / o.itemSize;

        } else {

            console.error( this.mName +'setVertices() invalid input, not Array' );
        }

    }

    setIndices ( indices ) {

        let o = this.indices;

        if( this.util.isArray( indices ) ) {

            if ( this.webgl.stats.uint32 ) {

                o.data = new Uint32Array( indices );

            } else {

                o.data = new Uint16Array( indices );

            }

        } else {

            console.error( this.mName + 'setIndices() invalid input, not Array' );

        }

    }

    setNormals ( normals ) {

        let o = this.normals;

        if ( this.util.isArray( normals ) ) {

            o.data = new Float32Array( normals );

            o.numItems = normals.length / o.itemSize;

        } else {

            console.error( this.mName + 'setNormals() invalid input, not Array' );
        }


    }

    setTexCoords ( texCoords ) {

        let o = this.texCoords;

        if ( this.util.isArray( texCoords ) ) {

            o.data = new Float32Array( texCoords );

            o.numItems = texCoords.length / o.itemSize;

        } else {

            console.error( this.mName + 'setTexCoords() invalid input, not Array' );
        }


    }

    setColors ( colors ) {

        let o = this.colors;

        if ( this.util.isArray( colors ) ) {

            o.data = new Float32Array( vertices );

            o.numItems = colors.length / o.itemSize;

        } else {

            console.error( this.mName + 'setTangents() invalid input, not Array' );

        }

    }

    setTangents ( tangents ) {

        let o = this.tangents;

        if ( this.util.isArray( tangents ) ) {

            o.data = new Float32Array( tangents );

            o.numItems = tangents.length / o.itemSize;

        } else {

            console.error( this.mName + 'setTangents() invalid input, not Array' );

        }

    }

    /** 
     * Create (empty) WebGL buffers using geometry data. Note that the 
     * size is for flattened arrays.
     * an array of vertices, in glMatrix.vec3 objects.
     * an array of indices for the vertices.
     * an array of texture coordinates, in glMatrix.vec2 format.
     * an array of normals, in glMatrix.vec3 format.
     * an array of tangents, in glMatrix.vec3 format.
     * an array of colors, in glMatrix.vec4 format.
     */
    createGLBuffers () {

            const gl = this.webgl.getContext();

            let fnName = this.mName + 'createGLBuffers():';

            // Vertex Buffer Object.

            let o = this.vertices;

            if ( ! o.data.length ) {

                console.log( fnName + ' no vertices present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Index buffer.

            o = this.indices;

            /* 
             * Conditionally create a UINT16 or UINT32 buffer for the index values, based 
             * on whether this is WebGL 2.0, or the WebGL extension is available
             */
            if ( this.webgl.stats.uint32 ) {

                if ( ! o.data.length ) {

                    console.log( fnName + ' no indices present, creating default' );

                    o.data = new Uint32Array();

                }

                this.bindGLBuffer( o, this.UINT32 );

            } else {


                if ( ! o.data.length ) {

                    console.log( fnName + ' no indices present, creating default' );

                    o.data = new Uint16Array();

                }

                this.bindGLBuffer( o, this.UINT16 );

            }

            // Create the Sides buffer, a kind of indices buffer.

            o = this.sides;

            if ( ! o.data.length ) {

                console.warn( fnName + ' no sides present, creating default' );

                o.data = new Uint16Array();

            }

            this.bindGLBuffer( o, this.UINT16 );

            // create the Normals buffer.

            o = this.normals;

            if ( ! o.data.length ) {

                console.log( fnName + ': no normals, present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the primary Texture buffer.

            o = this.texCoords;

            if ( ! o.data.length ) {

                console.warn( fnName + ' no texture present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // create the Tangents Buffer.

            o = this.tangents;

            if ( ! o.data.length ) {

                console.warn( fnName + ' no tangents present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Colors buffer.

            o = this.colors;

            if ( ! o.data.length || ( o.data.length < ( 4 * this.vertices.length / 3 ) ) ) {

                console.warn( fnName + ' no colors present, creating default color' );

                o.data = new Float32Array( this.computeColors( this.normals.data, o.data ) );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Set the flag.

            this.makeBuffers = false;

        return this;

    }

    /** 
     * Create default colors for Prim color array.
     * @param {glMatrix.vec3} normals the normals array.
     * @param {glmatrix.vec4} colors the colors array.
     */
    computeColors( normals, colors ) {

        let c = [];

        // Catch the case where we want a single color.

        if ( colors.length === 4 ) {

            for ( let i = 0; i < normals.length; i += 3 ) {

                c.push( colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 3 ] );

            }

        }

        // Otherwise, create colors as a normals map.

        for ( let i = 0; i < normals.length; i += 3 ) {

            c.push( normals[ i ], normals[ i + 1 ], normals[ i + 2 ], 1.0 );

        }

        return new Float32Array( c );

    }

}

export default GeoObj;

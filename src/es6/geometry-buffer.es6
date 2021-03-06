'use strict'

class GeometryBuffer {

    /** 
     * @class
     * Create an object from a Prim which may be used by our Shader objects.
     * Create WebGL buffers from flattened vertex, index, texture and other coordinate data.
     * @constructor
     * @param {Util} util shared utility methods, patches, polyfills.
     * @param {WebGL} webgl object holding the WebGLRenderingContext.
     */
    constructor ( name, util, webgl, type ) {

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

        this.pointSizes = {

                data: [],

                buffer: null,

                itemSize: 1,

                numItems: 0

        };

        this.valid = false;

        // Save the max allowed drawing size. For WebGL 1.0 with extension, vertices must be < 65k.

        this.MAX_DRAWELEMENTS = this.webgl.MAX_DRAWELEMENTS;

        this.mName = this.primName + ' GeometryBuffer::';

    } // end of constructor


    /* 
     * If we are limited to 65k drawing, split up our arrays, and re-index our index array
     * so the indices are always gl.UNSIGNED_SHORT. Use on old WebGL distributions.
     */
    splitBuffers () {


        // TODO: split buffers

        // TODO: create multiple indices

        // TODO: package in new WebGL buffer structure.

    }

    /** 
     * Confirm that data is a number.
     * @param {Array} data the data array
     * @param {String} dataType the type (FLOAT32, UINT16, UINT32, UINT)
     * @param {String} arrName the name of the array.
     */
    confirmNumericalData ( data, dataType, arrName ) {

        let len = data.length;

        for ( let i = 0; i < len; i++ ) {

            let d = data[ i ];

            switch( dataType ) {

                case this.FLOAT32:

                    if ( ! Number.isFinite( parseFloat( d ) ) ) {

                        console.error( this.mName +  'confirmNumericalData(): invalid float32 in ' + arrName + ' at pos:' + i + ' = ' + d );

                        return false;

                    }

                    break;

                case this.UINT16:
                case this.UINT32:
                case this.UINT:

                    if ( ! Number.isFinite( parseInt( d ) ) ) {

                        console.error( this.mName +  'confirmNumericalData(): invalid Uint in ' + arrName + ' at pos:' + i + ' = ' + d );

                        return false;

                    }

                    break;

                default:

                    console.error( this.mName +  ' confirmNumericalData(): unknown data type ' + dataType + ' for:' + arrName );

                    return false;

                    break;

            }

        }

        return true;

    }

    /** 
     * Check integrity of vertex data
     * @param {Boolean} complete it true, do all the tests.
     */
    checkVertexData ( complete ) {

        let fnName = this.mName + ' checkVertexData():'; // so many error messages we use this.

        let len = this.vertices.data.length;

        let numVertices = this.numVertices();

        if ( len < this.vertices.itemSize || this.util.frac( numVertices ) !== 0 ) {

            console.error( fnName + ' invalid vertex size, ' + numVertices );

            return false;

        } else if ( len > this.MAX_DRAWELEMENTS ) {

            console.error( fnName + ' vertex size exceeds 64k on hardware not supporting it' );

            return false;
        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.vertices.data, this.FLOAT32, 'vertices' ) ) {

               return false;

            }

        }

        return numVertices; // number of vertices (not array length)

    }

    /** 
     * Check integrity of index data.
     * @param {Boolean} complete it true, do all the tests.
     */
    checkIndexData ( complete ) {

        let fnName = this.mName + ' checkIndexData():'; // so many error messages we use this.

        let len = this.numIndices(),

        vLen = this.numVertices();

        if ( len < this.indices.itemSize ) { // can be fractional

            console.error( fnName + ' invalid index size, ' + len );

            return false;

        }

        if ( complete ) {

            // Make sure we have a valid number

            if ( ! this.confirmNumericalData( this.indices.data, this.UINT, 'indices' ) ) {

                return false;

            }

            // Make sure indices point to valid vertex.

            let d = this.indices.data;

            for ( let i = 0; i < len; i++ ) {

                let di = d[ i ];

                if ( di < 0 || di > vLen ) {

                    console.error ( fnName + ' index at ' + i + ' points to invalid postion in vertices ' + di + ', max:' + vLen );

                    return false;

                }

            }

        }

        return len; // number of indices

    }

    /** 
     * Check the number of sides (triangles) 
     * @param {Boolean} complete it true, do all the tests.
     */
    checkFacesData ( complete ) {

        // TODO: first check 3-sided faces (triangles).

        // TODO: then check non-triangle larger drawing faces defined on the object.

        // Make sure we have a valid number of Faces (triangles)

        let len = this.numFaces();

        if ( ! len ) {

            console.error( fnName + ' number of sides (triangles) is invalid' );

            return false;

        }

        return len;

    }

    /** 
     * Normals check (assumed always present for drawing).
     * @param {Boolean} complete it true, do all the tests.
     */
    checkNormalsData ( complete ) {

        let fnName = this.mName + ' checkNormalsData():'; // so many error messages we use this.

        let numVertices = this.numVertices(),

        len = this.numNormals();

        if ( len < this.normals.itemSize || this.util.frac( len ) !== 0 ) {

            console.error( fnName + ' invalid normals size, ' + len );

            return false;

        } else if ( len !== numVertices ) {

            console.error( fnName + ' normals length: ' + this.numNormals() + ' does not match vertices length: ' + this.numVertices() );

            return false;

        }

        if ( complete ) {

          if ( ! this.confirmNumericalData( this.normals.data, this.FLOAT32, 'normals' ) ) {

                return false;

            }

        }

        return len;

    }

    /** 
     * Check texture coordinate data.
     * @param {Boolean} complete it true, do all the tests.
     */
    checkTexCoordsData ( complete, texCoords ) {

        let fnName = this.mName + ' checkTexCoordsData():'; // so many error messages we use this.

        let numVertices = this.numVertices(),

        tc = texCoords || this.texCoords, // allows handling multiple texCoord buffers.

        len = this.numTexCoords( tc );

        if ( len > 0 ) {

            if ( len < ( tc.itemSize ) ||  this.util.frac( len ) !== 0 ) {

                console.error( fnName + ' invalid texCoords size, ' + tc.data.length );

                return false;

            } else if ( len !== numVertices ) {

                console.error( fnName + ' texCoords length: ' + this.numTexCoords( tc ) + ' does not match vertices length: ' + this.numVertices() );

                return false;

            }

        } else {

            console.warn( fnName + ' no texCoords data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( tc.data, this.FLOAT32, 'texCoords' ) ) {

                return false;

            }

        }

        return len;

    }

    /** 
     * Check tangent data.
     * @param {Boolean} complete it true, do all the tests.
     */
    checkTangentsData ( complete ) {

        let fnName = this.mName + ' checkTangentsData():'; // so many error messages we use this.

        let numVertices = this.numVertices(),

        len = this.numTangents();

        if ( len > 0 ) {

            if ( len < ( this.tangents.itemSize ) || this.util.frac( len ) !== 0  ) {

                console.error(fnName + ' invalid tangents size, ' + len );

                return false;

            } else if ( len !== numVertices ) {

                console.error( fnName + ' tangents length ' + this.numTangents() + ' does not match vertices length: ' + this.numVertices() );

                return false;

            }

        } else {

            console.warn( fnName + ' no tangents data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.tangents.data, this.FLOAT32, 'tangents' ) ) {

                return false;

            }

        }

        return len;

    }

    /**
     * Check color data.
     * @param {Boolean} complete it true, do all the tests.
     */
    checkColorsData ( complete ){

        let fnName = this.mName + ' checkColorsData():'; // so many error messages we use this.

        let numVertices = this.numVertices(),

        len = this.numColors();

        if ( len > 0 ) {

            if ( len < ( this.colors.itemSize ) || this.util.frac( len ) !== 0 ) {

                console.error( fnName + ' invalid colors size, ' + this.colors.data.length );

                return false;

            } else if ( len !== numVertices ) {

                console.error( fnName + ' colors length: ' + this.numColors() + ' does not match vertices length:' + this.numVertices() );

                return false;

            }

        } else {

            console.warn( fnName + ' no colors data defined.' );

        }

        if ( complete ) {

            if ( ! this.confirmNumericalData( this.colors.data, this.FLOAT32, 'colors' ) ) {

                return false;

            }

        }

        return len;

    }

    /** 
     * Check validity of buffer data.
     * @param {Boolean} complete if true, do extra checks.
     * @returns {Boolean} if buffers ok to use, return true, else false.
     */
    checkBufferData ( complete ) {

        let valid = this.valid = true;

        let len = this.vertices.data.length;

        let vLen = len; // used in indices checks

        let fnName = this.mName + ' checkBufferData():'; // so many error messages we use this.
        
        // Vertex check.

        if ( this.checkVertexData( true ) && 

            this.checkIndexData( true ) && 
        
            this.checkNormalsData( true ) && 
        
            this.checkTexCoordsData( true ) && 

            this.checkTangentsData( true ) && 
        
            this.checkColorsData( true ) ) {

            return true;

        }

        console.warn( this.mName + 'checkBufferData() buffers not ok' );

        return false;

    }

    /** 
     * Returns the number of vertex points.
     * @returns {Number} the number of vertices.
     */
    numVertices () {

        return ( this.vertices.data.length / this.vertices.itemSize );

    }

    /** 
     * Returns the number of indices.
     * @returns {Number} the number of indices.
     */
    numIndices () {

        return ( this.indices.data.length );

    }

    /** 
     * Returns the number of normals.
     * @returns {Number} the number of normals.
     */
    numNormals () {

        return ( this.normals.data.length / this.normals.itemSize );

    }

    /** 
     * Returns the number of texture coordinates.
     * @param {glMatrix.vec2[] texCoords} use if defined, else default to this.texCoords buffer.
     * @returns {Number} the number of texture coordinates.
     */
    numTexCoords ( texCoords ) {

        // Since we can have multiple texCoords, condtional.

        let tc = texCoords || this.texCoords;

        return ( tc.data.length / tc.itemSize );

    }

    /** 
     * Returns the number of tangents.
     * @returns {Number} the number of texture coordinates.
     */
    numTangents () { 

        return ( this.tangents.data.length / this.tangents.itemSize );

    }

    numColors () {

        return ( this.colors.data.length / this.colors.itemSize );

    }

    /** 
     * Returns the number of faces (triangles).
     * @returns {Number} the number of faces.
     */
    numFaces () {

        let len = this.indices.length / 3;

        if ( this.util.frac( len / this.tangents.itemSize  !== 0 ) ) {

            console.error( this.mName + 'numFaces(): fractional number of faces' );

        }

        return len;

    }

    /** 
     * Returns the number of sides (many Prims have only one).
     * @returns {Number} the number of sides.
     */
    numSides () {

        console.warn( this.mName + 'numSides(): sides not implemented yet' );

        return 0;

    }

    /** 
     * Returns the number of coordinates for ALL buffers as a sum.
     * use to compute if we are 'dirty' and need to run this.createGLBuffers();
     * @returns {Number} total size of ALL buffers.
     */
    numCoords () {

        return ( this.numVertices() + this.numIndices() + this.numNormals() + this.numTangents() + this.numColors() );

    }

    /** 
     * Set or reset the vertices.
     * @param {glMatrix.vec3[]} vertices a flattened vertex array.
     */
    setVertices ( vertices ) {

        let o = this.vertices;

        if ( this.util.isArray( vertices ) ) {

            o.data = new Float32Array( vertices );

            o.numItems = vertices.length / o.itemSize;

            this.bindGLBuffer( o, this.FLOAT32 );

        } else {

            console.warn( this.mName +'setVertices() invalid input, not Array, nothing set' );
        }

    }

    /** 
     * Set or reset the indices.
     * @param {Array} indices a flattened index array.
     */
    setIndices ( indices ) {

        let o = this.indices;

        if( this.util.isArray( indices ) ) {

            if ( this.webgl.stats.uint32 ) {

                o.data = new Uint32Array( indices );

                this.bindGLBuffer( o, this.UINT32 );

            } else {

                o.data = new Uint16Array( indices );

                this.bindGLBuffer( o, this.UINT16 );

            }

        } else {

            console.warn( this.mName + 'setIndices() invalid input, not Array, nothing set' );

        }

    }

    /** 
     * Set or reset the normals.
     * @param {glMatrix.vec3[]} normals a flattened normals array.
     */
    setNormals ( normals ) {

        let o = this.normals;

        if ( this.util.isArray( normals ) ) {

            o.data = new Float32Array( normals );

            o.numItems = normals.length / o.itemSize;

            this.bindGLBuffer( o, this.FLOAT32 );

        } else {

            console.error( this.mName + 'setNormals() invalid input, not Array' );
        }


    }

    /** 
     * Set or reset the texture coordinates.
     * @param {glMatrix.vec3[]} texCoords a flattened texture coordinate array.
     */
    setTexCoords ( texCoords ) {

        let o = this.texCoords;

        if ( this.util.isArray( texCoords ) ) {

            o.data = new Float32Array( texCoords );

            o.numItems = texCoords.length / o.itemSize;

            this.bindGLBuffer( o, this.FLOAT32 );

        } else {

            console.error( this.mName + 'setTexCoords() invalid input, not Array' );
        }

    }

    /** 
     * Set or reset the colors.
     * @param {glMatrix.vec4[]} vertices a flattened color array.
     */
    setColors ( colors ) {

        let o = this.colors;

        if ( this.util.isArray( colors ) ) {

            o.data = new Float32Array( colors );

            o.numItems = colors.length / o.itemSize;

            this.bindGLBuffer( o, this.FLOAT32 );

        } else {

            console.error( this.mName + 'setTangents() invalid input, not Array' );

        }

    }

    /** 
     * Set or reset the tangents.
     * @param {glMatrix.vec3[]} vertices a flattened tangent array.
     */
    setTangents ( tangents ) {

        let o = this.tangents;

        if ( this.util.isArray( tangents ) ) {

            o.data = new Float32Array( tangents );

            o.numItems = tangents.length / o.itemSize;

            this.bindGLBuffer( o, this.FLOAT32 );

        } else {

            console.error( this.mName + 'setTangents() invalid input, not Array' );

        }

    }

    setBufferData ( vertices = [], indices = [], normals = [], texCoords = [], tangents = [], colors = [] ) {

        if ( vertices.length > 0 ) {

            this.setVertices( vertices );

            console.log( 'numVertices is now:' + this.numVertices() )

        }

        if ( indices.length > 0 ) {

            this.setIndices( indices );

            console.log( 'numIndices is now:' + this.numIndices() )

        }

        if ( normals.length > 0 ) {

            this.setNormals( normals );

            console.log( 'numNormals is now:' + this.numNormals() )

        }

        if ( texCoords.length > 0 ) {

            this.setTexCoords( texCoords );

            console.log( 'numTexCoords is now:' + this.numTexCoords() )

        }

        if ( tangents.length > 0 ) {

            this.setTangents( tangents );

            console.log( 'numTangents is now:' + this.numTangents() )

        }

        if ( colors.length > 0 ) {

            this.setColors( colors );

            console.log( 'numColors is now:' + this.numColors() )

        }

        if ( this.vertices.data.length > this.webgl.MAX_DRAWELEMENTS ) {

            this.ssz = true;

        } else {

            this.ssz = false;

        }

    }

    /** 
     * Add data to existing data (e.g. combine two Prims into one).
     * @param {glMatrix.vec3[]} vertices the position data.
     * @param {Number} indices the index array for the vertices.
     * @param {glMatrix.vec3[]} the normals array for the vertices.
     * @param {glMatrix.vec2[]} the texture coordinates for the vertices.
     * @param {glMatrix.vec4[]} the tangent coordinates for the vertices.
     * @param {glMatrix.vec4[]} colors the colors array for the vertices.
     * @param {Boolean} check if true, check the data for consistency, else do not.
     */
    addBufferData ( vertices = [], indices = [], normals = [], texCoords = [], tangents = [], colors = [], check ) {

        // Local reference to utility function.

        const concat = this.util.concatArr;

        // Current buffer size.

        let currBufferSize = this.numCoords();

        // Concat data, if present.

        this.vertices.data = concat( this.vertices.data, vertices );

        this.indices.data = concat( this.indices.data, indices ),

        this.normals.data = concat( this.normals.data, normals ),

        this.texCoords.data = concat( this.texCoords.data, texCoords ),

        this.tangents.data = concat( this.tangents.data, tangents ),

        this.colors.data = concat( this.colors.data, colors );

        if ( this.vertices.data.length > this.webgl.MAX_DRAWELEMENTS ) {

            this.ssz = true;

        } else {

            this.ssz = false;

        }

        // Reset WebGL buffers if size has changed.

        if ( currBufferSize !== this.numCoords() ) {

            this.createGLBuffers();

        }

        // If check flagged, make sure the data is valid for drawing by a Shader.

        if ( check ) {

            return this.checkBufferData();

        } 

        return true;

    }

    clearData ( c ) {

        c.data = [];

    }

    clearBuffer ( c ) {

        this.clearData( c ),

        c.buffer = null,

        c.numItems = 0;

    }

    clear () {

        this.clearBuffer( this.vertices ),

        this.clearBuffer( this.indices ),

        this.clearBuffer( this.normals ),

        this.clearBuffer( this.texCoords ),

        this.clearBuffer( this.colors );

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

                // console.log( fnName + ' no vertices present, creating default' );

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

                    // console.log( fnName + ' no indices present, creating default' );

                    o.data = new Uint32Array();

                }

                this.bindGLBuffer( o, this.UINT32 );

            } else {


                if ( ! o.data.length ) {

                    // console.log( fnName + ' no indices present, creating default' );

                    o.data = new Uint16Array();

                }

                this.bindGLBuffer( o, this.UINT16 );

            }

            // Create the Sides buffer, a kind of indices buffer.

            o = this.sides;

            if ( ! o.data.length ) {

                // console.warn( fnName + ' no sides present, creating default' );

                o.data = new Uint16Array();

            }

            this.bindGLBuffer( o, this.UINT16 );

            // create the Normals buffer.

            o = this.normals;

            if ( ! o.data.length ) {

                // console.log( fnName + ': no normals, present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the primary Texture buffer.

            o = this.texCoords;

            if ( ! o.data.length ) {

                // console.warn( fnName + ' no texture present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // create the Tangents Buffer.

            o = this.tangents;

            if ( ! o.data.length ) {

                // console.warn( fnName + ' no tangents present, creating default' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Colors buffer.

            o = this.colors;

            if ( ! o.data.length || ( o.data.length < ( 4 * this.vertices.length / 3 ) ) ) {

                // console.warn( fnName + ' no colors present, creating default color' );

                o.data = new Float32Array();

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Set the flag.

            this.makeBuffers = false;

        return this;

    }

}

export default GeometryBuffer;

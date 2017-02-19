/** 
 * A mesh object containing un-flattened references to vertices, indices, and 
 * texture coordinates, suitable for subdivision and other complex manipulations.
 */
import Util   from './util';

/** 
 * Create a class for manipulating 3d data, We don't use glMatrix since the 
 * calculations here are faster if done locally.
 */
 class Coords {

    /**
     * @constructor
     * @param {Number} x the initializing x or 0 coordinate
     * @param {Number} y the initializing y or 1 coordinate
     * @param {Number} z the initializing z or 2 coordinate
     */
    constructor ( x = 0, y = 0, z = 0 ) {

        this.x = x;

        this.y = y;

        this.z = z;

    }

    /**
     * Check for null or undefined values.
     * @returns {Boolen} all all 3 coordinates are defined, return true, else false
     */
    isValid () {

        return ( Number.isFinite( parseFloat( this.x ) ) && 

            Number.isFinite( parseFloat( this.y ) ) && 

            Number.isFinite( parseFloat( this.z ) ) );

    }

    /**
     * Return a new copy of this Coords
     * @returns {Coords} a copy of the current coordinates.
     */
    clone () {

        return new Coords( this.x, this.y, this.z );

    }

    /** 
     * return a flattened coordinate array.
     */
    flatten () {

        return [ this.x, this.y, this.z ];

    }

} // End of class.

class Vertex {

    /** 
     * Create a class containing position, texture coordinate, and mesh
     * connectivity information.
     */
    constructor( x = 0, y = 0, z = 0, u = 0, v = 0, idx = '', vertexArr = [] ) {

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        this.idx = idx;

        this.vertexArr = vertexArr;

    }

    isValid () {

        if ( this.coords.isValid() && 

            Number.isFinite( parseFloat( this.u ) ) && this.u >= 0 && 

            Number.isFinite( parseFloat( this.v ) ) && this.v >= 0 ) {

            return true;

        }

        return false;

    }

    clone () {

        return new Vertex( this.coords.x, this.coords.y, this.coords.z, 

            this.texCoords.u, this.texCoords.v, 

            this.idx, this.vertexArr );

    }

    flatten () {

        return this.coords.flatten().concat( [ this.texCoords.u, this.texCoords.v ] );

    }

} // End of class.

class Edge {

    /** 
     * Edge, storing two consecutive Vertex objects
     */
    constructor () {

    }

}


class Face {

    /** 
     * Face, storing three consecttive Vertex objects
     */
    constructor () {

    }

}


class Mesh {

    /** 
     * Class for subdivision and other complex coordinate manipulation
     * @param {Float32Array} vertices a flat array of xyz position coordinates
     * @param {Uint32Array} indices indices for drawing the array
     * @param {Float32Array} texCoords texture coordinates for each position
     */
    constructor ( vertices, indices, texCoords ) {

        // Index reading order: i1, i2, i3, i1, i3, i4

        this.vertexArr = [];

        this.indexArr = [];

        this.edgeArr = [];

        this.edgeMap = []; // lookup table

        this.faceArr = [];

        this.notSmoothed = false; // by default

        // Keep these to test validity

        this.vertices = vertices;

        this.indices = indices;

        this.texCoords = texCoords;

        this.geometryToVertex( vertices, indices, texCoords );

        this.isValid();

    }

    /** 
     * Validate a mesh structure
     */
    isValid () {

        console.log( '>>>>>>>>>isValid Vertices' );

        let geo = this.vertexToGeometry();

        let vertices = this.vertices;

        let vertexArr = this.vertexArr;

        let indexArr = this.indexArr;

        let newVertices = geo.vertices;

        if ( vertices.length !== newVertices.length ) {

            console.error( 'Mesh::isValid(): vertices (' + newVertices.length + ') != oldVertices (' + vertices.length + ')' );

        }

        for ( let i = 0; i < vertices.length; i++ ) {

            if ( vertices[ i ] !== newVertices[ i ] ) {

                console.error( 'Mesh::isValid(): at pos i:' + i + ' old (' + vertices[ i ] + ') and new (' + newVertices[ i ] + ') coordinates do not match' );

            }

        }

        console.log( '>>>>>>>isvalid indices' );

        let indices = this.indices;

        let newIndices = geo.indices;

        // check indexing

        if ( indices.length !== newIndices.length ) {

            console.error( 'Mesh::isValid: indices (' + newIndices.length + ') != oldIndices (' + indices.length + ')' );

        }

        // compare vertex values with flattened and unflattened

        for ( let i = 0; i < indices.length; i++ ) {

            let idx = indices[ i ];

            if ( vertices[ idx * 3 ] != vertexArr[ idx ].coords.x ) {

                console.error( 'flattened x at indices:' + idx + ' in vertices is:' + ( vertices[ idx * 3 ]  ) + ' in newVertices:' + ( newVertices[ idx * 3 ]  ) + ' and in Vertex it is:' + vertexArr[ idx ].coords.x );

            }

        }

        let texCoords = this.texCoords;

        let newTexCoords = geo.texCoords;

    }

    computeEdge( i0, i1, ) {


    }

    /** 
     * Convert our native flattened geometric data (from Prim) to a Vertex object 
     * data representation suitable for subdivision and morphing.
     * @param {}
     */
    geometryToVertex ( vertices, indices, texCoords ) {

        console.log('>>>>>>>>geometryToVertex()')

        let i = 0, vi = 0, ti = 0, ii = 0;

        let numVertices = vertices.length / 3;

        /* 
         * The incoming flattened index array has stride = 3, so 
         * an x coord in the vertexArr is just the index value
         * the equivalen x coord in flattened vertices = index * 3 
         */

        let indexArr = indices.slice( 0 );

        let numIndices = indexArr.length;

        let numTexCoords = texCoords.length;

        // Create the Vertex array

        let vertexArr = new Array( numVertices );

        // Convert flattened coordinates to Vertex objects. IndexArr still points to the right places.

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ], i, vertexArr );

        }

        // Compute Edge and Mesh arrays.

        let edgeArr = new Array( numVertices );

        let faceArr = new Array( numVertices / 3 );

        for ( let i = 0; i < numIndices; i += 3 ) {

            let i0 = i;

            let i1 = i + 1;

            let i2 = i + 2;

            let fi = i / 3;

            // push an edge
            // call computeEdges 3 times
            // add 3 edges to face index 'fi'

        }

        // Assigned computed arrays.

        this.vertexArr = vertexArr;

        this.indexArr = indexArr;

        return this;

    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     */
    vertexToGeometry() {

        console.log( '>>>>>>>>>>>vertexToGeometry()' );

        let vertexArr = this.vertexArr;

        let indexArr = this.indexArr;

        let indices = new Array( indexArr.length );

        let vertices = new Array( vertexArr.length * 3 );

        let texCoords = new Array( vertexArr.length * 2 );

        console.log( 'vertexToGeometry: index length:' + indexArr.length + ' flattened length:' + indices.length)

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let vi = i * 3;

            let ti = i * 2;

            let c = vertexArr[ i ].coords;

            let t = vertexArr[ i ].texCoords;

            // Recover and flatten coordinate values

            vertices[ vi     ] = c.x;

            vertices[ vi + 1 ] = c.y;

            vertices[ vi + 2 ] = c.z;

            // Recover and flatten texture coordinate values

            texCoords[ ti ]     = t.u;

            texCoords[ ti + 1 ] = t.v;

        }

        // index array doesn't need to be flattened, just clone it.

        indices = this.indexArr.slice( 0 );

        // We aren't exporting a true Geometry, just some of its arrays.

        return {

            vertices: vertices,

            indices: indices,

            texCoords: texCoords

        };

    }

 } // End of class.

// We only export Mesh

export default Mesh;


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

        this.e = []; // Edge array

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
     * @param {Number} i0 index of first consecutive Vertex
     * @param {Number} i0 index of second consecutive Vertex
     */
    constructor ( i0, i1, i2, fi, idx ) {

        // Index of first and second Vertex.

        this.v = new Uint32Array( 2 );

        this.v[ 0 ] = i0;

        this.v[ 1 ] = i1;

        // Index of first and second Face connected to this edge (only know first one at this point).

        this.f = new Uint32Array( 2 );

        this.f[ 0 ] = fi;

        this.f[ 1 ] = 4294967295;

        // Index of the opposite Vertex (forming triangle) connected to this Edge (only know first one at this point).

        this.ov = new Uint32Array( 2 );

        this.ov[ 0 ] = i2;

        this.ov[ 1 ] = i2;

        this.idx = idx; // key in edgeMap hash

    }

    getOpposite ( vi ) {

        return ( this.v[ 0 ] == vi ? this.v[ 1 ] : this.v[ 0 ] );

    }

}

class Face {

    /** 
     * Face, storing three consecutive Vertex objects
     */
    constructor ( e0, e1, e2, idx ) {

        this.e = new Uint32Array( 3 );

        this.e[ 0 ] = e0;

        this.e[ 1 ] = e1;

        this.e[ 2 ] = e2;

        this.idx = idx;

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

        // Original flattened arrays.

        this.vertices = vertices;

        this.indices = indices;

        this.texCoords = texCoords;

        // Mesh arrays

        this.vertexArr = [];

        this.indexArr = [];

        this.edgeArr = [];

        this.edgeMap = []; // lookup table

        this.faceArr = [];

        this.vWeights = [];

        // Keep the original Vertex data when transforming mesh.

        this.oldVertexArr = [];

        // Control flags.

        this.notSmoothed = false; // by default

        this.badIndex32 = 4294967294;

        // Convert flattened arrays

        this.computeValencyWeights( 12 );

        this.geometryToVertex( vertices, indices, texCoords );

        this.isValid();

    }

    /** 
     * Given a valency of surround Edges (neighboring Vertices) for a given 
     * Vertex, compute weights. Similar to:
     * @link https://github.com/deyan-hadzhiev/loop_subdivision/blob/master/loop_subdivision.js
     * @param {Number} max the maximum valency to compute.
     */
    computeValencyWeights ( max ) {

        this.vWeight = new Float32Array( max );

        this.vWeight[ 0 ] = 0.0,

        this.vWeight[ 1 ] = 0.0,

        this.vWeight[ 2 ] = 1.0 / 8.0,

        this.vWeight[ 3 ] = 3.0 / 16.0;

        for ( let i = 4; i < max + 1; i++ ) {

            this.vWeight[ i ] = ( 1.0 / i ) * ( 5.0 / 8.0 

                - Math.pow( 3.0 / 8.0 + ( 1.0 / 4.0 ) 

                * Math.cos( 2.0 * Math.PI / i ), 2.0 ) );

            // Warren's modified formula: this.vWeight[i] = 3.0 / (8.0 * i);

        }

    }

    /** 
     * Compute the bounding box of the Mesh.
     */
    computeBoundingBox () {

        let vertexArr = this.vertexArr;

        for ( let i = 0; len = vertexArr.length; i++ ) {

        }


    }

    /** 
     * Compute the average distance beween Vertices in the Mesh.
     */
    computeAverageDistance () {

        let vertexArr = this.vertexArr;

        let edgeArr = this.edgeArr;

    }

    /** 
     * Compute the nearest neighbor to a Vertex that is not 
     * in its face
     */
    computeNeighbor () {

    }

    /** 
     * Create the Vertices, assigning texture coordinates.
     */
    computeVertices ( vertices, texCoords ) {

        let i = 0, vi = 0, ti = 0;

        let numVertices = vertices.length / 3;

        let vertexArr = new Array( numVertices );

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ], i, vertexArr );

        }

        return vertexArr;

    }

    /** 
     * Set values for an Edge
     */
    computeEdge ( i0, i1, i2, fi ) {

        let vertexArr = this.vertexArr;

        let edgeArr = this.edgeArr;

        let idx = -1;

        // Order edge Vertices in the Edge by their drawing order (defined by index array).

        const mini = Math.min( i0, i1 );

        const maxi = Math.max( i0, i1 );

        // Check hash lookup for Edge already existing.

        const key = mini + '-' + maxi;

        if ( key in this.edgeMap ) {

            idx = this.edgeMap[ key ]; // use existing Edge

            let edge = edgeArr[ idx ];

            ///////////////////////console.log( 'key:' + key + ' edge:' + edge )

            edge.f[ 1 ]  = fi; // Add the second Face to the Edge

            edge.ov[ 1 ] = i2; // Add the second opposite Vertex to the Edge

        } else {

            idx = edgeArr.length;

            this.edgeMap[ key ] = idx; // add new key to hash

            // Create Edge with Vertices, first opposite Face, first opposite Vertex
            // NOTE: second Face and opposite Vertex NOT PRESENT YET

            let edge = new Edge( i0, i1, i2, fi, key );

            edgeArr.push( edge );

            // Let Vertices know they are part of this Edge (most get 6).

            ///////console.log('trying to update MINI Vertex:' + mini + ' with Edge index at:' + idx + ' key:' + key )

            vertexArr[ mini ].e.push( idx );

            ////////console.log('trying to update MAXI Vertex:' + maxi + ' with Edge index at:' + idx + ' key:' + key )

            vertexArr[ maxi ].e.push( idx );

        }

        return idx;

    }

    computeEdges ( vertexArr, indexArr ) {

        console.log(">>>>>>computeEdges")

        let nv = vertexArr.length;

        if ( ! nv ) {

            console.error( 'Mesh::computeEdges(): missing Vertex array ');

            return -1;

        }

        let ni = indexArr.length;

        if ( ! ni ) {

            console.error( 'Mesh::computeEdges(): missing Index array ');

            return -1;

        }

        // Create the Edge and Face (triangle) arrays

        let faceArr = [];

        // Loop through the indexArr, defining Edges and Faces, hashing back to Vertices.

        for ( let i = 0; i < ni; i += 3 ) {

            const i0 = indexArr[ i ];

            const i1 = indexArr[ i + 1 ];

            const i2 = indexArr[ i + 2 ];

            const fi = i / 3;

            // Add 3 computed Edges to a Face, with Edges adding themselves to component Vertices

            let face = new Face(

                this.computeEdge( i0, i1, i2, fi ),

                this.computeEdge( i1, i2, i0, fi ),

                this.computeEdge( i2, i0, i1, fi ),

                fi

            );

           faceArr.push( face );

           ////////////////////////////////console.log("TRIANGLE:" + fi + '(' + i + ')')

        }

        // Faces for this Mesh.

        this.faceArr = faceArr;

    }

    /** 
     * Convert our native flattened geometric data (from Prim) to a Vertex object 
     * data representation suitable for subdivision and morphing.
     * @param {}
     */
    geometryToVertex ( vertices, indices, texCoords ) {

        console.log('>>>>>>>>geometryToVertex()')

        // Convert flattened coordinates to Vertex objects. IndexArr still points to the right places.

        this.vertexArr = this.computeVertices( vertices, texCoords );

        /* 
         * The incoming flattened index array has stride = 3, so 
         * an x coord in the vertexArr is just the index value
         * the equivalen x coord in flattened vertices = index * 3 
         */

        this.indexArr = indices.slice( 0 );

        // Compute Edge and Face arrays for the Vertices.

        this.computeEdges( this.vertexArr, this.indexArr );

        return this;

    }

    /**
     * Subdivide and optionally smooth a Mesh, similar to 
     * @link https://github.com/deyan-hadzhiev/loop_subdivision/blob/master/loop_subdivision.js
     * compute the Euler characteristic, based on effect of subdivision:
     * 1. Number of faces = 4x larger
     * 2. Each subdivided Face creates 3 new Edges, subdivided Edge creates 2 new Edges.
     * Chi = Vertices - Edges + Faces
     * V = E - F + Chi (Vertices in subdivided Mesh)
     */
    subdivide () {

        this.oldVertexArr = this.vertexArr.slice( 0 );

        const oldVertCount = this.vertexArr.length;

        const oldEdgeCount = this.edgeArr.length;

        const oldFaceCount = this.faceArr.length;

        // Compute new number of Vertices

        const Chi = oldVertCount - oldEdgeCount + oldFaceCount;

        const newEdgeCount = oldEdgeCount * 2 + oldFaceCount * 3;

        const newFaceCount = oldFaceCount * 4;

        const newVertCount = newEdgeCount - newFaceCount + Chi;



    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     */
    vertexToGeometry () {

        console.log( '>>>>>>>>>>>vertexToGeometry()' );

        let vertexArr = this.vertexArr;

        let numVertices = vertexArr.length;

        let indexArr = this.indexArr;

        let indices = new Array( indexArr.length );

        let vertices = new Array( vertexArr.length * 3 );

        let texCoords = new Array( vertexArr.length * 2 );

        console.log( 'vertexToGeometry: index length:' + indexArr.length + ' flattened length:' + indices.length)

        for ( let i = 0; i < numVertices; i++ ) {

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

    /** 
     * Validate a mesh structure
     */
    isValid () {

        console.log( '>>>>>>>>>isValid Vertices' );

        let geo = this.vertexToGeometry();

        let vertices = this.vertices;

        let vertexArr = this.vertexArr;

        let numVertices = this.vertexArr.length;

        let indexArr = this.indexArr;

        let numIndices = this.indexArr.length;

        let edgeArr = this.edgeArr;

        let numEdges = this.edgeArr.length;

        let faceArr = this.faceArr;

        let numFaces = this.faceArr.length;

        let newVertices = geo.vertices;

        console.log('make sure vertex length matches')

        if ( vertices.length !== newVertices.length ) {

            console.error( 'Mesh::isValid(): vertices (' + newVertices.length + ') != oldVertices (' + vertices.length + ')' );

        }

        console.log('make sure Vertex xyz coords are identical')

        for ( let i = 0; i < numVertices; i++ ) {

            if ( vertices[ i ] !== newVertices[ i ] ) {

                console.error( 'Mesh::isValid(): at pos i:' + i + ' old (' + vertices[ i ] + ') and new (' + newVertices[ i ] + ') coordinates do not match' );

            }

        }

        console.log( '>>>>>>>isvalid indices' );

        let indices = this.indices;

        let newIndices = geo.indices;

        console.log('make sure index length matches')

        // check indexing

        if ( indices.length !== newIndices.length ) {

            console.error( 'Mesh::isValid(): indices (' + newIndices.length + ') != oldIndices (' + indices.length + ')' );

        }

        // compare vertex values with flattened and unflattened

        console.log('make sure index values are identical')

        for ( let i = 0; i < numIndices; i++ ) {

            let idx = indices[ i ];

            if ( vertices[ idx * 3 ] != vertexArr[ idx ].coords.x ) {

                console.error( 'Mesh::isValid(): flattened x at indices:' + idx + ' in vertices is:' + ( vertices[ idx * 3 ]  ) + ' in newVertices:' + ( newVertices[ idx * 3 ]  ) + ' and in Vertex it is:' + vertexArr[ idx ].coords.x );

            }

        }

        let texCoords = this.texCoords;

        let newTexCoords = geo.texCoords;

        // Check Edges for validity.

        for ( let i = 0; i < numEdges; i++ ) {

            // See if Edge points to valid Vertex

            let edge = edgeArr[ i ];

            if ( ! vertexArr[ edge.v[0] ] ) console.error( 'Mesh::isValid(): nonexistent first Vertex at edge ' + edge.idx );
            if ( ! vertexArr[ edge.v[1] ] ) console.error( 'Mesh::isValid(): nonexistent first Vertex at edge ' + edge.idx );

            // See if Edge points to valid Face

            if ( ! faceArr[ edge.f[ 0 ] ] ) console.error( 'Mesh::isValid(): nonexistent first Face at edge ' + edge.idx )

            // Face not set at Mesh edge

            // if ( edge.f[ 1 ] >= this.badIndex32 ) console.warn( 'Mesh::isValid(): warn: no second Face for edge ' + edge.idx )

            // See if Edge points to valid opposite Vertex

            if ( ! vertexArr[ edge.ov[ 0 ] ] ) console.error( 'Mesh::isValid(): nonexistent first Opposite Vertex at edge ' + edge.idx );
            if ( ! vertexArr[ edge.ov[ 1 ] ] ) console.error( 'Mesh::isValid(): nonexistent first Opposite Vertex at edge ' + edge.idx );

        }

        // Check valency

        let valencyArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        let valNum = 0;

        let valMax = -1;

        for ( let i = 0; i < numVertices; i++ ) {

            let v = vertexArr[ i ];

            console.log("VERTEX " + i + " IS A: " + v )

            let len = v.e.length;

            valencyArr[ len ] += 1;

            valMax = Math.max( valMax, len );

        }

        console.log('checking valency of Vertex objects...');

        if ( valMax < 3 ) {

            console.error( 'Mesh::isValid(): Vertex valencies are too small to be a valid mesh:' + valMax );

        }

        for ( let i = 0; i < valencyArr.length; i++ ) {

            console.log('valency ' + i + ' has ' + valencyArr[ i ] + ' members' );

        }

        // Check Faces for validity.

    }

 } // End of class.

// We only export Mesh

export default Mesh;


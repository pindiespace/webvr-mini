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
     * return the difference between two Coords 
     */ 
    diff( coord ) {

        return new Coords(

            this.x - coord.x,

            this.y - coord.y,

            this.z - coord.z

        );

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

        this.even = true; // by default, not a midpoint

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
    constructor ( i0, i1, i2, fi, idx, key ) {

        // Index of first and second Vertex.

        this.v = new Uint32Array( 2 );  // index the two Vertex objects forming the Edge

        this.vo = new Uint32Array( 2 ); // save indices in ORIGINAL order.

        this.f = new Uint32Array( 2 );  // index the two Faces this Edge is part of

        this.ov = new Uint32Array( 2 ); // index the opposite vertices in first and second Face

        this.mp = new Uint32Array( 1 ); // midpoint (only computed in subdivide)

        this.v[ 0 ] = i0;

        this.v[ 1 ] = i1;

        // Index of first and second Face connected to this edge (only know first one at this point).

        this.f[ 0 ] = fi;         // The Face this Edge is initially part up during creation

        this.f[ 1 ] = 4294967295; // The other Face, initially invalid value

        // Index of the opposite Vertex (forming triangle) connected to this Edge (only know first one at this point).

        this.ov[ 0 ] = i2;

        this.ov[ 1 ] = i2; // This should change during computation

        this.idx = idx; // index in the edgeArr

        this.key = key // hash lookup in edgeMap

        this.isEven = true; // default to non-midpoint vertices

    }

    /** 
     * Given one Vertex in the Edge, return the other point in the Edge.
     * @param {Number} vi the index of one of the Vertices making up the Edge.
     * @returns {Number} the index of the other Vertex.
     */
    getOpposite ( vi ) {

        return ( this.v[ 0 ] == vi ? this.v[ 1 ] : this.v[ 0 ] );

    }

}

class Face {

    /** 
     * Face, storing three consecutive Vertex objects
     * @param {Number} e0 the first Edge index
     * @param {Number} e1 the second Edge index
     * @param {Number} e2 the third Edge index
     * @param {Number} idx the index in the Face array
     */
    constructor ( e0, e1, e2, idx ) {

        this.e = new Uint32Array( 3 );

        this.e[ 0 ] = e0;

        this.e[ 1 ] = e1;

        this.e[ 2 ] = e2;

        // Store midpoints here.

        this.m = new Uint32Array( 3 );

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

        this.edgeMap = []; // lookup table for Edges (even Vertices)

        this.midMap = []; // lookup hash for midpoints (odd Vertices)

        this.faceArr = [];

        this.valenceArr = [];

        // Keep the original Vertex data when transforming mesh.

        this.oldVertexArr = [];

        // Control flags.

        this.notSmoothed = false; // by default

        this.badIndex32 = 4294967294;

        // Pre-compute valency values

        this.computeValencyWeights( 12 );

        // Convert flattened arrays to Vertex data structure.

        this.geometryToVertex( vertices, indices, texCoords );

        // Check converted Vertices for validity.

        this.isValid();

    }

    /** 
     * Return the reversed key for this Edge, handling index 
     * traversal 1->2 and 2->1
     * @returns {String} the reversed key
     */
    getRevKey ( key ) {

        let keyArr = key.split( '-' );

        return keyArr[ 1 ] + '-' + keyArr[ 0 ];

    }

    /** 
     * Given a valency of surround Edges (neighboring Vertices) for a given 
     * Vertex, compute weights. Similar to:
     * @link https://github.com/deyan-hadzhiev/loop_subdivision/blob/master/loop_subdivision.js
     * @param {Number} max the maximum valency to compute.
     */
    computeValencyWeights ( max ) {

        this.valenceArr = new Float32Array( max );

        this.valenceArr[ 0 ] = 0.0,

        this.valenceArr[ 1 ] = 0.0,

        this.valenceArr[ 2 ] = 1.0 / 8.0,

        this.valenceArr[ 3 ] = 3.0 / 16.0;

        for ( let i = 4; i < max; i++ ) {

            this.valenceArr[ i ] = ( 1.0 / i ) * ( 5.0 / 8.0 

                - Math.pow( 3.0 / 8.0 + ( 1.0 / 4.0 ) 

                * Math.cos( 2.0 * Math.PI / i ), 2.0 ) );

            // Warren's modified formula: 
            //this.valenceArr[i] = 3.0 / (8.0 * i);

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
     * in any of its Edges. This helps smooth meshes that are 
     * not continous.
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
     * @param {Number} i0 index of first Vertex in Edge.
     * @param {Number} i1 index of second Vertex in Edge.
     * @Param {Number} i2 index of opposite Vertex, forming a Face with the Edge.
     */
    computeEdge ( i0, i1, i2, fi ) {

        let vertexArr = this.vertexArr;

        let edgeArr = this.edgeArr;

        let idx = -1;

        // Order edge Vertices in the Edge by their drawing order (defined by index array).

        const mini = Math.min( i0, i1 );

        const maxi = Math.max( i0, i1 );

        ///// DEBUG!!!!!!!!!!!!!!!!
        // THIS RESULTS IN ONLY THE CORNERS DRAWING
        //const mini = i0;

        //const maxi = i1;

        // Check hash lookup for Edge already existing.

        let key = mini + '-' + maxi;

        if ( key in this.edgeMap ) {

            idx = this.edgeMap[ key ]; // use existing Edge

            let edge = edgeArr[ idx ];

            ///////////////////////console.log( 'key:' + key + ' edge:' + edge )

            edge.f[ 1 ]  = fi; // Add the second Face to the Edge

            edge.ov[ 1 ] = i2; // Add the second opposite Vertex to the Edge

        } else {

            idx = edgeArr.length;

            //this.edgeMap[ key ] = idx; // add new key to hash
            this.edgeMap[ key ] = idx;

            // Create Edge with Vertices, first opposite Face, first opposite Vertex
            // NOTE: second Face and opposite Vertex NOT PRESENT YET

            let edge = new Edge( mini, maxi, i2, fi, idx, key );

            // ADD ORIGINAL ORDER

            edge.vo[ 0 ] = i0;

            edge.vo[ 1 ] = i1;

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

            // NOTE TO SELF - computeEdge returns the index of the edge in the Edge array
            // Need to connect Face specifically to surrounds

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

        /* 
         * The incoming flattened index array has stride = 3, so 
         * an x coord in the vertexArr is just the index value
         * the equivalen x coord in flattened vertices = index * 3 
         */

        this.indexArr = indices.slice( 0 );

        // Convert flattened coordinates to Vertex objects. IndexArr is unchanged, and still points to the right places.

        this.vertexArr = this.computeVertices( vertices, texCoords );

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
     * 
     * our original Vertex array become a backup after subdivision.
     * 
      * @param {Boolean} flatten if true, return flattened rather than Vertex array.
     */
    subdivide ( flatten ) {

        let vertexArr = this.vertexArr;

        this.oldVertexArr = vertexArr.slice(0);

        let oldVertexArr = this.oldVertexArr;

        const oldVertexCount = vertexArr.length;

        let indexArr = this.indexArr;

        let edgeArr = this.edgeArr;

        const oldEdgeCount = edgeArr.length;

        let faceArr = this.faceArr;

        const oldFaceCount = faceArr.length;

        const fw = 3 / 8;

        const ow = 1 / 8;

        // Compute new number of Vertices

        const chi = oldVertexCount - oldEdgeCount + oldFaceCount;

        const newEdgeCount = oldEdgeCount * 2 + oldFaceCount * 3;

        const newFaceCount = oldFaceCount * 4;

        const newVertexCount = newEdgeCount - newFaceCount + chi;

        let newVertexArr = new Array( newVertexCount ); // note: larger than original!

        // Re-compute our indices

        let newIndexArr = new Uint32Array( newFaceCount * 3 );

        //////////
        // Step 1: Compute old Vertices, and copy to newVertexArray.

        let c, tc, x, y, z, u, v;

        let diff = [];

        for ( let i = 0; i < oldVertexCount; i++ ) {

            let vtx = vertexArr[ i ];

           const vertexValency =  vtx.e.length;

            // Beta weighting for surround Vertices.

            const beta = this.valenceArr[ vertexValency ];

            // Beta weighting for the original ith Vertex.

            const vertexWeightBeta = 1.0 - (vertexValency * beta);
            // this looks more correct!!!
            //const vertexWeightBeta = 1.0 - (beta);

            ///////console.log("valence:" + vertexValency + " beta:" + beta + " vertexWeightBeta:" + vertexWeightBeta)

            c = vertexArr[ i ].coords;

            tc = vertexArr[ i ].texCoords;

            x = vertexWeightBeta * c.x;

            y = vertexWeightBeta * c.y;

            z = vertexWeightBeta * c.z;

            u = vertexWeightBeta * tc.u;

            v = vertexWeightBeta * tc.v;

            // Beta weighting for surround Vertices, using Edge vertices.

            for ( let j = 0; j < vertexValency; j++ ) {

                // Get the surround Vertices for ith Vertex

                //const oppositeIndex = edgeArr[ vtx.e[ j ] ].getOpposite( i );

                const oppositeIndex = edgeArr[ vtx.e[ j ] ].v[ 0 ];

                ////////console.log ( 'AT:' + vtx.idx + ', surround ' + j + ' is:' + vertexArr[ oppositeIndex ].idx )

                c = vertexArr[ oppositeIndex ].coords;

                tc = vertexArr[ oppositeIndex ].texCoords;

                x += beta * c.x;

                y += beta * c.y;

                z += beta * c.z;

                u += beta * tc.u;

                v += beta * tc.v;

            }

            // Save the recomputed Vertex

            newVertexArr[ i ] = new Vertex(  x, y, z, u, v, i, newVertexArr );

        }

        // Compute midpoint for e0 

        let mPos = oldVertexCount;

        for ( let i = 0; i < oldEdgeCount; i++ ) {

            let edge = edgeArr[ i ];

            const ev0 = vertexArr[ edge.v[ 0 ] ];
            const ev1 = vertexArr[ edge.v[ 1 ] ];
            const fv0 = vertexArr[ edge.ov[ 0 ] ];
            const fv1 = vertexArr[ edge.ov[ 1 ] ];

            let x = fw * ( ev0.coords.x + ev1.coords.x );
            let y = fw * ( ev0.coords.y + ev1.coords.y );
            let z = fw * ( ev0.coords.z + ev1.coords.z );
            let u = fw * ( ev0.texCoords.u + ev1.texCoords.u );
            let v = fw * ( ev0.texCoords.v + ev1.texCoords.v );

            x += ow * ( fv0.coords.x + fv1.coords.x );
            y += ow * ( fv0.coords.y + fv1.coords.y );
            z += ow * ( fv0.coords.z + fv1.coords.z );
            u += ow * ( fv0.texCoords.u + fv1.texCoords.u );
            v += ow * ( fv0.texCoords.v + fv1.texCoords.v );

            let vtx = new Vertex( x, y, z, u, v, mPos++, vertexArr );

            ///////////////////////////////////
            // ADD MIDPOINT TO EDGE

            edge.mp = vtx;
            edge.mp.isEven = false;
            edge.mp.e[ 0 ] = edge.vo[ 0 ];
            edge.mp.e[ 1 ] = edge.vo[ 1 ];
            ///////////////////////////////////

            newVertexArr[ i + oldVertexCount ] = vtx;


        }

        for ( let i = 0; i < indexArr.length; i += 3 ) {

            let spacer = '-'

            let key0 = i + spacer + ( i + 1 );

            let key1 = ( i + 1 ) + spacer + ( i + 2 );

            let key2 = ( i + 2 ) + spacer + ( i + 3 );

            let e0 = this.edgeMap[ key0 ];

            if ( ! e0 ) e0 = this.edgeMap[ this.getRevKey( key0 ) ];

            let e1 = this.edgeMap[ key1 ];

            if ( ! e1 ) e1 = this.edgeMap[ this.getRevKey( key1 ) ];

            let e2 = this.edgeMap[ key2 ];

            if ( ! e2 ) e2 = this.edgeMap[ this.getRevKey( key2 ) ];

            console.log( key0 + ":" + e0 + ", " + key1 + ":" + e1 + ", " + key2 + ":" + e2 )

        }

        // Old method, fails on some meshes
        for ( let i = 0; i < oldFaceCount; i++ ) {

            const ov0 = indexArr[i * 3    ];
            const ov1 = indexArr[i * 3 + 1];
            const ov2 = indexArr[i * 3 + 2];

            // the new vertex indices are obtained by the edge mesh's faces
            // since they hold indices to edges - that is the same order in
            // which the new vertices are constructed in the new vertex buffer
            // so we need only the index and add the offset of the old vertices count

            let face = faceArr[ i ];

            const nv0 = oldVertexCount + face.e[0];

            const nv1 = oldVertexCount + face.e[1];

            const nv2 = oldVertexCount + face.e[2];

            // now add the new vertices to the buffer
            const offset = i * 12; // 4 * 3

            newIndexArr[offset     ] = ov0;
            newIndexArr[offset +  1] = nv0;
            newIndexArr[offset +  2] = nv2;

            newIndexArr[offset +  3] = nv0;
            newIndexArr[offset +  4] = ov1;
            newIndexArr[offset +  5] = nv1;

            newIndexArr[offset +  6] = nv1;
            newIndexArr[offset +  7] = ov2;
            newIndexArr[offset +  8] = nv2;

            newIndexArr[offset +  9] = nv0;
            newIndexArr[offset + 10] = nv1;
            newIndexArr[offset + 11] = nv2;

////////////////////////////////////
/*
            console.log('new12: ' + 
            newVertexArr[ newIndexArr[offset     ] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  1] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  2] ].coords.x + ',' + 

            newVertexArr[ newIndexArr[offset +  3] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  4] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  5] ].coords.x + ',' + 

            newVertexArr[ newIndexArr[offset +  6] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  7] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset +  8] ].coords.x + ',' + 

            newVertexArr[ newIndexArr[offset +  9] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset + 10] ].coords.x + ',' + 
            newVertexArr[ newIndexArr[offset + 11] ].coords.x
            );
            console.log('-------------')
*/
////////////////////////////////////

       }



       let DEBUG = false;

       if ( DEBUG ) {

            // DEBUG
            this.newVertexArr = newVertexArr.slice( 0, oldVertexCount );
            this.vertexArr = this.newVertexArr;

       } else {
            this.newIndexArr = newIndexArr;
            this.newVertexArr = newVertexArr;
            this.vertexArr = this.newVertexArr;
            this.indexArr = this.newIndexArr;
       }

        // Keeps it working without midpoint;

        //this.vertexArr = this.newVertexArr;

        //this.newIndexArr = newIndexArr;

        //this.indexArr = newIndexArr;
        
        return this;
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

        // index array doesn't need to be flattened, just clone it.

        let indices = this.indexArr.slice( 0 );

        // flattened vertices and texCoords array need to be generated from Vertex array.

        let vertices = new Array( vertexArr.length * 3 );

        let texCoords = new Array( vertexArr.length * 2 );

        console.log( 'vertexToGeometry: index length:' + indexArr.length + ' flattened length:' + indices.length)

        for ( let i = 0; i < numVertices; i++ ) {

            let vi = i * 3;

            let ti = i * 2;

            let vtx = vertexArr[ i ];

            if ( vtx ) {

                let c = vtx.coords;

                let t = vtx.texCoords;

                // Recover and flatten coordinate values

                vertices[ vi     ] = c.x;

                vertices[ vi + 1 ] = c.y;

                vertices[ vi + 2 ] = c.z;

                // Recover and flatten texture coordinate values

                texCoords[ ti ]     = t.u;

                texCoords[ ti + 1 ] = t.v;

            } else {

                console.warn( 'Mesh::vertexToGeometry(): no vertex in vertexArr at pos:' + i );

                vertices = vertices.slice( i ); // TRUNCATE!

                break;

            }

        }

        // We aren't exporting a true Prim geometry, just some of its arrays.

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

        window.vertices = vertices;
        window.newVertices = newVertices;

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

    } // end of isValid

 } // End of class.

// We only export Mesh

export default Mesh;


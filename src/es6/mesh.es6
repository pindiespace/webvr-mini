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

    }

    /** 
     * Given one point, return the other point in the Edge.
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

        this.valenceArr = new Float32Array( max );

        this.valenceArr[ 0 ] = 0.0,

        this.valenceArr[ 1 ] = 0.0,

        this.valenceArr[ 2 ] = 1.0 / 8.0,

        this.valenceArr[ 3 ] = 3.0 / 16.0;

        for ( let i = 4; i < max + 1; i++ ) {

            this.valenceArr[ i ] = ( 1.0 / i ) * ( 5.0 / 8.0 

                - Math.pow( 3.0 / 8.0 + ( 1.0 / 4.0 ) 

                * Math.cos( 2.0 * Math.PI / i ), 2.0 ) );

            // Warren's modified formula: this.valenceArr[i] = 3.0 / (8.0 * i);

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

            this.edgeMap[ key ] = idx; // add new key to hash

            // Create Edge with Vertices, first opposite Face, first opposite Vertex
            // NOTE: second Face and opposite Vertex NOT PRESENT YET

            let edge = new Edge( mini, maxi, i2, fi, idx, key );

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

        let overtexArr = this.oldVertexArr;

        const oldVertexCount = this.vertexArr.length;

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

        for ( let i = 0; i < oldVertexCount; ++i ) {

            // get ith Vertex.

            let vtx = vertexArr[ i ];

            // Number of attached Edges.

            const vertexValency =  vtx.e.length;

            // Beta weighting for surround Vertices.

            const beta = this.valenceArr[ vertexValency ];

            // Beta weighting for the original ith Vertex.

            const vertexWeightBeta = 1.0 - vertexValency * beta;

            c = vertexArr[ i ].coords;

            tc = vertexArr[ i ].texCoords;

            x = vertexWeightBeta * c.x;

            y = vertexWeightBeta * c.y;

            z = vertexWeightBeta * c.z;

            u = vertexWeightBeta * tc.u;

            v = vertexWeightBeta * tc.v;

            // Beta weighting for surround Vertices.

            for ( let j = 0; j < vertexValency; ++j ) {

                // Get the surround Vertices for ith Vertex

                const oppositeIndex = edgeArr[ vtx.e[ j ] ].getOpposite( i );

                ////////console.log ( 'AT:' + vtx.idx + ', surround ' + j + ' is:' + vertexArr[ oppositeIndex ].idx )

                c = vertexArr[ oppositeIndex ].coords;

                tc = vertexArr[ oppositeIndex ].texCoords;

                x += beta * c.x;

                y += beta * c.y;

                z += beta * c.z;

                u += beta * tc.u;

                v += beta * tc.v;

            }

            // Set the new Vertex values.

            newVertexArr[ i ] = new Vertex(  x, y, z, u, v, i, newVertexArr );

            newVertexArr[ i ].oldIdx = vtx.idx; // DEBUGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG

        } // end of vertexCount

        ///////////
        // Step 2: compute midpoints and new indices.

        // READOUT FACE, COMPARE TO INDEX ARR.

        this.midMap = [];

        let mPos = vertexArr.length; // add after original Vertices

        for (let i = 0; i < this.faceArr.length; i++ ) {

            let face = faceArr[ i ];
 
            let e0 = edgeArr[ face.e[ 0 ] ]; // first Edge

            let e1 = edgeArr[ face.e[ 1 ] ]; // second Edge

            let e2 = edgeArr[ face.e[ 2 ] ]; // third Edge


            //console.log( "FACEREAD " + i + 
            //" edge0: " + e0.v + ' ov:' + e0.ov + 
            //" edge1: " +  e1.v + ' ov:' + e1.ov + 
            //" edge2: " + e2.v + ' ov:' + e2.ov ); // gives 1st and 2nd index of vertices forming Face

            console.log( "FACEREAD " + i + 
            " edge0: " + e0.v +  
            " edge1: " +  e1.v +  
            " edge2: " + e2.v ); // gives 1st and 2nd index of vertices forming Face


            // Each Edge object contains the 4 Vertex objects we need for the midpoint.

           
            // Compute midpoint for e0 

            let ew = 3.0 / 8.0;

            let ow = 1.0 / 8.0;

            for ( let i = 0; i < 3; i++  ) {

                let e = edgeArr[ face.e[ i ] ];

                let key = e.key;

                // TODO: conditional check, only add midpoint if needed.
                /*

                let mIdx = 0;

                if ( key in midMap ) {
                    mIdx = midMap[ key ];  
                } else if ( revKey in midMap ) {
                    mIdx = midMap[ key ];
                } else {
                    mIdx = mPos;
                }

                */

                console.log("Edge key:" + key)

                const ev0 = vertexArr[ e.v[ 0 ] ].coords;
                const ev1 = vertexArr[ e.v[ 1 ] ].coords;
                const fv0 = vertexArr[ e.ov[ 0 ] ].coords;
                const fv1 = vertexArr[ e.ov[ 1 ] ].coords;

                let x = ew * ( ev0.x + ev1.x );
                let y = ew * ( ev0.y + ev1.y );
                let z = ew * ( ev0.z + ev1.z );
                let u = ew * ( ev0.u + ev1.u );
                let v = ew * ( ev0.v + ev1.v );

                x += ow * ( fv0.x + fv1.x );
                y += ow * ( fv0.y + fv1.y );
                z += ow * ( fv0.z + fv1.z );
                u += ow * ( fv0.u + fv1.u );
                v += ow * ( fv0.v + fv1.v );

                let vtx = new Vertex( x, y, z, u, v, mPos, vertexArr );

                vtx.isEven = false;

                e.mp[ i ] = mPos; // add the Midpoint index to the Face

                newVertexArr[ mPos ] = vtx;

            } // end loop through individual Face Edges


        } // end loop through all Faces

        // Step 3: Re-compute indices

        // TODO: loop through faceArr.

        // TODO: test if we recover indexArr correctly.

        this.edgeTest = [];

        for ( let i = 0; i < edgeArr.length; i++ ) {

            let edge = edgeArr[ i ];

                let e0 = edge.v[ 0 ];

                let e1 = edge.v[ 1 ];

                //console.log( 'edge' + i + ' : ' + e0 + ',' + e1);

                this.edgeTest.push( e0 + ',' + e1 )

        }
 
 
        // DEBUG
        this.newVertexArr = newVertexArr;

        // Keeps it working without midpoint;
        this.vertexArr = newVertexArr.slice( 0, oldVertexCount );

        //this.vertexArr = newVertexArr;
        

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


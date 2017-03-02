/** 
 * A mesh object containing un-flattened references to vertices, indices, and 
 * texture coordinates, suitable for subdivision and other complex manipulations.
 */

/** 
 * Create a class for manipulating 3d data, We don't use glMatrix since the 
 * calculations here are faster if done locally.
 */
 class Coords {

    /**
     * @class
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

        return ( Number.isFinite( this.x ) && 

            Number.isFinite(  this.y ) && 

            Number.isFinite( this.z ) );

    }

    add ( coords ) {

        this.x += coords.x;

        this.y += coords.y;

        this.z += coords.z;

        return this;

    }

    scale ( scalar ) {

        this.x *= scalar;

        this.y *= scalar;

        this.z *= scalar;

        return this;

    }

    distance ( coords, fast ) {

        let x = this.x - coords.x;

        let y = this.y - coords.y;

        let z = this.z - coords.z;

        if ( fast ) {

            return ( Math.abs( x ) + Math.abs( y ) + Math.abs( z ) ) / 3;

        } else {

            return Math.sqrt( x * x + y * y + z * z );

        }

    }

    /**
     * Return a new copy of this Coords
     * @returns {Coords} a copy of the current coordinates.
     */
    clone () {

        return new Coords( this.x, this.y, this.z );

    }

} // End of class.

class Vertex {

    /** 
     * @class
     * @constructor
     * Create a class containing position, texture coordinate, and mesh
     * connectivity information.
     */
    constructor( x = 0, y = 0, z = 0, u = 0, v = 0, idx = '', vertexArr = [] ) {

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        this.idx = idx; // locally store our index in the vertexArr

        this.e = []; // Edge array

        this.vertexArr = vertexArr;

    }

    /** 
     * Confirm Vertex has valid values for position and texture.
     */
    isValid () {

        let texCoords = this.texCoords;

        if ( this.coords.isValid() && 

            Number.isFinite( parseFloat( texCoords.u ) ) && texCoords.u >= 0 && 

            Number.isFinite( parseFloat( texCoords.v ) ) && texCoords.v >= 0 ) {

            return true;

        }

        return false;

    }

    /** 
     * Return a vector distance between two Coords, optionally 
     * leaving out the square root calculation.
     * @param {Vertex} vtx another Vertex object
     * @param {Boolean} fast if true, don't do square root, just absolute 
     * sum of x, y, z, distances.
     * @returns {Number} a vector distance, or approximation.
     */
    distance ( vtx, fast = false ) {

        return this.coords.distance( vtx.coords, fast );

    }

    /** 
     * In-place setting values
     */
    set ( x, y, z, u, v ) {

        this.coords.x = x;

        this.coords.y = y;

        this.coords.z = z;

        this.texCoords.u = u;

        this.texCoords.v = v;

        return this;

    }

    add ( vtx ) {

        this.coords.add( vtx.coords );

        return this;

    }

    /** 
     * Scale coordinates in or out.
     */
    scale ( scalar ) {

        this.coords.scale( scalar );

        return this;

    }

    /** 
     * Return a copy
     */
    clone () {

        let vtx = new Vertex( this.coords.x, this.coords.y, this.coords.z, 

            this.texCoords.u, this.texCoords.v, 

            this.idx, this.vertexArr );

        // Copy the surround Edges.

        for ( let i = 0; i < this.e.length; i++ ) {

            vtx.e.push( this.e[ i ] );

        }

        return vtx;

    }

} // End of class.

class Edge {

    /** 
     * @class
     * @constructor
     * create an Edge, make from two consecutive Vertices in the index for 
     * drawing the Mesh. The Vertex objects used are defined by the index array.
     * @param {Number} i0 index of the first Vertex in the Vertex array.
     * @param {Number} i1 index of the second Vertex in the Vertex array.
     * @param {Number} i2 index of the third Vertex (forming a triangle) in the Vertex Array.
     * @param {Number} fi index of the Face created by the three Vertices.
     */
    constructor ( i0, i1, i2, fi ) {

        this.v = new Uint32Array( 2 );  // index the two Vertex objects forming the Edge

        this.ov = new Uint32Array( 2 ); // index the opposite Vertices in first and second Face

        this.f = new Uint32Array( 2 );  // index the opposite Faces

        this.v[ 0 ] = i0;

        this.v[ 1 ] = i1;

        this.f[ 0 ] = fi;         // The Face this Edge is initially part up during creation

        this.f[ 1 ] = 4294967295; // The other Face, initially invalid index value

        // Index of the opposite Vertex (forming triangle) connected to this Edge (only know first one at this point).

        this.ov[ 0 ] = i2;

        this.ov[ 1 ] = i2; // This should change during computation

    }

    isValid () {

        if ( this.v[ 0 ].isValid() && this.v[ 1 ].isValid ) {

            return true;

        }

        return false;

    }

    /** 
     * Given a Vertex, return the opposite Vertex in this Edge.
     * @param {Vertex} vtx the Vertex to test.
     * @returns {Number} the index of the opposite Vertex in the Vertex array.
     */
    getOpposite( vtx ) {

        if ( vtx.idx === this.v[ 0 ] ) {

            return this.v[ 1 ];

        } else if ( vtx.idx === this.v[ 1 ] ) {

            return this.v[ 0 ];

        } else {

            console.error( 'Edge::getOpposite: invalid Vertex:' + vtx.idx + ' supplied, our Edge:' + this.v[ 0 ] + ', ' + this.v[ 1 ] );

        }

    }

}

class Face {

    /** 
     * @class
     * @constructor
     * Face, storing three consecutive Vertex objects, a.k.a. drawing triangle.
     * @param {Number} e0 the first Edge index
     * @param {Number} e1 the second Edge index
     * @param {Number} e2 the third Edge index
     * @param {Number} idx the index in the Face array
     */
    constructor ( e0, e1, e2 ) {

        this.e = new Uint32Array( 3 );

        this.e[ 0 ] = e0;

        this.e[ 1 ] = e1;

        this.e[ 2 ] = e2;

    }

}

class Mesh {

    /** 
     * @class
     * @constructor
     * Our class for subdivision and other complex coordinate manipulation.
     * @param {GeoObj} An object with flattened vertices, indices, and texture 
     * coordinates, as well as the Prim type.
     */

    constructor ( geo ) {

        this.type = geo.type, 

        // Mesh arrays.

        this.vertexArr = [];    // holds Vertex objects

        this.indexArr = [];     // holds drawing path through Vertex objects

        this.edgeArr = [];      // holds Edge objects

        this.edgeMap = [];      // lookup table for Edges (even Vertices)

        this.faceArr = [];      // holds the triangle list (derived from indexArr)

        this.valenceArr = [];   // holds computed valency constants for Edge and opposite Vertices

        this.oldVertexArr = []; // keep the original Vertex data when transforming mesh

        this.avDistance = 0;    // average distance between Vertices

        this.width = 0;

        this.height = 0;

        this.depth = 0;

        // Scaling factors for smoothing.

        this.fw  = 3 / 8; // Edge Vertices a midpoint is created in.

        this.ow  = 1 / 8; // Opposite Vertices from the Edge the midpoint is in.

        this.f0w = 4 / 8; // Use when there is only one 'opposite' Vertex (e.g. Mesh 'seam') - change this to 4.5 to see the seams

        this.badIndex32 = 4294967294; // invalid index in Vertex array.

        // Pre-compute valency weighting values.

        this.computeValencyWeights( 12 );

        // Convert flattened arrays to Vertex data structure (Index array remains the same).

        this.geometryToVertex( geo.vertices.data, geo.indices.data, geo.texCoords.data );

        // Check converted Vertices for validity.

        this.isValid();

        this.totNeedIgnore = 0;  // DEBUG !!!!!!!!!!!!!!!!!!!!!!!!!

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
     * Find and return the midpoint between several Vertices.
     */
    computeCentroid () {

        let len = arguments.length, x = 0, y = 0, z = 0, u = 0, v = 0;

        for( var i in arguments ) {

            let vtx = arguments[ i ];

            x += vtx.coords.x,

            y += vtx.coords.y,

            z += vtx.coords.z;

            u += vtx.texCoords.u;

            v += vtx.texCoords.v;

        }

        x /= len,

        y /= len,

        z /= len;

        u /= len;

        v /= len;

        return new Vertex ( x, y, z, u, v, 0, null );

    }

    /** 
     * Create the Vertices, assigning texture coordinates.
     * @param {Float32Array} vertices a flattened array of xyz positions
     * @param {Float32Array} texCoords a flattened array of uv positions
     */
    computeVertices ( vertices, texCoords ) {

        let i = 0, vi = 0, ti = 0;

        // Average spacing between vertices

        let avDist = 0;

        // Bounding Box (get width, height, and depth)

        let width = 0, height = 0, depth = 0;

        let min = new Coords();

        let max = new Coords();

        let numVertices = vertices.length / 3;

        let vertexArr = new Array( numVertices );

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ], i, vertexArr );

            if ( i > 0 ) {

                avDist += vertexArr[ i ].distance( vertexArr[ i - 1 ], true ); // fast approx calc

                let c = vertexArr[ i ].coords;

                min.x = Math.min( min.x, c.x );

                max.x = Math.max( max.x, c.x );

                min.y = Math.min( min.y, c.y );

                max.y = Math.min( min.y, c.y );

                min.z = Math.min( min.z, c.z );

                max.z = Math.min( max.z, c.z );

            }

        }

        // Compute Mesh dimensions.

        this.width = max.x - min.x;

        this.height = max.y - min.y;

        this.depth = max.z - min.z;

        // Estimate average spacing among Vertices.

        this.avDistance = avDist / numVertices;

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

        // Check hash lookup for Edge already existing.

        let key = mini + '-' + maxi;

        if ( key in this.edgeMap ) {

            idx = this.edgeMap[ key ]; // use existing Edge

            let edge = edgeArr[ idx ];

            edge.f[ 1 ]  = fi; // Add the second Face to the Edge (1st added in constructor)

            edge.ov[ 1 ] = i2; // Add the second opposite Vertex to the Edge (1st added in constructor)

        } else {

            idx = edgeArr.length;

            this.edgeMap[ key ] = idx;

            let edge = new Edge( mini, maxi, i2, fi );

            edgeArr.push( edge );

            // Let Vertices know they are part of this Edge (non-seam Vertices get 6+).

            vertexArr[ mini ].e.push( idx );

            vertexArr[ maxi ].e.push( idx );

        }

        return idx;

    }

    /** 
     * Compute the Faces and Edges of the mesh from 
     * the index array.
     */
    computeFaces () {

        let vertexArr = this.vertexArr;

        let indexArr = this.indexArr;

        let len = indexArr.length;

        // Create the Edge and Face (triangle) arrays

        let faceArr = [];

        // Loop through the indexArr, defining Edges and Faces, hashing back to Vertices.

        for ( let i = 0; i < len; i += 3 ) {

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

        }

        // Faces for this Mesh.

        this.faceArr = faceArr;

    }

    /** 
     * Adjust Even Vertices, up to 6 control points.
     * @param {Vertex} vtx the Vertex to compute.
     * @param {Array[Vertex]} the array containing surround Vertices.
     */
    computeEven ( vtx, vertexArr ) {

        let edgeArr = this.edgeArr;

        const valency =  vtx.e.length;

        /* 
         * IMPORTANT!!!!!
         * 
         * For 'seamless' Meshes, every Vertex has at least 6 other Vertices connected 
         * to it. However for meshes are wrapped plane-type objects (e.g. a Sphere which is 
         * a flat sheet with its points projected into a Sphere), or corners 
         * (e.g. a Cube's ends) the Vertices of the Mesh form a 'seam' with 4 or fewer surround 
         * Vertices in the Vertex.e[] array. These seams should remain stationary when subdividing.
         * 
         * Running computeEven on a Vertex on a seam or corner results in a jagged edge.
         * So, exit this function if valency is low enough to be a seam.
         * 
         * Note: for this to work, the 'odd' vertices must also be correctly ignored. 
         * In the 'odd' computation, the 'seam' Vertices are recognized by missing 
         * the second Edge.ov[1] 'opposite' Vertex from the Edge they are inside. 
         */

        if ( valency < 5 ) {

            // if no return, the Vertices will be pulled away from the Mesh 'seam'.

            return false;

        }

        // Beta weighting for surround Vertices.

        const beta = this.valenceArr[ valency ];

        // Beta weighting for the original ith Vertex.

        const vertexWeightBeta = 1.0 - (valency * beta);

        let c = vtx.coords;

        let tc = vtx.texCoords;

        let x = vertexWeightBeta * c.x;

        let y = vertexWeightBeta * c.y;

        let z = vertexWeightBeta * c.z;

        let u = vertexWeightBeta * tc.u;

        let v = vertexWeightBeta * tc.v;

        // Beta weighting for surround Vertices, using Edge vertices.

        for ( let j = 0; j < valency; j++ ) {

            // Get the surround Vertices for vtx.

            const oppositeIndex = edgeArr[ vtx.e[ j ] ].getOpposite( vtx );

            let dist = vtx.distance( vertexArr[ oppositeIndex ] );

            c = vertexArr[ oppositeIndex ].coords;

            tc = vertexArr[ oppositeIndex ].texCoords;

            x += beta * c.x;

            y += beta * c.y;

            z += beta * c.z;

            u += beta * tc.u;

            v += beta * tc.v;

        }

        // Save the recomputed Vertex

        vtx.set( x, y, z, u, v );

        return true;

    }

    /** 
     * Adjust Odd Vertices, 4 control points.
     */
    computeOdd ( vtx, vertexArr, key, revKey ) {

        const fw = this.fw;   // 3 / 8;

        const ow = this.ow;   // 1 / 8;

        const f0w = this.f0w; // 4 / 8; // 4/8 change this to 4.5 to see seams

        let edgeArr = this.edgeArr;

        let edge = edgeArr[ this.edgeMap[ key ] ];

        if ( ! edge ) { 

             // vtx1-vtx2 key not found, find vtx2-vtx1 key.

            edge = edgeArr[ this.edgeMap[ revKey ] ];

        } else {

            //console.log('using forward edge')

        }

        if ( edge ) {

            /* 
             * IMPORTANT!
             * 
             * If a Vertex has only one 'opposite' Vertex (meaning 
             * that fv0 === fv1) we are at a 'seam' or a 'corner'. 
             * Vertices with no second control Vertex. They should 
             * not be computed.
             * 
             * You can see the 'seams by changing f02 to 4.5 / 8 and 
             * you will get a jagged vertical seam'.
             *
             * For this to work, the 'even' Vertices must also be ignored.
             * In computeEven(), seams are Vertices with < 6 surround 
             * vertices (Vertex.e.length < 6) and aren't processed.
             */

            const ev0 = vertexArr[ edge.v[ 0 ] ];
            const ev1 = vertexArr[ edge.v[ 1 ] ];

            let fv0 = vertexArr[ edge.ov[ 0 ] ];
            let fv1 = vertexArr[ edge.ov[ 1 ] ];

            // adjust only if the facing Vertices are different.

            let x, y, z, u, v;

            if ( fv0 !== fv1 ) {

                // Vertices forming the Edge the midpoint is in 

                x = fw * ( ev0.coords.x + ev1.coords.x ),
                y = fw * ( ev0.coords.y + ev1.coords.y ),
                z = fw * ( ev0.coords.z + ev1.coords.z ),
                u = fw * ( ev0.texCoords.u + ev1.texCoords.u ),
                v = fw * ( ev0.texCoords.v + ev1.texCoords.v );

                x += ow * ( fv0.coords.x + fv1.coords.x );
                y += ow * ( fv0.coords.y + fv1.coords.y );
                z += ow * ( fv0.coords.z + fv1.coords.z );
                u += ow * ( fv0.texCoords.u + fv1.texCoords.u );
                v += ow * ( fv0.texCoords.v + fv1.texCoords.v );

                vtx.set( x, y, z, u, v );

                return true;

            } else {

                // we need to pull up by a neighboring vertex at the edge.

                x = f0w * ( ev0.coords.x + ev1.coords.x ),
                y = f0w * ( ev0.coords.y + ev1.coords.y ),
                z = f0w * ( ev0.coords.z + ev1.coords.z ),
                u = f0w * ( ev0.texCoords.u + ev1.texCoords.u ),
                v = f0w * ( ev0.texCoords.v + ev1.texCoords.v );

                  vtx.set( x, y, z, u, v );

                return true;

            }

        } else {

            console.error( 'Mesh::computeEven(): invalid keys:' + key + ',' + revKey + ' edge is undefined' );

        }
        return false;
    }

    /**
     * Subdivide and optionally smooth a Mesh, similar to 
     * @link https://github.com/deyan-hadzhiev/loop_subdivision/blob/master/loop_subdivision.js
     * compute the Euler characteristic, based on effect of subdivision:
     * 1. Number of faces = 4x larger
     * 2. Each subdivided Face creates 3 new Edges, subdivided Edge creates 2 new Edges.
     * @param {Boolean} smooth if true, smooth the subdivided object, else just insert subdivions Vertices.
     */
    subdivide ( smooth ) {

        // Save the originals.

        this.oldVertexArr = this.vertexArr.slice( 0 );

        let vertexArr = this.oldVertexArr;

        let newVertexArr = [];

        this.oldIndexArr = this.indexArr.slice( 0 );

        let indexArr = this.oldIndexArr;

        let newIndexArr = [];

        let indexHash = []; // for old indices = position in oldVertexArray

        let midHash = []; // for new points, position in newVertexArray

        let edgeArr = this.edgeArr;

        // Rebuild the Vertex and Index array.

        let v0, v1, v2;

        // Compute Faces and Edges (hash back to Vertices).

        this.computeFaces();

        // Loop through the Vertices, creating new midpoints & smoothing Vertex positions only when needed.

        for ( let i = 0; i < indexArr.length; i += 3 ) {

            let i0 = indexArr[ i + 0 ];

            let i1 = indexArr[ i + 1 ];

            let i2 = indexArr[ i + 2 ];


            if ( indexHash[ i0 ] ) {

                v0 = newVertexArr[ indexHash[ i0 ] ];

            } else {

                v0 = vertexArr[ i0 ].clone();

            }

            if ( indexHash[ i1 ] ) {

                v1 = newVertexArr[ indexHash[ i1 ] ];

            } else {

                v1 = vertexArr[ i1 ].clone();

            }

            if ( indexHash[ i2 ] ) {

                v2 = newVertexArr[ indexHash[ i2 ] ];

            } else {

                v2 = vertexArr[ i2 ].clone();

            }

            // Compute new indices in the subdivided Vertex array

            let ii0 = newVertexArr.indexOf( v0 );

            if ( ii0 === -1 ) {

                newVertexArr.push( v0 );

                ii0 = newVertexArr.length - 1;

                indexHash[ i0 ] = ii0;

            } else {

                //ii0 = ii0;

            }

            let ii1 = newVertexArr.indexOf( v1 );

            if ( ii1 === -1 ) {

                newVertexArr.push( v1 );

                ii1 = newVertexArr.length - 1;

                indexHash[ i1 ] = ii1;

            } else {

                //ii1 = ii1;

            }

            let ii2 = newVertexArr.indexOf( v2 );

            if ( ii2 === -1 ) {

                newVertexArr.push( v2 );

                ii2 = newVertexArr.length - 1;

                indexHash[ i2 ] = ii2;

            } else {

                //ii2 = ii2;

            }

            let m0, m1, m2, mi0, mi1, mi2;

            /*
            newIndexArr.push(

                i0, i1, i2

            );
            */


/*
            // if we just add a central point

            m0 = this.computeCentroid( v0, v1, v2 );

            m0.scale( 1.02 ); //@@@@@@@@@@@@@@@@@@@@@@@@@@@DEBUG REMOVE

            newVertexArr.push( m0 );

            mi0 = newVertexArr.length - 1;

            // get the surround points

            let key = i0 + '-' + i1;
            let revKey = i1 + '-' + i0;
            let edg0 = edgeArr[ this.edgeMap[ key ] ];
            if ( ! edg0 ) edg0 = edgeArr[ this.edgeMap[ revKey ] ];

            key = i1 + '-' + i2;
            revKey = i2 + '-' + i1;
            let edg1 = edgeArr[ this.edgeMap[ key ] ];
            if ( ! edg1 ) edg1 = edgeArr[ this.edgeMap[ revKey ] ];

            key = i2+ '-' + i0;
            revKey = i0 + '-' + i2;
            let edg2 = edgeArr[ this.edgeMap[ key ] ];
            if ( ! edg2 ) edg2 = edgeArr[ this.edgeMap[ revKey ] ];

            let wt = 0.85;
            let awt = 1 - wt;

            let me0 = this.computeCentroid( 
                vertexArr[ edg0.ov[ 0 ] ],
                vertexArr[ edg1.ov[ 0 ] ],
                vertexArr[ edg2.ov[ 0 ] ]
            ).scale( 0.15 );

            v0.scale( 0.85 ).add( me0 );
            v1.scale( 0.85 ).add( me0 );
            v2.scale( 0.85 ).add( me0 );


            // push the new index

            newIndexArr.push(
                mi0, ii0, ii1,
                mi0, ii1, ii2,
                mi0, ii2, ii0
            );

*/

            if ( smooth ) {

                this.computeEven( v0, vertexArr );

                this.computeEven( v1, vertexArr );

                this.computeEven( v2, vertexArr );

            }

            // if we add three midpoints

            // First midpoint.

            let key = ii0 + '-' + ii1;

            let revKey = ii1 + '-' + ii0;

            if( midHash[ key ] ) { 

                mi0 = midHash[ key ];

            } else if ( midHash[ revKey] ) {

                mi0 = midhash[ revKey ];

            } else { 

                m0 = this.computeCentroid( v0, v1 );

                if ( smooth ) { 

                    this.computeOdd( m0, vertexArr, i0 + '-' + i1, i1 + '-' + i0 ); // OLD INDEXES

                }

                newVertexArr.push( m0 ); 

                mi0 = newVertexArr.length - 1; 

                midHash[ key ] = mi0;

                midHash[ revKey ] = mi0;

            }


            // Second midpoint.

            key = ii1 + '-' + ii2;

            revKey = ii2 + '-' + ii1;

            if( midHash[ key ] ) {

                mi1 = midHash[ key ];

            } else if ( midHash[ revKey] ) {

                mi1 = midhash[ revKey ];

            } else { 

                m1 = this.computeCentroid( v1, v2 );

                if ( smooth ) {

                    this.computeOdd( m1, vertexArr, i1 + '-' + i2, i2 + '-' + i1 ); // OLD INDEXES

                }

                newVertexArr.push( m1 ); 

                mi1 = newVertexArr.length - 1; 

                midHash[ key ] = mi1;

                midHash[ revKey ] = mi1;

            }

            // Third midpoint.

            key = ii2 + '-' + ii0;

            revKey = ii0 + '-' + ii2;

            if( midHash[ key ] ) {

                mi2 = midHash[ key ];

            } else if ( midHash[ revKey] ) {

                mi2 = midhash[ revKey ];

            } else { 

                m2 = this.computeCentroid( v2, v0 );

                if ( smooth ) {

                    this.computeOdd( m2, vertexArr, i2 + '-' + i0, i0 + '-' + i2 ); // OLD INDICES

                }

                newVertexArr.push( m2 ); 

                mi2 = newVertexArr.length - 1; 

                midHash[ key ] = mi2;

                midHash[ revKey ] = mi2;

            }



            // Push new indices

            newIndexArr.push(

                mi0, ii1, mi1,   // B  

                mi1, mi2, mi0,   // C

                mi2, mi1, ii2,   // D

                mi2, ii0, mi0    // A

            );

        } // end of index loop

        this.vertexArr = newVertexArr;

        this.indexArr = newIndexArr;

        ///TODO: ??????????????????????? WHY NOT MULTIPLE RUNS??????????????????????????????
        // TODO: ?????????????????? SHIFT TO UNIT32???????????????????????????????????????

        //this.edgeArr = [];

        this.edgeMap = [];

        this.midMap = [];

        this.faceArr = [];

        console.log( 'Mesh::subdivde(): subdivided from ' + this.oldVertexArr.length + ' to:' + this.vertexArr.length );

        return this;

    }


    /** 
     * Convert our native flattened geometric data (from Prim) to a Vertex object 
     * data representation suitable for subdivision and morphing.
     * @param {Float32Array} vertices a flattened array of positions.
     * @param {Uint16Array} indices drawing order for vertices.
     * @param {Float32Array} texCoords texture coordinates for each position.
     */
    geometryToVertex ( vertices, indices, texCoords ) {

        console.log('Mesh::geometryToVertex()')

        /* 
         * The incoming flattened index array has stride = 3, so 
         * an x coord in the vertexArr is just the index value
         * of the starting x coordinate in flattened vertices * 3, 
         * ...so we don't have to change the index array at all.
         */

        this.indexArr = indices.slice( 0 );

        // Convert flattened coordinates to Vertex objects. IndexArr is unchanged, and still points to the right places.

        this.vertexArr = this.computeVertices( vertices, texCoords );

        return this;

    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     * @returns{ Object{vertices, indices, texCoords}} an object with the flattened arrays.
     */
    vertexToGeometry () {

        console.log( 'Mesh::vertexToGeometry()' );

        let vertexArr = this.vertexArr;

        let numVertices = vertexArr.length;

        let indexArr = this.indexArr;

        // index array doesn't need to be flattened, just clone it.

        let indices = this.indexArr.slice( 0 );

        // flattened vertices and texCoords array need to be generated from Vertex array.

        let vertices = new Array( vertexArr.length * 3 );

        let texCoords = new Array( vertexArr.length * 2 );

        console.log( 'Mesh::vertexToGeometry(): index length:' + indexArr.length );

        for ( let i = 0; i < numVertices; i++ ) {

            let vi = i * 3;

            let ti = i * 2;

            let vtx = vertexArr[ i ];

            if ( vtx ) {

                let c = vtx.coords;

                let t = vtx.texCoords;

                // Recover and flatten coordinate values.

                vertices[ vi     ] = c.x;

                vertices[ vi + 1 ] = c.y;

                vertices[ vi + 2 ] = c.z;

                // Recover and flatten texture coordinate values.

                texCoords[ ti ]     = t.u;

                texCoords[ ti + 1 ] = t.v;

            } else {

                console.warn( 'Mesh::vertexToGeometry(): no vertex in vertexArr at pos:' + i );

                vertices = vertices.slice( i ); // truncate to keep the vertices valid for debugging

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
     * Completely clear the internal Mesh structure.
     */
    clear () {

        this.vertexArr = [];    // holds Vertex objects

        this.indexArr = [];     // holds drawing path through Vertex objects

        this.edgeArr = [];      // holds Edge objects

        this.edgeMap = [];      // lookup table for Edges (even Vertices)

        this.faceArr = [];      // holds the triangle list (derived from indexArr)

        this.oldVertexArr = []; // keep the original Vertex data when transforming mesh

    }

    /** 
     * Validate a Mesh structure
     */
    isValid () {

        let vertexArr = this.vertexArr;

        if ( vertexArr.length > 0 && this.indexArr.length > 0 ) {

            for ( let i = 0; i < vertexArr.length; i++ ) {

                if ( ! vertexArr[ i ].isValid() ) {

                    console.error( 'Mesh::isValid(): invalid supplied vertex at:' + i );

                }

            }

        } else {

            console.error( 'Mesh::isValid(): no vertex and/or index array defined' );

        }

    } // end of isValid

 } // End of class.

// We only export Mesh

export default Mesh;


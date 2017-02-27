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

        this.s = []; // Seam array, indicates other Vertex objects that are < epsilon apart

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

    /** 
     * Return a vector distance between two Coords, optionally 
     * leaving out the square root calculation.
     * @param {Vertex} vtx another Vertex object
     * @param {Boolean} fast if true, don't do square root, just absolute 
     * sum of x, y, z, distances.
     * @returns {Number} a vector distance, or approximation.
     */
    distance ( vtx, fast = false ) {

        let x = vtx.coords.x - this.coords.x;

        let y = vtx.coords.y - this.coords.y;

        let z = vtx.coords.z - this.coords.z;

        if ( fast ) {

            return ( Math.abs( x ) + Math.abs( y ) + Math.abs( z ) );

        } else {

            return Math.sqrt( x * x + y * y + z * z );

        }

    }

    set ( x, y, z, u, v ) {

        this.coords.x = x;

        this.coords.y = y;

        this.coords.z = z;

        this.texCoords.u = u;

        this.texCoords.v = v;

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
     * @constructor
     * create an Edge, make from two consecutive Vertices in the index for 
     * drawing the Mesh.
     * @param {Number} i0 index of the first Vertex in the Vertex array.
     * @param {Number} i1 index of the second Vertex in the Vertex array.
     * @param {Number} i2 index of the third Vertex (forming a triangle) in the Vertex Array.
     * @param {Number} fi index of the Face created by the three Vertices.
     */
    constructor ( i0, i1, i2, fi ) {

        this.v = new Uint32Array( 2 );  // index the two Vertex objects forming the Edge

        this.ov = new Uint32Array( 2 ); // index the opposite Vertices in first and second Face

        this.f = new Uint32Array( 2 );  // index the opposite Faces

        this.s = []; // index Edges that overlap position.

        this.v[ 0 ] = i0;

        this.v[ 1 ] = i1;

        this.f[ 0 ] = fi;         // The Face this Edge is initially part up during creation

        this.f[ 1 ] = 4294967295; // The other Face, initially invalid value

        // Index of the opposite Vertex (forming triangle) connected to this Edge (only know first one at this point).

        this.ov[ 0 ] = i2;

        this.ov[ 1 ] = i2; // This should change during computation

    }

    getOpposite( vtx ) {

        if ( vtx === this.v[ 0 ] ) {

            return this.v[ 1 ];

        } else if ( vtx === this.v[ 1 ] ) {

            return this.v[ 0 ];

        } else {

            console.error( 'Edge::getOpposite: invalid Vertex' + vtx + ' supplied' );

        }

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
    constructor ( e0, e1, e2 ) {

        this.e = new Uint32Array( 3 );

        this.e[ 0 ] = e0;

        this.e[ 1 ] = e1;

        this.e[ 2 ] = e2;

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

        this.vertexArr = [];    // holds Vertex objects

        this.indexArr = [];     // holds drawing path through Vertex objects

        this.edgeArr = [];      // holds Edge objects

        this.edgeMap = [];      // lookup table for Edges (even Vertices)

        this.faceArr = [];      // holds the triangle list (derived from indexArr)

        this.valenceArr = [];   // holds computed valency constants for Edge and opposite Vertices

        this.oldVertexArr = []; // Keep the original Vertex data when transforming mesh.

        this.badIndex32 = 4294967294;

        this.epsilon = 0.000001; // DEBUG!!!!!!!!!!!! change value as appropriate

        // Pre-compute valency values.

        this.computeValencyWeights( 12 );

        // Convert flattened arrays to Vertex data structure.

        this.geometryToVertex( vertices, indices, texCoords );

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
     * Compute the average (xyz) distance beween Vertices in the Mesh.
     */
    computeAverageDistance () {

        let vertexArr = this.vertexArr;

        let edgeArr = this.edgeArr;

        let len = edgeArr.length;

        let edgeHash = [];

        let dx = 0, dy = 0, dz = 0;

        for ( let i = 0; i < len; i++ ) {

            let edge = edgeArr[ i ];

            if ( ! edge.key in edgeHash ) {

                let v0 = vertexArr[ edge.v[ 0 ] ];

                let v1 = vertexArr[ edge.v[ 1 ] ];

                dx += Math.abs( v0.coords.x  - v1.coords.x ) ;

                dy += Math.abs( v0.coords.y - v1.coords.y );

                dz += Math.abs( v0.coords.z - v1.coords.z );

            }

        }

        return new Coords( 
  
            dx / len,

            dy / len,

            dz / len

        );

    }

    /** 
     * find the closest Vertex NOT in the immediate 'index' neighborhood 
     * for a given Vertex. Useful in adding more Edge points for  even 
     * vertex calculations.
     * 
     * Note filters use actual Vertex objects rather than indices
     */
    computeClosestVertex ( x, y, z, ignore ) {

        const vertexArr = this.vertexArr;

        const len = this.vertexArr.length;

        let min = 1000000;

        let idx = -1;

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let vtx = vertexArr[ i ];

            //if( ignore.indexOf( vtx.idx ) !== -1 ) console.log( 'in computeClosestVertex, ignore found at:' + ignore.indexOf( vtx.idx ) )

            //if ( ignore.indexOf( vtx.idx ) === -1 ) console.log('no ignore at:' + ignore.indexOf( vtx.idx ) )

            if ( ignore.indexOf( vtx.idx ) === -1 ) {

                let cMin = Math.abs( x - vtx.coords.x) + Math.abs( y - vtx.coords.y ) + Math.abs( z - vtx.coords.z )

                if ( cMin < min ) {

                    idx = i;

                    min = cMin;

                }

            }

        }

        return idx;

    }

    /** 
     * find the closest Edge for a given Edge. Useful for 
     * adding the opposite Vertex for odd (midpoint) calculations
     */
    computeClosestEdge ( edge ) {


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
     * Find seams in the Mesh (process differently). Also flag
     * edges that overlap so that midpoint calculations don't
     * cause a tear in the mesh.
     */
    computeSeams () {

        let vertexArr = this.vertexArr;

        let edgeArr = this.edgeArr;

        let c0, c1, c2, c3;

        let s0, s1, s2, s3;

        // Find any Edges with both Vertex objects overlapping.

        for ( let i = 0; i < edgeArr.length; i++ ) {

            let c0 = vertexArr[ edgeArr[ i ].v[ 0 ] ];

            let c1 = vertexArr[ edgeArr[ i ].v[ 1 ] ];

            for ( let j = 0; j < edgeArr.length; j++ ) {

                let c2 = vertexArr[ edgeArr[ j ].v[ 0 ] ];

                let c3 = vertexArr[ edgeArr[ j ].v[ 1 ] ];

                if ( c0.distance( c2 ) < this.epsilon ) s0 = true; else s0 = false;

            }

        }

        // If there is only one overlap, add to Vertex seam array (no midpoint)

        // if there is an Edge overlap, add to Edge seam array.

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

            edge.f[ 1 ]  = fi; // Add the second Face to the Edge (1st added in constructor)

            edge.ov[ 1 ] = i2; // Add the second opposite Vertex to the Edge (1st added in constructor)

        } else {

            idx = edgeArr.length;

            this.edgeMap[ key ] = idx;

            let edge = new Edge( mini, maxi, i2, fi );

            edgeArr.push( edge );

            //console.log('setting Edge key:' + key)

            // Let Vertices know they are part of this Edge (most get 6).

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
     * Add a midpoint between several Vertices.
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
     * Adjust Even Vertices, up to 6 control points.
     * @param {Vertex} vtx the Vertex to compute.
     * @param {Array[Vertex]} the array containing surround Vertices.
     */
    computeEven ( vtx, vertexArr ) {

        const valency =  vtx.e.length;

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

            // Get the surround Vertices for ith Vertex

            const oppositeIndex = edgeArr[ vtx.e[ j ] ].getOpposite( i );

            ///////const oppositeIndex = edgeArr[ vtx.e[ j ] ].v[ 0 ];

            c = vertexArr[ oppositeIndex ].coords;

            tc = vertexArr[ oppositeIndex ].texCoords;

            x += beta * c.x;

            y += beta * c.y;

            z += beta * c.z;

            u += beta * tc.u;

            v += beta * tc.v;

        }

        // Save the recomputed Vertex
        // TODO: remove weighting after done!!!

        vtx.set( x*1.01, y*1.01, z*1.01, u, v );

    }

    /** 
     * Adjust Odd Vertices, 4 control points.
     */
    computeOdd ( vtx, vertexArr, key, revKey ) {

        let edge = this.edgeArr[ this.edgeMap[ key ] ];

        if ( ! edge ) { 
            //console.log('no forward edge for ' + key + ', trying reverse'); 
            edge = this.edgeArr[ this.edgeMap[ revKey ] ];

        } else {

            //console.log('using forward edge')

        }

        if ( edge ) {

            const fw = 3 / 8;

            const ow = 1 / 8;

            const ev0 = vertexArr[ edge.v[ 0 ] ];
            const ev1 = vertexArr[ edge.v[ 1 ] ];

            let fv0 = vertexArr[ edge.ov[ 0 ] ];
            let fv1 = vertexArr[ edge.ov[ 1 ] ];

            if ( ! ev0 ) console.error( 'no ev0  for Edge vertex ' + edge.v[ 0 ] );
            if ( ! ev1 ) console.error( 'no ev0  for Edge vertex ' + edge.v[ 1 ] );
            if ( ! fv0 ) console.error( 'no ev0  for Edge vertex ' + edge.ov[ 0 ] );
            if ( ! fv1 ) console.error( 'no ev0  for Edge vertex ' + edge.ov[ 1 ] );

            // Only process if we are not on a mesh seam.
            // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            // TODO: THIS IS AN IMPERFECT WAY TO FIND MESH SEAMS. FAILS 
            // TODO: ON MULTIPLE SEAM CALCULATIONS.
            // TODO: COMPUTE MESH SEAMS IN ARRAY
            // TODO:
            // TODO: CONFIRM CONVERSION BACK TO FLATTENED WORKS CORRECTLY
            // TODO: FOR MULTIPLE VERTICES - MULTIPLE SUBDIVIDE LEAVING HOLES
            // TODO: ICOSPHERE PUTTING SOUTH POLE AT NORTH POLE IMPLES A PROBLEM
            // TODO: REDO TERRAIN SO IT DOESN'T JOIN ITSELF! IMPLIES BEING 
            // TODO: SLIGHTLY DIFFERENTLY, LEADING TO ERRORS IN SECOND SUBDIVIDE
            //
            // SUBDIVIDE WITH NO SMOOTHING CAUSES ERRORS ONLY IN SPHERE AND 
            // ICOSPHERE (go to zero point from triangles?)
            //
            // SUBDIVIDE WITH ONE SMOOTH CAUSES SMALL ERRORS ONLY IN POSITIONING.
            // SO THERE ARE TWO PROBLEMS HERE!!
            // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

            if ( fv0 !== fv1 ) {

                let x, y, z, u, v;

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

            } 

        } else {

            console.log( 'edge is undefined for:' + key + ',' + revKey);

        }
        return false;
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
     */
    subdivide ( smooth ) {

        // Save the originals.

        this.oldVertexArr = this.vertexArr.slice( 0 ); // DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        let vertexArr = this.oldVertexArr;

        let newVertexArr = [];

        this.oldIndexArr = this.indexArr.slice( 0 ); // DEBUG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        let indexArr = this.oldIndexArr;

        let newIndexArr = [];

        let indexHash = []; // for old indices = position in oldVertexArray

        let midHash = []; // for new points, position in newVertexArray


       // console.log("VERTEXARRAY LENGTH:" + vertexArr.length )
       // console.log("INDEXARRAY LENGTH:" + indexArr.length )

        // Rebuild the Vertex and Index array.

        let v0, v1, v2;

        // Compute Faces and Edges (hash back to Vertices).

        this.computeFaces();

        // Find Seams

        this.computeSeams();

        // Loop through the Vertices, creating new midpoints & smoothing Vertex positions.

        for ( let i = 0; i < indexArr.length; i += 3 ) {

            let i0 = indexArr[ i + 0 ];

            let i1 = indexArr[ i + 1 ];

            let i2 = indexArr[ i + 2 ];

            if ( indexHash[ i0 ] ) v0 = newVertexArr[ indexHash[ i0 ] ]; 
            else v0 = vertexArr[ i0 ].clone();

            if ( indexHash[ i1 ] ) v1 = newVertexArr[ indexHash[ i1 ] ]; 
            else v1 = vertexArr[ i1 ].clone();

            if ( indexHash[ i2 ] ) v2 = newVertexArr[ indexHash[ i2 ] ]; 
            else v2 = vertexArr[ i2 ].clone();


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

            m0 = this.addCentroid( v0, v1, v2 );

            //m0.coords.x *= 1.01;
            //m0.coords.y *= 1.01;
            //m0.coords.z *= 1.01;

            newVertexArr.push( m0 );

            mi0 = newVertexArr.length - 1;

            newIndexArr.push(
                mi0, ii0, ii1,
                mi0, ii1, ii2,
                mi0, ii2, ii0
            );
*/

            // if we add three midpoints

            // First midpoint.

            let key = ii0 + '-' + ii1;

            let revKey = ii1 + '-' + ii0;

           /// if( midHash[ key ] ) { 
           ///     mi0 = midHash[ key ];
           /// }
           //// else if ( midHash[ revKey] ) {
           ///     mi0 = midhash[ revKey ];
           //// }
           /// else { 
                m0 = this.computeCentroid( v0, v1 );

                if ( smooth ) this.computeOdd( m0, vertexArr, i0 + '-' + i1, i1 + '-' + i0 ); // OLD INDEXES

                newVertexArr.push( m0 ); 
                mi0 = newVertexArr.length - 1; 
                midHash[ key ] = mi0;
                midHash[ revKey ] = mi0;
           /// }

            // Second midpoint.

            //m1 = this.computeCentroid( v1, v2 );

            key = ii1 + '-' + ii2;
            revKey = ii2 + '-' + ii1;

            ///if( midHash[ key ] ) {
            ///    mi1 = midHash[ key ];
           ///}
            ///else if ( midHash[ revKey] ) {

            ///mi1 = midhash[ revKey ];
            ///}
           /// else { 
                m1 = this.computeCentroid( v1, v2 );

                if ( smooth ) this.computeOdd( m1, vertexArr, i1 + '-' + i2, i2 + '-' + i1 ); // OLD INDEXES

                newVertexArr.push( m1 ); 
                mi1 = newVertexArr.length - 1; 
                midHash[ key ] = mi1;
                midHash[ revKey ] = mi1;
            ///}

            // Third midpoint.

            //m2 = this.computeCentroid( v2, v0 );

            key = ii2 + '-' + ii0;
            revKey = ii0 + '-' + ii2;

            ///if( midHash[ key ] ) {
            ///    mi2 = midHash[ key ];
            ///}
            ///else if ( midHash[ revKey] ) {
            ///    mi2 = midhash[ revKey ];
            ///}
            ///else { 
                m2 = this.computeCentroid( v2, v0 );

                if ( smooth ) this.computeOdd( m2, vertexArr, i2 + '-' + i0, i0 + '-' + i2 ); // OLD INDICES

                newVertexArr.push( m2 ); 
                mi2 = newVertexArr.length - 1; 
                midHash[ key ] = mi2;
                midHash[ revKey ] = mi2;
            ///}

            // Run computeEven here since what we do with odd may determine what to do with even

            if (smooth) {

                this.computeEven( v0 );

                this.computeEven( v1 );

                this.computeEven( v2 );

            }

            // Push new indices

            newIndexArr.push(

                mi0, ii1, mi1,   // B  

                mi1, mi2, mi0,   // C

                mi2, mi1, ii2,   // D

                mi2, ii0, mi0    // A

            );


        } // end of index loop

        console.log("$$$$PARTIAL %:" + this.totNeedIgnore + '/' + this.oldVertexArr.length) //////////////////////////

        this.vertexArr = newVertexArr;

        this.indexArr = newIndexArr;

        console.log( 'mesh::subdivde: subdivided from ' + this.oldVertexArr.length + ' to:' + this.vertexArr.length );

        return this;

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


    } // end of isValid

 } // End of class.

// We only export Mesh

export default Mesh;


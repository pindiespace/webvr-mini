/** 
 * A mesh object containing un-flattened references to vertices, indices, and 
 * texture coordinates, suitable for subdivision and other complex manipulations.
 */
import Vertex from './vertex';
import Edge from './edge';
import Tri from './tri';
import Quad from './quad';

class Mesh {

    constructor ( vertexArr = [], indexArr = [], edgeArr = [], triArr = [], quadArr = [] ) {

        // reading order: i1, i2, i3, i1, i3, i4

        this.vertexArr = vertexArr;

        this.indexArr = indexArr;

        this.edgeArr = edgeArr;

        this.triArr = triArr;

        this.quadArr = quadArr;

    }

    /** 
     * Find the edges of a Mesh which is not closed (e.g., some Vertex objects 
     * are connected to less than 6 other Vertices.
     * Assume:
     * - Each Vertex should have 6 nearest neighbors
     * @returns {Object} a list of Vertex objects, sorted by the number of neighbors they are missing.
     */
    getEdges () {

        // define a data structure for Edges of the Mesh.

        let edgeList = {

            fEdges: [ [], [], [], [], [], [], [] ],

            oEdges: [ [], [], [], [], [], [], [] ]

        };

        let vertexArr = this.vertexArr;

        let len = vertexArr.length;

        /* 
         * Push Vertex objects into edgeLists, based on the number of Edges they have. 
         * If a vertex has 1 defined edge, it goes into fEdges[ 1 ], and oEdges[ 1 ];
         */

        for ( let i = 0; i < len; i++ ) {

            let v = vertexArr[ i ];

             // fEdges (forward edges)

            let pos = parseInt( v.fEdges.length );

            edgeList.fEdges[ pos ].push( v );

            // oEdges (reverse edges)

            pos = parseInt( v.oEdges.length );

            edgeList.oEdges[ pos ].push( v );

        }

        return edgeList;

    }

    /** 
     * If a mesh is not closed (meaning that it has Vertex objects without Edges on 
     * one side) approximate the missing Edges by looking for nearest neighbors which 
     * are not in the immediate Edge list.
     * @param {Array[Vertex]} vertexArr the array of Vertex objects.
     */
    computeEdgeNeighbors () {

        // A list of Edges with Vertex objects that don't have enough neighboring Edges.

        console.log( '--------------- COMPUTE MESH EDGES -----------------')

        // Get maximum number of Edges expected for this Vertex set

        const MAX_EDGES = this.vertexArr[ 0 ].MAX_EDGES; // a Max of 6 in most cases

        const MAX_LOOPS = MAX_EDGES;

        let vertexArr = this.vertexArr;

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let vtx = vertexArr[ i ];

            let edgeNum = vtx.fEdges.length;

            let loopNum = 0;

            // Set up an array that stores already found close Vertex objects - so we don't keep grabbing the same one

            let ignore = [], closest = null;

            while ( edgeNum <= MAX_EDGES && loopNum < MAX_LOOPS ) {

                if (loopNum >= MAX_LOOPS ) {

                    console.error( 'computeMeshEdges: too many loops trying to find close neighbors for:' + vtx.idx + ' at position:' + i );

                    break;

                }

                if ( edgeNum < MAX_EDGES ) {

                    // Find the closest Vertex, ignoring ones we already have in our ignore list.

                    closest = vtx.getNeighbor( vertexArr, ignore );

                    /////////////console.log( 'computeMeshEdges: for vtx:' + vtx.idx + ' the closest vertex is:' + closest.idx )

                    // Set the Vertex we found so we ignore it on the next loop

                    ignore.push( closest );

                    // Apply any non-duplicate Edges to our Vertex

                    vtx.setEdges( closest.fEdges, 0 ); // TODO: ignore edges that come too close to an Edge vertex of this vtx

                } 

                if ( vtx.oEdges.length < MAX_EDGES ) {

                    closest = vtx.getNeighbor( vertexArr, ignore );

                    /////////////console.log( 'computeMeshEdges: for vtx:' + vtx.idx + ' the closest vertex is:' + closest.idx )

                    // Set the Vertex we found so we ignore it on the next loop

                    ignore.push( closest );

                    // Apply any non-duplicate Edges to our Vertex

                    vtx.setEdges( closest.oEdges, 1 ); // TODO: ignore Edges that come too close to an Edge vertex of this vtx.

                }

                edgeNum = vtx.fEdges.length;

                loopNum++;

            } // end of while loop


        } // end of loop through entire Vertex array


        console.log( '-------------- COMPLETE-----------------')

        return true;

    }

    /** 
     * given a Vertex and index array, scan for the Vertex. If 
     * present, just add to the index array. Otherwise, push the 
     * midpoint to the Vertex array, and push its position to 
     * the Index array.
     */
    addMidPoint ( idx0, idx1, vertexArr ) {

        let spacer = '-';

        let key = idx0 + spacer + idx1;

        let m0 = vertexArr[ key ];

        let idx = -1;
            
        if( m0 ) {

            console.log("FOUND FORWARD")
            idx = mVertexArr.indexOf( m0 );

        } else {

            key = idx1 + spacer + idx0;

            m0 = vertexArr[ key ];

            if ( m0 ) {

                console.log("FOUND REVERSE")

            idx = mVertexArr.indexOf( m0 );

            } else {

                let v0 = vertexArr[ idx0 ];

                let v1 = vertexArr[ idx1 ];

                m0 = v0.midPoint( v1 );

                m0.idx = key;

                m0.isEven = false; // an 'odd' Vertex

                vertexArr.push( m0 );

                // return the index of the added Vertex

                idx = vertexArr.length - 1;

            }

        }

        return idx;

    }

    subdivide () {

        let vertexArr = this.vertexArr;

        let indexArr = this.indexArr;

        console.log("VERTEX ARR:" + vertexArr.length + " INDEX ARR:" + indexArr.length)

        // save the originals

        this.oldVertexArr = vertexArr.slice( 0 );

        this.oldIndexArr = indexArr.slice( 0 );

        console.log("VERTEX ARR:" + vertexArr.length + " INDEX ARR:" + indexArr.length)

         // Create a new array of Midpoint objects, with starting position in Vertex labeled

        let mIndexArr = [];

        let spacer = '-';

        let m0, m1;

        let vLen = vertexArr.length;

        for ( let i = 0; i < indexArr.length - 3; i += 3 ) {

            let i0 = indexArr[ i + 0 ];

            let i1 = indexArr[ i + 1 ];

            let i2 = indexArr[ i + 2 ];

            let v0 = vertexArr[ i0 ];

            let v1 = vertexArr[ i1 ];

            let v2 = vertexArr[ i2 ];

            // add Midpoint (if needed) and return index of midpoint

            let mi0 = this.addMidPoint( v1.idx, v2.idx, vertexArr ); // THIS IS WRONG

            let mi1 = this.addMidPoint( v1.idx, v2.idx, vertexArr );

            let mi2 = this.addMidPoint( v2.idx, v0.idx, vertexArr );

            // now, push the updated indexlist ot mIndexArr, even and odd Vertex objects.

            // THIS WORKS
            //mIndexArr.push(
            //    i0, i1, i2 );

            //mIndexArr.push(
            //  mi2, mi1, mi0 );

            console.log( vertexArr[ i0 ].coords.x + ',' + 
                vertexArr[ mi0 ].coords.x + ',' + 
                vertexArr[ i1 ].coords.x )

            mIndexArr.push( i0, mi0, i1, mi1, i2, mi2 )

/*
            mIndexArr.push(

 
                mi0, i1, mi1,    // B  

                mi1, mi2, mi0,   // C

                mi2, mi1, i2     // D

            );
*/

        }

        console.log("indexArr:" + indexArr.length + ' and mIndexArr:' + mIndexArr.length)

        // NOTE: have to reset with 'this', not the local indexArr

        this.indexArr = mIndexArr;

        console.log("indexArr:" + indexArr.length + ' and mIndexArr:' + mIndexArr.length)

        console.log("indexArr:" + this.indexArr.length + ' and mIndexArr:' + mIndexArr.length)

        // RUN A TEST
////////////////////////////////////////
        vLen = vertexArr.length;

        for ( let i = 0; i < indexArr.length; i++ ) {

            let idx = indexArr[ i ];

            if ( idx > vLen || idx < 0  ) {
                console.error( 'subdivision indexing error at pos:' + i );

            } 

            if ( ! vertexArr[ idx ] ) {

                console.error( 'subdivision no vertex error at pos:' + i );

            }

        }
////////////////////////////////////////

        return this;

    }


    /** 
     * smooth a Mesh, when new Vertex objects have been added. 
     */
    smooth () {

        return this;

    }

    /** 
     * Validate a mesh structure
     */
    validate () {

        let vertexArr = this.vertexArr;

        let len = vertexArr.length;

        // confirm that each vertex has 6 edges, and not redundant.

        for ( let i = 0; i < len; i++ ) {

            let vtx = vertexArr[ i ];

            // number test

            if ( vtx.fEdges.length !== vtx.MAX_EDGES ) {

                console.error( 'validateMesh: vtx:' + vtx.idx + ', fEdges ' + vtx.idx + ' has ' + vtx.fEdges.length + ' edges');

            }

            if ( vtx.oEdges.length !== vtx.MAX_EDGES ) {

                console.error( 'validateMesh: vtx:' + vtx.idx + ', oEdges ' + vtx.idx + ' has ' + vtx.oEdges.length + ' edges');

            }

            // identical test, forward edges ( our Vertex is 1st going counter-clockwise )

            for ( let j = 0; j < vtx.fEdges.length; j++ ) {

                let f1 = vtx.fEdges[ j ];

                for ( let k = 0; k < vtx.fEdges.length; k++ ) {

                    let f2 = vtx.fEdges[ k ];

                    if ( j !== k && f1 === f2 ) { // avoid self-compare

                        console.error( 'validateMesh: duplicate Edge entry for vtx:' + vtx.idx + ', ' + f1.idx + ' at:' + j + ' compared to ' + f2.idx + ' at ' + k );

                    }

                }

            }

        }

        let indexArr = mesh.indexArr;

        for ( let i = 0; i < indexArr; i++ ) {

            if ( ! vertexArr[ indexArr[ i ] ] ) {

                console.error( 'validateMesh: index value ' + indexArr[ i ] + ' at:' + i + ' in indexArr points to non-existent Vertex ')

            }

        }

        let triArr = mesh.triArr;

        let quadArr = mesh.quadArr;

    }

 }

 export default Mesh;
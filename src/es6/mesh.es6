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
     * Subdivide a mesh, setting up for smoothing via Loop algorithm.
     */
    subdivide () {

        let vtx = [];

        let idx = [];

        let v = this.vertexArr;

        // Re-compute Edges, Triangles, Index array

        for ( let i = 0; i < indexArr.length - 3; i += 3 ) {

            let v0 = v[ indexArr[ i ] ];

            let v1 = v[ indexArr[ i + 1 ] ];

            let v2 = v[ indexArr[ i + 2 ] ];

            let m0 = v0.midPoint( v1 );

            let m1 = v1.midPoint( v2 );

            let m2 = v0.midPoint( v2 );

            let c = vtx.length;

            // TODO: the midpoints aren't being added to the Vertex
            // Array correctly!

            window.ms = [ v0.coords, m0.coords, v1.coords, m1.coords, v2.coords, m2.coords]

            // TODO: just draw the triangles within a triangle!!!!!!!

            vtx.push(

                //v0, v1, v2 // THIS WORKS
                m0, m1, m2 // INVISIBLE!!! CHECK VALUES
                
            );

            idx.push (

                c + 0,

                c + 1,

                c + 2

            );


        }

        this.vtx = vtx;

        this.idx = idx;

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
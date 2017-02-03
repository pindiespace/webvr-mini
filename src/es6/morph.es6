/** 
 * complex transformations of meshes, e.g. subdivision with smoothing, or 
 * morphing.
 */
import Coords from './coords';
import Vertex from './vertex';
import Edge from './edge';
import Tri from './tri';
import Quad from './quad';
import Mesh from './mesh';

class Morph {

    constructor ( init, util, glMatrix  ) {

        console.log( 'in morph class' );

        this.util = util;

        this.glMatrix = glMatrix;

        if ( this.init === true ) {

            // Do something.

        }

    }




    /** 
     * G.
     */
    computeMeshEdges( vertexArr ) {

        // A list of Edges with Vertex objects that don't have enough neighboring Edges.

        console.log( '--------------- COMPUTE MESH EDGES -----------------')

        const MAX_EDGES = 6; // a Max of 6 in most cases

        const MAX_LOOPS = MAX_EDGES;

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let vtx = vertexArr[ i ];

            let edgeNum = vtx.fEdges.length;

            let loopNum = 0;

            // Set up an array that stores found close Vertex - so we don't keep grabbing the same one

            let ignore = [];

            while ( edgeNum <= MAX_EDGES && loopNum < MAX_LOOPS ) {

                if (loopNum >= MAX_LOOPS ) {

                    console.error( 'computeMeshEdges: too many loops trying to find close neighbors for:' + vtx.idx + ' at position:' + i );

                    break;

                }

            if ( edgeNum < MAX_EDGES ) {

                // Find the closest Vertex, ignoring ones we already have in our Edge list.

                let closest = vtx.getNeighborVertex( vertexArr, ignore );

                console.log( 'computeMeshEdges: for vtx:' + vtx.idx + ' the closest vertex is:' + closest.idx )

                // Set the Vertex we found so we ignore it on the next loop

                ignore.push( closest );

                // Apply any non-duplicate Edges to our Vertex

                vtx.setEdges( closest.fEdges, 0 ); // TODO: ignore edges that come too close to an Edge vertex of this vtx

                vtx.setEdges( closest.oEdges, 1 ); // TODO: ignore Edges that come too close to an Edge vertex of this vtx.

            } else {

                break;

            }

            if ( vtx.oEdges.length < MAX_EDGES ) {


            }

                edgeNum = vtx.fEdges.length;

                loopNum++;

                console.log( 'computeMeshEdges: for vtx:' + vtx.idx + ' fEdge num:' + edgeNum)

            }


        } // end of loop through entire Vertex array


        console.log( '-------------- COMPLETE-----------------')

    }

    /** 
     * Find Vertex objects with undefined nearest neighbors. If we have a mesh with 
     * Edges that wraps into an object, some of these are probably very near each 
     * other. Need to run after geometryToVertex.
     * Assume:
     * Each Vertex should have 6 nearest neighbors
     * Each Vertex should have a previous and next Vertex.
     * @param {Array[Vertex]} vertexArr the array of Vertices
     * @returns {Object} a list of Vertex objects, sorted by the number of neighbors they are missing.
     */
    getMeshEdges ( vertexArr ) {

        let edgeList = {

            fEdges: [ [], [], [], [], [], [], [] ],

            oEdges: [ [], [], [], [], [], [], [] ]

        };

        // Check for prev and next

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let v = vertexArr[ i ];

             // fEdges (forward edges)

            //console.log('fEdges length:'+ v.fEdges.length)

            //console.log( typeof edgeList.fEdges[ v.fEdges.length - 1 ] )

            //console.log( typeof edgeList.fEdges[ v.fEdges.length - 1 ].push )

            let pos = parseInt( v.fEdges.length )

            edgeList.fEdges[ pos ].push( v );


            // oEdges (reverse edges)

            pos = parseInt( v.oEdges.length );

            edgeList.oEdges[ v.oEdges.length - 1 ].push( v );

        }

        return edgeList;

    }

    /** 
     * Recalculate indices on a mesh
     */
    reIndexMesh( mesh ) {



    }

    /** 
     * Validate a mesh structure
     */
    validateMesh ( mesh ) {

        let vertexArr = mesh.vertexArr;

        // confirm that each vertex has 6 edges, and not redundant.

        for ( let i = 0; i < vertexArr.length; i++ ) {

            let vtx = vertexArr[ i ];

            // number test

            if ( vtx.fEdges.length !== 6 ) {

                console.error( 'validateMesh: vtx:' + vtx.idx + ', fEdges ' + vtx.idx + ' has ' + vtx.fEdges.length + ' edges');

            }

            if ( vtx.oEdges.length !== 6 ) {

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

        let triArr = mesh.triArr;

        let quadArr = mesh.quadArr;


    }

    /** 
     * Convert our native flatted geometric data (see Prim) to a Vertex object 
     * data representation suitable for subdivision and morphing.
     */
    geometryToVertex ( vertices, indices, texCoords ) {

        let i = 0;

        console.log("ORIGINAL VERTICES LENGTH:" + vertices.length + " reduced:" + vertices.length / 3 )

        console.log("ORIGINAL INDICES LENGTH:" + indices.length)

        let numVertices = vertices.length / 3;

        let vertexArr = new Array( numVertices );

        let indexArr = indices.slice(0);

        let numIndices = indexArr.length;

        let vi = 0, ti = 0;

        // Convert flattend coordinates to Vertex objects.

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ], vertexArr, i );

        }

        // Compute Edges, Triangles, Quads from the index array
        /*  
         * create Edges, referring to vertices.
         *
            Mk   = refined mesh
            Mk-1 = coarse mesh
            one simple solution is to store the edges vertices in Mk in a hash table. To look up the index for a given 
            "edge" vertex in Mk-1, we query the hash table with the indices of the endpoints of the edge
            in Mk-1, containing the "edge" vertex. If the table entry is uninitialized, the vertex is assigned a new 
            index and that index is stored in the hash table. Otherwise, the hash table returns the previously stored 
            index for the edge vertex. A global counter can be used to assigned new indices and keep track of the 
            total number of vertices.
        */

        // Edge hash

        // Diagram: https://fgiesen.wordpress.com/2012/02/21/half-edge-based-mesh-representations-theory/

        let edgeArr = [];

        window.edgeArr = edgeArr;

        let k1, k2, k3, key, revKey, pKey, nKey, spacer = '-';

        for ( let i = 0; i < numIndices - 1; i++ ) {

            k1 = i;

            k2 = i + 1;

            key = k1 + spacer + k2;

            revKey = k2 + spacer + k1;

            let e = new Edge( indexArr[ k1 ], indexArr[ k2 ], vertexArr );

            // Define Edges in both directions (10->11 and 11->10) but point to same Edge object.

            edgeArr[ key ] = e;      // clockwise

            edgeArr[ revKey ] = e;   // counter-clockwise

            // Define next in last Edge, prev in this Edge

            if ( i > 0 ) {

                k1 = i - 1;

                k2 = i;

                pKey = k1 + spacer + k2;

                edgeArr[ pKey ].nextEdge = edgeArr[ key ]; // last Vertex of this Edge shared with first Vertex of next Edge

                edgeArr[ key ].prevEdge = edgeArr[ pKey ]; // first Vertex of this Edge shared with last Vertex of previous Edge

            }

        }

        // Define Tris

        let triArr = [];

        window.triArr = triArr;

        for ( let i = 0; i < numIndices - 2; i += 2 ) {

            k1 = i;

            k2 = i + 1;

            k3 = i + 2;

            key = k1 + spacer + k2 + spacer + k3;

            /////////////////////console.log("tri key:" + key)

            let t = new Tri( indexArr[ i ], indexArr[ i + 1 ], indexArr[ i + 2 ], vertexArr );

            triArr[ key ] = t;

            // set edges, clockwise read

            t.setEdge( edgeArr[ k1 + spacer + k2 ], 0 );

            t.setEdge( edgeArr[ k2 + spacer + k3 ], 0 );

            t.setEdge( edgeArr[ k3 + spacer + k1 ], 0 );

            // counter-clockwise read

            t.setEdge( edgeArr[ k2 + spacer + k1 ], 1 );

            t.setEdge( edgeArr[ k1 + spacer + k2 ], 1 );

            t.setEdge( edgeArr[ k1 + spacer + k3 ], 1 );

        }

        // Define prev and next Tris

        console.log( "beginning prev and next Tris..." );

        for ( let i = 0; i < numIndices - 2; i += 2 ) {

            if ( i > 0 ) {

                k1 = i;

                k2 = i + 1;

                k3 = i + 2;

                key = k1 + spacer + k2 + spacer + k3;

                k1 = i - 2;

                k2 = i - 1;

                k3 = i;

                pKey = k1 + spacer + k2 + spacer + k3;

                triArr[ pKey ].next = triArr[ key ];

                triArr[ key ].prev = triArr[ pKey ];

            }

        }

        // Define quads

        let quadArr = [];

        // Find Vertex objects missing neighbors.

       let edgeMeshArr = this.getMeshEdges( vertexArr );

       //edgeMeshArr = this.computeMeshEdges( edgeMeshArr, vertexArr );
       edgeMeshArr = this.computeMeshEdges( vertexArr )

       window.edgeMeshArr = edgeMeshArr;

        // Give each Vertex a list of Edge, Face, and Quad indices (hash table)

        // Return a Mesh object (not all properties present yet).

        return new Mesh( vertexArr, indexArr, edgeArr, triArr, quadArr, edgeMeshArr );

    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     */
    vertexToGeometry( vertexArr, indexArr ) {

        let vertices = new Array( vertexArr.length * 3 );

        let indices = new Array( indexArr.length * 3 );

        let texCoords = new Array( vertexArr.length * 2 );

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

        // flatten index array, taking Vertex Position, multiply by 3, add extra coordinates

        let idx = 0;

        for ( let i = 0; i < indexArr.length; i++ ) {

            let iStart = i * 3; 

            indices[ idx++ ] = indexArr[ iStart++ ];

            indices[ idx++ ] = indexArr[ iStart++ ];

            indices[ idx++ ] = indexArr[ iStart ];

        }

        // We aren't exporting a true Geometry, just some of its arrays

        return {

            vertices: vertices,

            indices: indexArr,

            texCoords: texCoords

        };

    }

    /** 
     * Subdivide a mesh, optionally adding data structures for 
     * smoothing after the subdivision. 
     * @link https://graphics.stanford.edu/~mdfisher/Code/Engine/BaseMeshIndexing.cpp.html
     * 
     * a) the mesh is converted to a 
     * a) the mesh is converted to a set of quads, with appropriate indices. 
     * b) the set of quads had ned points added
     * c) indices are re-computed.
     * @param{Array[Vertex]} a Vertex Array
     */
    subdivideMesh ( mesh ) {

        // Find all the triangles



        return mesh;

    }

    /** 
     * Given a mesh, compute a power of two subdivision using the loop algorithm.
     */
    smoothLoop ( mesh ) {

        let submesh = {};

        return mesh;

    }

    /** 
     * Compute a loop subdivision of a mesh
     */
    computeSubdivide ( vertices, indices, texCoords, smooth ) {

        let mesh = this.geometryToVertex( vertices, indices, texCoords );

        window.mesh = mesh;

        window.vtx = mesh.vertexArr;
        window.idx = mesh.indexArr;

        console.log( "+++++++++++++++ VALIDATING +++++++++++++++++++++" )
        this.validateMesh( mesh );
        console.log(" ++++++++++++++++ COMPLETE ++++++++++++++++++++++" )

        mesh = this.subdivideMesh( mesh );

        if ( smooth ) {

            mesh = this.smoothLoop( mesh );

        }

        let divided = this.vertexToGeometry ( mesh.vertexArr, mesh.indexArr );

        window.vertices = vertices;
        window.indices = indices;
        window.vertices2 = divided.vertices;
        window.indices2 = divided.indices;
        window.texCoords = texCoords;
        window.texCoords2 = divided.texCoords;

        // Test vertices

        for ( let i = 0; i < vertices.length; i++ ) {
            if(vertices[i] !== vertices2[i]) {
                console.error("invalid vertices subdivide");
            }
        }

        // test texture coords

        for ( let i = 0; i < texCoords.length; i++ ) {
            if(texCoords[i] !== texCoords2[i]) {
                console.error("invalid texcoord subdivide"); 
            }
        }

        return divided;

    }

    /** 
     * Compute a simplification of a loop mesh.
     */
    computeUndivide ( vertices, indices, texCoords, smooth ) {

        console.error( 'computeUndivide not implemented' );

    }


    /** 
     * Convert from one Prim geometry to another, alters geometry.
     */
    computeMorph ( geometry1, geometry2) {

        console.error( 'computeMorph not implemented' );

    }

}

export default Morph;
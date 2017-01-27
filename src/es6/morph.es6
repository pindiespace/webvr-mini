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

            edgeArr[ key ] = e;

            edgeArr[ revKey ] = e;

            // Define next in last Edge, prev in this Edge

            if ( i > 0 ) {

                k1 = i - 1;

                k2 = i;

                pKey = k1 + spacer + k2;

                edgeArr[ pKey ].next = edgeArr[ key ];

                edgeArr[ key ].prev = edgeArr[ pKey ];

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

            console.log("tri key:" + key)

            let t = new Tri( indexArr[ i ], indexArr[ i + 1 ], indexArr[ i + 2 ], vertexArr );

            triArr[ key ] = t;

            // define Edges (only in one direction)

            t.edge1 = edgeArr[ k1 + spacer + k2 ];

            t.edge2 = edgeArr[ k2 + spacer + k3 ];

            t.edge3 = edgeArr[ k3 + spacer + k1 ]; // THIS IS UNDEFINED, WHY?

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

                console.log("tri key:" + key )
                console.log("tri pKey:" + pKey)

                triArr[ pKey ].next = triArr[ key ];

                triArr[ key ].prev = triArr[ pKey ];

            }

        }


        // Define quads

        let quadArr = [];



        // Give each Vertex a list of Edge, Face, and Quad indices (hash table)

        // Return a Mesh object (not all properties present yet).

        return new Mesh( vertexArr, indexArr, edgeArr, triArr, quadArr );

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

        // Mesh object

        let dm = new Mesh();

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

        window.vtx = mesh.vertexArr;
        window.idx = mesh.indexArr;

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
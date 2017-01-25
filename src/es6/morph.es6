/** 
 * complex transformations of meshes, e.g. subdivision with smoothing, or 
 * morphing.
 */
import Coords from './coords';
import Vertex from './vertex';
import Edge from './edge';
import Face from './face';

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
    geometryToVertex( vertices, indices, texCoords ) {

        let i = 0;

        console.log("ORIGINAL VERTICES LENGTH:" + vertices.length + " reduced:" + vertices.length / 3 )

        console.log("ORIGINAL INDICES LENGTH:" + indices.length)

        let numVertices = vertices.length / 3;

        let vertexArr = new Array( numVertices );

        let numIndices = indices.length / 3;

        let indexArr = new Array( numIndices );

        let vi, ti = 0;

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ] );

        }


        indexArr = indices.slice(0);

        for ( i = 0; i < indexArr.length; i+= 3 ) {

            console.log(" index:" + i + " indexArr:" + indexArr[ i ] + " Vertex:" + vertexArr[ indexArr[ i ] ] );


        }

        // Return an object (actually a basic Mesh )

        return {

            vertexArr: vertexArr,

            indexArr: indexArr

        };

    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     */
    vertexToGeometry( vertexArr, indexArr ) {

        let vertices = new Array( vertexArr.length * 3 );

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

        // flatten index array.

        for ( let i = 0; i < indexArr.length; i++ ) {

            indexArr[ i ] *= 3;

        }

        return {

            vertices: vertices,

            indices: indexArr,

            texCoords: texCoords

        };

    }

    /**
     * Compute the midpoint between any number of vertices in 3D space.
     * @param {Array[Vertex]} vertices
     */ 
    computeMidPoint( vertexArr ) {


    }

    /** 
     * Subdivide a mesh, optionally adding data structures for 
     * smoothing after the subdivision.
     * @param{Array[Vertex]} a Vertex Array
     */
    subdivideMesh ( vertexArr ) {

    }

    /** 
     * Compute a loop subdivision of a mesh
     */
    computeSubdivide ( vertices, indices, texCoords, smooth ) {

        let mesh = this.geometryToVertex( vertices, indices, texCoords );

        window.vtx = mesh.vertexArr;
        window.idx = mesh.indexArr;

        let divided = this.vertexToGeometry ( mesh.vertexArr, mesh.indexArr );

        window.divided = divided;

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
/** 
 * A mesh object containing un-flattened references to vertices, indices, and 
 * texture coordinates, suitable for subdivision and other complex manipulations.
 */
import Vertex from './vertex';

class Mesh {

    constructor ( vertices, indices, texCoords ) {

        // Index reading order: i1, i2, i3, i1, i3, i4

        this.vertexArr = [];

        this.notSmoothed = false; // by default

        this.flattenedToVertex( vertices, indices, texCoords );

    }

    /** 
     * Convert our native flatted geometric data (see Prim) to a Vertex object 
     * data representation suitable for subdivision and morphing.
     * @param {}
     */
    flattenedToVertex ( vertices, indices, texCoords ) {

        let i = 0;

        // Index array is unchanged, just make a copy.

        let vertexArr = this.vertexArr;

        this.indexArr = indices.slice(0);

        let numVertices = vertices.length / 3;

        this.vertexArr = new Array( numVertices );

        let vi = 0;

        let ti = 0;

        // Convert flattened coordinates to Vertex objects. IndexArr still points to the right places.

        for ( i = 0; i < numVertices; i++ ) {

            vertexArr[ i ] = new Vertex( vertices[ vi++ ], vertices[ vi++ ], vertices[ vi++ ], texCoords[ ti++ ], texCoords[ ti++ ], vertexArr, i );

        }

        return this;

    }

    /** 
     * Convert an array of Vertex objects back to our native 
     * flattened data representation.
     */
    vertexToFlattened( mesh ) {

        let vertexArr = mesh.vertexArr;

        let indexArr = mesh.indexArr;

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

        // Flatten index array, taking Vertex Position, multiply by 3, add extra coordinates.

        let idx = 0;

        for ( let i = 0; i < indexArr.length; i++ ) {

            let iStart = i * 3; 

            indices[ idx++ ] = indexArr[ iStart++ ];

            indices[ idx++ ] = indexArr[ iStart++ ];

            indices[ idx++ ] = indexArr[ iStart ];

        }

        // We aren't exporting a true Geometry, just some of its arrays.

        return {

            vertices: vertices,

            indices: indexArr,

            texCoords: texCoords

        };

    }

 }

 export default Mesh;
/** 
 * Create a Vertex class suitable for complex manipulatio of mesh objects, 
 * e.g. subdivision or morphing
 */
import Util from './util';
import Coords from './coords';

class Vertex {

    constructor ( x, y, z, idx, u, v ) {

        this.coords = new Coords( x, y, z );

        this.idx = idx;

        this.texCoords = [ u, v ];

    }


    /**
     * Flatten vertex data, and append to a flattened array.
     */
    flattenAndAppend ( vertices, indices, texCoords ) {

        vertices.push( this.x, this.y, this.z );

        indices.push( idx );

        texCoords.push( this.u, this.v );

    }

    /** 
     * give a list of Vertex objects, find the midpoint. This includes 
     * a texture coordinate calculation.
     */
    midpoint ( vertexArr ) {

        for ( let i = 0; i < vertexArr.length; i++ ) {

            // compute average

        }

    }


}

export default Vertex;
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

        this.triArr = triArr;

        this.quadArr = quadArr;

    }

 }

 export default Mesh;
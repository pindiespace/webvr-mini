/** 
 * Create a Vertex class suitable for complex manipulatio of mesh objects, 
 * e.g. subdivision or morphing
 */
import Util from './util';
import Coords from './coords';

class Vertex {

    /** 
     * @constructor
     * @param {Number} x the x, or 0 coordinate
     * @param {Number} y the y, or 1 coordinate
     * @param {Number} z the z, or 2 coordinate
     * @param {Number} u the u, or 0 texture coordinate
     * @param {Number} v the v, or 1 texture coordinate
     * @param {Array[Vertex]} the parent Vertex array
     */
    constructor ( x = 0, y = 0, z = 0, u = 0, v = 0, vtx, i1 ) {

        //console.log("x:" + x + " y:" + y + " z:" + z)

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        // Save the parent array with all vertices.

        this.vtx = vtx;

        // Hash
        // forward with our drawing (counter-clockwise), we are the first Vertex in the Edge.

        this.fEdges = [];

        // backwards, we are the second Vertex in the Edge.

        this.oEdges = []; 

        this.prevEdge = null;

        this.nextEdge = null;

        this.tris = [];

        this.quads = [];

        this.idx = i1;

    }

    valid () {

        if ( this.coords.isValid() ) {

            return true;

        }

        return false;
    }

    /** 
     * Set the position coordinates of the Vertex.
     * @param {Number} x the x, or 0 coordinate
     * @param {Number} y the y, or 1 coordinate
     * @param {Number} z the z, or 2 coordinate
     */
    setCoords ( x = 0, y = 0, z = 0 ) {

        this.coords.set( x, y, z );

        return this;

    }

    /**
     * Set the texture coordinates of the Vertex.
     * @param {Number} u the u, or 0 texture coordinate
     * @param {Number} v the v, or 1 texture coordinate
     */
    setTexCoords( u = 0, v = 0 ) {

        this.u = u;

        this. v = v; 

        return this;

    }

    /** 
     * Set the Edges this Vertex is associated with.
     * @param {Edge} edge a 'parent' Edge containing this Vertex
     * @param {Number} pos the position in the Edge (assuming we always 
     * move counterclockwise).
     */
    setEdge ( edge, pos ) {

        switch ( pos ) {

            case 0:
                this.fEdges.push( edge ); // counter-clockwise
                break;
            case 1:
                this.oEdges.push( edge ); // clockwise
                break;
            default:
                console.error( 'error when setting Edge in Vertex, ' + pos );
        }

    }

    /** 
     * Set the Tris this Vertex is associated with.
     * @param {Tri} tri a 'parent' Triangle containing this Vertex
     * @param {Number} pos the position in the Triangle (assuming we always 
     * move counterclockwise).
     */
    setTri ( tri ) {

        this.tris.push( tri );

    }

    /** 
     * Return a new Vertex which have averaged position and 
     * texture coordinate
     * @param {Vertex} other the Vertex to average with
     */
    average ( other ) {

        let v = this.clone();

        v.coords = v.coords.average( other.coords );

        v.texCoords =  { 
            u: v1.texCoords.u + v2.texCoords.u / 2,
            v: v1.texCoords.v + v2.texCoords.v / 2
        };

        return v;

    }

    /**
     * Return a new copy of this Vertex
     * @returns {Vertex} a copy of the current vertex
     */
    clone () {

        return new Vertex( this.x, this.y, this.z, this.u, this.v, this.vtx );

    }

}

export default Vertex;
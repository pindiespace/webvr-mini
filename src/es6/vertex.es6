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
    constructor ( x = 0, y = 0, z = 0, u = 0, v = 0, vtx ) {

        //console.log("x:" + x + " y:" + y + " z:" + z)

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        // Save the parent array with all vertices.

        this.vtx = vtx;

        // Hash

        this.edges = [];

        this.tris = [];

        this.quads = [];

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
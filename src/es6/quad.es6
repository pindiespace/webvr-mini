/** 
 * A face (typically a triangle) in a Vertex mesh
 */
import Vertex from './vertex';
import Tri from './tri';

class Quad {

    constructor ( i1, i2, i3, i4, vtx, ccw = true ) {

        // Reading order: i1, i2, i3, i1, i3, i4 for counter-clockwise.

        this.i1 = i1;

        this.i2 = i2;

        this.i3 = i3;

        this.i4 = i4;

        this.v1 = vtx[ i1 ];

        this.v2 = vtx[ i2 ];

        this.v3 = vtx[ i3 ];

        this.v4 = vtx[ i4 ];

        // NOTE: THIS IS WRONG. LOOK UP TRIS IN TRI ARRAY

        this.t1 = new Tri( i1, i2, i3, vtx );

        this.t2 = new Tri( i1, i2, i4, vtx );

        this.ccw = ccw; // by default, counterclockwise, reverse if we go clockwise.

    }

    hasVertex ( otherVertex ) {

    }

    hasEdge ( otherEdge, sameWind = false ) {

    }

    hasTri ( otherTri, sameWind = false ) {

    }

    /** 
     * Determine if two quads have the same vertices.
     */
    isEqual( other, sameWind ) {


    }

    /** 
     * Returns a new Vertex, the averaged point (centroid) for a triangle = Face
     * @returns {Vertex} the averaged, or centroid point of the 3 points in this Face.
     */
    midPoint () {

        return this.v1.clone().average( this.v2 ).average( this.v3 ).average( this.v4 );

    }

    /** 
     * Reverses the order of this Face between clockwise or counter-clockwise (default) 
     * winding.
     * @returns {Boolean} the winding, true = counter-clockwise, false = clockwise.
     */
    flip () {

        let p = this.v1;

        this.v3 = this.v1;

        this.v1 = p;

        if ( this.ccw === true ) this.ccw = false; else this.ccw = true;

        return this.ccw;
    }

 }

 export default Quad;
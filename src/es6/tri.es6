/** 
 * A face (typically a triangle) in a Vertex mesh
 */
import Vertex from './vertex';
import Edge from './edge';

class Tri {

    constructor ( i1, i2, i3, vtx, ccw = true ) {

        // Reading order i1, i2, i3 for counter-clockwise

        this.i1 = i1;

        this.i2 = i2;

        this.i3 = i3;

        // Store Vertex

        this.v1 = vtx[ i1 ];

        this.v2 = vtx[ i2 ];

        this.v3 = vtx[ i3 ];

        // Store Edges


        // NOTE: Edges are implicity defined as v1-v2, v2-v3, v3-v1

        this.ccw = ccw; // by default, counterclockwise, reverse if we go clockwise.

        // Store previous and next triangle

        this.prev = null;

        this.next = null;

        this.ccw = ccw;

    }

    valid () {

        if ( this.v1 && this.v2 && this.v3 ) {

            return true;

        }

        return false;

    }

    hasVertex ( otherVertex ) {

        if( this.v1 === otherVertex || this.v2 === otherVertex || 
            this.v3 === otherVertex ) {

            return true;

        }

        return false;

    }

    hasEdge ( otherEdge, sameWind = false ) {


    }

    /** 
     * Determine if two Tris have the same vertices.
     */
    isEqual ( other, sameWind = false ) {

        if ( this.v1 === other.v1 && this.v2 === other.v2 && this.v3 === other.v3 ) {

            return true;

        } else if ( sameWind === false ) {



        }

    }

    /** 
     * Returns a new Vertex, the averaged point (centroid) for a triangle = Face
     * @returns {Vertex} the averaged, or centroid point of the 3 points in this Face.
     */
    midPoint () {

        return this.v1.clone().average( this.v2 ).average( this.v3 );

    }

    /** 
     * Reverses the order of this Face between clockwise or counter-clockwise (default) 
     * winding.
     * @returns {Boolean} the winding, true = counter-clockwise, false = clockwise.
     */
    flip () {

        let p = this.v3;

        this.v3 = this.v1;

        this.v1 = p;

        if ( this.ccw === true ) this.ccw = false; else this.ccw = true;

        return this.ccw;
    }

 }

 export default Tri;
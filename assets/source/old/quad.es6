/** 
 * A face (typically a triangle) in a Vertex mesh
 */
import Vertex from './vertex';
import Tri from './tri';

class Quad {

    /** 
     * @constructor
     * @param {Number} i1 the first index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Number} i2 the second index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Number} i3 the third index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Number} i4 the fourth index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Array[Vertex]} vertexArr the parent Vertex array.
     */
    constructor ( i1, i2, i3, i4, vertexArr ) {

        // Reading order: i1-i2,-i3, i1-i3-i4, counter-clockwise.

        this.i1 = i1;

        this.i2 = i2;

        this.i3 = i3;

        this.i4 = i4;

        this.v1 = vertexArr[ i1 ];

        this.v2 = vertexArr[ i2 ];

        this.v3 = vertexArr[ i3 ];

        this.v4 = vertexArr[ i4 ];

        // NOTE: THIS IS WRONG. LOOK UP TRIS IN TRI ARRAY

        this.t1 = new Tri( i1, i2, i3, vertexArr );

        this.t2 = new Tri( i1, i2, i4, vertexArr );

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
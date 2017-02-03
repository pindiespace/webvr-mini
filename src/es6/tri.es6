/** 
 * A face (typically a triangle) in a Vertex mesh.

 */
import Vertex from './vertex';
import Edge from './edge';

class Tri {

    /** 
     * @constructor
     * @param {Number} i1 the first index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Number} i2 the second index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Number} i3 the third index for a Vertex (counter-clockwise) in the Vertex array.
     * @param {Array[Vertex]} vertexArr the parent Vertex array.
     */
    constructor ( i1, i2, i3, vertexArr ) {

        // Reading order i1, i2, i3, counter-clockwise

        this.i1 = i1;

        this.i2 = i2;

        this.i3 = i3;

        // Store Vertex

        this.v1 = vertexArr[ i1 ];

        this.v2 = vertexArr[ i2 ];

        this.v3 = vertexArr[ i3 ];

        // Let the Vertex objects know they are part of this Tri.

        this.v1.setTri( this );

        this.v2.setTri( this );

        this.v3.setTri( this );

        // Store Edges

        this.fEdges = [];

        this.oEdges = [];

        // NOTE: Edges are implicity defined as v1-v2, v2-v3, v3-v1

        this.idx = i1 + '-' + i2 + '-' + i3;

        // Store previous and next triangle

        this.prev = null;

        this.next = null;

    }

    valid () {

        if ( this.v1 && this.v2 && this.v3 ) {

            return true;

        }

        return false;

    }

    /** 
     * check if this Tri is in a supplied array.
     * @param {Array[Tri]} triArr an array of Tri objects.
     * @returns {Boolean} if we are in the supplied array, return true, else false.
     */
    inList ( triArr ) {

        if ( triArr.indexOf( this ) === -1 ) {

            return false;

        }

        return true;

    }

    /** 
     * Check if this tri contains a specific Vertex
     */
    hasVertex ( otherVertex ) {

        if( this.v1 === otherVertex || this.v2 === otherVertex || 
            this.v3 === otherVertex ) {

            return true;

        }

        return false;

    }

    /**
     * Check if this tri contains a specific Edge
     */
    hasEdge ( otherEdge, direction = 0 ) {

        switch ( direction ) {

            case 0:

                if ( this.fEdges.indexOf( otherEdge ) === -1 ) {

                    return false;

                }

                break;

            case 1:

                if ( this.oEdges.indexOf( otherEdge ) === -1 ) {

                    return false;

                }

                break;

            default:

                break;

        }

        return true;

    }

    /** 
     * Set the Edges this Tri is associated with.
     * @param {Edge} edge a 'parent' Edge containing this Vertex
     * @param {Number} direction the position in the Edge (assuming we always 
     * move counterclockwise).
     */
    setEdge ( edge, direction = 0 ) {

        switch ( direction ) {

            case 0:

                if ( this.fEdges.indexOf( edge ) === -1 ) {

                    this.fEdges.push( edge );  // counter-clockwise

                    return true;

                }

                break;

            case 1:

                if ( this.oEdges.indexOf( edge ) === -1 ) {

                    this.oEdges.push( edge );  // clockwise

                    return true;

                }

                break;

            default:

                console.error( 'error when setting Edge in Vertex, ' + direction );

                break;

        }

        return false;

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
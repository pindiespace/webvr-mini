/**
 * Edge of a face in a mesh.
 */
import Vertex from './vertex';

class Edge {

    constructor ( i1, i2, vtx, ccw = true ) {

        this.i1 = i1;

        this.i2 = i2;

        this.v1 = vtx[ i1 ];

        this.v2 = vtx[ i2 ];

        if ( ! this.valid() ) {

            console.error( 'Edge error: i1=' + i1 + ' i2:' + i2 + ' v1:' + v1 + ' v2:' + v2 );

        }

        // Let the vertices know they START this edge

        this.v1.setEdge( this, 0 );

        // NOTE: setting the second point = 12 connections (degenerate)
        // NOTE: max of 6 connections, sometimes less.
        this.v2.setEdge( this, 1 );

        // Save a reference to the overall Vertex array

        this.vtx = vtx;

        // Previous and next Edges

        this.prev = null;

        this.next = null;

        this.ccw = ccw; // by default, counterclockwise, reverse if we go clockwise.

        this.idx = i1 + '-' + i2;

    }

    valid () {

        if ( this.v1 && this.v2 ) {

            return true;

        }

        return false;
    }

    /** 
     * Determine if a Vertex is part of this Edge.
     */
    hasVertex ( otherVertex ) {

        if( this.v1 === otherVertex.v1 || this.v2 === otherVertex.v2 ) {

            return true;

        }

        return false;

    }

    /** 
     * Determine if two Edges share the same Coords (object reference, not value).
     * @param {Edge} other another Edge object
     * @param {Boolen} sameWind if set to true, objects have to have the same Coords 
     * in the same order. Otherwise, a--b is equivalent to b--a, which is common in 
     * indices referencing a set of Vertex objects.
     * @returns {Boolean} if shared Coords, return True, else false
     */
    isEqual ( other, sameWind = false ) {

        // Equal, and in same order 
        if( this.v1 === other.v1 && this.v2 === other.v2 ) {

            return true;

        } else if ( sameWind === false ) {

            if( this.hasVertex( other.v1 ) && this.hasVertex( other.v2 ) ) {

                return true;

            }

        }

        return false;

    }

    /**
     * Compute midpoint of the two Vertex objects
     * @returns{Vertex} this midpoint for position AND texture coordiantes.
     */
    midPoint () {

        // compute average texture coordinate

        return this.v1.clone().average( this.v2 );

    }

    /** 
     * Reverses the order of this Face between clockwise or counter-clockwise (default) 
     * winding.
     * @returns {Boolean} the winding, true = counter-clockwise, false = clockwise.
     */
    flip () {

        let p = this.a;

        this.a = this.b;

        this.b = p;

        if ( this.ccw === true ) this.ccw = false; else this.ccw = true;

    }

}

export default Edge;
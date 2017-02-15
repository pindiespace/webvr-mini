/**
 * Edge of a face in a mesh.
 */
import Vertex from './vertex';

class Edge {

    /** 
     * @constructor
     * @param {Number} i1 the first Vertex (counter-clockwise) in the Edge.
     * @param {Number} i2 the second Vertex (counter-clockwise) in the Edge.
     * @param {Array[Vertex]} vertexArr the parent Vertex array.
     */
    constructor ( i1, i2, vertexArr ) {

        this.i1 = i1;

        this.i2 = i2;

        this.v1 = vertexArr[ i1 ];  // first Vertex encountered, moving clockwise

        this.v2 = vertexArr[ i2 ];  // second Vertex encountered, moving clockwise

        if ( ! this.valid() ) {

            console.error( 'Edge error: i1=' + i1 + ' i2:' + i2 + ' v1:' + this.v1 + ' v2:' + this.v2 );

        }

        // Define BEFORE setEdge, since we may need the .clone() method

       // Save a reference to the overall Vertex array

        this.vertexArr = vertexArr;

        // Let the vertices know they START this edge (forward, clockwise)

        this.v1.setEdge( this, 0 );

        // NOTE: setting the second point = 12 connections (degenerate)
        // NOTE: max of 6 connections, sometimes less.
        // NOTE: backward, counter-clockwise

        this.v2.setEdge( this, 1 );

        // Previous and next Edges

        this.prev = null;

        this.next = null;

        this.idx = i1 + '-' + i2;

    }

    valid () {

        if ( this.v1 && this.v2 ) {

            return true;

        }

        return false;
    }

    /** 
     * check if this Edge is in a supplied array.
     * @param {Array[Edge]} edgeArr an array of Vertex objects.
     * @returns {Boolean} if we are in the supplied array, return true, else false.
     */
    inList ( edgeArr ) {

        if ( edgeArr.indexOf( this ) === -1 ) {

            return false;

        }

        return true;

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
     * Given a test Vertex, return the other Vertex of the Edge.
     * @param {Vertex} vtx the test Vertex.
     * @returns {Vertex|false} if we find the supplied Vertex, return the 
     * other Vertex, otherwise return false.
     */
    getOtherVertex( vtx ) {

        if ( this.v1 === vtx ) return this.v2;

        if ( this.v2 === vtx ) return this.v1;

        return false;

    }

    /** 
     * Given another Edge, find if a common Vertex is shared, either 
     * first (forward) or second (backward) winding.
     * @param {Edge} other another Edge
     * @returns {Vertex|false} if a common Vertex is found, return it, else false
     */
    commonVertex( other ) {

        if ( other.v1 === this.v1 ) return this.v1;

        if ( other.v2 === this.v1 ) return this.v1;

        if ( other.v2 === this.v2 ) return this.v2;

        if ( other.v1 === this.v2 ) return this.v2;

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
     * Compute the length of the edge
     * @returns {Number} the Edge length
     */
    length () {

        return this.v1.coords.distance( this.v2.coords );

    }

    /**
     * Compute midpoint of the two Vertex objects creating the Edge.
     * @returns {Vertex} this midpoint for position AND texture coordiantes.
     */
    midPoint () {

        return this.v1.clone().average( this.v2 );

    }

    /** 
     * Average the position of an Edge. Both Vertex objects
     * are averaged.
     * @param {Edge} other the Edge to average.
     * @returns {Edge} a new Edge, which is the average of this and the other Edge.
     */
    average ( other ) {

        let e = this.clone();

        e.v1.average( other.v1 );

        e.v2.average( other.v2 );

        return e;

    }

/** 
 * Do an in-place flipping of the Vertex Objects
 */
    flip () {

        let v = this.v2;

        let i = this.i2;

        this.v2 = this.v1;

        this.i2 = this.i1;

        this.v1 = v;

        this.i1 = i;

    }

    /** 
     * Clone the Edge NOTE: 
     * Cloning operation DIFFERENT than Vertex.
     * @param {Number} i1 the index of the first Vertex.
     * @param {Number} i2 the index of the second Vertex.
     * @param {Array[Vertex]} array of all Vertex objects.
     * @returns {Edge} a new copy of this Edge.
     */
    clone () {

        return new Edge( this.i1, this.i2, this.vertexArr );

    }

}

export default Edge;
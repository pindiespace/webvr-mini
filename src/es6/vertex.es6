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
     * @param {Array[Vertex]} vertexArr the parent Vertex array
     * @param {Number} i1 the name/index of this Vertex
     */
    constructor ( x = 0, y = 0, z = 0, u = 0, v = 0, vertexArr, i1 ) {

        //console.log("x:" + x + " y:" + y + " z:" + z)

        this.MAX_EDGES = 6;

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        // Save the parent array with all vertices.

        this.vertexArr = vertexArr;

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

        this.averageDistance = 0; // average distance to next Vertex

        if ( ! this.valid() ) {

            console.error( 'Vertex error: x=' + x + ' y:' + y + ' z:' + z + ' idx:' + i1 );

        }

    }

    valid () {

        if ( this.coords.isValid() ) {

            return true;

        }

        return false;
    }

    /** 
     * check if this Vertex is in a supplied array.
     * @param {Array[Vertex]} vertexArr an array of Vertex objects.
     * @returns {Boolean} if we are in the supplied array, return true, else false.
     */
    inList ( vertexArr ) {

        if ( vertexArr.indexOf( this ) === -1 ) {

            return false;
        }

        return true;

    }

    /**
     * Check if an Edge is already in our Edge list.
     * @param {Edge} edge the Edge to test.
     * @param {Number} direction if 0, use this.fEdges, else use this.oEdges
     * @retruns {Boolean} if edge is in the array return true, else false.
     */
    inEdgeList ( edge, direction = 0 ) {

        switch ( direction ) {

            case 0:

                if ( this.fEdges.indexOf( edge ) !== -1 ) {

                    return true; 

                }

                break;


            case 1:

                if ( this.oEdges.indexOf( edge ) ) {

                    return true;

                }

                break;

            default:

                break;

        }

        return false;

    }

    /** 
     * Given a supplied Vertex, determined if we are attached to it 
     * by our Edge array.
     * @param {Vertex} vtx the Vertex to test
     * @param {Number}
     * @returns 
     */
    isAttachedByEdge ( vtx, direction = 0 ) {

        switch ( direction ) {

            case 0:

                for ( let i = 0; i < this.fEdges.length; i++ ) {


                    if ( vtx === this.fEdges[ i ].v2 ) {

                        //console.log( 'isAttachedByEdge:' + this.idx + ' already attached to:' + this.fEdges[ i ].v2.idx );

                        return true;

                    }

                }

                break;

            case 1:

                for ( let i = 0; i < this.oEdges.length; i++ ) {

                    if( vtx === this.oEdges[ i ].v1 ) {

                        return true;

                    }

                }

                break;

            default:

                break;

        }

        //console.log( 'isAttachedByEdge:' + this.idx + ' NOT attached to new Edge:' + vtx.idx );

        return false;

    }

    /** 
     * average length of the Edges we are connected to...
     */
    getAverageDistance () {

        let d = 0;

        let len = this.fEdges.length;

        // We only do the forward, since reverse are redundant.

        for ( let i = 0; i < len; i++ ) {

            d += this.fEdges[ i ].length();

        }

        this.averageDistance = d / len;

    }

    /** 
     * Given an array of Vertex objects, return the closest Vertex 
     * which is NOT already in our attached Edge array.
     * @param {Array[Vertex]} vertexArray the list of Vertex objects to scan
     * @param {Array[Vertex]} ignoreArr the array with neighbors we ignore, e.g. because 
     * we have already found them in the past.
     * @param {Number} direction if 0, search vtx.fEdges, else search vtx.oEdges
     */
    getNeighbor( vertexArr, ignoreArr = [], direction = 0 ) {

        let dist = 100000; // huge distance to start

        let closest = null;

        for ( let i = 0; i < vertexArr.length; i++ ) {

            // Check our Edges and make sure we aren't already attached to the text Vertex via an Edge in our list.

            let vtx = vertexArr[ i ];

            if ( this === vtx || this.isAttachedByEdge( vtx, direction ) ) {

                continue;

            } else if ( ignoreArr.indexOf( vtx ) === -1 && this !== vtx ) {

                let d = this.coords.distance( vtx.coords );

                if(  d < dist ) {

                    closest = vtx;

                    dist = d;

                }

            }

        }

        return closest;

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
     * Set Edges this Vertex is associated, with, 
     * returning any duplicates
     */
    setEdges ( edgeArr, direction = 0 ) {

        let duplicates = [];

        for ( let i = 0; i < edgeArr.length; i++ ) {

            let duplicate = this.setEdge( edgeArr[ i ], direction );

            if ( duplicate ) {

                duplicates.push( duplicate );

            }

        }

        return duplicates;

    }

    /** 
     * Set the Edges this Vertex is associated with.
     * @param {Edge} edge a 'parent' Edge containing this Vertex
     * @param {Number} the Edges array to use (assuming we always 
     * move counterclockwise). We are finding Edges where the 
     * first Vertex nearly matches our own position.
     *  - direction = 0; push to fEdges
     *  - direction = 1; push to oEdges
     */
    setEdge ( edge, direction = 0 ) {

        switch ( direction ) {

            case 0:

                if ( this.fEdges.length >= this.MAX_EDGES ) {

                   // Only need MAX_EDGES for subdivision, but will use more if present.

                   // TODO: use this.getAverageDistance() to see if we should include a Vertex.
                   // TODO: needed for "open" shapes.

                   return edge; // add to ignored list

                }

                if ( edge.inList( this.fEdges ) ) {

                    return edge; // Edge already in list

                } else {

                    this.fEdges.push( edge );

                    return false;
                }

                break;

            case 1:

                if ( this.oEdges.length >= this.MAX_EDGES ) {

                    return edge; // Add to ignored list

                }

                if ( edge.inList( this.oEdges ) ) {

                    return edge; // Edge already in list

                } else {

                    this.oEdges.push( edge );

                    return false;

                }

                break;

            default:

                console.error( 'Vertex.setEdge: unrecognized Edge Array ' + direction );

                return false;

                break;

        }

        return true;

    }

    /** 
     * Set the Tris this Vertex is associated with.
     * @param {Tri} tri a 'parent' Triangle containing this Vertex
     * @param {Number} direction the position in the Triangle (assuming we always 
     * move counterclockwise).
     */
    setTri ( tri ) {

        if ( ! tri.inList( this.tris ) ) {

            // TODO: note position in triangle - 1st, second, third

            this.tris.push( tri );

        }

    }

    /** 
     * Return a new Vertex which have averaged position and 
     * averaged texture coordinate
     * @param {Vertex} other the Vertex to average with
     * @param {Number} weighting the weighting of the coordinate position, 
     * somewhere between:
     * - 0: average returned is our position
     * - 0.5: average returned is at in the middle of this Vertex and the other Vertex
     * - 1.0: average returned is the other Vertex
     * @returns {Vertex} a new Vertex in an averaged position.
     */
    average ( other, weighting = 0.5 ) {

        let v = this.clone();

        v.coords = v.coords.average( other.coords, weighting );

        v.texCoords =  {

            u: weighting * this.texCoords.u + other.texCoords.u,

            v: weighting * this.texCoords.v + other.texCoords.v

        };

        return v;

    }

    /**
     * Return a new copy of this Vertex
     * @returns {Vertex} a copy of the current vertex
     */
    clone () {

        return new Vertex( this.x, this.y, this.z, this.u, this.v, this.vertexArr );

    }

}

export default Vertex;
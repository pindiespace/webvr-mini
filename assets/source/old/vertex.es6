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
     * @param {Boolean} isEven if true, is an even vertex in Loop algorithm, otherwise odd.
     */
    constructor ( x = 0, y = 0, z = 0, u = 0, v = 0, vertexArr, i1, isEven = true ) {

        //console.log("x:" + x + " y:" + y + " z:" + z)

        this.MAX_EDGES = 6;

        this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        // Save the parent array with all vertices.

        this.vertexArr = vertexArr;

        // Previous and next Vertex in index array, along with weighting for each.

        this.prev = null;

        this.prevWeight = 0;

        this.next = null;

        this.nextWeight = 0;

        this.control = [];

        this.controlWeight = 0;

        // OLD
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

        // Assign even (original Vertex) or midpoint in subdivide (odd Vertex)

        this.isEven = isEven;  // Standard Vertex

        this.isOdd = ! isEven; // A Vertex just created as a midpoint in a subdivision

        this.isTemporary = false; // a Vertex created to help smooth mesh edges only

        this.weight = 0; // how much to weight this Vertex in smoothing another Vertex

        this.averageDistance = 0; // average distance to next Vertex

        ////////TEMP DEBUG
        this.swapped = 0;

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
     * Add a Vertex point that can be used to adjust this Vertex position during 
     * a subdivision. After subdivision, edgeVertices = controlVertices. But 
     * when a midpoint is created, they differ.
     * NOTE: when a .prev or .next Vertex is added, they are added to 
     * the .control Vertex list if they are new.
     * @param {Vertex} vtx the Vertex to add.
     * @returns {Boolean} if added, return true, else false.
     */
    addControlVertex( vtx ) {

        let control = this.control;

        if ( vtx !== this && control.indexOf( vtx ) === -1 ) {

            control.push( vtx );

            // Adjust weighting based on number of control elements.

            this.controlWeight = this.swapWeighting( control.length );

            return true;

        }

        return false;
    }

    /** 
     * Add a Vertex which is previous (in drawing order) to this Vertex.
     * Updates .prev and .control Vertex arrays.
     * @param {Vertex} vtx the Vertex to add.
     * @param {Boolean} if added, return true, else false.
     */
    addPrevVertex ( vtx, weight = 0 ) {

        if ( vtx !== this ) {

            this.prev = vtx;

            // Even only! Push a variable weight to prev and next, either 3/8 or 1/8

            this.prevWeight = weight;

            if ( this.isEven ) {

                this.addControlVertex( vtx );

            }

            return true;

        }

        return false;

    }

    /** 
     * Add a Vertex which is next (in drawing order) to this Vertex
     * Updates .next and .control Vertex arrays.
     * @param {Vertex} vtx the Vertex to add.
     */
    addNextVertex ( vtx, weight = 0 ) {

        if ( vtx !== this ) {

            this.next = vtx;

            // Even only! Push a variable weight to prev and next, either 3/8 or 1/8

            this.nextWeight = weight;

            if ( this.isEven ) {

                this.addControlVertex( vtx );

            }

            return true;

        }

        return false;

    }

    /** 
     * Given the number of surround Vertices, compute 
     * their weight.
     * @param {Number} n the number of surround Vertices.
     * @returns {Number} weighting factor, based on number of surround Vertices. 
     * Numbers hard-coded accd. to following formula (i = number of beta valency):
     * weighting = (1.0 / i) * (5.0 / 8.0 - Math.pow( 3.0 / 8.0 + (1.0 / 4.0) * Math.cos( 2.0 * Math.PI / i ), 2.0));
     */
    swapWeighting ( n ) {

        switch( n ) {
            case 0:
                return 0;
                break;
            case 1:
                return 0.0625; // NOT IN CALCS
                break;
            case 2:
                return 0.125; // 1/8, not in calcs
                break;
            case 3:
                return 0.1875; // 3/16
                break;
            case 4:
                return 0.12109375;
                break;
            case 5:
                return 0.08409322;
                break;
            case 6:
                return 0.0625;
                break;
            case 7:
                return 0.49024920;
                break;
            default:
                return 3 / ( 8 * n );
        }

    }

    /** 
     * Given an old and new Vertex, swap them in the .prev list.
     * DOES NOT change .control Vertex list
     * @param {Vertex} vtxOld the Vertex to find.
     * @param {Vertex} vtxNew the Vertex to swap.
     * @param {Boolean} if swapped, return true, else false.
     */
    swapPrevVertex( vtxOld, vtxNew ) {

        this.prev = vtxNew;

        this.addControlVertex ( vtxNew );

    }

    /**
     * Given an old and new Vertex, swap them in the .next list.
     * DOES NOT change .control Vertex list.
     * @param {Vertex} vtxOld the Vertex to find.
     * @param {Vertex} vtxNew the Vertex to swap.
     * @param {Boolean} if swapped, return true, else false.
     */
    swapNextVertex( vtxOld, vtxNew ) {

        this.next = vtxNew;

        this.addControlVertex( vtxNew );

    }

    /** 
     * given two Vertex objects, get a common Vertex they both 
     * are linked to in their Control Vertex array.
     * @param {Vertex} vtx an additional Vertex forming an edge.
     * @returns {Array} list of common vertices connected to this and the other vtx
     */
    getCommonControlVertex ( vtx ) {

        let common = [];


        for ( let i = 0; i < this.control.length; i++ ) {

            for ( let j = 0; j < vtx.control.length; j++ ) {

                if ( this.control [ i ] === vtx.control[ j ] ) {

                    // Return the added Control Vertex

                    let v = this.control[ i ];

                    if ( v !== this && v !== vtx && common.indexOf( v ) === -1 ) {

                        common.push( this.control[ i ] );

                    }

                }

            }

        }

        return common;

    }

    /** 
     * Adjust Vertex position based on 'odd' surround.
     */
    adjustOdd () {

        let prev = this.prev;

        let next = this.next;

        let control = this.control;

        let p = this.prevWeight;

        let n = this.nextWeight;

        let c0 = control[ 0 ];

        let c1 = control[ 1 ];

        let cw0 = this.controlWeight[ 0 ];

        let cw1 = this.controlWeight[ 1 ];

        this.coords.x += (
            prev.coords.x * p + 
            next.coords.x * p + 
            c0.coords.x * cw0 + 
            c1.coords.x * cw1 
            );

        this.coords.y /= 2;

        this.coords.y += (
            prev.coords.y * p + 
            next.coords.y * n + 
            c0.coords.y * cw0 + 
            c1.coords.y * cw1 
            );

        this.coords.y /= 2;

        this.coords.z += (
            prev.coords.z * p + 
            next.coords.z * n + 
            c0.coords.z * cw0 + 
            c1.coords.z * cw1 
            );

        this.coords.z /= 2;


    }

    /** 
     * Adjust Vertex position based on 'even' surround.
     */
    adjustEven () {

        let control = this.control;

        let controlWeight = this.controlWeight;

        let sWeight = 1  + ( controlWeight * control.length );

        for ( let i = 0; i < control.length; i++ ) {

            let vtx = control[ i ];

            this.coords.x += ( vtx.coords.x * controlWeight );
            this.coords.y += ( vtx.coords.y * controlWeight );
            this.coords.z += ( vtx.coords.z * controlWeight );

        }

        this.coords /= sWeight;

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
     * Given another Vertex, common Vertices they  
     * share via an Edge.
     */
    getCommonVertex( other ) {

        let vtxArr = [];

        let commonArr = [];

        // Get the Vertices in the Edges that don't match us (this) or other

        for ( let i = 0; i < this.fEdges.length; i++ ) {

            let v = this.fEdges[ i ].getOtherVertex( this );

            if ( v  && v !== other ) {

                vtxArr.push( v );

            }

        }

        // We now have a list of Vertex objects connected by Edges to 
        // this Vertex. Find out if other shares any of these Vertices.

        for ( let i = 0; i < other.fEdges.length; i++ ) {

            let v = other.fEdges[ i ].getOtherVertex( other );

            if( v && vtxArr.indexOf( v ) !== -1 ) {

                commonArr.push( v );

            }

        }

        return commonArr;

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
     * Remove any Edge in our list which shares
     * the two supplied Vertex objects, and swap in a new Edge.
     * @param {Vertex} v1 the first Vertex.
     * @param {Vertex} v2 the second Vertex.
     * @returns {Boolean} of Edge found and removed, return true, else false.
     */
    swapEdge ( v1, v2, edge ) {

        let swapFlag = false;

        for ( let i = 0; i < this.fEdges.length; i++ ) {

            let edge = this.fEdges[ i ];

            if (edge.v1 === v1 && edge.v2 === v2 || 

                edge.v2 === v1 && edge.v1 === v2 ) {

                this.fEdges[ i ] = edge;

                swapFlag = true;

            }

        }

        for ( let i = 0; i < this.oEdges.length; i++ ) {

            let edge = this.oEdges[ i ];

            if ( edge.v1 === v1 && edge.v2 === v2 || 

                edge.v2 === v1 && edge.v1 === v2 ) {

                this.fEdges[ i ] = edge;

                swapFlag = true;

            }

        }

        return swapFlag;

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

    midPoint( other ) {

        return this.average( other );

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

        v.idx = this.idx + '-' + other.idx;

        let mw = 1 - weighting;

        v.coords = v.coords.midPoint( other.coords, weighting );

        v.texCoords =  {

            u: ( weighting * this.texCoords.u ) + ( mw * other.texCoords.u ),

            v: ( weighting * this.texCoords.v ) + ( mw * other.texCoords.v )

        };

        return v;

    }

    /**
     * Return a new Copy of this Vertex
     * @returns {Vertex} a copy of the current vertex
     */
    clone ( idx, isEven ) {

        let v = new Vertex( this.coords.x, this.coords.y, this.coords.z, this.texCoords.u, this.texCoords.v, this.vertexArr );

        if ( idx ) {

            v.idx = idx;

        }

        if ( isEven ) {

            v.isEven = isEven;

        }

        return v;

    }

}

export default Vertex;
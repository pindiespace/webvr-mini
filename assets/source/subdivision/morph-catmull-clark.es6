class Morph {

    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in morph class' );

        this.util = util;

        this.glMatrix = glMatrix;

        this.webgl = webgl;

        if ( this.init === true ) {

            // Do something.

        }

    }

    /** 
     * Given a triangle, compute if it is wound clockwise or counter-clockwise relative 
     * to the viewpoint. Needed since the morph routines sometimes reverse the 
     * winding order of individual polygons.
     * @param {Number} i1 first index of triangle Vertex.
     * @param {Number} i2 second index of triangle Vertex.
     * @param {Number} i3 third index of triangle Vertex.
     * @param {Array[Vertex]} vertices an array of vertices.
     * @param {Array[Number]} viewPointVec the viewpoint relative to the object.
     */
    computeWinding( i1, i2, i3, vtx, viewpointVec=[ 0, 0, -1000 ] ) {

        let vec3 = this.glMatrix.vec3;

        //let viewpointVec = [ 0, 0, -1000 ];

        window.verts = vtx;

        // Get the triangle vertices

        let v1 = vtx[ i1 ].pos;

        let v2 = vtx[ i2 ].pos;

        let v3 = vtx[ i3 ].pos;

        // Get the normal for the triangle

        let a = vec3.sub( [ 0, 0, 0 ], [ v1.x, v1.y, v1.z ], [ v2.x, v2.y, v2.z ] );

        let b = vec3.sub( [ 0, 0, 0 ], [ v1.x, v1.y, v1.z ], [ v3.x, v3.y, v3.z ] );

        let cross = vec3.cross( [ 0, 0, 0 ], a, b );

        let cosA =  vec3.dot( cross, viewpointVec ) / ( vec3.length( cross ) * vec3.length( viewpointVec ) );

        let angleA = Math.acos( cosA );

        // get the same value for the face normal

        // Get the (normalized) centroid = triangle face normal

        let center = v1.clone().add( v2 ).add( v3 ).divideScalar( 3 );

        let cosB = vec3.dot( [center.x, center.y, center.z ], viewpointVec ) / ( vec3.length( [ center.x, center.y, center.z ] ) * vec3.length( viewpointVec) );

        let angleB = Math.acos( cosB );

        /////////////console.log( 'cosA:' + cosA + ' cosB:' + cosB + ' ANGLEA:' + angleA + ' ANGLEB:' + angleB );

        if ( cosA >= 0 ) cosA = 1; else cosA = -1;
        if ( cosB >= 0 ) cosB = 1; else cosB = -1;

        console.log( cosA + ', ' + cosB )

        if ( cosA === cosB ) {

            return 1;

        } else {

            return -1;

        }

/*
        if ( cosA > 0 ) {

            return -1;  // facing away

        } else {

            return 1;  // facing forward

        };
*/


        /*
         polygon normal
        Vector a,b;
        a = v1 - v2;
        b = v1 - v3;
        return Cross(a,b);   
        */

        /*
        https://www.gamedev.net/topic/187478-q-howto-determine-whether-a-triangle-is-cw-or-ccw/
        First compute the vector perpendicular (senkrecht) to the polygon. 
        This can be done using the cross product (Kreuzprodukt oder Vektor-Produkt). 
        Then you can see if the polygon faces away or not by computing the angle between 
        this vector and the vector from the polygon to the viewpoint. If it''s less 
        than 90 degrees, the polygon is front-facing, else it''s back-facing.
         You can compute the cosine (Cosinus) of the angle by using the dot product (Skalarprodukt oder Inneres Produkt). 
        */

    }

    /**
     * Compute the midpoint between two vertices forming an edge.
     */ 
    computeMidPoint( vertices, index1, index2 ) {

        let vec3 = this.glMatrix.vec3;

        var v1 = vertices[ index1 ];

        var v2 = vertixes[ index2 ];

        // NOTE: divideByScalar equivalent uses vec3.scale( out, a, 1/b )

        return ( vec3.scale( [ 0, 0, 0 ], vec3.add( [ 0, 0, 0 ], v1, v2 ), 0.5 ) );

    }

    /** 
     * Given a mesh of vertice rendered as triangles, compute the quads and indexing. 
     * from the indices (path through triangles)
     * https://github.com/Erkaman/gl-quads-to-tris
     * https://github.com/Erkaman/gl-catmull-clark/blob/master/index.js   THIS ONE
     * https://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
     * https://vorg.github.io/pex/docs/pex-geom/Geometry.html
     * http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * NOTE: quads = "cells" = "face"
     * @param {Array} triIndices in the format [[1, 2, 3], [1,2,3]...]
     * @returns {Array} quad indices in the format [[1,2,3,4],[1,2,3,4]...]
     */
    computeQuadsFromTris ( triIndices ) {

        let util = this.util;

        let idx = triIndices;

        let quads = new Array( idx.length / 2 );

        let ct = 0;

        if ( ! util.canFlatten( idx ) ) {

            console.error( 'Morph.trisToQuads() error: flattened arrays not supported' );

            return null;

        }

        // Array of GL_TRIANGLES (0, 1, 2, 0, 2, 3) to quads.

        for ( let i = 0; i < idx.length; i+= 2 ) {

            quads[ ct++ ] = [

                idx[ i ][0],

                idx[ i ][1],

                idx[ i + 1 ][1],

                idx[ i + 1 ][2]

            ];

        }

        return quads;

    }

    /** 
     * given a mesh of quads, compute the triangles and indexing.
     * @param {Array} quadIndices a quad index array in the format [[1,2,3,4],[1,2,3,4],...]
     * @returns {Array} a triangle index array in the format [[1, 2, 3], [1,2,3]...]
     */
    computeTrisFromQuads( quadIndices, vtx ) {

        // TODO: STRUCTURE OF VTX, what to pass to computeWinding 

        let util = this.util;

        let tris = new Array( quadIndices.length * 2 );

        let ct = 0, sign1 = 1, sign2 = 1;

        if( ! util.canFlatten( quadIndices ) ) {

            console.error( 'Morph.quadsToTris() error: flattened quad arrays not used in this program' );

            return null;

        }

        // Loop through vertices pointed to by the quadIndices

        for ( let i = 0; i < quadIndices.length; i++ ) {

            let quad = quadIndices[ i ];

            // TODO: WE MIGHT ALTERNATE QUADS!!!!!!

            // NOTE: THIS SHOWS THAT WINDING NEEDS TO BE REVERSED ON SOME OF THESE

            console.log("quadindices:" + quad); ///////////////////////////

            sign1 = this.computeWinding( quad[ 0 ], quad[ 2 ], quad[ 1 ], vtx );

            if ( sign1 > 0 ) {
                console.log("sign1 same")
                tris[ ct++ ] = [

                    quad[ 0 ], 
                    quad[ 2 ],
                    quad[ 1 ],

                ];

            } else {
                console.log("sign1 different")
                tris[ ct++ ] = [

                    quad[ 0 ], 
                    quad[ 1 ],
                    quad[ 2 ],

                ];

            }

/*
            tris[ ct++ ] = [

                quad[ 0 ], 
                quad[ 2 ],
                quad[ 1 ],

            ];
*/

            sign2 = this.computeWinding( quad[ 0 ], quad[ 2 ], quad[ 3 ], vtx );

            if ( sign2 > 0 ) {
                console.log("sign2 same")
                tris[ ct++ ] = [

                    quad[ 0 ],
                    quad[ 2 ],
                    quad[ 3 ]

                ];

            } else {
                console.log("sign2 differnt")
                tris[ ct++ ] = [

                    quad[ 0 ],
                    quad[ 3 ],
                    quad[ 2 ]

                ];

            }

/*
            tris[ ct++ ] = [

                quad[ 0 ],
                quad[ 2 ],
                quad[ 3 ]

            ];
*/

            console.log("sign1:" + sign1 + " sign2:" + sign2 )

        } // end of quad loop

        return tris;

    }


    /**
     * Given the Vertex object, flatten it to a simple array of coordinates.
     */
    flattenVertexList( vtx ) {

        let vertices = [];

        let normals = [];

        let texCoords = [];

        for ( let i = 0; i < vtx.length; i++ ) {

            let pos = vtx[ i ].pos;

            vertices.push( pos.x, pos.y, pos.z );

            texCoords.push( pos.u, pos.v );

            normals.push( pos.nx, pos.ny, pos.nz );

        }

        return {
            vertices: vertices,
            texCoords: texCoords,
            normals: normals
        };

    }


    /** 
     * Compute quad faces and edges, used for 
     * subdivision via
     * @param {Array} quads an array of quad indices for a Prim.
     * @param {Array} vtx an array of vertex3 objects.
     * @returns {Coord} the middle coordinate
     */
    computeQuadFaceEdges( quads, vtx ) {

        function Edge( minIndex, maxIndex ) {

            this.vertexIndices = [ minIndex, maxIndex ];

            this.faceIndices = [];

            Edge.prototype.midpoint = function( vtx ) {

                let vtx0 = vtx[ this.vertexIndices[ 0 ] ];

                let vtx1 = vtx[ this.vertexIndices[ 1 ] ];

                ////////console.log("vertexIndices: " + this.vertexIndices[ 0 ] + ', ' + this.vertexIndices[ 1 ] );

                var returnValue = vtx0.pos.clone().add( 

                    vtx1.pos ).divideScalar( 2 );

                return returnValue;

            };

        };

        function Face( quad ) {

            this.vertexIndices = quad;

            this.edgeIndices = [];

        }; // end of Face

        let faces = [];

        let edges = [];

        let minMaxLookup = [];

        let quadLen = quads[ 0 ].length ; // side of quads face, change for other face sizes.

        for ( let f = 0; f < quads.length; f++ ) {

            let quad = quads[ f ];

            //let quadLen = quad.length; 

            let face = new Face( quad );

            for ( let vi = 0; vi < quadLen; vi++ ) {

                // Get the working position in the quad.

                let viNext = ( vi + 1 ) % quadLen;

                // get current and next index for quad vertices.

                let vi0 = quad[ vi ];

                let vi1 = quad[ viNext ];

                let vertex = vtx[ vi0 ];

                let vertexNext = vtx[ vi1 ];

                vertex.faceIndices.push( f );

                // Get the larger and smaller of the two indices.

                let iMin = Math.min( vi0, vi1 );

                let iMax = Math.max( vi0, vi1 );

                // Initialize minMaxMLookup

                let maxLookup = minMaxLookup[ iMin ];

                ///////////console.log("maxlookup is a:" + maxLookup)

                if ( maxLookup === undefined ) {

                    maxLookup = [];

                    minMaxLookup[ iMin ] = maxLookup;

                }

                let edgeIndex = maxLookup[ iMax ];

                ///////////console.log("edgeIndex is a:" + edgeIndex )

                if (edgeIndex === undefined ) {

                    let edge = new Edge( iMin, iMax );

                    edgeIndex = edges.length;

                    edges.push( edge );

                }

                maxLookup[ iMax ] = edgeIndex;

                // hack
                // Is there away to avoid this indexOf call?

                if ( face.edgeIndices.indexOf( edgeIndex ) == -1 ) {

                    face.edgeIndices.push( edgeIndex );

                }
            }

            for ( let ei = 0; ei < face.edgeIndices.length; ei++ ) {

                let edgeIndex = face.edgeIndices[ ei ];

                let edge = edges[ edgeIndex ];

                edge.faceIndices.push( f );

                for ( let vi = 0; vi < edge.vertexIndices.length; vi++ ) {

                    let vi0 = edge.vertexIndices[ vi ];

                    let vertex = vtx[ vi0 ];

                    // hack
                    // Is there away to avoid this indexOf call?

                    if ( vertex.edgeIndices.indexOf( edgeIndex ) == -1 ) {

                        vertex.edgeIndices.push( edgeIndex );

                    }

                }

            }

            faces.push(face);

        }  // outer loop.

        return {
            faces : faces,
            edges: edges
        };

    }

    /** 
     * Subdivide a mesh
     * Comprehensive description.
     * @link http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * USE:
     * https://blog.nobel-joergensen.com/2010/12/25/procedural-generated-mesh-in-unity/
     * http://wiki.unity3d.com/index.php/MeshSubdivision
     * https://github.com/Erkaman/gl-catmull-clark/blob/master/index.js
     * Examples:
     * Subdivide algorithm
     * https://github.com/mikolalysenko/loop-subdivide
     * https://github.com/Erkaman/gl-catmull-clark
     * https://www.ibiblio.org/e-notes/Splines/models/loop.js
     * generalized catmull-clark subdivision algorithm
     * https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     * @link http://vorg.github.io/pex/docs/pex-geom/Geometry.html
     * @link http://answers.unity3d.com/questions/259127/does-anyone-have-any-code-to-subdivide-a-mesh-and.html
     * USE:
     * @link https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     */
    computeSubdivide ( vertices, indices, texCoords, normals ) {

        let util = this.util;

        let vec3 = this.glMatrix.vec3;

        let vtx, tris, tCoords, tNorms;


        function Coords( x, y, z, u = 0, v = 0, nx = 0, ny = 0, nz = 0 ) {

            this.x = x;

            this.y = y;

            this.z = z;

            this.u = u;

            this.v = v;

            this.nx = nx;

            this.ny = ny;

            this.nz = nz;

            Coords.prototype.flatten = function () {

                return [ this.x, this.y, this.z ];

            };

            Coords.prototype.add = function( other ) {

                this.x += other.x;

                this.y += other.y;

                this.z += other.z;

                // Texture coordinates are computed as an average

                this.u += other.u;

                this.u /= 2;

                this.v += other.v;

                this.v /= 2;

                // Normals have to be normalized

                this.nx += other.nx;

                this.ny += other.ny;

                this.nz += other.nz;

                let length = Math.sqrt( this.nx * this.nx + this.ny * this.ny + this.nz * this.nz );

                length = ( length === 0 ) ? 1.0 : length;

                this.nx /= length;

                this.ny /= length;

                this.nz /= length;

                return this;

            };

            Coords.prototype.subtract = function ( other ) {

                this.x -= other.x;

                this.y -= other.y;

                this.z -= other.z;

                // Texture coordinates are computed as an average.

                this.u += other.u;

                this.u /= 2;

                this.v += other.v;

                this.v /= 2;

                // Normals need to be recomputed.

                this.nx -= other.nx;

                this.ny -= other.ny;

                this.nz -= other.nz;

                let length = Math.sqrt( this.nx * this.nx + this.ny * this.ny + this.nz * this.nz );

                length = ( length === 0 ) ? 1.0 : length;

                this.nx /= length;

                this.ny /= length;

                this.nz /= length;

                return this;

            };

            Coords.prototype.clear = function () {

                this.x = this.y = this.z = 0;

                this.u = this.v = 0;

                this.nx = this.ny = this.nz = 0;

                return this;

            };

            Coords.prototype.clone = function () {

                return new Coords( this.x, this.y, this.z, this.u, this.v, this.nx, this.ny, this.nz );

            };

            Coords.prototype.multiplyScalar = function( scalar ) {

                this.x *= scalar;

                this.y *= scalar;

                this.z *= scalar;

                // Normals and texcoords unchanged by a multiply.

                return this;

            };

            Coords.prototype.divideScalar = function( scalar ) {

                this.x /= scalar;

                this.y /= scalar;

                this.z /= scalar;

                // normals and texCoords unchanged by a divide

                return this;

            };

            Coords.prototype.crossProduct = function( other ) {

                // Normals, texCoords aren't involved.

                return this.overwriteWithXYZ (
                    this.y * other.z - other.y * this.z,
                    other.x * this.z - this.x * other.z,
                    this.x * other.y - other.x * this.y
                );

            };

            Coords.prototype.dotProduct = function( other ) {

                return ( this.x * other.x + this.y * other.y + this.z * other.z );

            };

            Coords.prototype.magnitude = function() {

                return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

            };

            Coords.prototype.normalize = function () {

                return this.divideScalar( this.magnitude() );

            };

            Coords.prototype.overwriteWith = function ( other ) {

                this.x = other.x;

                this.y = other.y;

                this.z = other.z;

                this.u = other.u;

                this.v = other.v;

                this.nx = other.nx;

                this.ny = other.ny;

                this.nz = other.nz;

                return this;

            };

            Coords.prototype.overwriteWithXYZ = function ( x, y, z ) {

                this.x = x;

                this.y = y;

                this.z = z;

                return this;

            };

        }; // end of Coords

        // Adapt to our flattened vec3.

        function Vertex( vec, texCoord, normal ) {

            this.pos = new Coords( vec[ 0 ], vec[ 1 ], vec[ 2 ] );

            if ( texCoord ) {

                this.pos.u = texCoord[ 0 ];

                this.pos.v = texCoord[ 1 ];

            }

            if ( normal ) {

                this.pos.nx = normal[ 0 ];

                this.pos.ny = normal[ 1 ];

                this.pos.nz = normal[ 2 ];

            }

            this.edgeIndices = [];

            this.faceIndices = [];

        }; // end of Vertex

        Vertex.manyFromPositions = function( positions ) {

            var returnValues = [];
 
            for (var i = 0; i < positions.length; i++) {

                var position = positions[i];

                var vertex = new Vertex( 
                    [ position.x, position.y, position.z ], 
                    [ position.u, position.v ], 
                    [ position.nx, position.ny, position.nz ]
                ); ///CHANGED!!!!!!!!!

                returnValues.push( vertex );
            }

            return returnValues;

        }

        // handle both flattened and unflattened vertices.


        if ( ! util.canFlatten( indices ) ) {

            tris = util.unFlatten( indices, 3 );

        } else {

            tris = indices;

        }

        if ( ! util.canFlatten( texCoords ) ) {

            tCoords = util.unFlatten( texCoords, 2 );

        } else {

            tCoords = texCoords;

        }

        if ( ! util.canFlatten( normals ) ) {

            tNorms = util.unFlatten( normals, 3 );

        } else {

            tNorms = normals;

        }


        if ( ! util.canFlatten( vertices ) ) {

            let v = util.unFlatten( vertices, 3 );

            // Build Vertex object out of vec3.

            vtx = new Array( v.length );

            for ( let i = 0; i < v.length; i++ ) {

                // NOTE: this is our array, so it is OK

                vtx[ i ] = new Vertex( v[ i ], tCoords[ i ], tNorms[ i ] );

            }

        } else {

            vtx = vertices;

        }

        // requires unflattened indices, in triangles

        let quads = this.computeQuadsFromTris( tris );

        /////////////////////////////////////////////////////
        // TEST CUBE DATA
        // NOTE: we define Vertex differently from the original code.
/*
        vtx = [

                new Vertex( [-1, -1, -1], [ 0.0, 0.0 ], [-1, -1, -1] ),
                new Vertex( [ 1, -1, -1], [ 1.0, 0.0 ], [ 1, -1, -1] ),
                new Vertex( [ 1,  1, -1], [ 1.0, 1.0 ], [ 1,  1, -1] ),
                new Vertex( [-1,  1, -1], [ 0.0, 1.0 ], [-1,  1, -1] ),

                new Vertex( [-1, -1,  1], [ 0.0, 0.0 ], [-1, -1,  1] ),
                new Vertex( [ 1, -1,  1], [ 1.0, 0.0 ], [ 1, -1,  1] ),
                new Vertex( [ 1,  1,  1], [ 1.0, 1.0 ], [ 1,  1,  1] ),
                new Vertex( [-1,  1,  1], [ 0.0, 1.0 ], [-1,  1,  1] ),
        ];

        // Cube quads
        quads = [ [0,1,2,3], [0,1,5,4], [1,2,6,5], [2,3,7,6], [3,0,4,7], [4,5,6,7] ];

*/

        window.faces = faces;
        window.edges = edges;

        //let quads = quads;

        // Compute the Faces and Edges for each Quad.

        let faceEdges = this.computeQuadFaceEdges( quads, vtx );

        window.faceEdges = faceEdges;

        let faces = faceEdges.faces;
        let edges = faceEdges.edges;

        console.log("-------------FIRST UNIT TEST-------------------");
        window.vtx = vtx;
        window.faces = faces;
        window.edges = edges;

         // Run a unit test
         let faceTest = [{vertexIndices:[0,1,2,3],edgeIndices:[0,1,2,3]},{vertexIndices:[0,1,5,4],edgeIndices:[0,4,5,6]},{vertexIndices:[1,2,6,5],edgeIndices:[1,7,8,4]},{vertexIndices:[2,3,7,6],edgeIndices:[2,9,10,7]},{vertexIndices:[3,0,4,7],edgeIndices:[3,6,11,9]},{vertexIndices:[4,5,6,7],edgeIndices:[5,8,10,11]}];
         window.faceTest = faceTest;
         let ff = [], fft = [], ee = [], eet = [];

         for ( let i in faceTest ) {

            let ft = faceTest[i];
            let vit = ft.vertexIndices; ///////////////
            let eeit = ft.edgeIndices;

            let f = faces[i];
            let vi = f.vertexIndices;  /////////////////
            let eei = f.edgeIndices;

            // TEST
            for ( let j in vit ) {
                fft.push( vit[ j ] );
            }
            // OURS
            for ( let j in eeit ) {
                eet.push( eeit[ j ] );
            }
            // TEST
            for ( let j in vi ) {
                ff.push( vi[ j ] );
            }
            // OURS
            for ( let j in eei ) {
                ee.push( eei[ j ] );
            }

         }

         window.ff = ff;
         window.fft = fft;
         window.eet = eet;
         window.ee = ee;

         // NOW COMPARE Face VERTICES
         console.log( 'testing face vertices...');
         for ( let j in ff ) {
            if( ff[ j ] !== fft[ j ] ) {
                console.error('ERROR in face vertices at position:' + j );
            }
         }
         console.log( 'testing face indices...' );
         for (let j in ee ){
            if( ee[ j ] !== eet[ j ] ) {
                console.error('ERROR in face indices at position:' + j );
            }
         }

        console.log("-------------SECOND UNIT TEST-------------------");


        let edgeTest = [{vertexIndices:[0,1],faceIndices:[0,1]},{vertexIndices:[1,2],faceIndices:[0,2]},{vertexIndices:[2,3],faceIndices:[0,3]},{vertexIndices:[0,3],faceIndices:[0,4]},{vertexIndices:[1,5],faceIndices:[1,2]},{vertexIndices:[4,5],faceIndices:[1,5]},{vertexIndices:[0,4],faceIndices:[1,4]},{vertexIndices:[2,6],faceIndices:[2,3]},{vertexIndices:[5,6],faceIndices:[2,5]},{vertexIndices:[3,7],faceIndices:[3,4]},{vertexIndices:[6,7],faceIndices:[3,5]},{vertexIndices:[4,7],faceIndices:[4,5]}];

        let edgT = [], edg = [];
        // TEST EDGE ARRAY
        for ( let j in edgeTest ) {
            let edgTj = edgeTest[ j ];
            edgT.push( edgTj.vertexIndices[0], edgTj.vertexIndices[1], edgTj.faceIndices[0], edgTj.faceIndices[1]);
        }
        // OUR EDGE ARRAY
        for ( let j in edges ) {
            let edgj = edges[j];
            edg.push( edgj.vertexIndices[0], edgj.vertexIndices[1], edgj.faceIndices[0], edgj.faceIndices[1]);
        }
        window.edgT = edgT;
        window.edg = edg;
        // COMPARE EDGE ARRAYS
        for ( let j in edgT ) {
            if( edgT[j] !== edg[j] ) {
                console.error( 'Error in Edges at position:' + j );
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////
        // BEGIN SUBDIVIDE

        console.log("----------BEGIN SUBDIVIDE------------")

        var numberOfFacesOriginal = faces.length;
        var numberOfEdgesOriginal = edges.length;
        var numberOfVerticesOriginal = vtx.length;

        console.log("Number of faces original: " + numberOfFacesOriginal); ////////////////
        console.log("Number of edges original: " + numberOfEdgesOriginal);
        console.log("Number of vertices original:" + numberOfVerticesOriginal);

        var facePoints = [];
        var edgePoints = [];

        var faceTexCoords = [];
        var edgeTexCoords = [];

        var sumOfVertexPositions = new Coords();

        var averageOfVertexPositions = new Coords();

        // Loop through the original Faces, and create an average Vertex.

        for ( var f = 0; f < numberOfFacesOriginal; f++ ) {

            var face = faces[f];

            var numberOfVerticesInFace = face.vertexIndices.length;

            sumOfVertexPositions.clear();

            // Sum all Vertexes for each Face.

            for (var vi = 0; vi < numberOfVerticesInFace; vi++) {

                var vertexIndex = face.vertexIndices[ vi ];

                var vertexPos = vtx[ vertexIndex ].pos;

                sumOfVertexPositions.add( vertexPos );

            }

            // Compute a new averaged Coord for the Face.

            averageOfVertexPositions
            .overwriteWith( sumOfVertexPositions )
            .divideScalar( numberOfVerticesInFace );

            // Save to facePoints, key = position of original Face

            facePoints.push( averageOfVertexPositions.clone() );

        } // end for each face


        // Loop through the original Edges, and compute an averaged midpoint.

        for ( var e = 0; e < numberOfEdgesOriginal; e++ ) {

            var edge = edges[ e ];

            sumOfVertexPositions.clear();

            for ( var vi = 0; vi < edge.vertexIndices.length; vi++ ) {

                var vertexIndex = edge.vertexIndices[ vi ];

                var vertexPos = vtx[ vertexIndex ].pos;

                sumOfVertexPositions.add( vertexPos );

            }

            var numberOfFacesAdjacent = edge.faceIndices.length;

            for ( var fi = 0; fi < numberOfFacesAdjacent; fi++ ) {

                // Sum vertices from adjacent Face.

                var faceIndex = edge.faceIndices[ fi ];

                var facePoint = facePoints[ faceIndex ];

                sumOfVertexPositions.add( facePoint );

            }

            var numberOfVertices = edge.vertexIndices.length + numberOfFacesAdjacent;

            // Create new a Coords averaged with the Edge, plus adjacent Face.

            averageOfVertexPositions
            .overwriteWith( sumOfVertexPositions )
            .divideScalar( numberOfVertices );

            // Save to edgePoints, key = position of original Edge.

            edgePoints.push(averageOfVertexPositions.clone());

        } // end for each Edge


        var edgesFromFaceToEdgePoints = [];

        // Loop through our faces, and add in the new Coords.

        for ( var f = 0; f < numberOfFacesOriginal; f++ ) {

            var face = faces[ f ];

            // Get the Face Coord.

            var facePoint = facePoints[ f ];

            var numberOfEdgesInFace = face.edgeIndices.length;

            for (var ei = 0; ei < numberOfEdgesInFace; ei++) {

                // Get the Edge Coords.

                var edgeIndex = face.edgeIndices[ei];

                var edgePoint = edgePoints[edgeIndex];

                // compute the new index, and wrap in Array.

                var edgeFromFacePointToEdgePoint = [
                    numberOfVerticesOriginal 
                        + numberOfEdgesOriginal
                        + f,
                    numberOfVerticesOriginal
                        + edgeIndex
                ];

                // save the new positions in the array.

                edgesFromFaceToEdgePoints.push( edgeFromFacePointToEdgePoint );

            }

        } // end for each face

        // Re-write the new array list

        var edgesFromVerticesToEdgePoints = [];

        var verticesNew = [];

        ///////////////////////////////////////////////////////////////////////////////////////
        for (var v = 0; v < vtx.length; v++) {

            var vertex = vtx[ v ];

            var vertexPos = vertex.pos;

            // Are these always the same?

            var numberOfFacesAdjacent = vertex.faceIndices.length;

            var numberOfEdgesAdjacent = vertex.edgeIndices.length;

            sumOfVertexPositions.clear();

            // Sum the Face Coords for the current vertex, and average.

            for ( var fi = 0; fi < numberOfFacesAdjacent; fi++ ) {

                var faceIndex = vertex.faceIndices[ fi ];

                var facePoint = facePoints[ faceIndex ];

                sumOfVertexPositions.add( facePoint );

            }

            // Get the average Coord position (centroid).

            var averageOfFacePointsAdjacent = sumOfVertexPositions.clone().divideScalar( numberOfFacesAdjacent );

            sumOfVertexPositions.clear();

            // Sum the Edge Coords for the current vertex, and average.

            for (var ei = 0; ei < numberOfEdgesAdjacent; ei++) {

                var edgeIndex = vertex.edgeIndices[ei];

                var edge = edges[edgeIndex];

                var edgeMidpoint = edge.midpoint( vtx ); ///////////////////////CHANGED

                sumOfVertexPositions.add( edgeMidpoint );

                var edgeFromVertexToEdgePoint = [ v, numberOfVerticesOriginal + edgeIndex ];

                edgesFromVerticesToEdgePoints.push(edgeFromVertexToEdgePoint);

            }

            // Get the average Coord position.

            var averageOfEdgeMidpointsAdjacent = sumOfVertexPositions.clone().divideScalar(numberOfEdgesAdjacent);

            // Re-compute the Vertex Coord position based on added and adjusted Coords.

            var vertexNewPos 
                = vertexPos.clone()
                .multiplyScalar( numberOfFacesAdjacent - 3 )
                .add( averageOfFacePointsAdjacent )
                .add( averageOfEdgeMidpointsAdjacent )
                .add( averageOfEdgeMidpointsAdjacent )
                .divideScalar( numberOfFacesAdjacent );

            verticesNew.push( new Vertex( [ vertexNewPos.x, vertexNewPos.y, vertexNewPos.z ] ) ); // CHANGED!!!!
    
        } // end for each vertex 

        ///////////////CONCATENATE OPERATOR

        //verticesNew.append(Vertex.manyFromPositions(edgePoints));
        //verticesNew.append(Vertex.manyFromPositions(facePoints));

        // Add the Face points and Edge Points.

        verticesNew = util.concatArr( verticesNew, Vertex.manyFromPositions( edgePoints ) );

        verticesNew = util.concatArr( verticesNew, Vertex.manyFromPositions( facePoints ) );

        window.edgePoint = edgePoints;

        // Re-compute the indices for each Face.

        var vertexIndicesForFacesNew = [];

        for ( var f = 0; f < numberOfFacesOriginal; f++ ) {

            var faceOriginal = faces[f];

            var facePoint = facePoints[f];

            for ( var vi = 0; vi < faceOriginal.vertexIndices.length; vi++ ) {

                var vertexIndex = faceOriginal.vertexIndices[vi];

                var vertexOriginal = vtx[vertexIndex];

                var vertexNew = verticesNew[vertexIndex];

                var edgeIndicesShared = [];

                for (var ei = 0; ei < vertexOriginal.edgeIndices.length; ei++) {

                    var edgeIndex = vertexOriginal.edgeIndices[ei];

                    for ( var ei2 = 0; ei2 < faceOriginal.edgeIndices.length; ei2++ ) {

                        var edgeIndex2 = faceOriginal.edgeIndices[ ei2 ];

                        if (edgeIndex2 == edgeIndex) {

                            edgeIndicesShared.push(edgeIndex);

                        }

                    }

                }

                var vertexIndicesForFaceNew = [

                    // facePoint
                    numberOfVerticesOriginal + numberOfEdgesOriginal + f, 

                    // edgePoint0
                    numberOfVerticesOriginal + edgeIndicesShared[0],

                    // corner vertex
                    vertexIndex,

                    // edgePoint1
                    numberOfVerticesOriginal + edgeIndicesShared[1],
                ];

               vertexIndicesForFacesNew.push(vertexIndicesForFaceNew);

            }

        }

        // NOTE: verticesNew has right positions, but is EMPTY!

        window.verticesNew = verticesNew;
        window.indicesNew = vertexIndicesForFacesNew;

        // HAVE TO RECOMPUTE EDGE INDICES AND FACE INDICES
        window.newFaceEdges = this.computeQuadFaceEdges( vertexIndicesForFacesNew, verticesNew );

        ///////////////////////////////////////////////////////////////////////////
        // THIRD UNIT TEST ( test vertices )
        ///////////////////////////////////////////////////////////////////////////
        // TEST VERTICES
        let vvn = [], tvn = [];
        let testVerticesNew = [{pos:{x:-0.5555555555555555,y:-0.5555555555555555,z:-0.5555555555555555},edgeIndices:[1,2,13],faceIndices:[0,4,17]},{pos:{x:0.5555555555555555,y:-0.5555555555555555,z:-0.5555555555555555},edgeIndices:[4,5,15],faceIndices:[1,5,8]},{pos:{x:0.5555555555555555,y:0.5555555555555555,z:-0.5555555555555555},edgeIndices:[7,8,24],faceIndices:[2,9,12]},{pos:{x:-0.5555555555555555,y:0.5555555555555555,z:-0.5555555555555555},edgeIndices:[10,11,32],faceIndices:[3,13,16]},{pos:{x:-0.5555555555555555,y:-0.5555555555555555,z:0.5555555555555555},edgeIndices:[20,21,41],faceIndices:[7,18,20]},{pos:{x:0.5555555555555555,y:-0.5555555555555555,z:0.5555555555555555},edgeIndices:[17,18,29],faceIndices:[6,11,21]},{pos:{x:0.5555555555555555,y:0.5555555555555555,z:0.5555555555555555},edgeIndices:[26,27,37],faceIndices:[10,15,22]},{pos:{x:-0.5555555555555555,y:0.5555555555555555,z:0.5555555555555555},edgeIndices:[34,35,43],faceIndices:[14,19,23]},{pos:{x:0,y:-0.75,z:-0.75},edgeIndices:[0,1,4,12],faceIndices:[0,1,4,5]},{pos:{x:0.75,y:0,z:-0.75},edgeIndices:[5,6,7,22],faceIndices:[1,2,8,9]},{pos:{x:0,y:0.75,z:-0.75},edgeIndices:[8,9,10,30],faceIndices:[2,3,12,13]},{pos:{x:-0.75,y:0,z:-0.75},edgeIndices:[2,3,11,38],faceIndices:[0,3,16,17]},{pos:{x:0.75,y:-0.75,z:0},edgeIndices:[15,16,17,23],faceIndices:[5,6,8,11]},{pos:{x:0,y:-0.75,z:0.75},edgeIndices:[18,19,20,44],faceIndices:[6,7,20,21]},{pos:{x:-0.75,y:-0.75,z:0},edgeIndices:[13,14,21,40],faceIndices:[4,7,17,18]},{pos:{x:0.75,y:0.75,z:0},edgeIndices:[24,25,26,31],faceIndices:[9,10,12,15]},{pos:{x:0.75,y:0,z:0.75},edgeIndices:[27,28,29,46],faceIndices:[10,11,21,22]},{pos:{x:-0.75,y:0.75,z:0},edgeIndices:[32,33,34,39],faceIndices:[13,14,16,19]},{pos:{x:0,y:0.75,z:0.75},edgeIndices:[35,36,37,47],faceIndices:[14,15,22,23]},{pos:{x:-0.75,y:0,z:0.75},edgeIndices:[41,42,43,45],faceIndices:[18,19,20,23]},{pos:{x:0,y:0,z:-1},edgeIndices:[0,3,6,9],faceIndices:[0,1,2,3]},{pos:{x:0,y:-1,z:0},edgeIndices:[12,14,16,19],faceIndices:[4,5,6,7]},{pos:{x:1,y:0,z:0},edgeIndices:[22,23,25,28],faceIndices:[8,9,10,11]},{pos:{x:0,y:1,z:0},edgeIndices:[30,31,33,36],faceIndices:[12,13,14,15]},{pos:{x:-1,y:0,z:0},edgeIndices:[38,39,40,42],faceIndices:[16,17,18,19]},{pos:{x:0,y:0,z:1},edgeIndices:[44,45,46,47],faceIndices:[20,21,22,23]}];
        for ( let j in testVerticesNew ) {
            // TEST ONES
            let tvninst = testVerticesNew[ j ];
            vvn.push( tvninst.pos.x, tvninst.pos.y, tvninst.pos.z);
            vvn.push( tvninst.edgeIndices[0], tvninst.edgeIndices[1], tvninst.edgeIndices[2]);
            vvn.push( tvninst.faceIndices[0], tvninst.faceIndices[1], tvninst.faceIndices[2]);
            // OUR ONES
            let vnews = verticesNew[ j ];
            tvn.push( vnews.pos.x, vnews.pos.y, vnews.pos.z);
            tvn.push( vnews.edgeIndices[0], vnews.edgeIndices[1], vnews.edgeIndices[2]);
            tvn.push( vnews.faceIndices[0], vnews.faceIndices[1], vnews.faceIndices[2]);
        }
        // COMPARE
        window.vvn = vvn;
        window.tvn = tvn;

        console.log("---------BEGINNING FINAL VERTEX TEST--------------")

        for ( var j in vvn ) {

            if( vvn[ j ] !== tvn[j] ) {
                console.error( "final vertices don't match at:" + j + ", ", vvn[j] + ", " + tvn[j])
            }

        }

        // TEST INDICES
        let iin = [], tin = [];
        let testIndicesNew = [[20,8,0,11],[20,8,1,9],[20,9,2,10],[20,10,3,11],[21,8,0,14],[21,8,1,12],[21,12,5,13],[21,13,4,14],[22,9,1,12],[22,9,2,15],[22,15,6,16],[22,12,5,16],[23,10,2,15],[23,10,3,17],[23,17,7,18],[23,15,6,18],[24,11,3,17],[24,11,0,14],[24,14,4,19],[24,17,7,19],[25,13,4,19],[25,13,5,16],[25,16,6,18],[25,18,7,19]];
        for ( let j in testIndicesNew ) {
            let tiinst = testIndicesNew[ j ];
            tin.push( tiinst[0], tiinst[1], tiinst[2], tiinst[3])
        }

        for ( let j in indicesNew ) {
            let iinst = indicesNew[ j ];
            iin.push( iinst[0], iinst[1], iinst[2], iinst[3])
        }

        // COMPARE
        console.log("---------FINAL INDICES TEST (quads match)--------------");
        for( let j in indicesNew ) {
            if( tin[ j ] !== iin[j] ) {
                console.error("quads don't match at pos:" + j)
            }
        }

        // END OF UNIT TESTS
        //////////////////////////////////////////////////
        // !!!!!!!!!!!!!!!!!!!!!

        // NOTE: each kind of Prim will have to deal with texture Coordinates
        // convert indices to triangles and vertices to standard vertices.
        indices = this.computeTrisFromQuads( vertexIndicesForFacesNew, verticesNew );


        indices = util.flatten( indices );

        // Convert Vertex to flattened coordinate data
        let result = this.flattenVertexList( verticesNew );

        // Add our new indices to the flattened object

        result.indices = indices;

        return result;

        // END OF SUBDIVIDE
        ///////////////////////////////////////////////////////////////////////////////////////

        //return geometry;

    }

    /** 
     * Convert from one Prim geometry to another, alters geometry.
     */
    computeMorph ( newGeometry, easing, geometry ) {

        console.error( 'computeMorph not implemented' );

    }

}

export default Morph;
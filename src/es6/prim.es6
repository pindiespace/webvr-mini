import Map2d from './map2d';
import Map3d from './map3d';

class Prim {

    /** 
     * @class
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     * 
     * TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     * 1. regularize prim creation
     * - local vertex, index, etc
     * - vertices used in-place, instead of returned
     * - arrays created first in prim creation, then routine, then WebGL buffers added
     * 2. Texture indexing
     * - create startpoints in indices for swapping textures for complex objects
     * - create methods getting just the partial vertices, indices, etc. for manipulation.
     * 3. Update routines
     * - update when Prim modified (re-compute normals, tangents, smooth, optimize)
     * 
     * NOTE: if you need more complex shapes, use a mesh file, or 
     * a library like http://evanw.github.io/csg.js/ to implement 
     * mesh operations.
     * 
     * Implicit objects (values are units, with 1.0 being normalized size).
     * 
     * prim.position      = (vec5) [ x, y, z, rounding, | startSlice, endSlice,  ]
     * prim.dimensions    = (vec4) [ x, y, z ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * prim.acceleration  = (vec3) [ x, y, z ]
     * prim.rotation      = (vec3) [ x, y, z ]
     * prim.angular       = (vec3) [ x, y, z ]
     * prim.color         = [ red1, green1, blue1, alpha1, red2, blue2... ]
     * prim.texure1Arr    = [ texture1, texture2, texture3 ]
     * prim.audioArr      = [ AudioObj1, AudioObj2, AudioObj3...]
     * 
     * ---------------------------------------------------------------
     * Code rules
     * 1. vertices = final vertex data for computation or rendering
     * 2. vtx = any initialization vertices (e.g. for complex polyhedra)
     * 3. v, vv = local vertex or vertex array.
     * 4. when using GlMatrix functions, do 'in place' conversion first. 
     *    If not practical, return the result. If not practical, use an 
     *    object literal:
     *    a. vec3.sub( resultPt, a, b );
     *    b. resultPt = vec3.sub( resultPt, a, b );
     *    c. resultPt = vec3.sub( [ 0, 0, 0 ], a, b );
     * ---------------------------------------------------------------
     *
     * Array optimization
     * https://gamealchemist.wordpress.com/2013/05/01/lets-get-those-javascript-arrays-to-work-fast/
     * 
     * geo primitives
     * USE THIS!!!! https://github.com/nickdesaulniers/prims
     * https://github.com/mhintz/platonic/tree/master/src
     * https://github.com/azmobi2/html5-webgl-geometry-shapes/blob/master/webgl_geometry_shapes.html
     * 
     * convert fonts to texture
     * https://github.com/framelab/fontmatic
     * 
     * More prims
     * Ogre 3d procedural
     * https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/include/?at=default
     * https://bitbucket.org/transporter/ogre-procedural/wiki/Home
     *
     * https://github.com/jagenjo/litegl.js/tree/master/src
     *
     * http://wiki.unity3d.com/index.php/ProceduralPrimitives
     * 
     * advanced toolset
     * https://www.geometrictools.com/Samples/Geometrics.html
     * Geometry prebuilt
     * http://paulbourke.net/geometry/roundcube/
     * Lots of Webgl tricks!
     * https://acko.net
     * http://acko.net/blog/on-webgl/
     * 
     * https://gamedevdaily.io/four-ways-to-create-a-mesh-for-a-sphere-d7956b825db4#.lkbq2omq5
     *
     * 
     */
    constructor ( init, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo ) {

        console.log( 'in Prim class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.loadModel = loadModel;

        this.loadTexture = loadTexture;

        this.loadAudio = loadAudio;

        this.loadVideo = loadVideo;

        this.objs = [];

        this.typeList = {

            POINT: 'geometryPointCloud',

            POINTCLOUD: 'geometryPointCloud',

            LINE: 'geometryLine',

            PLANE: 'geometryOuterPlane',

            OUTERPLANE: 'geometryOuterPlane',

            INNERPLANE: 'geometryInnerPlane',

            CURVEDPLANE: 'geometryCurvedOuterPlane',

            CURVEDOUTERPLANE: 'geometryCurvedOuterPlane',

            CURVEDINNERPLANE: 'geometryCurvedInnerPlane',

            TERRAIN: 'geometryTerrain',

            CIRCLE: 'geometryCircle',

            CUBE: 'geometryCube',

            CUBESPHERE: 'geometryCubeSphere',

            SPHERE: 'geometrySphere',

            DISC: 'geometryCap',

            CAP: 'geometryCap',

            DOME: 'geometryDome',

            TOPDOME: 'geometryTopDome',

            SKYDOME: 'geometrySkyDome',

            BOTTOMDOME: 'geometryBottomDome',

            CONE: 'geometryCone',

            TOPCONE: 'geometryTopCone',

            BOTTOMCONE: 'geometryBottomCone',

            SPINDLE: 'geometrySpindle',

            TEARDROP: 'geometryTeardrop',

            CYLINDER: 'geometryCylinder',

            CAPSULE: 'geometryCapsule',

            PRISM: 'geometryPrism',

            ICOSOHEDRON: 'geometryIcosohedron',

            PYRAMID: 'geometryPyramid',

            ICOSPHERE: 'geometryIcoSphere',

            TOPICODOME: 'geometryTopIcoDome',

            SKYICODOME: 'geometrySkyIcoDome',

            BOTTOMICODOME: 'geometryBottomIcoDome',

            OCTAHEDRON: 'geometryOctahedron',

            DODECAHEDRON: 'geometryDodecahedron',

            TORUS: 'geometryTorus',

            MESH: 'geometryMesh'

        };

        // Sideness, direction. Mapped to equivalent unit vector names in this.getStdVecs()

        this.directions = {

            DEFAULT: 'up',

            FORWARD: 'forward',

            FRONT: 'forward',

            BACK: 'back',

            LEFT: 'left',

            RIGHT: 'right',

            UP: 'up',

            TOP: 'up',

            DOWN: 'down',

            BOTTOM: 'down'

        };

        this.FLOAT32 = 'float32',
        this.UINT32 = 'uint32';

        // Visible from inside or outside.

        this.OUTSIDE = 100,
        this.INSIDE = 101;

        // Shorthand.

        this.TWO_PI = Math.PI * 2;

    }

    /** 
     * See if supplied Prim type is supported. Individual Prim factory 
     * methods do more detailed checking.
     * @param {String} type the prim type.
     * @returns {Boolean} if supported, return true, else false.
     */
    checkType ( type ) {

        // Confirm we have a factory function for this type.

        if ( typeof type == 'function' ) {

            return true;

        }

        return true;

    }

    /** 
     * Unique object id
     * @link https://jsfiddle.net/briguy37/2MVFd/
     */
    setId () {

        let d = new Date().getTime();

        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

            let r = (d + Math.random() * 16 ) % 16 | 0;

            d = Math.floor( d / 16 );

            return ( c == 'x' ? r : ( r&0x3|0x8 ) ).toString( 16 );

        } );

        return uuid;

    }

    /** 
     * Get the big array with all vertex data. Every time a 
     * Prim is made, we store a reference in the this.objs[] 
     * array. So, to make one, we just concatenate the 
     * vertices. Use to send multiple prims sharing the same shader to one 
     * Renderer.
     * @param {Array} vertices
     * @returns {Array} vertices
     */
    setVertexData ( vertices ) {

        vertices = [];

        for ( let i in this.objs ) {

            vertices = vertices.concat( this.objs[i].vertices );

        }

        return vertices;

    }

    /** 
     * get the big array with all index data. Use to 
     * send multiple prims sharing the same shader to one 
     * Renderer.
     */
    setIndexData ( indices ) {

        indices = [];

        for ( let i in this.objs ) {

            indices = indices.concat( this.objs[i].indices );

        }

        return indices;

    }

    /** 
     * Return an empty buffer object.
     */
    createGeoObj () {

        return {

            makeBuffers: true,

            vertices: {

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

            },

            indices: { // where to start drawing GL_TRIANGLES.

                data: [],

                buffer: null,

                itemSize: 1,

                numItems: 0

            },

            sides: { // a collection of triangles creating a side on the shape.

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

            },

            normals: {

                data: [],

                buffer: null,

                itemSize: 3,

                numItems: 0

            },

            tangents: {

                data: [],

                buffer: null,

                itemSize: 4,

                numItems: 0

            },

            texCoords: {

                data: [],

                buffer: null,

                itemSize: 2,

                numItems: 0

            },

            colors: {

                data: [],

                buffer: null,

                itemSize: 4,

                numItems: 0

            }

        }

    }

    /** 
     * Add data to create buffers, works if existing data is present. However, 
     * indices must be consistent!
     */
    addBufferData( bufferObj, vertices, indices, normals, texCoords, tangents = [], colors = [] ) {

        const concat = this.util.concatArr;

        bufferObj.vertices.data = concat( bufferObj.vertices.data, vertices ),

        bufferObj.indices.data = concat( bufferObj.indices.data, indices ),

        bufferObj.normals.data = concat( bufferObj.normals.data, normals ),

        bufferObj.texCoords.data = concat( bufferObj.texCoords.data, texCoords ),

        bufferObj.tangents.data = concat( bufferObj.tangents.data, tangents ),

        bufferObj.colors.data = concat( bufferObj.colors.data, colors );

        return bufferObj;

    }

    /** 
     * Bind a WebGL buffer
     * @param {Object} o the bufferObj for for particular array (e.g. vertex, tangent).
     * @param {String} type the typed-array type.
     */
    bindGLBuffer( o, type ) {

        const gl = this.webgl.getContext();

        o.buffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

        switch( type ) {

            case this.FLOAT32:

                if (  o.data instanceof Float32Array ) {

                        gl.bufferData( gl.ARRAY_BUFFER, o.data, gl.STATIC_DRAW );

                    } else {

                        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

                    }

                break;

            case this.UINT16:

                o.buffer = gl.createBuffer();

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

                gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( o.data ), gl.STATIC_DRAW );

                o.numItems = o.data.length / o.itemSize;

                break;

            default:

                console.error( 'GL buffer type ' + type );

                break;

        }

    }

    /** 
     * Create WebGL buffers using geometry data. Note that the 
     * size is for flattened arrays.
     * @param {Object} bufferObj custom object holding the following:
     * an array of vertices, in glMatrix.vec3 objects.
     * an array of indices for the vertices.
     * an array of texture coordinates, in glMatrix.vec2 format.
     * an array of normals, in glMatrix.vec3 format.
     * an array of tangents, in glMatrix.vec3 format.
     * an array of colors, in glMatrix.vec4 format.
     */
    createGLBuffers( bufferObj ) {

            const gl = this.webgl.getContext();

            // Vertex Buffer Object.

            let o = bufferObj.vertices;

            if ( ! o.data.length ) {

                console.log( 'no vertices present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Index buffer.

            o = bufferObj.indices;

            if ( ! o.data.length ) {

                console.log( 'no indices present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            this.bindGLBuffer( o, this.UINT16 );

            // Create the Sides buffer, a kind of indices buffer.

            o = bufferObj.sides;

            if ( ! o.data.length ) {

                console.warn( 'no sides present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            this.bindGLBuffer( o, this.UINT16 );

            // create the Normals buffer.

            o = bufferObj.normals;

            if ( ! o.data.length ) {

                console.log( 'no normals, present, creating default' );

                o.data = new Float32Array( [ 0, 1, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the primary Texture buffer.

            o = bufferObj.texCoords;

            if ( ! o.data.length ) {

                console.warn( 'no texture present, creating default' );

                o.data = new Float32Array( [ 0, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // create the Tangents Buffer.

            o = bufferObj.tangents;

            if ( ! o.data.length ) {

                console.warn( 'no tangents present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0, 0 ] );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Create the Colors buffer.

            o = bufferObj.colors;

            if ( ! o.data.length ) {

                console.warn( 'no colors present, creating default color' );

                o.data = new Float32Array( this.computeColors( bufferObj.normals.data, o.data ) );

            }

            this.bindGLBuffer( o, this.FLOAT32 );

            // Set the flag.

            bufferObj.makeBuffers = false;

        return bufferObj;

    }

    /** 
     * Check the values of a Prim.
     * TODO: why is itemsize of indices = 1
     */
    primReadout ( prim ) {

        console.log( 'prim:' + prim.name + ' type:' + prim.type + 

            ' vertex:(' + prim.geometry.vertices.itemSize + 

            '), ' + prim.geometry.vertices.numItems + 

            ', texture:(' + prim.geometry.texCoords.itemSize + 

            '), ' + prim.geometry.texCoords.numItems + 

            ', index:(' + prim.geometry.indices.itemSize, 

            '), ' + prim.geometry.indices.numItems + 

            ', normals:(' + prim.geometry.normals.itemSize + 

            '), ' + prim.geometry.normals.numItems );

    }

    /* 
     * ---------------------------------------
     * DEFAULT VECTORS AND OBJECTS
     * ---------------------------------------
     */

    /** 
     * Standard vectors (similar to Unity) when needed. Call only 
     * if using the array literal (e.g. [ 0, 0, 0,]) doesn't make sense. 
     * Note you may need to go "let getStdVecs = this.getStdVecs.bind( this)" 
     * in your calling function.
     * @link https://docs.unity3d.com/ScriptReference/Vector3.html
    */
    getStdVecs ( type ) {

        let dir = this.directions;

        switch ( type ) {

            case dir.BACK: return [ 0, 0,-1 ];

            case dir.DOWN: return [ 0,-1, 0 ];

            case dir.FORWARD: return [ 0, 0, 1];

            case dir.LEFT: return [-1, 0, 0 ];

            case dir.RIGHT: return [ 1, 0, 0 ];

            case dir.UP: return [ 0, 1, 0 ];

            case dir.ONE: return [ 1, 1, 1 ];

            case dir.ZERO: return [ 0, 0, 0 ];

        }

    }

    /** 
     * Larger configuration vectors for Prims. additional values control slicing 
     * or flattening of part of a prim.
     * For CONE, the fourth value is truncation of the cone point.
     * For other Prims, the fourth and fifth values control the start and 
     * end of a cap on open prims (CYLINDER, CONE) and flattening of the 
     * top and bottom of SPHERE prims. This stretches the texture across the 
     * ends of the Prim. 
     */
    vec5 ( a, b, c, d = 0, e = 0 ) {

        return [ a, b, c, d, e ]; // dimensions, start slice (cone)

    }

    vec6 ( a, b, c, d = 0, e = 0, f = 0 ) {

        return [ a, b, c, d, e, f ];

    }

    /* 
     * ---------------------------------------
     * NORMAL, INDEX, VERTEX, TRIANGLE, QUAD CALCULATIONS
     * ---------------------------------------
     */

    /** 
     * Create default colors for Prim color array.
     */
    computeColors( normals, colors ) {

        for ( let i = 0; i < normals.length; i += 3 ) {

            colors.push( normals[ i ], normals[ i + 1 ], normals[ i + 2 ], 1.0 );

        }

        return colors;

    }

    /** 
     * Bounding box for a set of 3d points. This object is NO the same 
     * as a standard Cube, since each side is a quad without 
     * further divisions.
     * @param {[...vec3]} vertices a list of points to be enclosed in the bounding box.
     * @returns{Box} a BoundingBox object.
     */
    computeBoundingBox( vertices ) {

        let vec3 = this.glMatrix.vec3;

        let box = {

            vertices: [],

            indices: [],

            normals: [],

            texCoords: []

        }; 

        let tx = 0, ty = 0, tz = 0, bx = 0, by = 0, bz = 0;

        for( let i = 0; i < vertices.length; i++ ) {

            let v = vertices[ i ];

            tx = Math.min( tx, v[ 0 ] ),
            ty = Math.min( ty, v[ 1 ] ),
            tz = Math.min( tz, v[ 2 ] ),
            bx = Math.max( bx, v[ 0 ] ),
            by = Math.max( by, v[ 1 ] ),
            bz = Math.max( bz, v[ 2 ] );

        }

        // Two quads, vary by z values only, clockwise.

        box.vertices.push( 
            [ tx, ty, tz ],  // topLeft
            [ bx, ty, tz ],   // r
            [ bx, by, tz ],  // b
            [ tx, by, tz ],  // l

            [ tx, ty, bz ],  // t
            [ bx, ty, bz ],  // r
            [ bx, by, bz ],  // bottomRight
            [ tx, by, bz ]   // l
        );

        box.topLeft = box.vertices[ 0 ];

        box.bottomRight = box.vertices[ 6 ];

        box.dimensions = vec3.subtract( [ 0, 0, 0 ], box.bottomRight, box.topLeft );

        // if we draw it, add more here.

        return box;

    }

    /** 
     * Get spherical coordinates (u, v) for normalized unit vector.
     */
    computeSphereCoords ( vtx ) {

        let u = Math.atan2( vtx[ 0 ], vtx[ 2 ] ) / ( this.TWO_PI );  // x, z

        let v = Math.asin( vtx[ 1 ] ) / Math.PI + 0.5; // y

        if ( u < 0 ) {

            u += 1;

        }

        return [ u, v ];

    }

    /** 
     * Computed the angle between three 3d points defining a Plane.
     * @param {GlMatrix.vec3} a first Point in angle.
     * @param {GlMatrix.vec3} b second axis point in angle.
     * @param {GlMatrix.vec3} c third point defining angle.
     * @returns {Number} the angle between the points.
     */
    computeAngle3d ( a, b, c ) {

        let ab = [ b[ 0 ] - a[ 0 ], b[ 1 ] - a[ 1 ], b[ 2 ] - a[ 2 ] ];

        let bc = [ c[ 0 ] - b[ 0 ], c[ 1 ] - b[ 1 ], c[ 2 ] - b[ 2 ] ];

        let abDist = Math.sqrt( ab[ 0 ] * ab[ 0 ] + ab[ 1 ] * ab[ 1 ] + ab[ 2 ] * ab[ 2 ] );

        let bcDist = Math.sqrt( bc[ 0 ] * bc[ 0 ] + bc[ 1 ] * bc[ 1 ] + bc[ 2 ] * bc[ 2 ] );

        let abNorm = [ ab[ 0 ] / abDist, ab[ 1 ] / abDist, ab[ 2 ] / abDist ];

        let bcNorm = [ bc[ 0 ] / bcDist, bc[ 1 ] / bcDist, bc[ 2 ] / bcDist ];

        return Math.acos( abNorm[ 0 ] * bcNorm[ 0 ] + abNorm[ 1 ] * bcNorm[ 1 ] + abNorm[ 2 ] * bcNorm[ 2 ] );

    }


    computeMidPoint( vertices, index1, index2 ) {

        let vec3 = this.glMatrix.vec3;

        var v1 = vertices[ index1 ];

        var v2 = vertixes[ index2 ];

        // NOTE: divideByScalar equivalent uses vec3.scale( out, a, 1/b )

        return ( vec3.scale( [ 0, 0, 0 ], vec3.add( [ 0, 0, 0 ], v1, v2 ), 0.5 ) );

    }


    /**
     * Find the center between any set of 3d points
     * @param {[...vec3]} vertices an array of xyz points.
     * @returns {vec3} the center point.
     */ 
    computeCentroid ( vertices ) {

        let c = [ 0, 0, 0 ];

        let len = vertices.length;

        for ( let i = 0; i < len; i++ ) {

            let vertex = vertices[ i ];

            c[ 0 ] += vertex[ 0 ],

            c[ 1 ] += vertex[ 1 ],

            c[ 2 ] += vertex[ 2 ];

        }

        c[ 0 ] /= len,

        c[ 1 ] /= len,

        c[ 2 ] /= len;

        return c;

    }

    /** 
     * Compute an area-weighted centroid point for a Prim.
     * Use this when we want the center of the whole object the polygon is part of.
     * @param {Array[...GlMatrix.vec3]} vertices a list of 3d vertices.
     * @param {GlMatrix.vec3} the centroid Point.
     */
    computeMassCentroid( vertices ) {

        const vec3 = this.glMatrix.vec3;

        let c = [ 0, 0, 0 ];

        let areaTotal = 0.0;

        let p1 = vertices[ 0 ];

        let p2 = vertices[ 1 ];

        for ( let i = 2; i < vertices.length; i++ ) {

            let p3 = vertices[ i ];

            let edge1 = vec3.subtract( [ 0, 0, 0 ], p3, p1 );

            let edge2 = vec3.subtract( [ 0, 0, 0 ], p3, p2 );

            let crossProduct = vec3.cross( [ 0, 0, 0 ], edge1, edge2 );

            let area = vec3.length( crossProduct ) / 2;

            c[ 0 ] += area * ( p1[ 0 ] + p2[ 0 ] + p3[ 0 ] ) / 3,

            c[ 1 ] += area * ( p1[ 1 ] + p2[ 1 ] + p3[ 1 ] ) / 3,

            c[ 2 ] += area * ( p1[ 2 ] + p2[ 2 ] + p3[ 2 ] ) / 3;

            areaTotal += area;

            p2 = vec3.copy( [ 0, 0, 0 ], p3 );

        }

        return [

            c[ 0 ] / areaTotal,

            c[ 1 ] / areaTotal,

            c[ 2 ] / areaTotal

        ];

    }

    /** 
     * Compute barycentric coordinates of a Point relative 
     * to a triangle defined by three Points.
     * @param {vec3} p the point to test.
     * @param {vec3} p0 first clockwise vertex of triangle.
     * @param {vec3} p1 second clockwise vertex of triangle.
     * @param {vec3} p2 third clockwise vertex of triangle.
     * @returns {GlMatrix.vec2} uv coordinates of Point relative to triangle.
     */
    computeBarycentric( p, p0, p1, p2 ) {

        const vec3 = this.glMatrix.vec3;

        let v0, v1, v2, d00, d01, d02, d11, d12;

        // Compute vectors.

        v0 = vec3.sub( v0, p2, p0 );

        v1 = vec3.sub( v1, p1, p0 );

        v2 = vec3.sub( v2, p, p0 );

        // Compute dot products.

        d00 = vec3.dot( v0, v0 );

        d01 = vec3.dot( v0, v1 );

        d02 = vec3.dot( v0, v2 );

        d11 = vec3.dot( v1, v1 );

        d12 = vec3.dot( v1, v2 );

        // Compute barycentric coordinates.

        let invDenom = 1 / ( d00 * d11 - d01 * d01 );

        let u = ( d11 * d02 - d01 * d12 ) * invDenom;

        let v = ( d00 * d12 - d01 * d02 ) * invDenom;

        return [ u, v ];

    }


    /**
     * Compute whether point is in a triangle, wrapped 
     * clockwise (begin with a, end with c)
     * @link http://blackpawn.com/texts/pointinpoly/
     * @param {vec3} p the point to test.
     * @param {vec3} p0 first clockwise vertex of triangle.
     * @param {vec3} p1 second clockwise vertex of triangle.
     * @param {vec3} p2 third clockwise vertex of triangle.
     * @returns {Boolean} if point in triangle, return true, else false.
     */
    computePointInTriangle ( p, p0, p1, p2 ) {

        let uv = this.computeBaryCentric( p, p0, p1, p2 );

        // Check if Point is in triangle.

        return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

    }

    /** 
     * Given a set of Points, compute a triangle fan around the Centroid for those points.
     * @param {[...vec3]} vertices an array of UN-FLATTENED xyz points.
     * @param {[uint16]} indices the sequence to read triangles.
     * @returns {Object} UN-FLATTENED vertices, indices, texCoords nomals, tangents.
     */
    computeFan ( vertices, indices ) {

        let vec3 = this.glMatrix.vec3;

        let vv = [];

        // Get the subset of vertices we should take by following indices.

        for ( let i = 0; i < indices.length; i++ ) {

            vv.push( vertices[ indices[ i ] ] );

        }

        // Get the topLeft and bottomRight points (bounding rectangle).

        let center = this.computeCentroid( vv );

        // Add a central point so we can create a triangle fan.

        vv.push( center );

        let centerPos = vv.length - 1;

        let vtx = [], tex = [], norms = [], idx = [];

        // We re-do the indices calculations, since we insert a central point.

        let lenv = vv.length;

        let env = lenv - 1;

        for ( let i = 1; i < lenv; i++ ) {

            let p1 = i - 1;

            let p2 = i;

            if ( i === lenv - 1 ) {

                p2 = 0;

            }

            let v1 = vv[ p1 ];

            let v2 = vv[ p2 ];

            idx.push( p1, p2, centerPos );

            norms.push( v1, v2, center );

            // Assumes a regular polygon.

            tex.push(

                Math.cos( this.TWO_PI * p2 / ( lenv - 1 ) ) / 2 + .5,

                Math.sin( this.TWO_PI * p2 / ( lenv - 1 ) ) / 2 + .5

            );

        } // end of for loop

        // Push the center point texture coordinate.

        tex.push( 0.5, 0.5 );

        return {

            vertices: vv,

            indices: idx,

            texCoords: tex,

            normals: norms,

            tangents: [],

            colors: []

        }

    }

    /** 
     * Compute normals for a 3d object. 
     * NOTE: some routines compute their own normals.
     * Adapted from BabylonJS version:
     * @link https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
     * @link http://gamedev.stackexchange.com/questions/8191/any-reliable-polygon-normal-calculation-code
     * @link https://www.opengl.org/wiki/Calculating_a_Surface_Normal
     * @param {[...GLMatrix.vec3]} vertices the current 3d position coordinates.
     * @param {Array} current indices into the vertices.
     * @param {[...GLMatrix.vec3]} normals the normals array to recalculate.
     */
    computeNormals ( vertices, indices, normals ) {

        let idx = 0;

        let p1p2x = 0.0, p1p2y = 0.0, p1p2z = 0.0;

        let p3p2x = 0.0, p3p2y = 0.0, p3p2z = 0.0;

        let faceNormalx = 0.0, faceNormaly = 0.0, faceNormalz = 0.0;

        let length = 0.0;

        let i1 = 0, i2 = 0, i3 = 0;

        normals = new Float32Array( vertices.length );

        // Index triangle = 1 face.

        let nbFaces = indices.length / 3;

        for ( idx = 0; idx < nbFaces; idx++ ) {

            i1 = indices[ idx * 3]; // get the idxes of each vertex of the face

            i2 = indices[ idx * 3 + 1 ];

            i3 = indices[ idx * 3 + 2 ];

            // Get face vertex values.

            p1p2x = vertices[ i1 * 3 ] - vertices[ i2 * 3 ]; // compute two vectors per face

            p1p2y = vertices[ i1 * 3 + 1 ] - vertices[ i2 * 3 + 1 ];

            p1p2z = vertices[ i1 * 3 + 2 ] - vertices[ i2 * 3 + 2 ];

            p3p2x = vertices[ i3 * 3 ] - vertices[ i2 * 3];

            p3p2y = vertices[ i3 * 3 + 1 ] - vertices[ i2 * 3 + 1 ];

            p3p2z = vertices[ i3 * 3 + 2 ] - vertices[ i2 * 3 + 2 ];

            // Compute the face normal with cross product.

            faceNormalx = p1p2y * p3p2z - p1p2z * p3p2y;

            faceNormaly = p1p2z * p3p2x - p1p2x * p3p2z;

            faceNormalz = p1p2x * p3p2y - p1p2y * p3p2x;

            // Get normalized length of face normal.

            length = Math.sqrt( faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz );

            length = (length === 0) ? 1.0 : length;

            faceNormalx /= length; // normalize this normal

            faceNormaly /= length;

            faceNormalz /= length;

            // Accumulate all the normals defined for the face.

            normals[i1 * 3] += faceNormalx;

            normals[i1 * 3 + 1] += faceNormaly;

            normals[i1 * 3 + 2] += faceNormalz;

            normals[i2 * 3] += faceNormalx;

            normals[i2 * 3 + 1] += faceNormaly;

            normals[i2 * 3 + 2] += faceNormalz;

            normals[i3 * 3] += faceNormalx;

            normals[i3 * 3 + 1] += faceNormaly;

            normals[i3 * 3 + 2] += faceNormalz;

        }

        // Last normalization of each normal

        for ( idx = 0; idx < normals.length / 3; idx++ ) {

            faceNormalx =  normals[ idx * 3 ];

            faceNormaly = -normals[ idx * 3 + 1 ];

            faceNormalz =  normals[ idx * 3 + 2 ];

            length = Math.sqrt( faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz );

            length = (length === 0) ? 1.0 : length;

            faceNormalx /= length;

            faceNormaly /= length;

            faceNormalz /= length;

            // NOTE: added negative (-) to x, z to match our lighting model.

            normals[ idx * 3 ] = -faceNormalx;

            normals[ idx * 3 + 1 ] = faceNormaly;

            normals[ idx * 3 + 2 ] = -faceNormalz;

        }

        return normals;

    }

    /** 
     * Compute tangents. NOTE: some routines compute their own tangents.
     * CodePen - http://codepen.io/ktmpower/pen/ZbGRpW
     * adapted from the C++ code from this link: http://www.terathon.com/code/tangent.html
     * TODO: CONVERT TO GLMATRIX
     * "The code below generates a four-component tangent T in which the handedness of the local coordinate system
     * is stored as ±1 in the w-coordinate. The bitangent vector B is then given by B = (N × T) · Tw."
     */
    computeTangents ( vertices, indices, normals, texCoords, tangents ) {

        const vec3 = this.glMatrix.vec3;

        let tan1 = new Float32Array( normals.length );

        let tan2 = new Float32Array( normals.length );

        // the indices array specifies the triangles forming the object mesh (3 indices per triangle)

        const numIndices = indices.length;

        const numVertices = vertices.length;

        //const numNormals = normals.length;

        tangents = new Float32Array( numVertices * 4 / 3 ); // TODO: ADDED 4 to this!!

        // for each triangle (step through indices 3 by 3)

        for (let i = 0; i < numIndices; i += 3) {

            const i1 = indices[i], i2 = indices[ i + 1 ], i3 = indices[ i + 2 ];

            let j = i1 * 3; const v1x = vertices[ j ], v1y = vertices[ j + 1 ], v1z = vertices[ j + 2 ];

            j = i2 * 3; const v2x = vertices[ j ], v2y = vertices[ j + 1 ], v2z = vertices[ j + 2 ];

            j = i3 * 3; const v3x = vertices[ j ], v3y = vertices[ j + 1 ], v3z = vertices[ j + 2 ];
    
            const x1 = v2x - v1x, x2 = v3x - v1x;

            const y1 = v2y - v1y, y2 = v3y - v1y;

            const z1 = v2z - v1z, z2 = v3z - v1z;

            j = i1 * 2; const w1x = texCoords[ j ], w1y = texCoords[ j + 1 ];

            j = i2 * 2; const w2x = texCoords[ j ], w2y = texCoords[ j + 1 ];

            j = i3 * 2; const w3x = texCoords[ j ], w3y = texCoords[ j + 1 ];

            const s1 = w2x - w1x, s2 = w3x - w1x;

            const t1 = w2y - w1y, t2 = w3y - w1y;

            const r = 1.0 / ( s1 * t2 - s2 * t1 );

            const sx = ( t2 * x1 - t1 * x2 ) * r, sy = ( t2 * y1 - t1 * y2 ) * r, sz = ( t2 * z1 - t1 * z2 ) * r;

            const tx = ( s1 * x2 - s2 * x1 ) * r, ty = ( s1 * y2 - s2 * y1 ) * r, tz = ( s1 * z2 - s2 * z1 ) * r;

            j = i1 * 3; tan1[ j ] += sx; tan1[ j + 1 ] += sy; tan1[ j + 2 ] += sz;

            tan2[ j ] += tx; tan2[ j + 1 ] += ty; tan2[ j + 2 ] += tz;

            j = i2 * 3; tan1[ j ] += sx; tan1[ j + 1 ] += sy; tan1[ j + 2 ] += sz;

            tan2[ j ] += tx; tan2[ j + 1 ] += ty; tan2[ j + 2 ] += tz;

            j = i3 * 3; tan1[ j ] += sx; tan1[ j + 1 ] += sy; tan1[ j + 2 ] += sz;

            tan2[ j ] += tx; tan2[ j + 1 ] += ty; tan2[ j + 2 ] += tz;

        }

        // Loop through vertices.

        for (let i3 = 0, i4 = 0; i4 < numVertices; i3 += 3, i4 += 4) {

            // not very efficient here (used the vec3 type and dot/cross operations from MV.js)

            const n  = [ normals[ i3 ], normals[ i3 + 1 ], normals[ i3 + 2 ] ];

            const t1 = [ tan1   [ i3 ], tan1   [ i3 + 1 ], tan1   [ i3 + 2 ] ];

            const t2 = [ tan2   [ i3 ], tan2   [ i3 + 1 ], tan2   [ i3 + 2 ] ];

            //console.log('n:' + n + ' t1:' + t1 + ' t2:' + t2)

            // Gram-Schmidt orthogonalize
            ////////////////const tmp  = subtract(t1, scale(dot(n, t1), n));
            const tmp = vec3.sub( [ 0, 0, 0 ], t1, vec3.scale( [ 0, 0, 0 ], t1, vec3.dot( n, t1 ) ) );

            //console.log("TMP:" + tmp) //NOT COMPUTING THIS RIGHT, all NAN

            const len2 = tmp[ 0 ] * tmp[ 0 ] + tmp[ 1 ] * tmp[ 1 ] + tmp[ 2 ] * tmp[ 2 ];

            // normalize the vector only if non-zero length

            const txyz = ( len2 > 0 ) ? vec3.scale( [ 0, 0, 0 ], tmp, 1.0 / Math.sqrt( len2 ) ) : tmp;

            ////console.log("TXYZ:" + txyz );

            // Calculate handedness
            //////////////const tw = (dot(cross(n, t1), t2) < 0.0) ? -1.0 : 1.0;
            const tw = ( vec3.dot( vec3.cross( [ 0, 0, 0 ], n, t1 ), t2 ) < 0.0 ) ? -1.0 : 1.0;

            tangents[ i4     ] = txyz[ 0 ];

            tangents[ i4 + 1 ] = txyz[ 1 ];

            tangents[ i4 + 2 ] = txyz[ 2 ];

            tangents[ i4 + 3 ] = tw;

        }

        return tangents;

    }

    /** 
     * Given a mesh of vertices, compute the quads and indexing. 
     * from the indices (path through triangles)
     * https://github.com/Erkaman/gl-quads-to-tris
     * https://github.com/Erkaman/gl-catmull-clark/blob/master/index.js   THIS ONE
     * https://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
     * https://vorg.github.io/pex/docs/pex-geom/Geometry.html
     * http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * NOTE: quads = "cells" = "face"
     */
    computeQuadsFromTris ( triIndices ) {

        let util = this.util;

        let idx = triIndices;

        let quads = new Array( idx.length / 2 );

        let ct = 0;

        if ( ! util.canFlatten( idx ) ) {

            console.error( 'trisToQuads() error: flattened arrays not supported' );

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
     */
    computeTrisFromQuads( quadIndices ) {

        let util = this.util;

        let tris = new Array( quadIndices.length * 2 );

        let ct = 0;

        if( ! util.canFlatten( quadIndices ) ) {

            console.error( 'Prim.quadsToTris() error: flattened quad arrays not used in this program' );

            return null;

        }

        for ( let i = 0; i < quadIndices.length; i++ ) {

            let quad = quadIndices[ i ];

            tris[ ct++ ] = [

                quad[ i ], 

                quad[ i + 1 ],

                quad[ i + 2 ]

            ];

            tris[ ct++ ] = [

                quad[ i ],

                quad[ i + 2 ],

                quad[ i + 3 ]

            ]

        }

        return tris;

    }


    /** 
     * Subdivide a mesh
     * Comprehensive description.
     * http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * @link http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * USE:
     * USE: https://blog.nobel-joergensen.com/2010/12/25/procedural-generated-mesh-in-unity/
     * USE: http://wiki.unity3d.com/index.php/MeshSubdivision
     * USE: https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     * USE: https://github.com/Erkaman/gl-catmull-clark/blob/master/index.js
     * Examples:
     * Subdivide algorithm
     * https://github.com/mikolalysenko/loop-subdivide
     * https://github.com/Erkaman/gl-catmull-clark
     * https://www.ibiblio.org/e-notes/Splines/models/loop.js
     * generalized catmull-clark subdivision algorithm
     * https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     * @link http://vorg.github.io/pex/docs/pex-geom/Geometry.html
     * @link http://answers.unity3d.com/questions/259127/does-anyone-have-any-code-to-subdivide-a-mesh-and.html
     * @link https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     */
    computeSubdivide ( vertices, indices ) {

        let util = this.util;

        let vec3 = this.glMatrix.vec3;

        let v = util.unFlatten( vertices, 3 );

        // Augment vertices

        let vtx = new Array( v.length );

        let tris = util.unFlatten( indices, 3 );

        let quads = this.computeQuadsFromTris( tris );

        let faces = [];

        let edges = [];

        // https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/

        // Based on a description of Catmull-Clark subdivision at the URL
        // "https://en.wikipedia.org/wiki/Catmull-clark_subdivision".

        function Edge( minIndex, maxIndex ) {

            this.vertexIndices = [ minIndex, maxIndex ];

            this.faceIndices = [];

        }; // end of Edge

        function Face( quad ) {

            this.vertexIndices = quad;

            this.edgeIndices = [];


        }; // end of Face

        function Vertex( vec ) {

            this.pos = vec;

            this.edgeIndices = [];

            this.faceIndices = [];

        }; // end of vertex

        // Build Vertex object out of vec3.

        for ( let i = 0; i < v.length; i++ ) {

            vtx[ i ] = new Vertex( v[ i ] );

        }

        /////////////////////////////////////////////////////
        // CUBE DATA
        vertices = [
        {pos:{x:-1,y:-1,z:-1},edgeIndices:[],faceIndices:[]},
        {pos:{x:1,y:-1,z:-1},edgeIndices:[],faceIndices:[]},
        {pos:{x:1,y:1,z:-1},edgeIndices:[],faceIndices:[]},
        {pos:{x:-1,y:1,z:-1},edgeIndices:[],faceIndices:[]},
        {pos:{x:-1,y:-1,z:1},edgeIndices:[],faceIndices:[]},
        {pos:{x:1,y:-1,z:1},edgeIndices:[],faceIndices:[]},
        {pos:{x:1,y:1,z:1},edgeIndices:[],faceIndices:[]},
        {pos:{x:-1,y:1,z:1},edgeIndices:[],faceIndices:[]}
        ];

        quads = [[0,1,2,3],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];

        window.faces = faces;
        window.edges = edges;

        //let quads = quads;

        ////////////////////////////////////////////////////////////////////////////////////////
    let minMaxLookup = [];

    let quadLen = 4; // side of quads face, change for other face sizes.

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

            let vertex = vertices[ vi0 ];

            let vertexNext = vertices[ vi1 ];

            vertex.faceIndices.push( f );

            // Get the larger and smaller of the two indices.

            let iMin = Math.min( vi0, vi1 );

            let iMax = Math.max( vi0, vi1 );

            // Initialize sed minMaxMLookup

            let maxLookup = minMaxLookup[ iMin ];

            if ( maxLookup == null ) {

                maxLookup = [];

                minMaxLookup[ iMin ] = maxLookup;

            }

            let edgeIndex = maxLookup[ iMax ];

            if (edgeIndex == null ) {

                let edge = new Edge( iMin, iMax );

                edgeIndex = edges.length;

                edges.push(edge);

            }

            maxLookup[ iMax ] = edgeIndex;

            // hack
            // Is there away to avoid this indexOf call?

            if ( face.edgeIndices.indexOf( edgeIndex ) == -1 ) {

                face.edgeIndices.push( edgeIndex );

            }
        }

        for ( let ei = 0; ei < face.edgeIndices.length; ei++) {

            let edgeIndex = face.edgeIndices[ei];

            let edge = edges[edgeIndex];

            edge.faceIndices.push( f );

            for ( let vi = 0; vi < edge.vertexIndices.length; vi++ ) {

                let vi0 = edge.vertexIndices[vi];

                let vertex = vertices[ vi0 ];

                // hack
                // Is there away to avoid this indexOf call?
                if ( vertex.edgeIndices.indexOf( edgeIndex ) == -1 ) {

                    vertex.edgeIndices.push( edgeIndex );

                }
            }
        }

        faces.push(face);
    }

    console.log("FFFFACES:" + faces[5].edgeIndices )
    console.log("FFFFACES:" + faces[5].vertexIndices )
    console.log("EEDDGGES:" + edges[3].faceIndices )
    console.log("EEDDGGES:" + edges[3].vertexIndices )

        ///////////////////////////////////////////////////////////////////////////////////////
        // subdivide
        console.log("BEGIN SUBDIVIDE")

        //return geometry;

    }

    /** 
     * Convert from one Prim geometry to another, alters geometry.
     */
    computeMorph ( newGeometry, easing, geometry ) {

    }


    /** 
     * Scale vertices directly, without changing position.
     */
    computeScale ( vertices, scale ) {

        let oldPos = this.getCenter( vertices );

        for ( let i = 0; i < vertices.length; i++ ) {

            vertices[ i ] *= scale;

        }

        this.moveTo( oldPos );

    }

    /** 
     * Move vertices directly in geometry, i.e. for something 
     * that always orbits a central point.
     * NOTE: normally, you will want to use a matrix transform to position objects.
     * @param {GLMatrix.vec3} pos - the new position.
     */
    computeMove ( vertices, pos ) {

        let center = this.getCentroid( vertices );

        let delta = [

            center[ 0 ] - pos[ 0 ],

            center[ 1 ] - pos[ 1 ],

            center[ 2 ] - pos[ 2 ]

        ];

        for ( let i = 0; i < vertices.length; i += 3 ) {

            vertices[i] = delta[ 0 ];

            vertices[ i + 1 ] = delta[ 1 ];

            vertices[ i + 2 ] = delta[ 2 ];

        }

    }

    /* 
     * ---------------------------------------
     * GEOMETRY CREATORS
     * ---------------------------------------
     */

    /** 
     * WebGL point cloud (particle system).
     * Rendered as GL_POINT.
     * @link https://github.com/potree/potree/releases
     * @link https://www.khronos.org/registry/webgl/sdk/demos/google/particles/index.html
     * @link https://github.com/gouzhen1/WebGL-Particle-System/
     * @link https://github.com/gouzhen1/WebGL-Particle-System/blob/master/index.html#L3
     * @link http://nullprogram.com/blog/2014/06/29/
     * https://codepen.io/kenjiSpecial/pen/yyeaKm
     * rendered as an array of GL_POINT.
     * 
     * @param {Prim} the Prim needing geometry. 
     * prim.dimensions    = (vec4) [ x, y, z, radius || 0, pointSize (pixels) | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryPointCloud ( prim ) {

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = [], indices = [], texCoords = [], normals = [], tangents = [];

        // Expect points in Map3d object, or generate random.

        let w = prim.dimensions[ 0 ],
        h = prim.dimensions[ 1 ],
        d = prim.dimensions[ 2 ],
        radius = prim.dimensions[ 3 ],
        pointSize = prim.dimensions[ 4 ] || 1,
        numPoints = prim.divisions[ 0 ] || 1;

        if ( ! prim.spaceMap ) {

            console.log( 'adding spaceMap for:' + prim.name );

            prim.sphereMap = new Map3d( this.util );

            prim.sphereMap.initRandom ( w, h, d, numPoints );

            // roughness 0.2 of 0-1, flatten = 1 of 0-1;

            //prim.spaceMap[ prim.spaceMap.type.CLOUD ]( prim.divisions[ 0 ], prim.divisions[ 1 ], prim.divisions[ 2 ], 0.6, 1 );

        }

        // Vertices.

        // Indices.

        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Texture coordinates.

        // Tangents (not used).

        this.computeTangents( vertices, indices, normals, texCoords, tangents );

        // Colors already present, or computed in this.createGLBuffers.

        return this.addBufferData( bufferObj, vertices, indices, texCoords, normals, tangents, colors );

    }

    /** 
     * type LINE
     * rendered as GL_LINE.
     * prim.dimensions    = (vec4) [ x, y, z, thickness | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryLine ( prim ) {

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = [], indices = [], texCoords = [], normals = [], tangents = [];

        // Expect points in Map3d object, or generate random.

        let w = prim.dimensions[ 0 ],
        h = prim.dimensions[ 1 ],
        d = prim.dimensions[ 2 ],
        radius = prim.dimensions[ 3 ],
        pointSize = prim.dimensions[ 4 ] || 1,
        numPoints = prim.divisions[ 0 ] || 1;


        // Vertices.

        // Indices.

        // Normals.

        // Tangents.

        // Colors.

        // Return the buffer, or add array data to the existing Prim data.

        // Return data to build WebGL buffers.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * Objects created with uv methods (i.e. they have polar points).
     * rendered as GL_TRIANGLES.
     * startSlice cuts off the cylinder, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cylinder, and wraps the texture across the bottom.
     * for an open cylinder with no caps, set startSlice and endSlize to zero.
     * prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     *
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometrySphere ( prim ) {

        const list = this.typeList;

        const vec3 = this.glMatrix.vec3;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays.

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        let longitudeBands = prim.divisions[ 0 ] // x axis (really xz)

        let latitudeBands = prim.divisions[ 1 ]; // y axis

        // Radius is measured along the x axis.

        let l = prim.dimensions[ 0 ],
        w = prim.dimensions[ 1 ], 
        h = prim.dimensions[ 2 ], 
        startSlice = prim.dimensions[ 3 ] || 0,
        endSlice = prim.dimensions[ 4 ] || 1.0;

        // Everything except SPHERE, CYLINDER, SPINDLE, and CONE is a half-object.

        let latStart = 0, longStart = 0, latDist;

        if( prim.type === list.SPHERE || prim.type === list.CYLINDER || 

            prim.type === list.SPINDLE || prim.type === list.CONE || prim.type === list.TEARDROP ) {

            latDist = latitudeBands;

        } else if ( prim.type === list.CAP ) {

            latDist = 1; // one flat object, central points + one ring.

        } else {

            latDist = latitudeBands / 2; // half-domes and half-cones

        }

        let latNum, longNum;

        // Start our uv build loop.

        for ( latNum = latStart; latNum <= latDist; latNum++ ) {

            let theta = latNum * Math.PI / latitudeBands;

            let sinTheta = Math.sin( theta );

            let cosTheta = Math.cos( theta );

            for ( longNum = longStart; longNum <= longitudeBands; longNum++ ) {

                let phi = longNum * this.TWO_PI / longitudeBands;

                let sinPhi = Math.sin( phi );

                let cosPhi = Math.cos( phi );

                let x, y, z, u, v, r;

                // Compute vertices.

                let lat = latNum / latDist;

                r = lat / 2; // use for no-spherical shapes.

                let long = longNum / longitudeBands;

                u = 1 - long;
                v = 1 - lat;

                x = cosPhi * sinTheta / 2;
                z = sinPhi * sinTheta / 2;

                switch( prim.type ) {

                    case list.CAP:
                        x = cosPhi / 4;
                        z = sinPhi / 4;
                        y = 0;
                        break;

                    case list.CYLINDER:
                        if ( startSlice > 0 && lat <= startSlice ) {
                            y = 1 - startSlice;
                        }
                        else if ( endSlice !== 1.0 && lat >= endSlice ) {
                            y = 1 - endSlice;
                        } else {
                            y = 1 - lat;
                            x = cosPhi / 2;
                            z = sinPhi / 2;
                        }
                        y -= 0.5;
                        break;

                    case list.SPHERE:
                        y = cosTheta / 2;
                        break;

                    case list.TOPDOME:
                    case list.DOME:
                        y = cosTheta / 2;
                        break;

                    case list.SKYDOME:
                        y = cosTheta / 2;
                        u = long;
                        //v = 1 - lat;
                        break;

                    case list.BOTTOMDOME:
                        y = ( (1 - cosTheta) / 2 ) - 0.5;
                        u = long;
                        v = lat;
                        break;

                    case list.SPINDLE:
                        if( lat <= 0.4 ) {
                            x = cosPhi * lat;
                            z = sinPhi * lat;
                        } else {
                            x = cosPhi * ( 1 - lat + ( 1 / latDist ) )
                            z = sinPhi * ( 1 - lat + ( 1 / latDist ) )
                        }
                            y = 1 - lat - 0.5;
                        break;

                    case list.TEARDROP:
                        if( lat < 0.5 ) {
                            y = cosTheta / 4;
                        } else {
                            x = 2 * cosPhi * ( 0.5  - r );
                            z = 2 * sinPhi * ( 0.5  - r );
                            y = cosTheta / 2;
                        }
                        break;

                    case list.CONE:
                        if( lat <= startSlice ) {

                            y = 1 - startSlice;   
                            x = cosPhi * r;
                            z = sinPhi * r;
                        } 
                        else if ( lat > endSlice ) { // NOTE: not >= endSlice
                            y = 1 - endSlice ;
  
                            x = cosPhi * sinTheta / 2
                            z = sinPhi * sinTheta / 2;
                        } 
                        else {
                            y = 1 - lat;
                            x = cosPhi * r;
                            z = sinPhi * r;
                        }
                        y -= 0.5;
                        break;

                    case list.TOPCONE:
                        x = cosPhi * r;
                        z = sinPhi * r;
                        y = 0.5 - r;
                        break;

                    case list.BOTTOMCONE:
                        x = cosPhi * ( 0.5 - r );
                        z = sinPhi * ( 0.5 - r );
                        y = 0.0 - r;
                        break;

                }

                // Texture coords.

                texCoords.push( u, v );

                // Push normals.

                let n = vec3.normalize( [ 0, 0, 0 ], [ x, y, z ] );

                normals.push( n[ 0 ], n[ 1 ], n[ 2 ] );

                // Push vertices.

                vertices.push( x * l, y * w, z * h );

                // These were wrapped bottom->top, so reverse y on normals.

                if ( prim.type === list.BOTTOMDOME || prim.type === list.BOTTOMCONE || prim.type === list.SKYDOME ) {

                    y = -y; // the y value (have to flip indices backwards for SKYDOME for it to work).

                }

                // Sphere indices.

                if ( latNum !== latDist && longNum !== longitudeBands ) {

                    let first = ( latNum * ( longitudeBands + 1 ) ) + longNum;

                    let second = first + longitudeBands + 1;

                    // Texture only visible outside.

                    indices.push( first + 1, second + 1, second );

                    indices.push( first, first + 1,  second );

                }

            }

        }

        // Wind the SKYDOME indices backwards so texture displays inside.

        if ( prim.type === list.SKYDOME ) {

            geo.indices.data = indices.reverse();

        }

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords, tangents );

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * type CAP
     * rendered as GL_TRIANGLES.
     * Just a flattened half-sphere creating a circular 'lid'.
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCap( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type DOME
     * rendered as GL_TRIANGLES.
     * Half-sphere, visible from outside.
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryDome ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type TOPDOME.
     * rendered as WebGL TRIANGLES.
     * Half-sphere (equivalent to type DOME).
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryTopDome ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type SKYDOME
     * rendered as GL_TRIANGLES.
     * Half-sphere, order of drawing is reversed, so texture displays inside by default.
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometrySkyDome ( prim ) {

        prim.visibleFrom = this.INSIDE;

        return this.geometrySphere( prim );

    }

    /** 
     * type BOTTOMDOME
     * rendered as GL_TRIANGLES.
     * bowl shaped, formed from lower half of sphere.
     * prim.dimensions    = (vec4) [ x, y, z ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryBottomDome ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type CYLINDER
     * rendered as GL_TRIANGLES.
     * Cylinder, either open or closed, visible from outside.
     * startSlice cuts off the cylinder, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cylinder, and wraps the texture across the bottom.
     * for an open cylinder with no caps, set startSlice and endSlize to zero.
     * prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCylinder ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type CONE.
     * rendered as GL_TRIANGLES (equivalent to TOPCONE).
     * Cone can have segments sliced off its beginning or end.
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type TOPCONE.
     * rendered as GL_TRIANGLES.(equivalent to CONE).
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     *
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryTopCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type BOTTOMCONE
     * rendered as GL_TRIANGLES.
     * Cone structure, pointing downwards.
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     *
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryBottomCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /**
     * TYPE SPINDLE.
     * rendered as GL_TRIANGLES.
     * Spindle (two cones stuck together).
     * prim.dimensions    = (vec4) [ x, y, z ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometrySpindle ( prim ) {

        return this.geometrySphere( prim );

    }

    geometryTeardrop ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type CAPSULE
     * rendered as WebGL TRIANGLES.
     * a cylinder with two spheres on each end, similar to capped cylinder, 
     * equivalent to a closed cube.
     * @link https://github.com/vorg/primitive-capsule
     * position x axis is the radius, y axis is the height z not used
     * dimensions x is number of steps along the y axis, dimensions y is the number of radial 
     * divisions around the capsule.
     * prim.dimensions    = (vec4) [ x, y, z ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCapsule ( prim ) {

        const TWO_PI = this.TWO_PI;

        const list = this.typeList;

        const vec3 = this.glMatrix.vec3;

        let util = this.util;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays.

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        // Radius is measured along the x axis, height along y axis.

        let radius = prim.dimensions[ 0 ] || 0.5,
        height = prim.dimensions[ 1 ] || 1.0,
        segmentHeight = prim.divisions[ 0 ] || 12,
        numSegments = prim.divisions[ 1 ] || 12;

        // Compute a capsule ring.

        function calculateRing( segments, r, y, dy ) {

            let segIncr = 1.0 / ( segments - 1 );

            for( let s = 0; s < segments; s++ ) {

                let x = Math.cos( ( TWO_PI ) * s * segIncr ) * r;

                let z = Math.sin( ( TWO_PI ) * s * segIncr ) * r;

                vertices.push( radius * x, radius * y + height * dy, radius * z );

                normals.push( x, y, z )

                let u =  1 - ( s * segIncr );

                let v = 0.5 + ( ( radius * y + height * dy ) / ( 2.0 * radius + height ) );

                texCoords.push( u, v );

            }
        }

        let ringsBody = segmentHeight + 1;

        let ringsTotal = segmentHeight + ringsBody;


        let bodyIncr = 1.0 / ( ringsBody - 1 );

        let ringIncr = 1.0 / ( segmentHeight - 1 );

        for( let r = 0; r < segmentHeight / 2; r++ ) {

            calculateRing( numSegments, Math.sin( Math.PI * r * ringIncr), Math.sin( Math.PI * ( r * ringIncr - 0.5 ) ), -0.5 );

        }

        for( let r = 0; r < ringsBody; r++ ) {

            calculateRing( numSegments, 1.0, 0.0, r * bodyIncr - 0.5);

        }

        for( let r = segmentHeight / 2; r < segmentHeight; r++ ) {

            calculateRing( numSegments, Math.sin( Math.PI * r * ringIncr), Math.sin( Math.PI * ( r * ringIncr - 0.5 ) ), +0.5);

        }

        for( let r = 0; r < ringsTotal - 1; r++ ) {

            for( let s = 0; s < numSegments - 1; s++ ) {

                indices.push(

                    ( r * numSegments + ( s + 1 ) ),

                    ( r * numSegments + ( s + 0 ) ),

                    ( ( r + 1 ) * numSegments + ( s + 1 ) )

                    );

                indices.push(

                    ( ( r + 1 ) * numSegments + ( s + 0 ) ),

                    ( ( r + 1 ) * numSegments + ( s + 1 ) ),

                    ( r * numSegments + s )

                 )

            }

        }

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords, tangents );

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * Create a PLANE, CUBE, or spherical object from cube mesh.
     * --------------------------------------------------------------------
     * type CUBE.
     * rendered as WebGL TRIANGLES.
     * Derived partly from pex.
     * @link http://vorg.github.io/pex/docs/
     * adjust curveRadius to round the edges of the Cube.
     * used by several other Prim routines (CUBESPHERE, PLANE, OUTERPLANE, 
     * INNERPLANE, CURVEDPLANE, CURVEDOUTERPLANE, CURVEDINNERPLANE)
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCube ( prim ) {

        const vec3 = this.glMatrix.vec3;

        const flatten = this.util.flatten;

        const list = this.typeList;

        const side = this.directions;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        let sx = prim.dimensions[ 0 ],   // x width
        sy = prim.dimensions[ 1 ],       // y height
        sz = prim.dimensions[ 2 ],       // z depth
        nx = prim.divisions[ 0 ],        // should be x , j
        ny = prim.divisions[ 1 ],        // should be y, i 
        nz = prim.divisions[ 2 ]         // should be z

        //var numVertices = ( nx + 1 ) * ( ny + 1 ) * 2 + ( nx + 1 ) * ( nz + 1 ) * 2 + ( nz + 1 ) * ( ny + 1 ) * 2;

        let positions = [];

        let norms = [];

        let sides = [];

        let vertexIndex = 0;

        switch ( prim.type ) {

            case list.CUBE:

            case list.CUBESPHERE:

                computeSquare( 0, 1, 2, sx, sy, nx, ny,  sz / 2,  1, -1, side.FRONT );  //front

                computeSquare( 0, 1, 2, sx, sy, nx, ny, -sz / 2, -1, -1, side.BACK );   //back

                computeSquare( 2, 1, 0, sz, sy, nz, ny, -sx / 2,  1, -1, side.LEFT );   //left

                computeSquare( 2, 1, 0, sz, sy, nz, ny,  sx / 2, -1, -1, side.RIGHT );  //right

                computeSquare( 0, 2, 1, sx, sz, nx, nz,  sy / 2,  1,  1, side.TOP );    //top

                computeSquare( 0, 2, 1, sx, sz, nx, nz, -sy / 2,  1, -1, side.BOTTOM ); //bottom

                break;

            case list.PLANE:
            case list.CURVEDOUTERPLANE:
            case list.CURVEDINNERPLANE:
            case list.TERRAIN:

                switch( prim.dimensions[ 3 ] ) { // which side, based on cube sides

                    case side.FRONT:
                        computeSquare( 0, 1, 2, sx, sy, nx, ny, sz / 2,  1, -1, side.FRONT );
                    break;

                    case side.BACK:
                        computeSquare( 0, 1, 2, sx, sy, nx, ny, -sz / 2, -1, -1, side.BACK );
                    break;

                    case side.LEFT:
                        computeSquare( 2, 1, 0, sx, sy, nz, ny, -sx / 2,  1, -1, side.LEFT );
                    break;

                    case side.RIGHT:
                        computeSquare( 2, 1, 0, sx, sy, nz, ny,  sx / 2, -1, -1, side.RIGHT ); 
                        break;

                    case side.TOP:
                        computeSquare( 0, 2, 1, sx, sy, nx, nz,  sy / 2,  1,  1, side.TOP ); // ROTATE xy axis
                        break;

                    case side.BOTTOM:
                        computeSquare( 0, 2, 1, sx, -sy, nx, nz, -sy / 2,  1, -1, side.BOTTOM ); // ROTATE xy axis
                        break;

                    default:
                        break;

                }
                break;

            default:
                break;

        }

        // Make an individual Plane.

        function computeSquare( u, v, w, su, sv, nu, nv, pw, flipu, flipv, currSide ) {

            // Create a square, positioning in correct position.

            let vertShift = vertexIndex;

            if( prim.name === 'testPlane') console.log( 'i:' + i + ' j:' + j)

            for( let j = 0; j <= nv; j++ ) {

                for( let i = 0; i <= nu; i++ ) {

                    let vert = positions[ vertexIndex ] = [ 0, 0, 0 ];

                    vert[ u ] = ( -su / 2 + i * su / nu ) * flipu;

                    vert[ v ] = ( -sv/2 + j * sv / nv ) * flipv;

                    vert[ w ] = pw;

                    // heightMap is always the middle, up-facing vector.

                    if ( prim.heightMap ) {

                        // our 'y' for the TOP x/z MAY NEED TO CHANGE FOR EACH SIDE

                        vert[ w ] = prim.heightMap.getPixel( i, j );

                    }

                    // Normals.

                    norms[ vertexIndex ] = [ 0, 0, 0 ];

                    // Texture coords.

                    texCoords.push( i / nu, 1.0 - j / nv );

                    ++vertexIndex;

                }

            }

            // Compute indices and sides.

            let side = [];

            for(let j = 0; j < nv; j++ ) {

                for(let i = 0; i < nu; i++ ) {

                    let n = vertShift + j * ( nu + 1 ) + i;

                    // Indices for entire prim.

                    indices.push( n, n + nu  + 1, n + nu + 2 );

                    indices.push( n, n + nu + 2, n + 1 );

                    // Individual sides.

                    side.push( n, n + nu  + 1, n + nu + 2 );

                    side.push( n, n + nu + 2, n + 1 );

                }

            }

            // Save the indices for this side.

            sides[ currSide ] = side;

        } // end of computeSquare.

        // Round the edges of the CUBE or SPHERECUBE to a sphere.

        if ( ( prim.type === list.CUBE || prim.type === list.CUBESPHERE ) && prim.divisions[ 3 ] !== 0 ) {

            let tmp = [ 0, 0, 0 ];

            // Radius controlled by 4th parameter in divisions

            let radius = prim.divisions[ 3 ];

            let rx = sx / 2.0;

            let ry = sy / 2.0;

            let rz = sz / 2.0;

            for( let i = 0; i < positions.length; i++ ) {

                let pos = positions[ i ];

                let normal = normals[ i ];

                let inner = [ pos[ 0 ], pos[ 1 ], pos[ 2 ] ];

                if ( pos[ 0 ] < -rx + radius ) {

                    inner[ 0 ] = -rx + radius;

                }

                else if ( pos[ 0 ] > rx - radius ) {

                    inner[ 0 ] = rx - radius;

                }

                if ( pos[ 1 ] < -ry + radius ) {

                    inner[ 1 ] = -ry + radius;

                }

                else if ( pos[ 1 ] > ry - radius) {

                    inner[ 1 ] = ry - radius;

                }

                if ( pos[ 2 ] < -rz + radius ) {

                    inner[ 2 ] = -rz + radius;

                }

                else if ( pos[ 2 ] > rz - radius ) {

                    inner[ 2 ] = rz - radius;

                }

                // Re-compute position of moved vertex via normals.

                normal = [ pos[ 0 ], pos[ 1 ], pos[ 2 ] ];

                vec3.sub( normal, normal, inner );

                vec3.normalize( normal, normal );

                //normals[ i ] = normal;

                pos = [ inner[ 0 ], inner[ 1 ], inner[ 2 ] ];

                tmp = [ normal[ 0 ], normal[ 1 ], normal[ 2 ] ];

                vec3.scale( tmp, tmp, radius );

                vec3.add( pos, pos, tmp );

                positions[ i ] = pos;

            }

        } else if ( ( prim.type === list.CURVEDOUTERPLANE || prim.type === list.CURVEDINNERPLANE ) && prim.dimensions[ 4 ] && prim.dimensions[ 4 ] !== 0 ) {

            let dSide = 1;

            switch( prim.dimensions[ 3 ] ) {

                case side.FRONT:
                    if ( prim.type === list.CURVEDINNERPLANE || prim.type == list.INNERPLANE ) dSide = -1;
                    break;

                case side.BACK:
                    if ( prim.type === list.CURVEDOUTERPLANE || prim.type === list.OUTERPLANE ) dSide = -1;
                    break;

                case side.LEFT:
                    if ( prim.type === list.CURVEDOUTERPLANE || prim.type === list.OUTERPLANE ) dSide = -1;
                    break;

                case side.RIGHT:
                    if ( prim.type === list.CURVEDINNERPLANE || prim.type === list.INNERPLANE ) dSide = -1;
                    break;

                case side.TOP:
                    if ( prim.type === list.CURVEDOUTERPLANE || prim.type === list.OUTERPLANE ) dSide = -1;
                    break;

                case side.BOTTOM:
                    if ( prim.type === list.CURVEDINNERPLANE || prim.type === list.INNERPLANE ) dSide = -1
                    break;
            }

            for( let i = 0; i < positions.length; i++ ) {

                switch ( prim.dimensions[ 3 ] ) {

                case side.FRONT:
                    positions[ i ][ 2 ] = dSide * Math.cos( positions[ i ][ 0 ] ) * prim.dimensions[ 4 ];
                    break;

                case side.BACK:
                    positions[ i ][ 2 ] = dSide * Math.cos( positions[ i ][ 0 ] ) * prim.dimensions[ 4 ];
                    break;

                case side.LEFT:
                    positions[ i ][ 0 ] = dSide * Math.cos( positions[ i ][ 2 ] ) * prim.dimensions[ 4 ];
                    break;

                case side.RIGHT:
                    positions[ i ][ 0 ] = dSide * Math.cos( positions[ i ][ 2 ] ) * prim.dimensions[ 4 ];
                    break;

                case side.TOP:
                    positions[ i ][ 1 ] = dSide * Math.cos( positions[ i ][ 0 ] ) * prim.dimensions[ 4 ];
                    break;

                case side.BOTTOM:
                    positions[ i ][ 1 ] = -Math.cos( positions[ i ][ 0 ] ) * prim.dimensions[ 4 ]; // SEEN FROM INSIDE< CORRECT
                    break;

                }

            }

        }

        // Flatten arrays, since we created using 2 dimensions.

        vertices = flatten( positions, false );

        normals = flatten( norms, false );

        // Re-compute normals, which may have changed.

        normals = this.computeNormals( vertices, indices, normals );

        console.log(" IN CUBE NORMALS NOW ARE>...." + normals.length)

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * type PLANE, OUTERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'outside' as defined by the outward vector from Prim.side.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryOuterPlane ( prim ) {

        return this.geometryCube( prim );

    }

    /** 
     * type INNERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'inside', as defined by the outward vectore from Prim.side.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryInnerPlane ( prim ) {

        return this.geometryCube( prim );

    }

    /** 
     * type CURVEDPLANE, CUREVEDOUTERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'outside' as defined by the outward vector from Prim.side.
     * curve radius sets the amount of curve by assigning a radius for a circle.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
     geometryCurvedOuterPlane( prim ) {

        return this.geometryCube( prim );

     }

     /** 
     * type CURVEDINNERPLANE
     * rendered as GL_TRIANGLES.
     * visible from the 'inside', as defined by the outward vectore from Prim.side.
     * curve radius sets the amount of curve by assigning a radius for a circle.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
     geometryCurvedInnerPlane( prim ) {

        return this.geometryCube( prim );

     };

    /** 
     * type TERRAIN.
     * rendered as GL_TRIANGLES.
     * Generate terrain, using a heightMap, from a PLANE object. The 
     * heightMap values are interpolated for each vertex in the PLANE.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryTerrain ( prim ) {

        if ( ! prim.heightMap ) {

            console.log( 'adding heightmap for:' + prim.name );

            prim.heightMap = new Map2d( this.util );

            // roughness 0.2 of 0-1, flatten = 1 of 0-1;

            prim.heightMap[ prim.heightMap.type.DIAMOND ]( prim.divisions[ 0 ], prim.divisions[ 2 ], 0.6, 1 );

            // TODO: SCALE DOWN FOR WATERLINE.

            //prim.heightMap.scale( 165, 165 );

            //prim.heightMap.scale( 25, 25 );

        }

        // NOTE: this can make the heightmap in any orientation.

        return this.geometryOuterPlane( prim );

    };

    /** 
     * Create terrain with hexagon grid with each grid element independently addressible.
     * @link http://catlikecoding.com/unity/tutorials/hex-map-1/
     */
    geometryHexTerrain ( prim ) { 

    }

    /** 
     * Create terrain with octagon grid, with each grid element independently addressible.
     */
    geometryOctTerrain ( prim ) {

    }

    /** 
     * type CUBESPHERE.
     * rendered as WebGL TRIANGLES.
     * http://catlikecoding.com/unity/tutorials/rounded-cube/
     * http://mathproofs.blogspot.com.au/2005/07/mapping-cube-to-sphere.html
     * 
     * just sets the curveRadius to 1/2 of the prim size.
     * prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryCubeSphere ( prim ) {

        // force the rounding radii to a circle

        prim.divisions[ 3 ] = prim.dimensions[ 0 ] / 2;

           // NOTE: if there is a heightmap, return, then 'pincusion' out the points.

        return this.geometryCube( prim );

    }

    /** 
     * Icosphere, adapted from Unity 3d tutorial.
     * @link https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * @link https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/src/ProceduralIcoSphereGenerator.cpp?at=default&fileviewer=file-view-default
     * http://donhavey.com/blog/tutorials/tutorial-3-the-icosahedron-sphere/
     * http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
     * https://github.com/glo-js/primitive-icosphere
     * https://github.com/hughsk/icosphere
     * http://mft-dev.dk/uv-mapping-sphere/
     * octahedron sphere generation
     * https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * https://experilous.com/1/blog/post/procedural-planet-generation
     * https://experilous.com/1/planet-generator/2014-09-28/planet-generator.js
     * https://fossies.org/dox/eigen-3.2.10/icosphere_8cpp_source.html
     * 
     * divisions max: ~60
     * @param {Object} prim the primitive needing geometry.
     * @param {Boolean} noSphere if false, make an icosohedron.
     */
    geometryIcoSphere ( prim ) {

        let TWO_PI = this.TWO_PI; // connect scope to internal functions.

        const vec3 = this.glMatrix.vec3;

        const flatten = this.util.flatten;

        const list = this.typeList;

        const side = this.directions;

        // Size and divisions.

        let subdivisions;

        subdivisions = prim.divisions[ 0 ];

        if ( prim.type === list.ICOSOHEDRON ) {

            subdivisions = 2;

        } else {

            subdivisions = prim.divisions[ 0 ]

        }

        let radius = prim.dimensions[ 0 ] * 0.5;

        let resolution = subdivisions;

        // Default vectors.

        let getStdVecs = this.getStdVecs.bind( this );

        let directions = [
            side.LEFT,
            side.BACK,
            side.RIGHT,
            side.FORWARD,
        ];

        // Allocate memory, since we may have to access out-of-range vertices, indices.

        let geo = prim.geometry;

        // TODO: halve index length if making a dome.

        let vertices = new Array ( ( resolution + 1 ) * ( resolution + 1 ) * 4 - (resolution * 2 - 1) * 3 ),
        indices  = new Array( (1 << ( subdivisions * 2 + 3) ) * 3 ),
        texCoords = new Array( vertices.length ),
        normals = new Array( vertices.length ),
        tangents = new Array( vertices.length );

        // Initialize lots of default variables.

        let v = 0, vBottom = 0, t = 0, i, d, progress, from, to;

        for ( i = 0; i < 4; i++ ) {

            //vertices[ v++ ] = getStdVecs('down');
            vertices[ v++ ] = getStdVecs( side.DOWN );

        }

        for ( i = 1; i <= resolution; i++ ) {

            progress = i / resolution;

            to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.DOWN ), getStdVecs( side.FORWARD ), progress );

            vertices[ v++ ] = vec3.copy( [ 0, 0, 0 ], to );

            for ( d = 0; d < 4; d++ ) {

                from = vec3.copy( [ 0, 0, 0 ], to );

                to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.DOWN ), getStdVecs( directions[ d ] ), progress );

                t = createLowerStrip( i, v, vBottom, t, indices );

                v = createVertexLine( from, to, i, v, vertices );

                vBottom += i > 1 ? ( i - 1 ) : 1;

            }

            vBottom = v - 1 - i * 4;

        }

        for ( i = resolution - 1; i >= 1; i-- ) {

                progress = i / resolution;

                to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.UP ), getStdVecs( side.FORWARD ), progress );

                vertices[ v++ ] = vec3.copy( [ 0, 0, 0 ], to );

                for ( d = 0; d < 4; d++) {

                    from = vec3.copy( [ 0, 0, 0 ], to );

                    to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.UP ), getStdVecs( directions[ d ] ), progress );

                    t = createUpperStrip( i, v, vBottom, t, indices );

                    v = createVertexLine( from, to, i, v, vertices );

                    vBottom += i + 1;

                }

                vBottom = v - 1 - i * 4;

        }

        for ( i = 0; i < 4; i++ ) {

            indices[ t++ ] = vBottom;

            indices[ t++ ] = v;

            indices[ t++ ] = ++vBottom;

            vertices[ v++ ] = getStdVecs( side.UP );

        }

        // Create our Normals, and set icosphere to unit size.

        for ( i = 0; i < vertices.length; i++ ) {

            // Toggle icosphere with icosohedron.


            if ( prim.type !== list.OCTAHEDRON ) {

                vertices[i] = vec3.normalize( [ 0, 0, 0 ], vertices[ i ] );

            }

            normals[i] = vec3.copy( [ 0, 0, 0 ], vertices[ i ] );

        }

        // Texture coords.

        createUV( vertices, texCoords );

        // Tangents.

        createTangents( vertices, tangents );

        if ( radius != 1 ) {

            for ( i = 0; i < vertices.length; i++ ) {

                    vertices[ i ][ 0 ] *= radius;

                    vertices[ i ][ 1 ] *= prim.dimensions[ 1 ] / 2; //radius;

                    vertices[ i ][ 2 ] *= prim.dimensions[ 2 ] / 2; //radius;

            }

        }

        // Flatten the data arrays.

        vertices = flatten( vertices, false );

        texCoords = flatten( texCoords, false );

        normals = flatten(normals, false );

        tangents = flatten(tangents, false );

        // Helper functions.

        // Create UV texCoords.

        function createUV ( vertices, uv ) {

            let previousX = 1;

            for ( i = 0; i < vertices.length; i++ ) {

                v = vertices[ i ];

                if ( v[ 0 ] == previousX ) {  // was v.x

                    uv[ i - 1 ][ 0 ] = 1;      // was v.x

                }

                previousX = v[ 0 ];           // was v.x

                let textureCoordinates = [ 0, 0 ];

                textureCoordinates[ 0 ] = Math.atan2( v[ 0 ], v[ 2 ] ) / ( -TWO_PI );  // was v.x, v.z

                if ( textureCoordinates[ 0 ] < 0 ) {   // was textureCoordinates.x

                    textureCoordinates[ 0 ] += 1;    // was textureCoordinates

                }

                textureCoordinates[ 1 ] = Math.asin( v[ 1 ] ) / Math.PI + 0.5;  // was v.y, textureCoordinates.y

 
                uv[ i ] = textureCoordinates;
            }

            uv[ vertices.length - 4 ][ 0 ] = 0.125;

            uv[ 0 ][ 0 ] = 0.125; // was v.x

            uv[ vertices.length - 3 ][ 0 ] = 0.375

            uv[ 1 ][ 0 ] = 0.375; // was v.x

            uv[ vertices.length - 2][ 0 ] = 0.625

            uv[ 2 ][ 0 ] = 0.625; // was v.x

            uv[vertices.length - 1][ 0 ] = 0.875

            uv[ 3 ][ 0 ] = 0.875; // was v.x

            // Our engine wraps opposite, so reverse first coordinate (can't do it until we do all coordinates).

            for ( i = 0; i < texCoords.length; i++ ) {

                texCoords[ i ][ 0 ] = 1.0 - texCoords[ i ][ 0 ];

            }

        }

        function createTangents (vertices, tangents) {

            for ( i = 0; i < vertices.Length; i++ ) {

                v = vertices[ i ];

                v[ 1 ] = 0;

                v = vec3.normalize( [ 0, 0, 0 ], v );

                tangent = [ 0, 0, 0, 0 ];

                tangent[ 0 ] = -v[ 2 ];

                tangent[ 1 ] = 0;

                tangent[ 2 ] = v[ 0 ];

                tangent[ 3 ] = -1;

                tangents[ i ] = tangent;

            }

            tangents[ vertices.length - 4 ] = [ -1, 0, 1 ];

            tangents[ 0 ] = [ -1, 0, -1 ];

            tangents[ vertices.length - 3 ] = [ 1, 0, -1 ];

            tangents[ 1 ] = [ 1, 0, -1 ];

            tangents[ vertices.length - 2 ] = [ 1, 0, 1 ];

            tangents[ 2 ] = [ 1, 0, 1 ];

            tangents[ vertices.length - 1 ] = [ -1, 0, 1 ];

            tangents[ 3 ] = [ -1, 0, 1 ];

            for ( i = 0; i < 4; i++ ) {

                tangents[ vertices.length - 1 - i ][ 3 ] = tangents[ i ][ 3 ] = -1;

            }
        }

        function createVertexLine ( from, to, steps, v, vertices ) {

            for ( let i = 1; i <= steps; i++ ) {

                //console.log("Vec3 " + v + " IS A:" + vec3.lerp( [ 0, 0, 0 ], from, to, i / steps ))

                vertices[ v++ ] = vec3.lerp( [ 0, 0, 0 ], from, to, i / steps );

            }

            return v;

        }

        function createLowerStrip ( steps, vTop, vBottom, t, triangles ) {

            for ( let i = 1; i < steps; i++ ) {

                triangles[t++] = vBottom;
                triangles[t++] = vTop - 1;
                triangles[t++] = vTop;

                triangles[t++] = vBottom++;
                triangles[t++] = vTop++;
                triangles[t++] = vBottom;

            }

            triangles[t++] = vBottom;
            triangles[t++] = vTop - 1;
            triangles[t++] = vTop;

            return t;

        }

        function createUpperStrip ( steps, vTop, vBottom, t, triangles ) {
               triangles[t++] = vBottom;
            triangles[t++] = vTop - 1;   
            triangles[t++] = ++vBottom;

            for ( let i = 1; i <= steps; i++ ) {

                triangles[t++] = vTop - 1;
                triangles[t++] = vTop;
                triangles[t++] = vBottom;

                triangles[t++] = vBottom;
                triangles[t++] = vTop++;
                triangles[t++] = ++vBottom;
            }

            return t;

        }

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

        //return this.createGLBuffers( prim.geometry );

    }

    /** 
     * type ICOSOHEDRON.
     * create a icosohedron.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryIcosohedron ( prim ) {

        return this.geometryIcoSphere( prim, false );

    }

    /** 
     * type PRISM.
     * create a closed prism type shape.
     */
    geometryPrism( prim ) {

        // TODO code needs to be written.

    }

    /** 
     * type PYRAMID.
     * create a closed pyramid shape, half of an icosohedron.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryPyramid ( prim ) {

        // TODO: return upper half of icosohedron, and close. (possibly by setting 
        // bottom half to a comm y value)

    }

    /** 
     * type ICODOME.
     * create a half-sphere from an icosphere.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryIcoDome( prim ) {

    }

    /** 
     * type TOPICODOME.
     * create a half-sphere from an icosphere.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryTopIcoDome ( prim ) {

    }

    /** 
     * type SKYICODOME.
     * create a half-sphere with texture only visible from the inside.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometrySkyIcoDome ( prim ) {

        prim.visibleFrom = this.INSIDE;

    }

    /** 
     * type BOTTOMICODOME.
     * create a bowl shape from the lower half of an icosphere.
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryBottomIcoDome ( prim ) {

    }


    /** 
     * Create an octahedron
     * Note: the icosphere algorith returns an octahedron if we don't "inflate" 
     * the object's vertices by normalizing.
     * 
     * Additional links:
     * @link https://github.com/nickdesaulniers/prims/blob/master/octahedron.js
     * @link http://paulbourke.net/geometry/platonic/
     * @link https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryOctahedron ( prim ) {

        return this.geometryIcoSphere( prim );

    }

    /** 
     * Dodecahedron
     * @link https://github.com/prideout/par/blob/master/par_shapes.h
     * @link https://github.com/nickdesaulniers/prims/blob/master/dodecahedron.js
     * @link http://vorg.github.io/pex/docs/pex-gen/Dodecahedron.html
     */
    geometryDodecahedron ( prim ) {

        const vec3 = this.glMatrix.vec3;

        const flatten = this.util.flatten;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays.

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        let w = prim.dimensions[ 0 ],
        h = prim.dimensions[ 1 ],
        d = prim.dimensions[ 2 ];

        let r = prim.divisions[ 0 ] || 0.5;

        let phi = ( 1 + Math.sqrt( 5 ) ) / 2;
        let a = 0.5;
        let b = 0.5 * 1 / phi;
        let c = 0.5 * ( 2 - phi );

        let vtx = [

            [ c,  0,  a ],    // 0
            [-c,  0,  a ],    // 1
            [-b,  b,  b ],    // 2
            [ 0,  a,  c ],    // 3

            [ b,  b,  b ],    // 4  + 1 = 5
            [ b, -b,  b ],    // 5  + 1 = 6
            [ 0, -a,  c ],    // 6  + 1 = 7
            [-b, -b,  b ],    // 7  + 1 = 8

            [ c,  0, -a ],    // 8  + 2 = 10
            [-c,  0, -a ],    // 9  + 2 = 12
            [-b, -b, -b ],    // 10 + 2 = 13
            [ 0, -a, -c ],    // 11 + 2 = 14

            [ b, -b, -b ],    // 12 + 3 = 16
            [ b,  b, -b ],    // 13 + 3 = 17
            [ 0,  a, -c ],    // 14 + 3 = 18
            [-b,  b, -b ],    // 15 + 3 = 19

            [ a,  c,  0 ],    // 16 + 4 = 21
            [-a,  c,  0 ],    // 17 + 4 = 22
            [-a, -c,  0 ],    // 18 + 4 = 23
            [ a, -c,  0 ]     // 19 + 4 = 24

        ];

      //vertices = vertices.map(function(v) { return v.normalize().scale(r); })

      let faces = [
            [  4,  3,  2,  1,  0 ],
            [  7,  6,  5,  0,  1 ],
            [ 12, 11, 10,  9,  8 ],
            [ 15, 14, 13,  8,  9 ],
            [ 14,  3,  4, 16, 13 ],
            [  3, 14, 15, 17,  2 ],
            [ 11,  6,  7, 18, 10 ],
            [  6, 11, 12, 19,  5 ],
            [  4,  0,  5, 19, 16 ],
            [ 12,  8, 13, 16, 19 ],
            [ 15,  9, 10, 18, 17 ],
            [  7,  1,  2, 17, 18 ]
        ];

        if ( prim.applyTexToFace ) {

            for ( let i = 0; i < faces.length; i++ ) {

                let len = vertices.length;

                // The fan is a flat polygon, constructed with face points, shared vertices.

                let fan = this.computeFan ( vtx, faces[ i ] );

                vertices = vertices.concat( fan.vertices );

                // Update the indices to reflect concatenation.

                for ( let i = 0; i < fan.indices.length; i++ ) {

                    fan.indices[ i ] += len;

                }

                indices = indices.concat( fan.indices );

                texCoords = texCoords.concat( fan.texCoords );

                normals = normals.concat( fan.normals );

            }

        } else {

            let computeSphereCoords = this.computeSphereCoords;

            for ( let i = 0; i < faces.length; i++ ) {

                let vv = faces[ i ]; // indices to vertices

                let vvv = []; // saved vertices
            
                let lenv = vv.length;

                for ( let j = 0; j < vv.length; j++ ) {

                    vvv.push( vtx[ vv[ j ] ] );

                }

                let center = this.computeCentroid( vvv );

                for ( let i = 1; i <= lenv; i++ ) {

                    let p1 = i - 1;

                    let p2 = i;

                    if ( i === lenv ) {

                        p1 = p2 - 1;

                        p2 = 0;

                    }

                    let v1 = vvv[ p1 ];

                    let v2 = vvv[ p2 ];

                    vertices.push( 
                        vec3.copy( [ 0, 0, 0 ], v1 ), 
                        vec3.copy( [ 0, 0, 0 ], v2 ),
                        vec3.copy( [ 0, 0, 0 ], center ) );

                    let cLen = vertices.length - 1;

                    indices.push( cLen - 2, cLen - 1, cLen );

                    normals.push( 
                        vec3.copy( [ 0, 0, 0 ], v1 ), 
                        vec3.copy( [ 0, 0, 0 ], v2 ),
                        vec3.copy( [ 0, 0, 0 ], center ) );

                    texCoords.push(

                        computeSphereCoords( v1 ),

                        computeSphereCoords( v2 ),

                        computeSphereCoords( center )

                    );


                } // end of 'for' loop.

            } // end of 'faces' loop.

        } // end of wrap whole object with one texture.

        for ( let i = 0; i < vertices.length; i++ ) {

            let vv = vertices[ i ];

            vv[ 0 ] *= w;

            vv[ 1 ] *= h;

            vv[ 2 ] *= d;

        }

        // Flatten.

        vertices = flatten( vertices );

        texCoords = flatten( texCoords );

        normals = flatten( normals );

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * Torus object
     * @link https://blogoben.wordpress.com/2011/10/26/webgl-basics-7-colored-torus/
     * @link http://apparat-engine.blogspot.com/2013/04/procedural-meshes-torus.html
     * Creates a 3D torus in the XY plane, returns the data in a new object composed of
     *   several Float32Array objects named 'vertices' and 'colors', according to
     *   the following parameters:
     * r:  big radius
     * sr: section radius
     * n:  number of faces
     * sn: number of faces on section
     * k:  factor between 0 and 1 defining the space between strips of the torus
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryTorus ( prim ) {

        const vec3 = this.glMatrix.vec3;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        let radius = prim.dimensions[ 0 ] / 2; // x coordinate, width of torus in x direction

        let ringRadius = prim.dimensions[ 2 ] / 2; // ringradius

        let rings = prim.divisions[ 0 ];

        let sides = prim.divisions[ 1 ];

        // typical: radius = 0.5, ringRadius = 0.25, sides = 36, rings = 24;

        let vertsPerRow = sides + 1;

        let vertsPerColumn = rings + 1;

        let ringStride = this.TWO_PI / rings;

        let torusStride = this.TWO_PI / sides;

        let theta = 0, phi = 0, x, y, z;

        for ( let vertColumn = 0; vertColumn < vertsPerColumn; vertColumn++ ) {
            
            theta = ringStride * vertColumn;

            for ( let horizRow = 0; horizRow < vertsPerRow; horizRow++ ) {
          
                phi = torusStride * horizRow;

                // Position.

                x = Math.cos( theta ) * ( radius + ringRadius * Math.cos( phi ) );

                y = Math.sin( theta ) * ( radius + ringRadius * Math.cos( phi ) );

                z = ringRadius * Math.sin(phi);

                vertices.push( x, y, z ); // NOTE: x, z, y gives a horizontal torus

                let norm = vec3.normalize( [ 0, 0, 0 ], [ x, y, z ] );

                normals.push( norm[ 0 ], norm[ 1 ], norm[ 2 ] );

                let u = horizRow / vertsPerRow;

                let v = vertColumn / vertsPerColumn;

                texCoords.push( u, v );

            }

        }

       // let numIndices = sides * rings * 6;

        for ( let vertColumn = 0; vertColumn < rings; vertColumn++ ) {

            for ( let horizRow = 0; horizRow < sides; horizRow++ ) {

                let lt = ( horizRow + vertColumn * ( vertsPerRow) );

                let rt = ( ( horizRow + 1 ) + vertColumn * ( vertsPerRow ) );

                let lb = ( horizRow + ( vertColumn + 1) * ( vertsPerRow ) );

                let rb = ( ( horizRow + 1 ) + ( vertColumn + 1 ) * ( vertsPerRow ) );

                indices.push( lb, rb, rt, lb, rt, lt );

                // NOTE: wrap backwards to see inside of torus (tunnel?).

            }

        } 

        ///////////////////////////
        this.computeSubdivide( vertices, indices );
        //////////////////////////

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.addBufferData( prim.geometry, vertices, indices, normals, texCoords, tangents );

    }

    /** 
     * a Torus that doesn't close
     */
    geometrySpring ( prim ) {


    }

    /** 
     * Generic 3d shape (e.g. Collada model).
     * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
     * @link https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryMesh ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = [], indices  = [], normals = [], texCoords = [], tangents = [];

        // Vertices.

        // Indices.

        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords, tangents );

        // Color array is pre-created, or gets a default when WebGL buffers are created.

        // Return the buffer.

        return this.createGLBuffers( prim.geometry );

    }

    /*
     * ---------------------------------------
     * PRIMS
     * ---------------------------------------
     */

    /** 
     * Create an standard 3d object.
     * @param {String} name assigned name of object (not necessarily unique).
     * @param {Number} scale size relative to unit vector (1,1,1).
     * @param {GLMatrix.vec3} position location of center of object.
     * @param {GLMatrix.vec3} acceleration movement vector (acceleration) of object.
     * @param {GLMatrix.vec3} rotation rotation vector (spin) around center of object.
     * @param {String} textureImage the path to an image used to create a texture.
     * @param {Array|GLMatrix.vec4} color the default color(s) of the object.
     * @param {Boolean} applyTexToFace if true, apply texture to each face, else apply texture to 
     * the entire object.
     */
    createPrim ( type, name = 'unknown', 
        dimensions = this.vec7( 1, 1, 1, 0, 0, 0, 0 ), 
        divisions = this.vec6( 1, 1, 1, 0, 0, 0 ), 
        position = this.glMatrix.vec3.create(), acceleration = this.glMatrix.vec3.create(), 
        rotation = this.glMatrix.vec3.create(), angular = this.glMatrix.vec3.create(), 
        textureImages, color, applyTexToFace = false ) {

        const vec3 = this.glMatrix.vec3;

        const mat4 = this.glMatrix.mat4;

        if ( ! this.checkType( type ) ) {

            console.error( 'unsupported Prim type:' + type );

            return null;
        }

        let prim = {};

        prim.id = this.setId();

        prim.name = name;

        prim.type = type;

        prim.dimensions = dimensions || this.vec7( 1, 1, 1, 0, 0, 0, 0 );

        prim.divisions = divisions || this.vec6( 1, 1, 1, 0, 0, 0 );

        prim.position = position || vec3.create();

        prim.acceleration = acceleration || vec3.create();

        // The absolute .rotation object includes rotation on x, y, z axis

        prim.rotation = rotation || vec3.create();

        // The acceleration object indicates velocity on angular motion in x, y, z

        prim.angular = angular || vec3.create();

        // The orbit defines a center that the object orbits around, and orbital velocity.

        prim.orbitRadius = 0.0;

        prim.orbitAngular = 0.0;

        // Lighting and materials.

        prim.material = {};

        prim.light = {};

        // Visible from outside (counterclockwise) or inside (clockwise).

        prim.visibleFrom = this.OUTSIDE;

        prim.applyTexToFace = applyTexToFace;

        // Geometry factory function.

        prim.geometry = this.createGeoObj();

        prim.geometry.type = type;

        prim.geometry = this.createGeoObj();

        prim.geometry = this[ type ]( prim, color );

        prim.geometry = this.createGLBuffers( prim.geometry );

        // Compute the bounding box.

        prim.boundingBox = this.computeBoundingBox( prim.geometry.vertices.data );

        // Internal functions.

        /** 
         * Set the model-view matrix
         */
        prim.setMV = ( mvMatrix ) => {

            let p = prim;

            mat4.identity( mvMatrix );

            let z = -5;

            // Translate.

            vec3.add( p.position, p.position, p.acceleration );

            mat4.translate( mvMatrix, mvMatrix, [ p.position[ 0 ], p.position[ 1 ], z + p.position[ 2 ] ] );

            // If orbiting, set orbit.

            // Rotate.

            // TODO: rotate first for rotation.
            // TODO: rotate second for orbiting.
            // TODO: rotate (internal), translate, rotate (orbit)

            vec3.add( p.rotation, p.rotation, p.angular );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 0 ], [ 1, 0, 0 ] );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 1 ], [ 0, 1, 0 ] );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 2 ], [ 0, 0, 1 ] );

            return mvMatrix;

        };

        /** 
         * Set a material for a prim.
         * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
         * didn't use chroma (but could)
         * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
         */
        prim.setMaterial = ( colorMult = 1, diffuse = [ 0, 0, 0 ], specular = [ 1, 1, 1, 1 ], shininess = 250, specularFactor = 1 ) => {

            let p = prim;

            p.material.colorMult = colorMult;

            p.diffuse = diffuse;

            p.specular = specular;

            p.shininess = shininess;

            p.specularFactor = specularFactor;

        };

        /** 
         * Set the Prim as a glowing object. Global lights 
         * are handled by the World.
         */
        prim.setLight = ( direction = [ 1, 1, 1 ], color = [ 255, 255, 255 ], prim = this ) => {

            let p = prim;

            p.light.direction = direction;

            p.light.color = color;

        };

        // Shared with factory functions. Normally, we used matrix transforms to accomplish this.

        prim.scaleVertices = ( scale ) => { this.scale ( scale, prim.geometry.vertices ); };

        prim.moveVertices = ( pos ) => { this.computeMove( scale, prim.geometry.vertices ); };

        prim.morphVertices = ( newGeometry, easing ) => { this.morph( newGeometry, easing, prim.geometry ); };

        // Waypoints for scripted motion or timelines.

        prim.waypoints = [];

        // Store multiple textures for one Prim.

        prim.textures = [];

        // Store multiple sounds for one Prim.

        prim.audio = [];

        // Store multiple videos for one Prim.

        prim.video = [];

        // Multiple textures per Prim. Rendering defines how textures for each Prim type are used.

        for ( let i = 0; i < textureImages.length; i++ ) {

            this.loadTexture.load( textureImages[ i ], prim );

        }

        prim.scale = 1.0;

        // Define Prim material (only one material type at a time per Prim ).

        prim.setMaterial();

        //prim.setLight();

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

        prim.renderId = -1; // NOT ASSIGNED. TODO: Assign a renderer to each Prim.

        // Push into our list of all Prims.

        this.objs.push( prim );

        // TODO: Prim readout to console.

        this.primReadout( prim ); // TODO: DEBUG!!!!!!!!!!!!!!!!!!!!!!

        return prim;

    }

} // End of class.

// We put this here because of JSDoc(!).

export default Prim;
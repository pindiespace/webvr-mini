import Map2d from './map2d';
import Map3d from './map3d';
import Mesh from  './mesh';
import ModelPool from './model-pool';

'use strict'

class GeometryPool {
 
    /** 
     * @class GeometryPool
     * create coordinate geometry for vertices, textures, normals, tangents, either 
     * from a file or proceedurally.
     *
     * geo primitive examples
     * https://github.com/nickdesaulniers/prims
     * https://github.com/mhintz/platonic/tree/master/src
     * https://github.com/azmobi2/html5-webgl-geometry-shapes/blob/master/webgl_geometry_shapes.html
     * 
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
     * Lots of Webgl tricks!
     * https://acko.net
     * http://acko.net/blog/on-webgl/
     * https://gamedevdaily.io/four-ways-to-create-a-mesh-for-a-sphere-d7956b825db4#.lkbq2omq5
     *
     * ---------------------------------------------------------------
     * Code Writing Conventions
     * 1. vertices = flattened array, final vertex data for computation or rendering
     * 2. vtx      = any initialization Vertex object (e.g. for complex polyhedra)
     * 3. v, vv    = local vertex or vertex array.
     * 4. when using glMatrix functions, do 'in place' conversion first. 
     *    If not practical, return the result. If not practical, use an 
     *    object literal:
     *    - vec3.sub( resultPt, a, b );
     *    - resultPt = vec3.sub( resultPt, a, b );
     *    - resultPt = vec3.sub( [ 0, 0, 0 ], a, b );
     * ---------------------------------------------------------------
     * @constructor
     * @param {Boolean} init if true, initialize in the constructor.
     * @param {Util} util the utility class.
     * @param {glMatrix} the glMatrix class.
     * @param {WebGL} the webGL class.
     */
    constructor ( init, util, glMatrix, webgl, modelPool ) {

        console.log( 'in GeometryPool class' );

        this.util = util,

        this.glMatrix = glMatrix,

        this.webgl = webgl,

        this.modelPool = modelPool,

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

            PRISM: 'geometryPrism',              // 3 sides

            ICOSOHEDRON: 'geometryIcosohedron',  // 8 sides

            PYRAMID: 'geometryPyramid',

            REGULARTETRAHEDRON: 'geometryRegularTetrahedron', // 2 joined 4-sided pyramids

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

        // Visible from inside or outside, or not visible.

        this.OUTSIDE = 100,

        this.INSIDE = 101,

        this.INVISIBLE = 102;

        // Math shorthand.

        this.TWO_PI = Math.PI * 2;


        if ( init ) {

            // do something

        }

    }

    /** 
     * Return a default GeometryPool object.
     * @param {glMatrix.vec3[]} vertices the vertex data.
     * @param {Array} indices index data for vertices.
     * @param {glMatrix.vec2[]} texCoords the 2d texture coordinate data.
     * @param {glMatrix.vec3[]} normals normals for the vertices.
     * @param {glMatrix.vec3[]} tangents tangent data for vertices.
     */
    default ( vertices = [], indices = [], texCoords = [], normals = [], tangents = [] ) {

        return {

            vertices: vertices, 

            indices: indices, 

            normals: normals, 

            texCoords: texCoords, 

            tangents: tangents 

        };

    }

    /** 
     * See if supplied Prim type is supported via a method. 
     * Individual Prim factory methods may do more detailed checking.
     * @param {String} type the Prim type.
     * @returns {Boolean} if supported, return true, else false.
     */
    checkType ( type ) {

        // Confirm we have a factory function for this type.

        if ( this[ type ] instanceof Function ) {

            return true;

        }

        return false;

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
     * @param {String} type the (flattened) vector type.
     * @returns {Array} a directional array.
    */
    getStdVecs ( type ) {

        const dir = this.directions;

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
     * @param {Number} a the x value of the vector.
     * @param {Number} b the y value of the vector.
     * @param {Number} c the z value of the vector.
     * @param {Number} d for CONE, truncation of the CONE point, otherwise controls 
     * the start and end of a Caps on CYLINDER and CONE Prims, or flattening of the 
     * top and bottom of SPHERE Prims. This ensures the texture stretchs across a Prim 
     * made up of CYLINER or CONE with Caps at the end.
     */
    vec5 ( a, b, c, d = 0, e = 0 ) {

        return [ a, b, c, d, e ];

    }

    /* 
     * ---------------------------------------
     * NORMAL, INDEX, VERTEX, TRIANGLE, QUAD CALCULATIONS
     * ---------------------------------------
     */

    /**
     * Compute whether point is in a triangle of 3 coordinates, wrapped 
     * clockwise (p0, p1, p2)
     * @link http://blackpawn.com/texts/pointinpoly/
     * @param {glMatrix.vec3} p the point to test.
     * @param {glMatrix.vec3} p0 first clockwise vertex of triangle.
     * @param {glMatrix.vec3} p1 second clockwise vertex of triangle.
     * @param {glMatrix.vec3} p2 third clockwise vertex of triangle.
     * @returns {Boolean} if point in triangle, return true, else false.
     */
    computePointInTriangle ( p, p0, p1, p2 ) {

        const uv = this.computeBaryCentric( p, p0, p1, p2 );

        // Check if point is in triangle.

        return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

    }

    /** 
     * Compute the angle between two 2d coordinates.
     * @param {glMatrix.vec3} a the first vertex in the angle.
     * @param {glMatrix.vec3} b the second vertex in the angle.
     * @returns {Number} the angle between the vertices, in radians.
     */
    computeAngle2d ( a, b , whichAngle ) {

        let d1, d2;

        switch ( whichAngle ) {

            case 0: // xz

                d1 = b[ 0 ] - a[ 0 ];

                d2 = b[ 2 ] - a [ 2 ];

                break;

            case 1: // xy

                d1 = b[ 0 ] - a[ 0 ];

                d2 = b[ 1 ] - a[ 1 ];

                break;

            case 2: // yz

                d1 = b[ 1 ] - a[ 1 ];

                d2 = b[ 2 ] - a[ 2 ];

                break;

            default:

                console.error( 'invalid 2d angle choice, ' + whichAngle );

                break;

        }

        return Math.atan2( d2, d1 );

    }

    /** 
     * Compute the angle between three 3d coordinates defining a plane.
     * @param {glMatrix.vec3} a first vertex in angle.
     * @param {glMatrix.vec3} b second axis vertex in angle.
     * @param {glMatrix.vec3} c third vertex defining the angle.
     * @returns {Number} the angle between the vertices, in radians.
     */
    computeAngle3d ( a, b, c ) {

        const ab = [ b[ 0 ] - a[ 0 ], b[ 1 ] - a[ 1 ], b[ 2 ] - a[ 2 ] ];

        const bc = [ c[ 0 ] - b[ 0 ], c[ 1 ] - b[ 1 ], c[ 2 ] - b[ 2 ] ];

        const abDist = Math.sqrt( ab[ 0 ] * ab[ 0 ] + ab[ 1 ] * ab[ 1 ] + ab[ 2 ] * ab[ 2 ] );

        const bcDist = Math.sqrt( bc[ 0 ] * bc[ 0 ] + bc[ 1 ] * bc[ 1 ] + bc[ 2 ] * bc[ 2 ] );

        const abNorm = [ ab[ 0 ] / abDist, ab[ 1 ] / abDist, ab[ 2 ] / abDist ];

        const bcNorm = [ bc[ 0 ] / bcDist, bc[ 1 ] / bcDist, bc[ 2 ] / bcDist ];

        return Math.acos( abNorm[ 0 ] * bcNorm[ 0 ] + abNorm[ 1 ] * bcNorm[ 1 ] + abNorm[ 2 ] * bcNorm[ 2 ] );

    }

    /**
     * Find the center between any set of 3d coordinates.
     * @param {glMatrix.vec3[]} vertices an array of xyz coordinates.
     * @returns {glMatrix.vec3} the center point.
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
     * @param {glMatrix.vec3[]} vertices a list of 3d vertices.
     * @param {glMatrix.vec3} the centroid Point.
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
     * to a triangle defined by three coordinates.
     * @param {glMatrix.vec3} p the point to test.
     * @param {glMatrix.vec3} p0 first clockwise vertex of triangle.
     * @param {glMatrix.vec3} p1 second clockwise vertex of triangle.
     * @param {glMatrix.vec3} p2 third clockwise vertex of triangle.
     * @returns {glMatrix.vec2} uv coordinates of Point relative to triangle.
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
     * Bounding box for a set of 3d coordinates. This object is NO the same 
     * as a standard Cube, since each side is a quad without 
     * further divisions.
     * @param {glMatrix.vec3[]} vertices a list of coordinates to be enclosed in the bounding box.
     * @returns{Prim.BoundingBox} a BoundingBox object.
     */
    computeBoundingBox( vertices ) {

        let vec3 = this.glMatrix.vec3;

        let box = {}; 

        let tx = 0, ty = 0, tz = 0, bx = 0, by = 0, bz = 0;

        // Find minimum topLeft and maximum bottomRight coordinates defining a cube.

        for( let i = 0; i < vertices.length; i += 3 ) {

            let v0 = vertices[ i ],

            v1 = vertices[ i + 1 ],

            v2 = vertices[ i + 2 ];

            tx = Math.min( tx, v0 ),

            ty = Math.min( ty, v1 ),

            tz = Math.min( tz, v2 ),

            bx = Math.max( bx, v0 ),

            by = Math.max( by, v1 ),

            bz = Math.max( bz, v2 );

            //console.log("BX:"+ bx + " V[0]:" + v[0])

        }

        // Two quads, vary by z values only, clockwise.

        box.vertices = [

            // Front face

            tx, ty, bz, bx, ty, bz,

            bx, by, bz, tx, by, bz,

            // Back face

            tx, ty, tz, tx, by, tz,

            bx, by, tz, bx, ty, tz,

            // Top face

            tx, by, tz, tx, by, bz,

            bx, by, bz, bx, by, tz,

            // Bottom face

            tx, ty, tz, bx, ty, tz,

            bx, ty, bz, tx, ty, bz,

             // Right face

            bx, ty, tz, bx, by, tz,

            bx, by, bz, bx, ty, bz,

            // Left face

            tx, ty, tz, tx, ty, bz,

            tx, by, bz, tx, by, tz

        ];

        box.indices = [ 

            0,  1,  2,      0,  2,  3,    // front

            4,  5,  6,      4,  6,  7,    // back

            8,  9,  10,     8,  10, 11,   // top

            12, 13, 14,     12, 14, 15,   // bottom

            16, 17, 18,     16, 18, 19,   // right

            20, 21, 22,     20, 22, 23    // left

        ];


        box.topLeft = [ tx, ty, tz ];

        box.bottomRight = [ bx, by, bz ];

        box.dimensions = vec3.subtract( [ 0, 0, 0 ], box.bottomRight, box.topLeft );

        // if we draw it, add more here.

        return box;

    }

    /** 
     * Compute the bounding sphere enclosed by a bounding box
     */
    computeBoundingSphere( boundingBox ) {

        let sphere = {};

        const topLeft = boundingBox.topLeft;

        const bottomRight = boundingBox.bottomRight;

        let xSpan = Math.abs( bottomRight[ 0 ] - topLeft[ 0 ] );

        let ySpan = Math.abs( bottomRight[ 1 ] - topLeft[ 1 ] );

        let zSpan = Math.abs( bottomRight[ 2 ] - topLeft[ 2 ] );

        let radius = Math.max( xSpan, ySpan, zSpan ) / 2;

        sphere.radius = radius;

        let center = this.computeCentroid( vertices );

        sphere.center = center;

        return sphere;

    }

    /** 
     * Get spherical coordinates (u, v) for normalized unit vector.
     * @param {glMatrix.vec3} vtx the [x, y, z] unit vector
     * @returns {glMatrix.vec2} the texture coordinate [ u, v ].
     */
    computeSphericalCoords ( vtx ) {

        let u = Math.atan2( vtx[ 0 ], vtx[ 2 ] ) / ( this.TWO_PI );  // x, z

        let v = Math.asin( vtx[ 1 ] ) / Math.PI + 0.5; // y

        if ( u < 0 ) {

            u += 1;

        }

        return [ u, v ];

    }

    /** 
     * Compute the bounding sphere for a Prim, with all its coordinates projected to the 
     * surface of the sphere. Use to make non-uv sphere. Also use to supply texture coordinates 
     * when they are missing.
     * @param {glMatrix.vec3[]} vertices the vertex coordinates.
     * @param {Object} boundingBox a pre-computed bounding box for the coordinates.
     */
     computeInflateToSphere ( vertices, boundingBox ) {

        let sphere = this.computeSphere( boundingBox );

        let sVertices = [];

        let sTexCoords = [];

        // Compute distances between extremes

        const cx = sphere.center[ 0 ];

        const cy = sphere.center[ 1 ];

        const cz = sphere.center[ 2 ];

        const radius = sphere.radius;

        for ( let i = 0; i < vertices.length; i += 3 ) {

            let x = vertices[ i ];

            let y = vertices[ i + 1 ];

            let z = vertices[ i + 2 ];

            let dist = Math.sqrt( cx * x + cy * y + cz * z );

            let scale = dist / radius;

            sVertices.push( x * scale, y * scale, z * scale );

            let texCoord = this.computeSphericalCoords( [ x, y, z ] );

            sTexCoords.push( texCoord.u, texCoord.v );

        }

        return {

            vertices: vertices,

            texCoords: texCoords

        };

     }

    /** 
     * Compute normals for a 3d object. 
     * NOTE: some routines may compute their own normals.
     * Adapted from BabylonJS version:
     * @link https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
     * @link http://gamedev.stackexchange.com/questions/8191/any-reliable-polygon-normal-calculation-code
     * @link https://www.opengl.org/wiki/Calculating_a_Surface_Normal
     * @param {glMatrix.vec3[]} vertices the current 3d position coordinates.
     * @param {Array} current indices into the vertices.
     * @param {glMatrix.vec3[]} normals the normals array to populate, or recalculate.
     * @param {Boolean} justFace if true, return the face normal for all three vertices in a triangle, otherwise, compute each vertex normal separately.
     * @returns {glMatrix.vec3[]} an array of normals.
     */
    computeNormals ( vertices, indices, normals, justFace ) {

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

            i1 = indices[ idx * 3 ]; // get the indices of each Vertex of the Face

            i2 = indices[ idx * 3 + 1 ];

            i3 = indices[ idx * 3 + 2 ];

            // Get face vertex values.

            p1p2x = vertices[ i1 * 3 ] - vertices[ i2 * 3 ]; // compute two vectors per Face

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

            normals[ i1 * 3     ] += faceNormalx;

            normals[ i1 * 3 + 1 ] += faceNormaly;

            normals[ i1 * 3 + 2 ] += faceNormalz;

            normals[ i2 * 3     ] += faceNormalx;

            normals[ i2 * 3 + 1 ] += faceNormaly;

            normals[ i2 * 3 + 2 ] += faceNormalz;

            normals[ i3 * 3     ] += faceNormalx;

            normals[ i3 * 3 + 1 ] += faceNormaly;

            normals[ i3 * 3 + 2 ] += faceNormalz;

        }

        // Last normalization of each normal.

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
     * Compute tangents.
     * NOTE: some routines compute their own tangents.
     * Adapted from these links:
     * @link http://codepen.io/ktmpower/pen/ZbGRpW
     * @link http://www.terathon.com/code/tangent.html
     * "The code below generates a four-component tangent, in which the handedness of the local coordinate system
     * is stored as ±1 in the w-coordinate. The bitangent vector B is then given by b = (n × tangent) · tangentw."
     * @param {glMatrix.vec3[]} vertices the current 3d position coordinates.
     * @param {Array} current indices into the vertices.
     * @param {glMatrix.vec3[]} normals the normals array to populate, or recalculate.
     * @param {glmatrix.vec2[]} texCoordinates the texture coordinates for the geometry.
     * @param {glMatrix.vec4[]} tangents the tangents array to populate or recompute.
     * @returns {glmatrix.vec4[]} an array of tangents.
     * 
     */
    computeTangents ( vertices, indices, normals, texCoords, tangents ) {

        const vec3 = this.glMatrix.vec3;

        let tan1 = new Float32Array( normals.length );

        let tan2 = new Float32Array( normals.length );

        // The indices array specifies the Faces (triangles) forming the object mesh (3 indices per Face).

        const numIndices = indices.length;

        const numVertices = vertices.length;

        tangents = new Float32Array( numVertices * 4 / 3 );

        // For each Face (step through indices 3 by 3)

        for (let i = 0; i < numIndices; i += 3) {

            const i1 = indices[ i ], i2 = indices[ i + 1 ], i3 = indices[ i + 2 ];

            let j = i1 * 3; const v1x = vertices[ j ], v1y = vertices[ j + 1 ], v1z = vertices[ j + 2 ];

            j = i2 * 3; const v2x = vertices[ j ], v2y = vertices[ j + 1 ], v2z = vertices[ j + 2 ];

            j = i3 * 3; const v3x = vertices[ j ], v3y = vertices[ j + 1 ], v3z = vertices[ j + 2 ];
    
            const x1 = v2x - v1x, x2 = v3x - v1x;

            const y1 = v2y - v1y, y2 = v3y - v1y;

            const z1 = v2z - v1z, z2 = v3z - v1z;

            j = i1 * 2;

            const w1x = texCoords[ j ], w1y = texCoords[ j + 1 ];

            j = i2 * 2;

            const w2x = texCoords[ j ], w2y = texCoords[ j + 1 ];

            j = i3 * 2;

            const w3x = texCoords[ j ], w3y = texCoords[ j + 1 ];

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

            const n  = [ normals[ i3 ], normals[ i3 + 1 ], normals[ i3 + 2 ] ];

            const t1 = [ tan1   [ i3 ], tan1   [ i3 + 1 ], tan1   [ i3 + 2 ] ];

            const t2 = [ tan2   [ i3 ], tan2   [ i3 + 1 ], tan2   [ i3 + 2 ] ];

            // Gram-Schmidt orthogonalize, was const tmp  = subtract(t1, scale(dot(n, t1), n));

            const tmp = vec3.sub( [ 0, 0, 0 ], t1, vec3.scale( [ 0, 0, 0 ], t1, vec3.dot( n, t1 ) ) );

            const len2 = tmp[ 0 ] * tmp[ 0 ] + tmp[ 1 ] * tmp[ 1 ] + tmp[ 2 ] * tmp[ 2 ];

            // Normalize the vector only if non-zero length.

            const txyz = ( len2 > 0 ) ? vec3.scale( [ 0, 0, 0 ], tmp, 1.0 / Math.sqrt( len2 ) ) : tmp;

            // Calculate handedness, originally const tw = (dot(cross(n, t1), t2) < 0.0) ? -1.0 : 1.0;

            const tw = ( vec3.dot( vec3.cross( [ 0, 0, 0 ], n, t1 ), t2 ) < 0.0 ) ? -1.0 : 1.0;

            tangents[ i4     ] = txyz[ 0 ];

            tangents[ i4 + 1 ] = txyz[ 1 ];

            tangents[ i4 + 2 ] = txyz[ 2 ];

            tangents[ i4 + 3 ] = tw;

        }

        return tangents;

    }

    /** 
     * Compute texture coordinates by getting the equivalent spherical coordinate of the object.
     * @param {glMatrix.vec3[]} vertices. The input positions.
     * @returns {glmatrix.vec2} an array of texture coordinates.
     */
    computeTexCoords ( vertices ) {

        // Assume y is vertical, x and z are horizontal.

        let texCoords = [];

        for ( let i = 0; i < vertices.length; i += 3 ) {

            let t = this.computeSphericalCoords( [ vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] ] );

            texCoords.push( t[ 0 ], t[ 1 ] );

        }

        return texCoords; 

    }

    // http://answers.unity3d.com/questions/64410/generating-uvs-for-a-scripted-mesh.html
    // TODO: get valid results here!!!!!!!
    computeTexCoords2 ( vertices, indices, scale = 1.0 ) {

        let util = this.util;

        let vec3 = this.glMatrix.vec3;

        let directions = this.directions;

        let i0, i1, i2, v0, v1, v2, side1, side2, direction, facing;

        let Facing = { Up: 0, Forward: 1, Right: 2 };

        let texCoords = new Array( vertices.length * 2 / 3 );

        for ( let i = 0; i < indices.length; i += 3 ) {

            let i0 = i,

            i1 = i + 1,

            i2 = i + 2;

            v0 = this.util.getArr( vertices, i0, 3 ),

            v1 = this.util.getArr( vertices, i1, 3 ),

            v2 = this.util.getArr( vertices, i2, 3 );

            side1 = vec3.sub( [ 0, 0, 0 ], v1, v0 );

            side2 = vec3.sub( [ 0, 0, 0 ], v2, v0 );

            direction = vec3.cross( [ 0, 0, 0 ], side1, side2 );

            facing = facingDirection( direction );

            // NOTE: replace with :         Array.prototype.push.apply( indices, iIndices );

            switch ( facing ) {

                case Facing.Forward:

                    texCoords[i0] = scaledUV( v0[ 0 ], v0[ 1 ], scale );

                    texCoords[i1] = scaledUV( v1[ 0 ], v1[ 1 ], scale );

                    texCoords[i2] = scaledUV( v2[ 0 ], v2[ 1 ], scale );

                    break;

                    texCoords[i0] = scaledUV( v0[ 0 ], v0[ 2 ], scale );

                    texCoords[i1] = scaledUV( v1[ 0 ], v1[ 2 ], scale );

                    texCoords[i2] = scaledUV( v2[ 0 ], v2[ 2 ], scale );


                case Facing.up:

                    texCoords[i0] = scaledUV( v0[ 1 ], v0[ 2 ], scale );

                    texCoords[i1] = scaledUV( v1[ 1 ], v1[ 2 ], scale );

                    texCoords[i2] = scaledUV( v2[ 1 ], v2[ 2 ], scale );

                    break;

                case Facing.right:

                    texCoords[i0] = scaledUV(v0[ 2 ], v0[ 1 ], scale );

                    texCoords[i1] = scaledUV(v1[ 2 ], v1[ 1 ], scale );

                    texCoords[i2] = scaledUV(v2[ 2 ], v2[ 1], scale );

                    break;
            }


        } // end of for loop

        function facesThisWay( v, dir, p, maxDot, ret ) {

            let t = vec3.dot( [ 0, 0, 0 ], v, dir );

            if ( t > maxDot ) {

             //ret = p;

             //maxDot = t;

             return {
                ret: p,
                maxDot: t
            };

         }

         return false;

        }
     
        function facingDirection( v ) {

            var ret = Facing.Up, val;

            let maxDot = Number.NegativeInfinity;

            if ( ! facesThisWay( v, directions.RIGHT, Facing.Right, maxDot, ret ) ) {

                val = facesThisWay( v, directions.LEFT, Facing.Right, maxDot, ret );

                ret = val.ret, maxDot = val.maxDot

            }
         
            if ( ! facesThisWay( v, directions.FORWARD, Facing.Forward, maxDot, ret ) ) {

                val = facesThisWay( v, directions.BACK, Facing.Forward, maxDot, ret );

                ret = val.ret, maxDot = val.maxDot;

            }
         
            if ( ! facesThisWay( v, directions.UP, Facing.Up, maxDot, ret ) ) {

                val = facesThisWay( v, directions.DOWN, Facing.Up, maxDot, ret );

                ret = val.ret, maxDot = val.maxDot;

            }
         
            return ret;

        }
     
        function scaledUV( uv1, uv2, scale ) {

            return [ uv1 / scale, uv2 / scale ];

        }

        // Return computed texCoords

        return texCoords;

    }


    /** 
     * Create default colors for Prim color array. This can also be used 
     * to generate a normal map or tangent map.
     * @param {glMatrix.vec3[]} coords either vertices, normals (normalmap) tangents (tangentmap).
     * @param {glmatrix.vec4[]} colors the colors array to populate or recompute.
     * @returns {glMatrix.vec4[]} the completed colors array
     */
    computeColors( coords, colors ) {

        let c = [];

        // Catch the case where we want a single color (e.g. a call from a Material file).

        if ( colors.length === 4 ) {

            for ( let i = 0; i < coords.length; i += 3 ) {

                c.push( colors[ 0 ], colors[ 1 ], colors[ 2 ], colors[ 3 ] );

            }

        }

        // Otherwise, create colors as a normals map.

        for ( let i = 0; i < coords.length; i += 3 ) {

            c.push( coords[ i ], coords[ i + 1 ], coords[ i + 2 ], 1.0 );

        }

        return c;

    }


    /** 
     * Given a set of 3d coordinates, compute a triangle fan around the Centroid for those coordinates.
     * @param {glMatrix.vec3[]} vertices an array of UN-FLATTENED xyz coordinates.
     * @param {Array} indices the sequence to read triangles.
     * @returns {Object} UN-FLATTENED vertices, indices, texCoords nomals, tangents.
     */
    computeFan ( vertices, indices ) {

        let vec3 = this.glMatrix.vec3;

        let vv = [];

        // Get the subset of vertices we should take by following indices.

        for ( let i = 0; i < indices.length; i++ ) {

            vv.push( vertices[ indices[ i ] ] );

        }

        // Compute the central point of the triangle fan.

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

            // NOTE: each vertex gets a face normal = center. For shapes built with triangle fans, re-compute!

            norms.push( center[ 0 ], center[ 1 ], center[ 2 ] ); // center vertex in fan

            // Assumes a regular polygon.

            tex.push(

                Math.cos( this.TWO_PI * p2 / ( lenv - 1 ) ) / 2 + .5,

                Math.sin( this.TWO_PI * p2 / ( lenv - 1 ) ) / 2 + .5

            );

        } // end of for loop

        // Push the center point texture coordinate.

        tex.push( 0.5, 0.5 );

        // Push the center point normal.

        norms.push( center[ 0 ], center[ 1 ], center[ 2 ] );

        return {

            vertices: vv,

            indices: idx,

            texCoords: tex,

            normals: norms,

            tangents: [],

            colors: []

        }

    }

    /* 
     * ---------------------------------------
     * GEOMETRY TRANSFORMATIONS
     * ---------------------------------------
     */

    /** 
     * Scale vertices directly, without changing position.
     * @param {glMatrix.vec3[]} vertices the input positions.
     * @param {Number} scale the value to scale by (> 0).
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
     * NOTE: normally, you will want to use a matrix transform to position objects.
     * @param {glMatrix.vec3[]} vertices flattened vertex array.
     * @param {glMatrix.vec3} pos the new position measured from object centroid.
     */
    computeMove ( vertices, pos ) {

        let center = this.computeCentroid( vertices );

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
     * rendered as an array of coordinates.
     * 
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (glMatrix.vec4) [ x, y, z, radius || 0, pointSize (pixels) | 0 ]
     *  - prim.divisions     = (glMatrix.vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryPointCloud ( prim ) {

        const list = this.typeList;

        let vec3 = this.glMatrix.vec3,

        geo = prim.geometry;

        // Expect points in Map3d object, or generate random.

        const w = prim.dimensions[ 0 ],

        h = prim.dimensions[ 1 ],

        d = prim.dimensions[ 2 ],

        radius = prim.dimensions[ 3 ],

        pointSize = prim.dimensions[ 4 ] || 1,

        numPoints = prim.divisions[ 0 ] || 1;

        // Shortcuts to Prim data arrays

        let vertices = [], indices = [], texCoords = [], normals = [], tangents = [];

        if ( ! prim.spaceMap ) {

            console.log( 'GeometryPool::geometryPointCloud(): adding spaceMap for:' + prim.name );

            prim.sphereMap = new Map3d( this.util );

            prim.sphereMap.initRandom ( w, h, d, numPoints );

            let map = prim.sphereMap.map;

             for ( let i = 0; i < map.length; i += 3 ) {

                map[ i ]     *= w;

                map[ i + 1 ] *= h;

                map[ i + 2 ] *= d;

                indices.push[ i ];

            }

            // roughness 0.2 of 0-1, flatten = 1 of 0-1;

            //prim.spaceMap[ prim.spaceMap.type.CLOUD ]( prim.divisions[ 0 ], prim.divisions[ 1 ], prim.divisions[ 2 ], 0.6, 1 );

        } else {

            // Read a starmap, assign colors, brightness, etc.

        }

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }


    /** 
     * type LINE
     * rendered as GL_LINE.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (glMatrix.vec4) [ x, y, z, thickness | 0 ]
     *  - prim.divisions     = (glMatrix.vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryLine ( prim ) {

        let vec3 = this.glMatrix.vec3,

        geo = prim.geometry;

        const w = prim.dimensions[ 0 ],

        h = prim.dimensions[ 1 ],

        d = prim.dimensions[ 2 ],

        radius = prim.dimensions[ 3 ],

        pointSize = prim.dimensions[ 4 ] || 1,

        numPoints = prim.divisions[ 0 ] || 1;

        // Shortcuts to Prim data arrays

        let vertices = [], indices = [], texCoords = [], normals = [], tangents = [];

        // Expect points in Map3d object, or generate random.

        // The Line is created centered on 0,0,0.

        vertices.push( 

            w - radius, h - radius, d - radius, 

            w + radius, h + radius, d + radius

        );

        indices.push( 0, 3 );

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }


    /** 
     * Objects created with uv methods (i.e. they have polar points).
     * rendered as GL_TRIANGLES.
     * startSlice cuts off the cylinder, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cylinder, and wraps the texture across the bottom.
     * for an open cylinder with no caps, set startSlice and endSlize to zero.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometrySphere ( prim ) {

        const list = this.typeList;

        let vec3 = this.glMatrix.vec3,

        geo = prim.geometry;

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

                r = lat / 2; // use for no-spherical shapes

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

                        } else if ( endSlice !== 1.0 && lat >= endSlice ) {

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

                            x = cosPhi * ( 1 - lat + ( 1 / latDist ) );

                            z = sinPhi * ( 1 - lat + ( 1 / latDist ) );

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

                        } else if ( lat > endSlice ) { // NOTE: not >= endSlice

                            y = 1 - endSlice ;

                            x = cosPhi * sinTheta / 2;

                            z = sinPhi * sinTheta / 2;

                        } else {

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

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }

    /** 
     * Type CAP.
     * rendered as GL_TRIANGLES.
     * Just a flattened half-sphere creating a circular 'lid'.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryCap( prim ) {

        return this.geometrySphere( prim );

    }


    /** 
     * Type DOME.
     * rendered as GL_TRIANGLES.
     * Half-sphere, visible from outside.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryTopDome ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * type SKYDOME
     * rendered as GL_TRIANGLES.
     * Half-sphere, order of drawing is reversed, so texture displays inside by default.

     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometrySkyDome ( prim ) {

        prim.visibleFrom = this.INSIDE;

        return this.geometrySphere( prim );

    }

    /** 
     * Type BOTTOMDOME
     * rendered as GL_TRIANGLES.
     * bowl shaped, formed from lower half of sphere.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryBottomDome ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * Type CYLINDER.
     * rendered as GL_TRIANGLES.
     * Cylinder, either open or closed, visible from outside.
     * startSlice cuts off the cylinder, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cylinder, and wraps the texture across the bottom.
     * for an open cylinder with no caps, set startSlice and endSlize to zero.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryCylinder ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * Type CONE.
     * rendered as GL_TRIANGLES (equivalent to TOPCONE).
     * Cone can have segments sliced off its beginning or end.
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * Type TOPCONE.
     * rendered as GL_TRIANGLES.(equivalent to CONE).
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryTopCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * Type BOTTOMCONE.
     * rendered as GL_TRIANGLES.
     * Cone structure, pointing downwards.
     * startSlice cuts off the cone, and wraps the texture across the top. 
     * endSlize truncates the bottom of the cone, and wraps the texture across the bottom.
     * for a cone with no caps, set startSlice and endSlize to zero.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, startSlice | 0, endSlice | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryBottomCone ( prim ) {

        return this.geometrySphere( prim );

    }

    /**
     * Type SPINDLE.
     * rendered as GL_TRIANGLES.
     * Spindle (two cones stuck together).
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometrySpindle ( prim ) {

        return this.geometrySphere( prim );

    }

    /** 
     * Type TEARDROP.
     * Rendered as GL_TRIANGLES.
     * Teardrop (cone and dome stuck together).
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
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
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

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
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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

        // numVertices = ( nx + 1 ) * ( ny + 1 ) * 2 + ( nx + 1 ) * ( nz + 1 ) * 2 + ( nz + 1 ) * ( ny + 1 ) * 2;

        let positions = [];

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

        // Flatten vertices, which were created using 2D array.

        vertices = flatten( positions, false );

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }

    /** 
     * type PLANE, OUTERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'outside' as defined by the outward vector from Prim.side.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryOuterPlane ( prim ) {

        return this.geometryCube( prim );

    }

    /** 
     * type INNERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'inside', as defined by the outward vectore from Prim.side.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryInnerPlane ( prim ) {

        return this.geometryCube( prim );

    }

    /** 
     * type CURVEDPLANE, CUREVEDOUTERPLANE
     * rendered as WebGL TRIANGLES.
     * visible from the 'outside' as defined by the outward vector from Prim.side.
     * curve radius sets the amount of curve by assigning a radius for a circle.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
     geometryCurvedOuterPlane( prim ) {

        return this.geometryCube( prim );

     }

     /** 
     * type CURVEDINNERPLANE
     * rendered as GL_TRIANGLES.
     * visible from the 'inside', as defined by the outward vectore from Prim.side.
     * curve radius sets the amount of curve by assigning a radius for a circle.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius | 0 ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
     geometryCurvedInnerPlane( prim ) {

        return this.geometryCube( prim );

     };

    /** 
     * type TERRAIN.
     * rendered as GL_TRIANGLES.
     * Generate terrain, using a heightMap, from a PLANE object. The 
     * heightMap values are interpolated for each vertex in the PLANE.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. .
     */
    geometryTerrain ( prim ) {

        if ( ! prim.heightMap ) {

            console.log( 'Prim::geometryTerrain(): adding heightmap for:' + prim.name );

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
     * just sets the curveRadius to 1/2 of the prim size.
     * @param {Prim} the Prim needing geometry. 
     *  - prim.dimensions    = (vec4) [ x, y, z, Prim.side, curveRadius ]
     *  - prim.divisions     = (vec3) [ x, y, z ]
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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
     * Additional tutorials:
     * @link https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/src/ProceduralIcoSphereGenerator.cpp?at=default&fileviewer=file-view-default
     * @link http://donhavey.com/blog/tutorials/tutorial-3-the-icosahedron-sphere/
     * http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
     * https://github.com/glo-js/primitive-icosphere
     * https://github.com/hughsk/icosphere
     * http://mft-dev.dk/uv-mapping-sphere/
     * Octahedron sphere generation:
     * @link https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * @link  https://experilous.com/1/blog/post/procedural-planet-generation
     * @link https://experilous.com/1/planet-generator/2014-09-28/planet-generator.js
     * @link https://fossies.org/dox/eigen-3.2.10/icosphere_8cpp_source.html
     * divisions max: ~60
     * @param {Object} prim the primitive needing geometry.
     * @param {Boolean} domeFlag if 0, do nothing, if 1, do top, if 2, do bottom.
     */
    geometryIcoSphere ( prim, domeFlag, visibleFrom ) {

        let TWO_PI = this.TWO_PI; // connect scope to internal functions.

        const vec3 = this.glMatrix.vec3;

        const flatten = this.util.flatten;

        const list = this.typeList;

        const side = this.directions;

        // Size and divisions. After making the object, subdivide further to match divisions.

        let subdivisions;

        subdivisions = prim.divisions[ 0 ];

        if ( prim.type === list.REGULARTETRAHEDRON ) {

            subdivisions = 1;

        } else if ( prim.type === list.ICOSOHEDRON ) {

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

        /* 
         * The original algorithm tried to pre-define the size of the index array, since out-of-range 
         * indices may be accessed. However, for some sizes this leads to a blob of undefineds, which 
         * would cause problems elsewhere. So, we use the dynamic feature of JS arrays - slower, but 
         * more compatible. The browser needs to support adding a new cell with aVar[num++] constructs
         */

        let geo = prim.geometry;

        let vertices = new Array ( ( resolution + 1 ) * ( resolution + 1 ) * 4 - (resolution * 2 - 1) * 3 ),

        indices = new Array( vertices.length), // will get bigger!

        texCoords = new Array( vertices.length ),

        normals = new Array( vertices.length ),

        tangents = new Array( vertices.length );

        // Initialize lots of default variables.

        let v = 0, vBottom = 0, t = 0, i, d, progress, from, to;

        for ( i = 0; i < 4; i++ ) {

            vertices[ v++ ] = getStdVecs( side.DOWN );

        }

        for ( i = 1; i <= resolution; i++ ) {

            progress = i / resolution;

            to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.DOWN ), getStdVecs( side.FORWARD ), progress );

            vertices[ v++ ] = vec3.copy( [ 0, 0, 0 ], to );

            for ( d = 0; d < 4; d++ ) {

                from = vec3.copy( [ 0, 0, 0 ], to );

                to = vec3.lerp( [ 0, 0, 0 ], getStdVecs( side.DOWN ), getStdVecs( directions[ d ] ), progress );

                // Conditionally draw the bottom of the icosphere.

                if ( domeFlag !== this.directions.TOP ) {

                    t = createLowerStrip( i, v, vBottom, t, indices );

                }

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

                    // Conditionally draw the top of the icosphere.

                    if ( domeFlag !== this.directions.BOTTOM )  {

                        // Reverse the winding order for a SkyDome (viewed from inside).

                        if ( visibleFrom === this.INSIDE ) {

                            t = createUpperSkyStrip( i, v, vBottom, t, indices );

                        } else {

                            t = createUpperStrip( i, v, vBottom, t, indices );

                        }

                    }

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

        console.log(" ICOSPHERE VERTICES: " + vertices.length + " texCoords:" + texCoords.length)

        // Scale if necessary.

        if ( radius != 1 ) {

            for ( i = 0; i < vertices.length; i++ ) {

                    vertices[ i ][ 0 ] *= radius;

                    vertices[ i ][ 1 ] *= prim.dimensions[ 1 ] / 2; //radius;

                    vertices[ i ][ 2 ] *= prim.dimensions[ 2 ] / 2; //radius;

            }

        }

        // Tangents (nonstandard).

        createTangents( vertices, tangents );

        // Flatten the data arrays.

        vertices = flatten( vertices, false );

        texCoords = flatten( texCoords, false );

        normals = flatten( normals, false );

        tangents = flatten( tangents, false );

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

        // Create tangents.

        function createTangents ( vertices, tangents ) {

            for ( i = 0; i < vertices.length; i++ ) {

                let v = vertices[ i ];

                let vt = vec3.normalize( [ 0, 0, 0 ], [ v[ 0 ], 0, v[ 2 ] ] );

                let tangent = [ 0, 0, 0, 0 ];

                tangent[ 0 ] = -vt[ 2 ];

                tangent[ 1 ] = 0;

                tangent[ 2 ] = vt[ 0 ];

                tangent[ 3 ] = -1;

                tangents[ i ] = tangent;

            }

            // Adjust a few specific tangents.

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

        // Create line of vertices.

        function createVertexLine ( from, to, steps, v, vertices ) {

            for ( let i = 1; i <= steps; i++ ) {

                vertices[ v++ ] = vec3.lerp( [ 0, 0, 0 ], from, to, i / steps );

            }

            return v;

        }

        // Create a triangle strip for the lower part of the sphere.

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

        // Create a triangle strip for the upper part of the sphere.

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

        // Create a strip for the upper sphere, but reverse the winding order so it works as a SkyDome.

        function createUpperSkyStrip ( steps, vTop, vBottom, t, triangles ) {

            triangles[t++] = vBottom;

            triangles[t++] = ++vBottom;

            triangles[t++] = vTop - 1;

            for ( let i = 1; i <= steps; i++ ) {

                triangles[t++] = vTop;

                triangles[t++] = vTop - 1;

                triangles[t++] = vBottom;

                triangles[t++] = vBottom;

                triangles[t++] = ++vBottom;

                triangles[t++] = vTop++;

            }

            return t;
        }

        console.log("ICOSPHERE: vertices:" + vertices.length + " TANGENTS:" + tangents.length);

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }

    /** 
     * Type REGULARTETRAHEDRON.
     * Create a icosohedron.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryRegularTetrahedron ( prim ) {

        return this.geometryIcoSphere ( prim );

    }

    /** 
     * Type ICOSOHEDRON.
     * Create a icosohedron.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryIcosohedron ( prim ) {

        return this.geometryIcoSphere( prim );

    }

    /** 
     * Type PRISM.
     * create a closed prism type shape.
     * Create a icosohedron.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryPrism( prim ) {

        // TODO code needs to be written.

    }

    /** 
     * Type PYRAMID.
     * create a closed pyramid shape, half of an icosohedron.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryPyramid ( prim ) {

        // TODO: return upper half of icosohedron, and close. (possibly by setting 
        // bottom half to a comm y value)

    }

    /** 
     * type ICODOME.
     * create a half-sphere from an icosphere.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryIcoDome( prim ) {

        return this.geometryTopIcoDome( prim );

    }

    /** 
     * type TOPICODOME.
     * create a half-sphere from an icosphere.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryTopIcoDome ( prim ) {

        return this.geometryIcoSphere( prim, this.directions.TOP );

    }

    /** 
     * Type SKYICODOME.
     * create a half-sphere with texture only visible from the inside.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometrySkyIcoDome ( prim ) {

        prim.visibleFrom = this.INSIDE;

        // TODO: reverse winding order!!!!!!!!!!!!!!!!!!

        return this.geometryIcoSphere( prim, this.directions.TOP, prim.visibleFrom );

    }

    /** 
     * Type BOTTOMICODOME.
     * create a bowl shape from the lower half of an icosphere.
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryBottomIcoDome ( prim ) {

        return this.geometryIcoSphere( prim, this.directions.BOTTOM );

    }


    /** 
     * Type OCTAHEDRON.
     * Create an octahedron
     * Note: the icosphere algorithm returns an octahedron if we don't "inflate" 
     * the object's vertices by normalizing.
     * Additional links:
     * @link https://github.com/nickdesaulniers/prims/blob/master/octahedron.js
     * @link http://paulbourke.net/geometry/platonic/
     * @link https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     */
    geometryOctahedron ( prim ) {

        return this.geometryIcoSphere( prim );

    }

    /** 
     * Type DODECAHEDRON.
     * Create a dodecahedron.
     * @link https://github.com/prideout/par/blob/master/par_shapes.h
     * @link https://github.com/nickdesaulniers/prims/blob/master/dodecahedron.js
     * @link http://vorg.github.io/pex/docs/pex-gen/Dodecahedron.html
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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

            for ( let i = 0; i < faces.length; i++ ) {

                let vv = faces[ i ]; // indices to vertices

                let vvv = []; // saved vertices

                let lenv = vv.length;

                for ( let j = 0; j < vv.length; j++ ) {

                    vvv.push( vtx[ vv[ j ] ] );

                }

                let center = this.geometry.computeCentroid( vvv );

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

                        vec3.copy( [ 0, 0, 0 ], center )

                    );

                    let cLen = vertices.length - 1;

                    indices.push( cLen - 2, cLen - 1, cLen );

                    normals.push(

                        vec3.copy( [ 0, 0, 0 ], v1 ),

                        vec3.copy( [ 0, 0, 0 ], v2 ),

                        vec3.copy( [ 0, 0, 0 ], center )

                    );

                    texCoords.push(

                        this.computeSphericalCoords( v1 ),

                        this.computeSphericalCoords( v2 ),

                        this.computeSphericalCoords( center )

                    );


                } // end of 'for' loop.

            } // end of 'faces' loop.

        } // end of wrap whole object with one texture.

        // Scale.

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

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }

    /** 
     * Type TORUS
     * A Torus object.
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
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
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

                // NOTE: wrap backwards to see inside of torus ( a tunnel?).

            }

        }

        // Initialize the Prim, adding normals, texCoords and tangents as necessary.

        return { vertices: vertices, indices: indices, normals: normals, texCoords: texCoords, tangents: tangents };

    }

    geometryTunnel ( prim ) {

        // TODO: write

    }

    /** 
     * Type SPRING.
     * a Torus that doesn't close
     */
    geometrySpring ( prim ) {

        // TODO: write

    }

    /** 
     * Generic 3d shape defined from files (e.g. OBJ model).
     * calls load-model, then executes final callback. Final callback creates WebGL buffers 
     * for the Prim. Other model files (e.g. material) are loaded by load-model and values 
     * assigned to the Prim before final loading.
     *
     * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
     * @link https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryMesh ( prim, pathList ) {

        // Get the model file. Pass in Prim so we can respond to model completion events.

        // TODO: ONLY IF MULTIPLE PATHS

        // TODO: FORWARD SEPARATE ARRAY HERE

        this.modelPool.getModels( prim, prim.models, true );

    }

    /* 
     * ---------------------------------------
     * LOADERS
     * ---------------------------------------
     */

    /** 
     * Procedurally generate geometry coordinates, then emit a pseudo-event to the calling Prim.
     * @param {String} type the type of procedural geometry type, also the name of the factory funciton.
     * @param {Prim} prim the calling Prim.
     * @param {String|number} key the key to assign the geometry model to in the prim.models array.
     */
    addGeometry ( type, prim, key ) {

        if ( type === this.typeList.MESH ) {

            // Load geometry from a file, with callback emitter GEOMETRY_READY in ModelPool, calling Prim.initPrim().

            this.geometryMesh( prim );


        } else {

            // Procedural geometry.

            let c = this[ type ]( prim );

            // Colors not supplied by procedural geometry.

            c.colors = [];

            // Emit a GEOMETRY_READY event, calling Prim.initPrim().

            this.util.emitter.emit( this.util.emitter.events.GEOMETRY_READY, prim, key, c );

        }

    }

    /** 
     * Get multiple geometries.
     */
    getGeometries( prim, pathList = [], cacheBust = true ) {

        if( pathList && ( prim.type === this.typeList.MESH ) ) {

            /* 
             * Mesh geometry, uses data from a file in OBJ wavefront format.
             */

            for ( let i = 0; i < pathList.length; i++ ) {

                let path = pathList[ i ];

                // Could have an empty path.

                if ( path ) {

                let poolModel = this.modelPool.pathInList( path );

                    if ( poolModel ) {

                        // Reload from the asset file.

                        console.log( 'GeometryPool::getGeometries(): model file ' + path + ' already in the pool for:' + prim.name)

                        prim.models.push( poolModel ); // just reference an existing texture in this pool.

                    } else {

                        // Load geometry from a file, with callback emitter GEOMETRY_READY in ModelPool, calling Prim.initPrim().

                        console.log( 'GeometryPool::getGeometries(): new model file ' + path + ' for ' + prim.name );

                        this.modelPool.getModels( prim, pathList, true );

                    }

                } else {

                    console.warn( 'GeometryPool::getTextures(): no path supplied for position ' + i );

                } // end of valid path

            } // end of for loop

        } else { // NO PATHLIST (procedural instead)

            /* 
             * Procedural geometry, returns the same structure as modelPool.getModels();
             *
             * Model format:
             * {
             *   vertices: vertices,
             *   indices: indices,
             *   texCoords: texCoords,
             *   normals: normals,
             *   type: type,
             *   path: key to the ModelPool,
             *   usemtl: util.DEFAULT_KEY (always 'default')
             * }
             */

            console.log( 'GeometryPool::getGeometries() new procedural geometry for:' + prim.name );

            let m = this.modelPool.addAsset( this[ prim.type ]( prim ) );

            window.modelPool = this.modelPool;

            // Store the type.

            m.type = prim.type,

            // Since there's no file path, we'll use our key for the pseudo-path (Blob-like).

            m.path = m.key,

            // Default material, since none specified.

            m.material = this.util.DEFAULT_KEY,

            // Add the emit event.

            m.emits = this.util.emitter.events.GEOMETRY_READY;

            // Procedural models ALWAYS go to position 0

            this.util.emitter.emit( m.emits, prim, m.key, 0 );

        }

    }

}

export default GeometryPool;
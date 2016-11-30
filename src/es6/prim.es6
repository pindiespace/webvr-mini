import Map2d from './map2d';
import Map3d from './map3d';

export default class Prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
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
     * More prims
     * Ogre 3d procedural
     * https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/include/?at=default
     * https://bitbucket.org/transporter/ogre-procedural/wiki/Home
     *
     * https://github.com/jagenjo/litegl.js/tree/master/src
     *
     * http://wiki.unity3d.com/index.php/ProceduralPrimitives
     *
     * octahedron sphere generation
     * https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * https://experilous.com/1/blog/post/procedural-planet-generation
     * https://experilous.com/1/planet-generator/2014-09-28/planet-generator.js
     * another octahedron sphere 
     * https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * rounded cube
     * https://github.com/vorg/primitive-rounded-cube
     * rounded cube algorithim
     * http://catlikecoding.com/unity/tutorials/rounded-cube/
     *
     * generalized catmull-clark subdivision algorithm
     * https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     *
     * cube inflation algorithm
     * http://mathproofs.blogspot.com.au/2005/07/mapping-cube-to-sphere.html
     * advanced toolset
     * https://www.geometrictools.com/Samples/Geometrics.html
     * Eigen
     * https://fossies.org/dox/eigen-3.2.10/icosphere_8cpp_source.html
     * Geometry prebuilt
     * http://paulbourke.net/geometry/roundcube/
     * Lots of Webgl tricks!
     * https://acko.net
     * http://acko.net/blog/on-webgl/
     * 
     * https://gamedevdaily.io/four-ways-to-create-a-mesh-for-a-sphere-d7956b825db4#.lkbq2omq5
     * https://www.geometrictools.com/Samples/Geometrics.html
     *
     * https://github.com/glo-js/primitive-icosphere
     * https://github.com/hughsk/icosphere
     * http://mft-dev.dk/uv-mapping-sphere/
     * http://donhavey.com/blog/tutorials/tutorial-3-the-icosahedron-sphere/
     * http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
     *
     * https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
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

            POLY: 'geometryPoly',

            CUBE: 'geometryCube',

            CUBESPHERE: 'geometryCubeSphere',

            SPHERE: 'geometrySphere',

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

        this.side = {

            DEFAULT: 'up',

            FRONT: 'forward',

            BACK: 'back',

            LEFT: 'left',

            RIGHT: 'right',

            TOP: 'up',

            BOTTOM: 'down'

        };

        // draw facing size, back side, or both sides (e.g. for flat Plane or Poly).

        this.draw = {

            FORWARD_SIDE: 10,

            BACKWARD_SIDE: 11,

            BOTH_SIDES: 12
        };

    }

    /** 
     * See if supplied Prim type is supported. Individual Prim factory 
     * methods do more detailed checking.
     * @param {String} type the prim type.
     * @returns {Boolean} if supported, return true, else false.
     */
    checkType ( type ) {

        let l = this.typeList;

        // Object iteration.

        for ( let i in l ) {

            if ( l[ i ] === type ) {

                return true;

            }

        }

        return false;

    }

    /** 
     * Unique object id
     * @link https://jsfiddle.net/briguy37/2MVFd/
     */
    setId () {

        let d = new Date().getTime();

        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

            let r = (d + Math.random()*16)%16 | 0;

            d = Math.floor(d/16);

            return ( c=='x' ? r : ( r&0x3|0x8 ) ).toString( 16 );

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

        const len = this.objs.length;

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

        const len = this.objs.length;

        for ( let i in this.objs ) {

            indices = indices.concat( this.objs[i].indices );

        }

        return indices;

    }

    /** 
     * Return an empty buffer object.
     */
    createBufferObj () {

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
    addBufferData( bufferObj, vertices, indices, texCoords, normals, tangents, colors ) {

        const concat = this.util.concatArr;

        concat( bufferObj.vertices.data, vertices );

        concat( bufferObj.indices.data, indices );

        concat( bufferObj.texCoords.data, texCoords );

        concat( bufferObj.normals.data, normals );

        concat( bufferObj.tangents.data, tangents );

        concat( bufferObj.colors.data, colors );

        return bufferObj;

    }

    /** 
     * Create WebGL buffers using geometry data
     * @param {Object} bufferObj custom object holding the following:
     * an array of vertices, in glMatrix.vec3 objects.
     * an array of indices for the vertices.
     * an array of texture coordinates, in glMatrix.vec2 format.
     * an array of normals, in glMatrix.vec3 format.
     * an array of tangents, in glMatrix.vec3 format.
     * an array of colors, in glMatrix.vec4 format.
     */
    createBuffers( bufferObj ) {

            const gl = this.webgl.getContext();

            // Vertex Buffer Object.

            let o = bufferObj.vertices;

            if ( ! o.data.length ) {

                console.log( 'no vertices present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the Index buffer.

            o = bufferObj.indices;

            if ( ! o.data.length ) {

                console.log( 'no indices present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the Sides buffer, a kind of indices buffer.

            o = bufferObj.sides;

            if ( ! o.data.length ) {

                console.warn( 'no sides present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            // TODO: SUPPORT BY SIDE DRAWING FOR SOME PRIMS.
            // TODO: SUPPORT

            // create the Normals buffer.

            o = bufferObj.normals;

            if ( ! o.data.length ) {

                console.log( 'no normals, present, creating default' );

                o.data = new Float32Array( [ 0, 1, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the primary Texture buffer.

            o = bufferObj.texCoords;

            if ( ! o.data.length ) {

                console.warn( 'no texture present, creating default' );

                o.data = new Float32Array( [ 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // create the Tangents Buffer.

            o = bufferObj.tangents;

            if ( ! o.data.length ) {

                console.warn( 'no tangents present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;


            // Create the Colors buffer.

            o = bufferObj.colors;

            if ( ! o.data.length ) {

                console.warn( 'no colors present, creating default color' );

                o.data = new Float32Array( this.computeColors( bufferObj.normals.data, o.data ) );

                //o.data = new Float32Array( [ 0.2, 0.5, 0.2, 1.0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            bufferObj.makeBuffers = false; // they're created!

        return bufferObj;

    }

    /** 
     * Create default colors for Prim color array.
     */
    computeColors( normals, colors ) {

        for ( let i = 0, len = normals.length; i < len; i += 3 ) {

            colors.push( normals[ i ], normals[ i + 1 ], normals[ i + 2 ], 1.0 );

        }

        return colors;

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
     * DEFAULT VECTORS
     * ---------------------------------------
     */

    /** 
     * Standard vectors (similar to Unity) when needed. Call only 
     * if using the array literal (e.g. [ 0, 0, 0,]) doesn't make sense.
     * @link https://docs.unity3d.com/ScriptReference/Vector3.html
    */
    getStdVecs ( type ) {

        switch ( type ) {

            case 'back': return [ 0, 0,-1 ];

            case 'down': return [ 0,-1, 0 ];

            case 'forward': return [ 0, 0, 1];

            case 'left': return [-1, 0, 0 ];

            case 'one': return [ 1, 1, 1 ];

            case 'right': return [ 1, 0, 0 ];

            case 'up': return [ 0, 1, 0 ];

            case 'zero': return [ 0, 0, 0 ];

        }

    }

    /** 
     * Larger configuration vectors for Prims. additional values control slicing 
     * or flattening of part of a prim.
     * For CONE, the fourth value is truncation of the cone point.
     * For other Prims, the fourth and fifth values control the start and 
     * end of a cap on open prims (CYLINDER, CONE) and flattening of the 
     * top and bottom of SPHERE prims.
     */
    vec5 ( a, b, c, d, e ) {

        d = d || 0;

        e = e || 0;

        return [ a, b, c, d, e ]; // dimensions, start slice (cone)

    }

    vec6 ( a, b, c, d, e, f ) {

        d = d || 0;

        e = e || 0;

        f = f || 0;

        return [ a, b, c, d, e, f ];

    }

    /* 
     * ---------------------------------------
     * NORMAL, INDEX, VERTEX, TRIANGLE, QUAD CALCULATIONS
     * ---------------------------------------
     */

    /** 
     * Subdivide a mesh, WITHOUT smoothing.
     * Comprehensive description.
     * @link http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
     * USE:
     * USE: https://blog.nobel-joergensen.com/2010/12/25/procedural-generated-mesh-in-unity/
     * USE: http://wiki.unity3d.com/index.php/MeshSubdivision
     * USE: https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     * USE: https://github.com/Erkaman/gl-catmull-clark/blob/master/index.js
     * Examples:
     * @link http://vorg.github.io/pex/docs/pex-geom/Geometry.html
     * @link http://answers.unity3d.com/questions/259127/does-anyone-have-any-code-to-subdivide-a-mesh-and.html
     * @link https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     */
    subDivide ( geometry, center ) {

        // TODO: NOT DONE!!!!


        return geometry;

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
    pointInTriangle ( p, p0, p1, p2 ) {

        const vec3 = this.glMatrix.vec3;

        let v0, v1, v2, dot00, dot01, dot02, dot11, dot12;

        // Compute vectors.

        v0 = vec3.sub( v0, p2, p0 );
        v1 = vec3.sub( v1, p1, p0 );
        v2 = vec3.sub( v2, p, p0 );

        // Compute dot products.

        dot00 = vec3.dot( v0, v0 )
        dot01 = vec3.dot( v0, v1 )
        dot02 = vec3.dot( v0, v2 )
        dot11 = vec3.dot( v1, v1 )
        dot12 = vec3.dot( v1, v2 )

        // Compute barycentric coordinates.

        let invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 )
        let u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom
        let v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom

        // Check if point is in triangle.

        return ( u >= 0 ) && ( v >= 0 ) && ( u + v < 1 );

    }

    /** 
     * Compute normals for a 3d object. NOTE: some routines compute their 
     * own normals.
     * Adapted from BabylonJS version.
     * @link https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
     * @link http://gamedev.stackexchange.com/questions/8191/any-reliable-polygon-normal-calculation-code
     * @link https://www.opengl.org/wiki/Calculating_a_Surface_Normal
     */
    computeNormals ( vertices, indices, normals ) {

        let index = 0;

        let p1p2x = 0.0;

        let p1p2y = 0.0;

        let p1p2z = 0.0;

        let p3p2x = 0.0;

        let p3p2y = 0.0;

        let p3p2z = 0.0;

        let faceNormalx = 0.0;

        let faceNormaly = 0.0;

        let faceNormalz = 0.0;

        let length = 0.0;

        let i1 = 0;

        let i2 = 0;

        let i3 = 0;

        for (index = 0; index < vertices.length; index++) {

                normals[index] = 0.0;

        }

        // index triplet = 1 face

        let nbFaces = indices.length / 3;

        for (index = 0; index < nbFaces; index++) {

            i1 = indices[index * 3]; // get the indexes of each vertex of the face
            i2 = indices[index * 3 + 1];
            i3 = indices[index * 3 + 2];

            // Get face vertex values.

            p1p2x = vertices[i1 * 3] - vertices[i2 * 3]; // compute two vectors per face
            p1p2y = vertices[i1 * 3 + 1] - vertices[i2 * 3 + 1];
            p1p2z = vertices[i1 * 3 + 2] - vertices[i2 * 3 + 2];
            p3p2x = vertices[i3 * 3] - vertices[i2 * 3];
            p3p2y = vertices[i3 * 3 + 1] - vertices[i2 * 3 + 1];
            p3p2z = vertices[i3 * 3 + 2] - vertices[i2 * 3 + 2];

            faceNormalx = p1p2y * p3p2z - p1p2z * p3p2y; // compute the face normal with cross product
            faceNormaly = p1p2z * p3p2x - p1p2x * p3p2z;
            faceNormalz = p1p2x * p3p2y - p1p2y * p3p2x;

            length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
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

        // last normalization of each normal

        for (index = 0; index < normals.length / 3; index++) {
            faceNormalx = normals[index * 3];
            faceNormaly = -normals[index * 3 + 1];
            faceNormalz = normals[index * 3 + 2];
            length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
            length = (length === 0) ? 1.0 : length;
            faceNormalx /= length;
            faceNormaly /= length;
            faceNormalz /= length;

            // NOTE: added negative (-) to x, z to match lighting model.

            normals[index * 3] = -faceNormalx;
            normals[index * 3 + 1] = faceNormaly;
            normals[index * 3 + 2] = -faceNormalz;

        }

    }

    /** 
     * Compute tangents. NOTE: some routines compute their own tangents.
     * CodePen - http://codepen.io/ktmpower/pen/ZbGRpW
     * adapted from the C++ code from this link: http://www.terathon.com/code/tangent.html
     * TODO: CONVERT TO GLMATRIX
     * "The code below generates a four-component tangent T in which the handedness of the local coordinate system
     * is stored as ±1 in the w-coordinate. The bitangent vector B is then given by B = (N × T) · Tw."
     */
    computeTangents ( vertices, indices, normals, texCoords ) {

        const vec3 = this.glMatrix.vec3;

        var tan1 = new Float32Array( normals.length );

        var tan2 = new Float32Array( normals.length );

        // the indices array specifies the triangles forming the object mesh (3 indices per triangle)
        const numIndices = indices.length;
        const numVertices = vertices.length;
        //const numNormals = normals.length;

        //console.log("NUMVERTICES:" + numVertices / 3 + " NUMINDICES:" + numIndices / 3 + " NUMNORMALS:" + numNormals / 3)

        // for each triangle (step through indices 3 by 3)
        for (var i = 0; i < numIndices; i += 3) {

            const i1 = indices[i], i2 = indices[i + 1], i3 = indices[i + 2];

            var j = i1 * 3; const v1x = vertices[j], v1y = vertices[j + 1], v1z = vertices[j + 2];
            var j = i2 * 3; const v2x = vertices[j], v2y = vertices[j + 1], v2z = vertices[j + 2];
            var j = i3 * 3; const v3x = vertices[j], v3y = vertices[j + 1], v3z = vertices[j + 2];
    
            const x1 = v2x - v1x, x2 = v3x - v1x;
            const y1 = v2y - v1y, y2 = v3y - v1y;
            const z1 = v2z - v1z, z2 = v3z - v1z;

            var j = i1 * 2; const w1x = texCoords[j], w1y = texCoords[j + 1];
            var j = i2 * 2; const w2x = texCoords[j], w2y = texCoords[j + 1];
            var j = i3 * 2; const w3x = texCoords[j], w3y = texCoords[j + 1];

            const s1 = w2x - w1x, s2 = w3x - w1x;
            const t1 = w2y - w1y, t2 = w3y - w1y;

            const r = 1.0 / (s1 * t2 - s2 * t1);

            const sx = (t2 * x1 - t1 * x2) * r, sy = (t2 * y1 - t1 * y2) * r, sz = (t2 * z1 - t1 * z2) * r;
            const tx = (s1 * x2 - s2 * x1) * r, ty = (s1 * y2 - s2 * y1) * r, tz = (s1 * z2 - s2 * z1) * r;

            var j = i1 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
            var j = i2 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
            var j = i3 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
        }

        var tangents = new Float32Array( numVertices * 4 / 3 ); // TODO: ADDED 4 to this!!
        //var numTangents = tangents.length / 4;

        //console.log("TAN1:" + tan1)
        //console.log("TAN2:" + tan2)

        //console.log('NUMTANGENTS:' + numTangents)
                                            
        for (var i3 = 0, i4 = 0; i4 < numVertices; i3 += 3, i4 += 4) {

            // not very efficient here (used the vec3 type and dot/cross operations from MV.js)
            const n  = [ normals[i3], normals[i3 + 1], normals[i3 + 2] ];
            const t1 = [ tan1   [i3], tan1   [i3 + 1], tan1   [i3 + 2] ];
            const t2 = [ tan2   [i3], tan2   [i3 + 1], tan2   [i3 + 2] ];

            //console.log('n:' + n + ' t1:' + t1 + ' t2:' + t2)

            // Gram-Schmidt orthogonalize
            ////////////////const tmp  = subtract(t1, scale(dot(n, t1), n));
            const tmp = vec3.sub( [ 0, 0, 0 ], t1, vec3.scale( [ 0, 0, 0 ], t1, vec3.dot( n, t1 ) ) );

            //console.log("TMP:" + tmp) //NOT COMPUTING THIS RIGHT, all NAN

            const len2 = tmp[ 0 ] * tmp[ 0 ] + tmp[1] * tmp[1] + tmp[2] * tmp[2];

            // normalize the vector only if non-zero length

            const txyz = ( len2 > 0 ) ? vec3.scale( [ 0, 0, 0 ], tmp, 1.0 / Math.sqrt( len2 ) ) : tmp;

            ////console.log("TXYZ:" + txyz );

            // Calculate handedness
            //////////////const tw = (dot(cross(n, t1), t2) < 0.0) ? -1.0 : 1.0;
            const tw = ( vec3.dot( vec3.cross( [ 0, 0, 0 ], n, t1 ), t2 ) < 0.0 ) ? -1.0 : 1.0;

            tangents[i4    ] = txyz[ 0 ];
            tangents[i4 + 1] = txyz[1];
            tangents[i4 + 2] = txyz[2];
            tangents[i4 + 3] = tw;

            ///console.log("TW:" + tw)

        }
  
        return tangents;

    }

    /* 
     * ---------------------------------------
     * GEOMETRY
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

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data

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

            prim.spaceMap[ prim.spaceMap.type.CLOUD ]( prim.divisions[ 0 ], prim.divisions[ 1 ], prim.divisions[2], 0.6, 1 );

        }

        // Vertices.

        // Indices.

        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Colors already present, or computed in this.createBuffers.

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

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

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        // Vertices.

        // Indices.

        // Normals.

        // Tangents.

        // Colors.

        if( ! colors.length ) {

            geo.colors.data = this.computeColors( normals, colors );

        }

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }


    /** 
     * type POLYGON.
     * rendered as GL_POLYGON.
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometryPoly ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        let l = prim.dimensions[ 0 ], 
        w = prim.dimensions[ 2 ];

        // Strategy is to determine number of sides, equally space, then connect.

        let sides = prim.divisions[ 0 ];

        // Get the distance between Points in radians.

        let sideInc = 2.0 * Math.PI * 1.0 / sides;

        for ( let i = 0; i < sides; i++ ) {

            // Vertices (also includes x/z sizing.

            vertices.push( 

                Math.sin( sideInc * i ) * l,
                0.0,
                Math.cos( sideInc * i ) * w

            );

            // Indices (if we're not making a cap).

            indices.push( i ); //NOT drawing triangles (use polygon shader)!

            // Normals.

            normals.push( 0, 1, 0 );

        }

        //this.computeNormals( vertices, indices, normals );

        // Indices (if we are making a cap) {

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Colors.

        if( ! colors.length ) {

            geo.colors.data = this.computeColors( normals, colors );

        }

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data; 

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

                //console.log("STARTSLICE FOR:" + prim.name + " = " + startSlice );

                let phi = longNum * 2 * Math.PI / longitudeBands;

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

        //////////////////geo = this.subDivide( geo );


        // Wind the SKYDOME indices backwards so texture displays inside.

        if ( prim.type === list.SKYDOME ) {

            geo.indices.data = indices.reverse();

        }

        // Tangents.

        geo.tangents.data = tangents = this.computeTangents( vertices, indices, normals, texCoords );

        // Color array is pre-created, or gets a default in createBuffers().

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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
     * Half-sphere, Indices are reversed, so texture displays inside by default.
     * prim.dimensions    = (vec4) [ x, y, z, startRadius | 0 ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * 
     * @param {Prim} the Prim needing geometry. 
     * @returns {Prim.geometry} geometry data, including vertices, indices, normals, texture coords and tangents. 
     * Creating WebGL buffers is turned on or off conditionally in the method.
     */
    geometrySkyDome ( prim ) {

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

        const list = this.typeList;

        const vec3 = this.glMatrix.vec3;

        let util = this.util;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays.

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data; 

        // Radius is measured along the x axis, height along y axis.

        let radius = prim.dimensions[ 0 ] || 0.5,
        height = prim.dimensions[ 1 ] || 1.0,
        subdivisionsHeight = prim.divisions[ 0 ] || 12,
        numSegments = prim.divisions[ 1 ] || 12;

        var positions = [];
        //var normals = [];
        var uvs = [];
        var cells = [];

        function calculateRing( segments, r, y, dy ) {

            var segIncr = 1.0 / ( segments - 1 );

            for( var s = 0; s < segments; s++ ) {

                var x = Math.cos( ( Math.PI * 2 ) * s * segIncr ) * r;

                var z = Math.sin( ( Math.PI * 2 ) * s * segIncr ) * r;

                positions.push( radius * x, radius * y + height * dy, radius * z );

                normals.push( x, y, z )

                var u =  1 - ( s * segIncr );

                var v = 0.5 + ( ( radius * y + height * dy ) / ( 2.0 * radius + height ) );

                uvs.push( u, v );

            }
        }

        var ringsBody = subdivisionsHeight + 1;

        var ringsTotal = subdivisionsHeight + ringsBody;


        var bodyIncr = 1.0 / ( ringsBody - 1 );

        var ringIncr = 1.0 / ( subdivisionsHeight - 1 );

        for( var r = 0; r < subdivisionsHeight / 2; r++ ) {

            calculateRing( numSegments, Math.sin( Math.PI * r * ringIncr), Math.sin( Math.PI * ( r * ringIncr - 0.5 ) ), -0.5 );

        }

        for( var r = 0; r < ringsBody; r++ ) {

            calculateRing( numSegments, 1.0, 0.0, r * bodyIncr - 0.5);

        }

        for( var r = subdivisionsHeight / 2; r < subdivisionsHeight; r++ ) {

            calculateRing( numSegments, Math.sin( Math.PI * r * ringIncr), Math.sin( Math.PI * ( r * ringIncr - 0.5 ) ), +0.5);

        }

        for( var r = 0; r < ringsTotal - 1; r++ ) {

            for( var s = 0; s < numSegments - 1; s++ ) {

                cells.push(
                    ( r * numSegments + ( s + 1 ) ),
                    ( r * numSegments + ( s + 0 ) ),
                    ( ( r + 1 ) * numSegments + ( s + 1 ) )
                    );

                cells.push(
                    ( ( r + 1 ) * numSegments + ( s + 0 ) ),
                    ( ( r + 1 ) * numSegments + ( s + 1 ) ),
                    ( r * numSegments + s )
                 )

            }

        }

        geo.vertices.data = positions;

        geo.indices.data = cells;

        geo.normals.data = normals;

        geo.texCoords.data = uvs;

        // Tangents.

        geo.tangents.data = tangents = this.computeTangents( vertices, indices, normals, texCoords );

        // Color array is pre-created, or gets a default in createBuffers().

        // Return the buffer.

        return this.createBuffers( prim.geometry );

    }

    /** 
     * Create a PLANE, CUBE, or spherical object from cube mesh.
     * --------------------------------------------------------------------
     * type CUBE.
     * rendered as WebGL TRIANGLES.
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

        const side = this.side;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        let sx = prim.dimensions[ 0 ],   // x width
        sy = prim.dimensions[ 1 ],       // y height
        sz = prim.dimensions[ 2 ],       // z depth
        nx = prim.divisions[ 0 ],        // should be x , j
        ny = prim.divisions[ 1 ],        // should be y, i 
        nz = prim.divisions[ 2 ]         // should be z

        //var numVertices = ( nx + 1 ) * ( ny + 1 ) * 2 + ( nx + 1 ) * ( nz + 1 ) * 2 + ( nz + 1 ) * ( ny + 1 ) * 2;

        var positions = [];

        var norms = [];

        let vertexIndex = 0;

        switch ( prim.type ) {

            case list.CUBE:

            case list.CUBESPHERE:

                makePlane( 0, 1, 2, sx, sy, nx, ny,  sz / 2,  1, -1 ); //front

                makePlane( 0, 1, 2, sx, sy, nx, ny, -sz / 2, -1, -1 ); //back

                makePlane( 2, 1, 0, sz, sy, nz, ny, -sx / 2,  1, -1 ); //left

                makePlane( 2, 1, 0, sz, sy, nz, ny,  sx / 2, -1, -1 ); //right

                makePlane( 0, 2, 1, sx, sz, nx, nz,  sy / 2,  1,  1 ); //top

                makePlane( 0, 2, 1, sx, sz, nx, nz, -sy / 2,  1, -1 ); //bottom

                break;

            case list.PLANE:
            case list.CURVEDOUTERPLANE:
            case list.CURVEDINNERPLANE:
            case list.TERRAIN:

                switch( prim.dimensions[ 3 ] ) { // which side, based on cube sides

                    case side.FRONT:
                        makePlane( 0, 1, 2, sx, sy, nx, ny, sz / 2,  1, -1 );
                    break;

                    case side.BACK:
                        makePlane( 0, 1, 2, sx, sy, nx, ny, -sz / 2, -1, -1 );
                    break;

                    case side.LEFT:
                        makePlane( 2, 1, 0, sx, sy, nz, ny, -sx / 2,  1, -1 );
                    break;

                    case side.RIGHT:
                        makePlane( 2, 1, 0, sx, sy, nz, ny,  sx / 2, -1, -1 ); 
                        break;

                    case side.TOP:
                        makePlane( 0, 2, 1, sx, sy, nx, nz,  sy / 2,  1,  1 ); // ROTATE xy axis
                        break;

                    case side.BOTTOM:
                        makePlane( 0, 2, 1, sx, -sy, nx, nz, -sy / 2,  1, -1 ); // ROTATE xy axis
                        break;

                    default:
                        break;

                }
                break;

            default:
                break;

        }

        // Make an individual Plane.

        function makePlane( u, v, w, su, sv, nu, nv, pw, flipu, flipv ) {

            // Create a size, positioning in correct position.

            var vertShift = vertexIndex;

            if( prim.name === 'testPlane') console.log( 'i:' + i + ' j:' + j)

            for( var j = 0; j <= nv; j++ ) {

                for( var i = 0; i <= nu; i++ ) {

                    var vert = positions[ vertexIndex ] = [ 0, 0, 0 ];

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

            // Compute indices.

            for(var j = 0; j < nv; j++ ) {

                for(var i = 0; i < nu; i++ ) {

                    var n = vertShift + j * ( nu + 1 ) + i;

                    indices.push( n, n + nu  + 1, n + nu + 2 );

                    indices.push( n, n + nu + 2, n + 1 );

                }

            }

        } // end of makePlane.

        // Round the edges of the CUBE or SPHERECUBE to a sphere.

        if ( ( prim.type === list.CUBE || prim.type === list.CUBESPHERE ) && prim.divisions[ 3 ] !== 0 ) {

            var tmp = [ 0, 0, 0 ];

            // Radius controlled by 4th parameter in divisions

            var radius = prim.divisions[ 3 ];

            var rx = sx / 2.0;

            var ry = sy / 2.0;

            var rz = sz / 2.0;

            for( var i = 0; i < positions.length; i++ ) {

                var pos = positions[ i ];

                var normal = normals[ i ];

                var inner = [ pos[ 0 ], pos[ 1 ], pos[ 2 ] ];

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

            for( var i = 0; i < positions.length; i++ ) {

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

        vertices = geo.vertices.data = flatten( positions, false );

        normals = geo.normals.data = flatten( norms, false );

        // Re-compute normals, which may have changed.

        this.computeNormals( vertices, indices, normals );

        // Color array is pre-created, or gets a default in createBuffers().

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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

            prim.heightMap[ prim.heightMap.type.DIAMOND ]( prim.divisions[ 0 ], prim.divisions[2], 0.6, 1 );

            // TODO: SCALE DOWN FOR WATERLINE.

            //prim.heightMap.scale( 165, 165 );

            //prim.heightMap.scale( 25, 25 );

        }

        // NOTE: this can make the heightmap in any orientation.

        return this.geometryOuterPlane( prim );

    };

    /** 
     * type CUBESPHERE.
     * rendered as WebGL TRIANGLES.
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
     * divisions max: ~60
     * @param {Object} prim the primitive needing geometry.
     * @param {Boolean} noSphere if false, make an icosohedron.
     */
    geometryIcoSphere ( prim ) {

        //const vec2 = this.glMatrix.vec2;

        const vec3 = this.glMatrix.vec3;

        const flatten = this.util.flatten;

        const list = this.typeList;

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

        let getVecs = this.getStdVecs;

        let directions = [
            'left',
            'back',
            'right',
            'forward'
        ];

        // Allocate memory, since we may have to access out-of-range vertices, indices.

        let geo = prim.geometry;

        // TODO: halve index length if making a dome.

        let vertices = geo.vertices.data = new Array ( ( resolution + 1 ) * ( resolution + 1 ) * 4 - (resolution * 2 - 1) * 3 ),
        indices  = geo.indices.data = new Array( (1 << ( subdivisions * 2 + 3) ) * 3 ),
        texCoords = geo.texCoords.data = new Array( vertices.length ),
        normals = geo.normals.data = new Array( vertices.length ),
        tangents = geo.tangents.data = new Array( vertices.length );

        // Initialize lots of default variables.

        let v = 0, vBottom = 0, t = 0, i, d, progress, from, to;

        for ( i = 0; i < 4; i++ ) {

            vertices[ v++ ] = getVecs('down');

        }

        for ( i = 1; i <= resolution; i++ ) {

            progress = i / resolution;

            to = vec3.lerp( [ 0, 0, 0 ], getVecs( 'down' ), getVecs( 'forward' ), progress );

            vertices[ v++ ] = vec3.copy( [ 0, 0, 0 ], to );

            for ( d = 0; d < 4; d++) {

                from = vec3.copy( [ 0, 0, 0 ], to );

                to = vec3.lerp( [ 0, 0, 0 ], getVecs( 'down' ), getVecs( directions[ d ] ), progress );

                t = createLowerStrip( i, v, vBottom, t, indices );

                v = createVertexLine( from, to, i, v, vertices );

                vBottom += i > 1 ? (i - 1) : 1;

            }

            vBottom = v - 1 - i * 4;

        }

        for ( i = resolution - 1; i >= 1; i-- ) {

                progress = i / resolution;

                to = vec3.lerp( [ 0, 0, 0 ], getVecs( 'up' ), getVecs( 'forward' ), progress );

                vertices[ v++ ] = vec3.copy( [ 0, 0, 0 ], to );

                for ( d = 0; d < 4; d++) {

                    from = vec3.copy( [ 0, 0, 0 ], to );

                    to = vec3.lerp( [ 0, 0, 0 ], getVecs( 'up' ), getVecs( directions[ d ] ), progress );

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

            vertices[ v++ ] = getVecs( 'up' );

        }

        // Create our Normals, and set icosphere to unit size.

        for ( i = 0; i < vertices.length; i++ ) {

            // Toggle icosphere with icosohedron.

            //if ( prim.type === list.ICOSPHERE ) {

            if ( prim.type !== list.OCTAHEDRON ) {

                vertices[i] = vec3.normalize( [ 0, 0, 0 ], vertices[ i ] );

            }

            //}

            normals[i] = vec3.copy( [ 0, 0, 0 ], vertices[ i ] );

        }

        // Texture coords.

        createUV( vertices, texCoords );

        // Tangents.

        createTangents( vertices, tangents );

        // Scale. NOTE: this has to be after createUV and createTangents (assuming unit sphere).

        // TODO: TEST TO MAKE SURE IT WORKS

        // TODO: MAKE DOME INSTEAD OF SPHERE OPTION.

        if ( radius != 1 ) {

            for ( i = 0; i < vertices.length; i++ ) {

                    vertices[ i ][ 0 ] *= radius;

                    vertices[ i ][ 1 ] *= prim.dimensions[1] / 2; //radius;

                    vertices[ i ][ 2 ] *= prim.dimensions[2] / 2; //radius;

            }

        }

        // Flatten the data arrays.

        vertices = geo.vertices.data = flatten( vertices, false );

        texCoords = geo.texCoords.data = flatten( texCoords, false );

        normals = geo.normals.data = flatten(normals, false );

        tangents = geo.tangents.data = flatten(tangents, false );

        // Color array is pre-created, or gets a default in createBuffers().

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

                textureCoordinates[ 0 ] = Math.atan2( v[ 0 ], v[ 2 ] ) / ( -2 * Math.PI );  // was v.x, v.z

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

                v = vertices[i];

                v[1] = 0;            // was v.y

                //v = v.normalized;
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

            //console.log("VECTOR ARRAY:" + vertices.length)

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

        window.geo = geo;

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        // TODO: abstract the creation of the triangle fan for each pentagon.

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        sides = geo.sides.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        // Size and divisions.

        let wi = prim.dimensions[ 0 ];

        let hi = prim.dimensions[ 1 ];

        let de = prim.dimensions[ 2 ];

        let subdivisions = prim.divisions[ 0 ];

        var phi = ( 1 + Math.sqrt( 5 ) ) / 2;

        var b = 1 / phi;

        var c = 2 - phi;

        var ertices = [
             b,  b,  b,   0,  1,  c,  -b,  b,  b,  -c,  0,  1,   c,  0,  1,
            -b, -b,  b,   0, -1,  c,   b, -b,  b,   c,  0,  1,  -c,  0,  1,
             b, -b, -b,   0, -1, -c,  -b, -b, -b,  -c,  0, -1,   c,  0, -1,
            -b,  b, -b,   0,  1, -c,   b,  b, -b,   c,  0, -1,  -c,  0, -1,
             0,  1, -c,   0,  1,  c,   b,  b,  b,   1,  c,  0,   b,  b, -b,
             0,  1,  c,   0,  1, -c,  -b,  b, -b,  -1,  c,  0,  -b,  b,  b,
             0, -1, -c,   0, -1,  c,  -b, -b,  b,  -1, -c,  0,  -b, -b, -b,
             0, -1,  c,   0, -1, -c,   b, -b, -b,   1, -c,  0,   b, -b,  b,
             b,  b,  b,   c,  0,  1,   b, -b,  b,   1, -c,  0,   1,  c,  0,
             b, -b, -b,   c,  0, -1,   b,  b, -b,   1,  c,  0,   1, -c,  0,
            -b,  b, -b,  -c,  0, -1,  -b, -b, -b,  -1, -c,  0,  -1,  c,  0,
            -b, -b,  b,  -c,  0,  1,  -b,  b,  b,  -1,  c,  0,  -1, -c,  0
        ];



        // The problem is that the five points listed are not 5 triangles, so we have
        // to find the middle of each set of five, and duplicate the last point.
        // Am I proud of this code?  No.

        for ( let i = 0; i < ertices.length; i += 15) {

            var a = [ertices[i], ertices[i + 1], ertices[i + 2]];
            var b = [ertices[i + 3], ertices[i + 4], ertices[i + 5]];
            var c = [ertices[i + 6], ertices[i + 7], ertices[i + 8]];
            var d = [ertices[i + 9], ertices[i + 10], ertices[i + 11]];
            var e = [ertices[i + 12], ertices[i + 13], ertices[i + 14]];
        
            var center = [
                ( a[ 0 ] + b[ 0 ] + c[ 0 ] + d[ 0 ] + e[ 0 ] ) / 5,
                ( a[ 1 ] + b[ 1 ] + c[ 1 ] + d[ 1 ] + e[ 1 ] ) / 5,
                ( a[ 2 ] + b[ 2 ] + c[ 2 ] + d[ 2 ] + e[ 2 ] ) / 5
            ];

            let side = [];

            vertices.push.apply(vertices, a);
            side.push( a );

            vertices.push.apply(vertices, b);
            side.push( b );

            vertices.push.apply(vertices, center);
            side.push( center );

            vertices.push.apply(vertices, b);
            side.push( b );

            vertices.push.apply(vertices, c);
            side.push( c );

            vertices.push.apply(vertices, center);
            side.push( center );

            vertices.push.apply(vertices, c);
            side.push( c );

            vertices.push.apply(vertices, d);
            side.push( d );

            vertices.push.apply(vertices, center);
            side.push( center );

            vertices.push.apply(vertices, d);
            side.push( d );

            vertices.push.apply(vertices, e);
            side.push( e );

            vertices.push.apply(vertices, center);
            side.push( center );

            vertices.push.apply(vertices, e);
            side.push( e );

            vertices.push.apply(vertices, a);
            side.push( a );

            vertices.push.apply(vertices, center);
            side.push( center );

            sides.push( side );

        }

        // Indices.

        for ( var ii = 0, len = vertices.length / 3; ii < len; ii++ ) {

            indices.push( ii );

        }

        for ( var i = 0; i < vertices.length; i += 15) {

            setUV( i );
            setUV( i + 3);
            setUV( i + 6 );
            setUV( i + 9);
            setUV( i + 12);

        }

        // Normals.

        for ( var i = 0; i < vertices.length; i += 9 ) {

            var a = [ vertices[ i     ], vertices[ i + 1 ], vertices[ i + 2 ] ];

            var b = [ vertices[ i + 3 ], vertices[ i + 4 ], vertices[ i + 5 ] ];

            var c = [ vertices[ i + 6 ], vertices[ i + 7 ], vertices[ i + 8 ] ];

            // Normalizing is probably not necessary.
            // It should also be seperated out.

            // Create normals.

            let d = vec3.sub( [ 0, 0, 0 ], a, b );

            let e = vec3.sub( [ 0, 0, 0 ], a, c );

            let f = vec3.cross( [ 0, 0, 0 ], d, e );

            let normal = vec3.normalize( [ 0, 0, 0 ], f );

            normals.push( 

                normal[ 0 ], normal[ 1 ], normal[ 2 ],

                normal[ 0 ], normal[ 1 ], normal[ 2 ],

                normal[ 0 ], normal[ 1 ], normal[ 2 ]

            );

            // Scale.

            vertices[ i ]     *= wi;

            vertices[ i + 1 ] *= hi;

            vertices[ i + 2 ] *= de;

            vertices[ i + 3 ] *= wi;

            vertices[ i + 4 ] *= hi;

            vertices[ i + 5 ] *= de;

            vertices[ i + 6 ] *= wi;

            vertices[ i + 7 ] *= hi;

            vertices[ i + 8 ] *= de;

        }


            // Texture coordinates using positions on a sphere.
            // https://www.mvps.org/directx/articles/spheremap.htm


            function setUV ( vPos ) {

              let u, v;

                u = Math.atan2( vertices[ vPos ], vertices[ vPos + 2 ] ) / ( 2 * Math.PI );  // was v.x, v.z

                if ( u < 0 ) {   // was textureCoordinates.x

                    u += 1;    // was textureCoordinates

                }

                v = Math.asin( vertices[ vPos + 1 ] ) / Math.PI + 0.5;  // was v.y, textureCoordinates.y

                // corrections. TODO:
              
                texCoords.push( u, v );

            }

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        let radius = prim.dimensions[ 0 ] / 2; // x coordinate, width of torus in x direction

        let ringRadius = prim.dimensions[ 2 ] / 2; // ringradius

        let rings = prim.divisions[ 0 ];

        let sides = prim.divisions[ 1 ];

       // radius = 0.5, ringRadius = 0.25, sides = 36, rings = 24;

        let numVerticesPerRow = sides + 1;

        let numVerticesPerColumn = rings + 1;

        //let numVertices = numVerticesPerRow * numVerticesPerColumn;

        let verticalAngularStride = Math.PI * 2.0 / rings;

        let horizontalAngularStride = Math.PI * 2.0 / sides;

        let theta = 0, phi = 0, x, y, z;

        for ( let verticalIt = 0; verticalIt < numVerticesPerColumn; verticalIt++ ) {
            
            theta = verticalAngularStride * verticalIt;

            for ( let horizontalIt = 0; horizontalIt < numVerticesPerRow; horizontalIt++ ) {
          
                phi = horizontalAngularStride * horizontalIt;

                // position
                x = Math.cos( theta ) * ( radius + ringRadius * Math.cos( phi ) );

                y = Math.sin( theta ) * ( radius + ringRadius * Math.cos( phi ) );

                z = ringRadius * Math.sin(phi);

                vertices.push( x, y, z ); // NOTE: x, z, y gives a horizontal torus! NOTE: MAY WANT TO DO FOR PLANE

                let norm = vec3.normalize( [ 0, 0, 0 ], [ x, y, z ] );

                normals.push( norm[ 0 ], norm[ 1 ], norm[ 2 ] );

                let u = horizontalIt / numVerticesPerRow;

                let v = verticalIt / numVerticesPerColumn;

                texCoords.push( u, v );

            }

        }

       // let numIndices = sides * rings * 6;

        for ( let verticalIt = 0; verticalIt < rings; verticalIt++ ) {

            for ( let horizontalIt = 0; horizontalIt < sides; horizontalIt++ ) {

                let lt = ( horizontalIt + verticalIt * ( numVerticesPerRow) );

                let rt = ( ( horizontalIt + 1 ) + verticalIt * ( numVerticesPerRow ) );

                let lb = ( horizontalIt + ( verticalIt + 1) * ( numVerticesPerRow ) );

                let rb = ( ( horizontalIt + 1 ) + ( verticalIt + 1 ) * ( numVerticesPerRow ) );

                indices.push( lb, rb, rt, lb, rt, lt );

                // note: wrap backwards to see inside of torus.

            }

        }

        // Color array is pre-created, or gets a default in createBuffers().

        // Return the buffer.

        return this.createBuffers( prim.geometry );

    }


    ///////////////////////////////////////////////////////////////////////
    // geo primitives
    // USE THIS!!!! https://github.com/nickdesaulniers/prims
    // https://github.com/mhintz/platonic/tree/master/src
    // https://github.com/azmobi2/html5-webgl-geometry-shapes/blob/master/webgl_geometry_shapes.html
    // Subdivide algorithm
    // https://github.com/mikolalysenko/loop-subdivide
    // https://github.com/Erkaman/gl-catmull-clark
    // https://www.ibiblio.org/e-notes/Splines/models/loop.js
    // convert fonts to texture
    // https://github.com/framelab/fontmatic
    ///////////////////////////////////////////////////////////////////////

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

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data;

        // Vertices.

        // Indices.

        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Color array is pre-created, or gets a default in createBuffers().

        // Return the buffer.

        return this.createBuffers( prim.geometry );

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
     */
    createPrim ( type, name = 'unknown', dimensions, divisions, position, acceleration, 
        rotation, angular, textureImage, color ) {

        const vec3 = this.glMatrix.vec3;

        const mat4 = this.glMatrix.mat4;

        if ( ! this.checkType( type ) ) {

            console.error( 'unsupported Prim type, ' + type );

            return null;
        }

        let prim = {};

        prim.id = this.setId();

        prim.name = name;

        prim.scale = 1.0; // starting size = default scale

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

        // Side to render

        prim.side = this.DEFAULT_SIDE; // TODO: Normals outside, inside or both !!!!!!!!!!!!!!!!!!!! CHANGE

        // Waypoints for scripted motion.

        prim.waypoints = [];

        // Store multiple textures for one Prim.

        prim.textures = [];

        // Store multiple sounds for one Prim.

        prim.audio = [];

        // Store multiple videos for one Prim.

        prim.video = [];

        // Multiple textures per Prim. Rendering defines how textures for each Prim type are used.

        for ( let i = 0; i < textureImage.length; i++ ) {

            this.loadTexture.load( textureImage[ i ], prim );

        }

        // Define Prim material (only one material type at a time per Prim ).

        prim.material = this.setMaterial();

        // Define Prim light (it glows) not how it is lit.

        this.light = {

            direction: [ 1, 1, 1 ],

            color: [ 255, 255, 255 ]

        };

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

        // startRadius and endRadius are used by a few Prims (e.g. Cone)

        //if ( dimensions[ 3 ] === undefined ) {

       //     dimensions[ 4 ] = dimensions[ 3 ] = dimensions[ 0 ] / 2;

       // }

        // Set the geometry, based on defined type.

        prim.type = type;

        prim.geometry = this.createBufferObj();

        // Copy geometry type for use in rendering/shaders later.

        prim.geometry.type = type;

        // NOTE: mis-spelling type leads to error here...

        prim.geometry = this[ type ]( prim, color );

        // Standard Prim properties for position, translation, rotation, orbits. Used by shader/renderer objects (e.g. shaderTexture).

        // Note: should use scale matrix
        // TODO: @link https://nickdesaulniers.github.io/RawWebGL/#/16

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

        }

        prim.renderId = -1; // NOT ASSIGNED. TODO: Assign a renderer to each Prim.

        // Push into our list;

        this.objs.push( prim );

        // Prim readout to console.

        this.primReadout( prim ); // TODO: DEBUG!!!!!!!!!!!!!!!!!!!!!!

        return prim;

    }

    /* 
     * ---------------------------------------
     * PRIM TRANSFORMS AND PROPERTIES
     * ---------------------------------------
     */

    /** 
     * Scale vertices directly, without changing position.
     */
    scale ( vertices, scale ) {

        let oldPos = this.getCenter( vertices );

        for ( let i = 0, len = vertices.length; i < len; i++ ) {

            vertices[ i ] *= scale;

        }

        this.move( vertices, oldPos );

    }

    /** 
     * Move vertices directly in geometry, i.e. for something 
     * that always orbits a central point.
     * NOTE: normally, you will want to use a matrix transform to position objects.
     */
    move ( vertices, pos ) {

        let center = this.getCenter( vertices );

        let delta = [

            center[ 0 ] - pos[ 0 ],

            center[ 1 ] - pos[ 1 ],

            center[ 2 ] = pos[ 2 ]

        ];

        for ( let i = 0, len = vertices.length; i < len; i += 3 ) {

            vertices[i] = delta[ 0 ];

            vertices[ i + 1 ] = delta[ 1 ];

            vertices[ i + 2 ] = delta[ 2 ];

        }

    }

    /** 
     * Get the bounding box of a shape by getting the largest and 
     * smallest vertices in coordinate space.
     * TODO: incomplete.
     */
    boundingBox ( vertices ) {

        let biggest = [ 0, 0, 0 ];

        let smallest = [ 0, 0, 0 ];

        let minX, minY, minZ, maxX, maxY, maxZ;

        for ( let i = 0, len = vertices.length; i < len; i += 3 ) {

            minX = Math.min( vertices[ i ], minX );

            minY = Math.min( vertices[ i + 1 ], minY );

            minZ = Math.min( vertices[ i + 2 ], minZ );

            maxX = Math.max( vertices[ i ], maxX );

            maxY = Math.max( vertices[ i + 1 ], maxY );

            maxZ = Math.max( vertices[ i + 2 ], maxZ );

        }

        // Create cube points.

        // TODO: not complete.

        let box = [];

        return box;

    }

    /** 
     * Get the center of a shape.
     * @param {Array|Float32Array} a flat array of 3d vertices.
     * @returns {GlMatrix.vec3} a array with the centroid x, y, z. 
     */
    getCentroid ( vertices ) {

        let centroid = [ 0, 0, 0 ];

        let len = vertices.length;

        for( let i = 0; i < len; i += 3 ) {

            centroid[ 0 ] += vertices[ i ];

            centroid[ 1 ] += vertices[ i + 1 ];

            centroid[ 2 ] += vertices[ i + 2 ];

        }

        centroid[ 0 ] /= len;

        centroid[ 1 ] /= len;

        centroid[ 2 ] /= len;

        return centroid;

    }

    /** 
     * Set a material for a prim.
     * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
     * didn't use chroma (but could)
     * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
     */
    setMaterial ( prim ) {

       return {

            colorMult:             0,

            diffuse:               [ 1, 1, 1 ], // TODO: should be textures[ 0 ]

            specular:              [ 1, 1, 1, 1 ],

            shininess:             this.util.getRand( 500 ),

            specularFactor:        this.util.getRand( 1 ) // TODO: MAY NOT BE RIGHT

        }

    }

}
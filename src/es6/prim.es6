import Map2d from './map2d';


export default class Prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     * 
     * NOTE: if you need more complex shapes, use a mesh file, or 
     * a library like http://evanw.github.io/csg.js/ to implement 
     * mesh operations.
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

            POINT: 'geometryPoint',

            POINTCLOUD: 'geometryPointCloud',

            LINE: 'geometryLine',

            PLANE: 'geometryPlane',

            CIRCLE: 'geometryCircle',

            POLY: 'geometryPoly',

            CUBE: 'geometryCube',

            SPHERE: 'geometrySphere',

            ICOSOHEDRON: 'geometryIcosohedron',

            CUBESPHERE: 'geometryCubeSphere',

            ICOSPHERE: 'geometryIcoSphere',

            DOME: 'geometryDome',

            TOPDOME: 'geometryTopDome',

            BOTTOMDOME: 'geometryBottomDome',

            TOPICODOME: 'geometryTopIcoDome',

            BOTTOMICODOME: 'geometryBottomIcoDome',

            CONE: 'geometryCone',

            TOPCONE: 'geometryTopCone',

            BOTTOMCONE: 'geometryBottomCone',

            CYLINDER: 'geometryCylinder',

            MESH: 'geometryMesh',

            TERRAIN: 'geometryTerrain'

        };

        this.DEFAULT_SIDE = 0;
        this.FRONT_SIDE = 1;
        this.BACK_SIDE = 1;
        this.DOUBLE_SIDE = 2;

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
     * Get the big array with all vertex data. Use to 
     * send multiple prims sharing the same shader to one 
     * Renderer.
     */
    setVertexData ( vertices ) {

        vertices = [];

        let len = this.objs.length;

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

        let len = this.objs.length;

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

            indices: {

                data: [],

                buffer: null,

                itemSize: 1,

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

            edges: {

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

        let concat = this.util.concatArr;

        concat( bufferObj.vertices.data, vertices );

        concat( bufferObj.indices.data, indices );

        concat( bufferObj.texCoords.data, texCoords );

        concat( bufferObj.normals.data, normals );

        concat( bufferObj.tangents.data, tangents );

        concat( bufferObj.colors.data, colors );

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

            let gl = this.webgl.getContext();

            let o;

            // Vertex Buffer Object.

            o = bufferObj.vertices;

            if ( ! o.data ) {

                console.log( 'no vertices present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the Index buffer.

            o = bufferObj.indices;

            if ( ! o.data ) {

                console.log( 'no indices present, creating default' );

                o.data = new Uint16Array( [ 1 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // create the Normals buffer.

            o = bufferObj.normals;

            if ( ! o.data ) {

                console.log( 'no normals, present, creating default' );

                o.data = new Float32Array( [ 0, 1, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the primary Texture buffer.

            o = bufferObj.texCoords;

            if ( ! o.data ) {

                console.warn( 'no texture present, creating default' );

                o.data = new Float32Array( [ 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // create the Tangents Buffer.

            o = bufferObj.tangents;

            if ( ! o.data ) {

                console.warn( 'no tangents present, creating default' );

                o.data = new Float32Array( [ 0, 0, 0, 0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the Edges buffer.

            o = bufferObj.edges;

            if( ! o.data ) {

                console.warn( 'no edges present, creating default' );

                o.data = new Float32Array( [0, 0, 0] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

            // Create the Colors buffer.

            o = bufferObj.colors;

            if ( ! o.data ) {

                console.warn( 'no colors present, creating default color' );

                o.data = new Float32Array( [ 0.2, 0.5, 0.2, 1.0 ] );

            }

            o.buffer = gl.createBuffer();

            gl.bindBuffer( gl.ARRAY_BUFFER, o.buffer );

            gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( o.data ), gl.STATIC_DRAW );

            o.numItems = o.data.length / o.itemSize;

        return bufferObj;

    }

    /** 
     * Check the values of a Prim.
     * TODO: why is itemsize of indices = 1??????
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
     * Simulate Vector3.down, etc. defaults (in many Unity C# scripts).
     * @link https://docs.unity3d.com/ScriptReference/Vector3.html
    */
    getStdVec3 ( type ) {

        switch (type) {
            case 'back': return [0, 0, -1]; break;
            case 'down': return [0, -1, 0]; break;
            case 'forward': return [0, 0, 1]; break;
            case 'left': return [-1, 0, 0]; break;
            case 'one': return [1, 1, 1]; break;
            case 'right': return [1, 0, 0]; break;
            case 'up': return [0, 1, 0]; break;
            case 'zero': return [0, 0, 0]; break;
        }

    }

    /* 
     * ---------------------------------------
     * NORMAL, INDEX, VERTEX CALCULATIONS
     * ---------------------------------------
     */

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

        let vec3 = this.glMatrix.vec3;

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
     * Adapted from BabylonJS
     * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
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
     * Set or reset indices, normals, texCoords in-place, based on
     * wether we draw to the front, back, or both. Adapted from 
     * BabylonJS example.
     * @param {ENUM} sideOrientation either front, back, or both.
     * @param {glMatrix.vec3} vertices the 3d vertex coordinates.
     * @param {glMatrix.vec3} indices the 3d face coordinates.
     * @param {glMatrix.vec3} normals the 3d normals.
     * @param {glMatrix.vec2} texCoords the 2d texture coordinates.
     * @param {glMatrix.vec3} tangents the 4d tangent coordinates.
     * TODO: tangents
     */
    computeSides ( sideOrientation, positions, indices, normals, uvs, tangents ) {

            var li = indices.length;
            var ln = normals.length;
            var i;
            var n;
            sideOrientation = sideOrientation || this.DEFAULT_SIDE;

            switch (sideOrientation) {

                case this.FRONT_SIDE:
                    // nothing changed
                    break;

                case this.BACK_SIDE:
                    var tmp;
                    // indices
                    for (i = 0; i < li; i += 3) {
                        tmp = indices[i];
                        indices[i] = indices[i + 2];
                        indices[i + 2] = tmp;
                    }
                    // normals
                    for (n = 0; n < ln; n++) {
                        normals[n] = -normals[n];
                    }
                    break;

                case this.DOUBLE_SIDE:
                    // positions
                    var lp = positions.length;
                    var l = lp / 3;
                    for (var p = 0; p < lp; p++) {
                        positions[lp + p] = positions[p];
                    } 
                    // indices
                    for ( i = 0; i < li; i += 3) {
                        indices[i + li] = indices[i + 2] + l;
                        indices[i + 1 + li] = indices[i + 1] + l;
                        indices[i + 2 + li] = indices[i] + l;
                    }
                    // normals
                    for (n = 0; n < ln; n++) {
                        normals[ln + n] = -normals[n];
                    }
                    // uvs
                    var lu = uvs.length;
                    for (var u = 0; u < lu; u++) {
                        uvs[u + lu] = uvs[u];
                    }
                    break;
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

        let vec3 = this.glMatrix.vec3;

        var tan1 = new Float32Array( normals.length );
        var tan2 = new Float32Array( normals.length );

        // the indices array specifies the triangles forming the object mesh (3 indices per triangle)
        const numIndices = indices.length;
        const numVertices = vertices.length;
        const numNormals = normals.length;

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
        var numTangents = tangents.length / 4;

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
            const tmp = vec3.sub( [0,0,0], t1, vec3.scale( [0,0,0], t1, vec3.dot( n, t1 ) ) );

            //console.log("TMP:" + tmp) //NOT COMPUTING THIS RIGHT, all NAN

            const len2 = tmp[0] * tmp[0] + tmp[1] * tmp[1] + tmp[2] * tmp[2];

            // normalize the vector only if non-zero length

            const txyz = ( len2 > 0 ) ? vec3.scale( [0,0,0], tmp, 1.0 / Math.sqrt( len2 ) ) : tmp;

            ////console.log("TXYZ:" + txyz );

            // Calculate handedness
            //////////////const tw = (dot(cross(n, t1), t2) < 0.0) ? -1.0 : 1.0;
            const tw = ( vec3.dot( vec3.cross( [0,0,0], n, t1 ), t2 ) < 0.0 ) ? -1.0 : 1.0;

            tangents[i4    ] = txyz[0];
            tangents[i4 + 1] = txyz[1];
            tangents[i4 + 2] = txyz[2];
            tangents[i4 + 3] = tw;

            ///console.log("TW:" + tw)

        }
  
        return tangents;

    }

    /** 
     * Subdivide a mesh, keep vertices shared.
     * @link http://answers.unity3d.com/questions/259127/does-anyone-have-any-code-to-subdivide-a-mesh-and.html
     * @link https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
     */
    subdivide ( geometry ) {

    }


    /* 
     * ---------------------------------------
     * GEOMETRY
     * ---------------------------------------
     */

    /** 
     * WebGL point.
     */
    geometryPoint ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }


    }

    /** 
     * WebGL point cloud (particle system).
     * https://github.com/potree/potree/releases
     */
    geometryPointCloud ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * WebGL particle system
     * @link https://www.khronos.org/registry/webgl/sdk/demos/google/particles/index.html
     * @link https://github.com/gouzhen1/WebGL-Particle-System/
     * @link https://github.com/gouzhen1/WebGL-Particle-System/blob/master/index.html#L3
     * @link http://nullprogram.com/blog/2014/06/29/
     * https://codepen.io/kenjiSpecial/pen/yyeaKm

     */
    geometryParticleSystem () {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * WebGL line.
     */
    geometryLine ( prim ) {

        let geo = prim.geometry;

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * Plane (non-infinite, multiple vertices, can be turned into TERRAIN)
     */
    geometryPlane ( prim ) {

        let vec3 = this.glMatrix.vec3;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        let cols = prim.divisions[ 0 ], // x axis (really xz)
        rows = prim.divisions[ 2 ]; // z axis

        let halfX = prim.dimensions[ 0 ] / 2, // x axis
        halfZ = prim.dimensions[ 2 ] / 2; // z axis

        let incX = prim.dimensions[ 0 ] / prim.divisions[ 0 ],
        incY = 1.0,
        incZ = prim.dimensions[ 2 ] / prim.divisions[ 2 ];

        for ( let colNumber = 0; colNumber <= cols; colNumber++ ) {

            for ( let rowNumber = 0; rowNumber <= rows; rowNumber++ ) {

                // Vertex values.

                let x = colNumber;

                let y = 0;

                // Get interpolated pixel height from heightmap.

                if ( prim.heightMap ) {

                    y = prim.heightMap.getPixel( colNumber, rowNumber );

                }

                let z = rowNumber;

                // Texture coords.

                let u = (colNumber / cols);

                let v = 1 - (rowNumber / rows);

                // Add to arrays.

                vertices.push( ( incX * x ) - halfX, ( incY * y), ( incZ * z ) - halfZ );

                texCoords.push( u, v );

                normals.push( 0, 1.0, 0 );

            }

        }

        // Indices.

        for (let rowNumber = 0; rowNumber < rows; rowNumber++) {

            for (let colNumber = 0; colNumber < cols; colNumber++) {

                let first = (rowNumber * (cols + 1)) + colNumber;

                let second = first + cols + 1;

                // Note: we're running culling in reverse from some tutorials here.

                indices.push( first + 1, second + 1, second );

                indices.push( first + 1, second, first );

            }

        }

        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

        //return this.createBuffers ( this.createBufferObj(), vertices, indices, texCoords, normals, tangents, colors );

    }

    /** 
     * Polygon (flat), square to circular.
     */
    geometryPoly ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * Create a (non-subdivided) cube geometry of a given size (units) centered 
     * on a point.
     * @param {GLMatrix.Vec3} center a 3d vector defining the center.
     * @param {Size} width, height, depth, with 1.0 (unit) max size
     * @param {Number} scale relative to unit size (1, 1, 1).
      name = 'unknown', scale = 1.0, dimensions, position, acceleration, rotation, textureImage, color
     */
    geometryCube ( prim ) {

        // Shortcuts to Prim data arrays

        let x = prim.dimensions[ 0 ] / 2;

        let y = prim.dimensions[ 1 ] / 2;

        let z = prim.dimensions[ 2 ] / 2 ;

        // Create cube geometry.

        let vertices = prim.geometry.vertices.data = [
            // Front face
            -1.0, -1.0,  1.0, // bottomleft
             1.0, -1.0,  1.0, // bottomright
             1.0,  1.0,  1.0, // topright
            -1.0,  1.0,  1.0, // topleft
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];

        let indices = prim.geometry.indices.data = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face //can't go to 30
            20, 21, 22,   20, 22, 23  // Left face
        ];

        let normals = prim.geometry.normals.data = [
            // Front face
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            0.0,  0.0,  1.0,
            // Back face
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            0.0,  0.0, -1.0,
            // Top face
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            0.0,  1.0,  0.0,
            // Bottom face
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            // Right face
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            1.0,  0.0,  0.0,
            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
        ];

        let texCoords = prim.geometry.texCoords.data = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];

        let tangents = prim.geometry.tangents.data = [];

        let colors = prim.geometry.colors.data = [
            // Front face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Back face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Top face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Bottom face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Right face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Left face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0     // blue
        ];

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

        //return this.createBuffers ( this.createBufferObj(), vertices, indices, texCoords, normals, tangents, colors );

    }


    /** 
     * Half-sphere, polar coordinates.
     * @param {Prim} prim the object needing geometry.
     */
    geometryDome ( prim ) {

        let list = this.typeList;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays.

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        let longitudeBands = prim.divisions[ 0 ] // x axis (really xz)

        let latitudeBands = prim.divisions[ 1 ]; // y axis

        let radius = prim.dimensions[ 0 ] * 0.5;

        let latDist = 0;


        // Sphere vs. Dome

        if ( prim.type === this.typeList.SPHERE || prim.type === this.typeList.CYLINDER ) {

            latDist = latitudeBands;

        } else {

            latDist = latitudeBands / 2;

        }

        // Set some parameters based on type.

        switch( prim.type ) {

            case list.SPHERE:
            case list.CYLINDER:
                break;
            case list.DOME:
            case list.TOPDOME:
            case list.BOTTOMDOME:
                break;
            case list.CONE:
                break;
            default:
                break;

        }


        let x, y, z, u, v;

        for (let latNumber = 0; latNumber <= latDist; latNumber++) {

            let theta = latNumber * Math.PI / latitudeBands;

            let sinTheta = Math.sin(theta);

            let cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {

                let phi = longNumber * 2 * Math.PI / longitudeBands;

                let sinPhi = Math.sin( phi );

                let cosPhi = Math.cos( phi );

                // Compute vertex positions.

                if( prim.type === this.typeList.CYLINDER ) {

                    x = cosPhi;

                    z = sinPhi;

                    y = cosTheta;

                    u = 1 - (longNumber / longitudeBands);

                    v = 1 - (latNumber / latitudeBands);

                } else if ( prim.type === this.typeList.SPHERE || prim.type === this.typeList.TOPDOME || prim.type === this.typeList.DOME ) {

                    x = cosPhi * sinTheta;

                    z = sinPhi * sinTheta;

                    y = cosTheta;

                    // Texture coords.

                    u = 1 - (longNumber / longitudeBands);

                    v = 1 - (latNumber / latitudeBands);

                } else if ( prim.type === this.typeList.BOTTOMDOME ) {

                    x = (cosPhi * sinTheta);

                    z = (sinPhi * sinTheta);

                    y = 1 - cosTheta;

                    // Texture coords.

                    u = (longNumber / longitudeBands);

                    v = (latNumber / latitudeBands);

                } else if ( prim.type === this.typeList.CONE ) {

                    x = cosPhi;

                    z = sinPhi;

                    y = cosTheta;

                    u = 1 - (longNumber / longitudeBands);

                    v = 1 - (latNumber / latitudeBands);

                }

                // Push values.

                vertices.push( radius * x, radius * y, radius * z );

                texCoords.push( u, v) ;

                normals.push( x, y, z );

            }

        }

        // Sphere indices.

        for ( let latNumber = 0; latNumber < latDist; latNumber++ ) {

            for ( let longNumber = 0; longNumber < longitudeBands; longNumber++ ) {

                let first = (latNumber * (longitudeBands + 1)) + longNumber;

                let second = first + longitudeBands + 1;

                // Note: we're running culling in reverse from some tutorials here.

                indices.push(first + 1, second + 1, second);

                indices.push(first + 1, second, first);

            }

        }

        geo.tangents.data = tangents = this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * Just create the top dome.
     */
    geometryTopDome ( prim ) {

        return this.geometryDome( prim );

    }

    /** 
     * Just create the bottom dome.
     */
    geometryBottomDome ( prim ) {

        return this.geometryDome( prim );

    }

    /** 
     * Sphere with polar points.
     * http://learningwebgl.com/blog/?p=1253
     * @param {Prim} prim the prim needing geometry.
     * @param {Boolean} sphere if true, make a sphere, otherwise a cylinder.
     */
    geometrySphere ( prim ) {

        return this.geometryDome( prim );

    }

    /** 
     * Cylinder with open ends.
     */
    geometryCylinder ( prim ) {

        return this.geometryDome( prim );

    }

    /** 
     * Cone with beginning and ending radius, open ends.
     */
    geometryCone ( prim ) {

        return this.geometryDome( prim );

    }

    /** 
     * Create a spherical object from a cube mesh. Useful for cubemaps. If rounding 
     * is zero, it is a cube.
     * TODO: move vertices to better coverage
     * @link https://github.com/caosdoar/spheres/
     */
    geometryCubeSphere ( prim ) {

        let vec3 = this.glMatrix.vec3;

        let flatten = this.util.flatten;

        let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        let sx = prim.dimensions[ 0 ];
        let sy = prim.dimensions[ 1 ];
        let sz = prim.dimensions[ 2 ];

        let nx = prim.divisions[ 0 ];
        let ny = prim.divisions[ 1 ];
        let nz = prim.divisions[ 2 ];

        var numVertices = ( nx + 1 ) * ( ny + 1 ) * 2 + ( nx + 1 ) * ( nz + 1 ) * 2 + ( nz + 1 ) * ( ny + 1 ) * 2;

        var positions = [];
        var norms = [];

        let vertexIndex = 0;

        makeSide( 0, 1, 2, sx, sy, nx, ny,  sz/2,  1, -1 ); //front
        makeSide( 0, 1, 2, sx, sy, nx, ny, -sz/2, -1, -1 ); //back
        makeSide( 2, 1, 0, sz, sy, nz, ny, -sx/2,  1, -1 ); //left
        makeSide( 2, 1, 0, sz, sy, nz, ny,  sx/2, -1, -1 ); //right
        makeSide( 0, 2, 1, sx, sz, nx, nz,  sy/2,  1,  1 ); //top
        makeSide( 0, 2, 1, sx, sz, nx, nz, -sy/2,  1, -1 ); //bottom

        function makeSide(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {

            var vertShift = vertexIndex;

            for( var j = 0; j <= nv; j++ ) {

                for( var i = 0; i <= nu; i++ ) {

                    var vert = positions[ vertexIndex ] = [0,0,0];

                    vert[ u ] = ( -su / 2 + i * su / nu ) * flipu;

                    vert[ v ] = ( -sv/2 + j * sv / nv ) * flipv;

                    vert[ w ] = pw

                    // Normals.

                    var normal = norms[ vertexIndex ] = [0,0,0];
                    normal[ u ] = 0
                    normal[ v ] = 0
                    normal[ w ] = pw / Math.abs( pw );

                    // Texture coords.

                    texCoords.push(
                        i/nu,
                        1.0 - j/nv
                    );

                    ++vertexIndex;

                }

            }

            // Compute indices.

            for(var j=0; j<nv; j++) {

                for(var i=0; i<nu; i++) {

                    var n = vertShift + j * (nu + 1) + i
                    indices.push(n, n + nu  + 1, n + nu + 2);
                    indices.push(n, n + nu + 2, n + 1);

                }

            }

        }

        // Round the edges of the cube.

        var tmp = [0,0,0];
        var radius = 1.5; // TODO: fraction of the dimensions!

        var rx = sx / 2.0;
        var ry = sy / 2.0;
        var rz = sz / 2.0;

        for(var i = 0; i < positions.length; i++ ) {

            var pos = positions[i];
            var normal = normals[i];
            var inner = [pos[0], pos[1], pos[2]];

            if (pos[0] < -rx + radius) {
                inner[0] = -rx + radius;
            }
            else if (pos[0] > rx - radius) {
                inner[0] = rx - radius;
            }

            if (pos[1] < -ry + radius) {
                inner[1] = -ry + radius;
            }
            else if (pos[1] > ry - radius) {
                inner[1] = ry - radius;
            }

            if (pos[2] < -rz + radius) {
                inner[2] = -rz + radius;
            }

            else if (pos[2] > rz - radius) {
                inner[2] = rz - radius;
            }

            normal = [pos[0], pos[1], pos[2]];

            vec3.sub(normal, normal, inner);
            vec3.normalize(normal, normal);

            normals[i] = normal;

            pos = [ inner[0], inner[1], inner[2] ]; //Vec3.set(pos, inner);
            tmp = [ normal[0], normal[1], normal[2] ]; //Vec3.set(tmp, normal);

            vec3.scale(tmp, tmp, radius);
            vec3.add(pos, pos, tmp);

            positions[i] = pos;

        }

        // Flatten arrays we used multidimensonal access to compute.

        prim.geometry.vertices.data = flatten(positions, false);

        prim.geometry.normals.data = flatten(norms, false);

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

        //return this.createBuffers ( this.createBufferObj(), vertices, indices, texCoords, normals, tangents, colors );

    }


    /** 
     * Icosphere, adapted from Unity 3d tutorial.
     * @link https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
     * @param {Object} prim the primitive needing geometry.
     * @param {Boolean} noSphere if false, make an icosohedron.
     */
    geometryIcoSphere ( prim, sphere = true ) {

        let vec3 = this.glMatrix.vec3;

        let vec2 = this.glMatrix.vec2;

        let flatten = this.util.flatten;

        // Size and divisions.

        let subdivisions = prim.divisions[0];

        let radius = prim.dimensions[0] * 0.5;

        let resolution = 1 << subdivisions;

        // Default vectors.

        let getVecs = this.getStdVec3;

        let directions = [
            'left',
            'back',
            'right',
            'forward'
        ];

        console.log("RESOLUTION:" + resolution)

        // Allocate memory

        let geo = prim.geometry;

        let vertices = geo.vertices.data = new Array ( (resolution + 1) * (resolution + 1) * 4 - (resolution * 2 - 1) * 3 ),
        indices  = geo.indices.data = new Array( (1 << (subdivisions * 2 + 3)) * 3 ),
        texCoords = geo.texCoords.data = new Array( vertices.length ),
        normals = geo.normals.data = new Array( vertices.length ),
        tangents = geo.tangents.data = new Array( vertices.length ),
        colors = geo.colors.data = new Array( vertices.length * 4 );

        // initialize lots of default variables.

        let v = 0, vBottom = 0, t = 0, i, d, progress, from = getVecs( 'zero' ), to = getVecs( 'zero' ), out = getVecs( 'zero' );
            
        for ( i = 0; i < 4; i++ ) {

            vertices[ v++ ] = getVecs('down');

        }

        for ( i = 1; i <= resolution; i++) {

            progress = i / resolution;

            to = vec3.lerp( [0,0,0], getVecs( 'down' ), getVecs( 'forward' ), progress );

            ///console.log('tttttto:' + to)

            vertices[ v++ ] = vec3.copy( [0,0,0], to );

            ////onsole.log( 'at position v:' + parseInt(v-1) + ', to:' + to + ', array:' + vec3.copy( [0,0,0], to ))

            for ( d = 0; d < 4; d++) {

                from = vec3.copy( [0,0,0], to );

                to = vec3.lerp( [0,0,0], getVecs( 'down' ), getVecs( directions[ d ] ), progress );

                t = createLowerStrip( i, v, vBottom, t, indices );

                v = createVertexLine( from, to, i, v, vertices );

                vBottom += i > 1 ? (i - 1) : 1;

            }

            vBottom = v - 1 - i * 4;
        }

        for ( i = resolution - 1; i >= 1; i-- ) {

                progress = i / resolution;

                to = vec3.lerp( [0,0,0], getVecs( 'up' ), getVecs( 'forward' ), progress );

                vertices[ v++ ] = vec3.copy( [0,0,0], to );

                for ( d = 0; d < 4; d++) {

                    from = vec3.copy( [0,0,0], to );

                    to = vec3.lerp( [0,0,0], getVecs( 'up' ), getVecs( directions[ d ] ), progress );

                    t = createUpperStrip( i, v, vBottom, t, indices );

                    v = createVertexLine( from, to, i, v, vertices );

                    vBottom += i + 1;
                }

                vBottom = v - 1 - i * 4;

        }

        for ( i = 0; i < 4; i++ ) {

            indices[t++] = vBottom;

            indices[t++] = v;

            indices[t++] = ++vBottom;

            vertices[v++] = getVecs( 'up' );

        }

        // Create our Normals, and set sphere to unit size.

        for (i = 0; i < vertices.length; i++ ) {

            // Toggle icosphere with icosohedron.

            if ( prim.type === this.typeList.ICOSPHERE ) {

                vertices[i] = vec3.normalize( [0,0,0], vertices[i]);

            }

            normals[i] = vec3.copy( [0,0,0], vertices[i] );

        }

        // Scale the icosphere.

        if (radius != 1) {
            for (i = 0; i < vertices.Length; i++) {
                    vertices[i][0] *= radius;
                    vertices[i][1] *= radius;
                    vertices[i][2] *= radius;
            }
        }

        // Texture coords.

        createUV ( vertices, texCoords );

        // Tangents.

        createTangents ( vertices, tangents );

        // Flatten the data arrays.

        geo.vertices.data = flatten(vertices, false );
        geo.texCoords.data = flatten(texCoords, false );
        geo.normals.data = flatten(normals, false )
        geo.tangents.data = flatten(tangents, false )

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

                let textureCoordinates = [ 0,0 ];

                textureCoordinates[ 0 ] = Math.atan2( v[ 0 ], v[ 2 ] ) / ( -2 * Math.PI );  // was v.x, v.z

                if ( textureCoordinates[ 0 ] < 0 ) {   // was textureCoordinates.x

                    textureCoordinates[ 0 ] += 1;    // was textureCoordinates

                }

                textureCoordinates[1] = Math.asin( v[ 1 ] ) / Math.PI + 0.5;  // was v.y, textureCoordinates.y

 
                uv[i] = textureCoordinates;
            }

            uv[vertices.length - 4][0] = 0.125;

            uv[0][0] = 0.125; // was v.x

            uv[vertices.length - 3][0] = 0.375

            uv[1][0] = 0.375; // was v.x

            uv[vertices.length - 2][0] = 0.625

            uv[2][0] = 0.625; // was v.x

            uv[vertices.length - 1][0] = 0.875

            uv[3][0] = 0.875; // was v.x

            // Our engine wraps opposite, so reverse first coordinate (can't do it until we do all coordinates).

            for (i = 0; i < texCoords.length; i++ ) {

                texCoords[i][0] = 1.0 - texCoords[i][0];

            }

        }

        function createTangents (vertices, tangents) {

            for ( i = 0; i < vertices.Length; i++ ) {

                v = vertices[i];

                v[1] = 0;            // was v.y

                //v = v.normalized;
                v = vec3.normalize( [0,0,0], v );

                tangent = [0,0,0,0];

                tangent[0] = -v[2];
                tangent[1] = 0;
                tangent[2] = v[0];
                tangent[3] = -1;

                tangents[i] = tangent;

            }

            //tangents[vertices.Length - 4] = tangents[0] = new Vector3(-1f, 0, -1f).normalized;
            tangents[vertices.length - 4] = [-1, 0, 1];
            tangents[0] = [-1, 0, -1];

            //tangents[vertices.Length - 3] = tangents[1] = new Vector3(1f, 0f, -1f).normalized;
            tangents[vertices.length - 3] = [1, 0, -1];
            tangents[1] = [1, 0, -1];

            //tangents[vertices.Length - 2] = tangents[2] = new Vector3(1f, 0f, 1f).normalized;
            tangents[vertices.length - 2] = [1, 0, 1];
            tangents[2] = [1, 0, 1];

            //tangents[vertices.Length - 1] = tangents[3] = new Vector3(-1f, 0f, 1f).normalized;
            tangents[vertices.length - 1] = [-1, 0, 1];
            tangents[3] = [-1, 0, 1];


            for (i = 0; i < 4; i++) {

                tangents[vertices.length - 1 - i][3] = tangents[i][3] = -1;

            }
        }

        function createVertexLine ( from, to, steps, v, vertices ) {

            for ( let i = 1; i <= steps; i++ ) {

                //console.log("Vec3 " + v + " IS A:" + vec3.lerp( [0,0,0], from, to, i / steps ))

                vertices[ v++ ] = vec3.lerp( [0,0,0], from, to, i / steps );

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

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }


    /** 
     * Closed cylinder with one texture.
     */
    geometryCan ( prim ) {

    }

    /** 
     * Two spheres stuck on a cylinder
     */
    geometryCapsule ( prim ) {

    }

    // More prims
    // Ogre 3d procedural
    // https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/include/?at=default
    // https://bitbucket.org/transporter/ogre-procedural/wiki/Home
    //
    // https://github.com/jagenjo/litegl.js/tree/master/src
    // ////////////////////////////////
    // http://wiki.unity3d.com/index.php/ProceduralPrimitives
    // ////////////////////////////////
    // http://wiki.unity3d.com/index.php/ProceduralPrimitives
    //
    // octahedron sphere generation
    // https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
    // https://experilous.com/1/blog/post/procedural-planet-generation
    // https://experilous.com/1/planet-generator/2014-09-28/planet-generator.js
    // another octahedron sphere 
    // https://www.binpress.com/tutorial/creating-an-octahedron-sphere/162
    // rounded cube
    // https://github.com/vorg/primitive-rounded-cube
    // rounded cube algorithim
    // http://catlikecoding.com/unity/tutorials/rounded-cube/
    // generalized catmull-clark subdivision algorithm
    // https://thiscouldbebetter.wordpress.com/2015/04/24/the-catmull-clark-subdivision-surface-algorithm-in-javascript/
    // cube inflation algorithm
    // http://mathproofs.blogspot.com.au/2005/07/mapping-cube-to-sphere.html
    // advanced toolset
    // https://www.geometrictools.com/Samples/Geometrics.html
    // Eigen
    // https://fossies.org/dox/eigen-3.2.10/icosphere_8cpp_source.html
    // Geometry prebuilt
    // http://paulbourke.net/geometry/roundcube/
    // Lots of Webgl tricks!
    // https://acko.net
    // http://acko.net/blog/on-webgl/

    /** 
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
     */
    geometryIcosohedron ( prim ) {

        return this.geometryIcoSphere( prim, false );

    }

    geometryPrism ( prim ) {

        // TODO: return upper half of icosohedron, and close. (possibly by setting 
        // bottom half to a comm y value)

    }

    /** 
     * Half-sphere, icosohedron based.
     */
    geometryIcoDome( prim ) {

    }


    /** 
     * Generic 3d shape (e.g. Collada model).
     * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
     * https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
     */
    geometryMesh ( prim ) {

       let geo = prim.geometry;

        // Shortcuts to Prim data arrays

        let vertices = geo.vertices.data,
        indices  = geo.indices.data,
        texCoords = geo.texCoords.data,
        normals = geo.normals.data,
        tangents = geo.tangents.data,
        colors = geo.colors.data;

        // Vertices.


        // Normals.

        this.computeNormals( vertices, indices, normals );

        // Tangents.

        this.computeTangents( vertices, indices, normals, texCoords );

        // Return the buffer, or add array data to the existing Prim data.

        if( prim.geometry.makeBuffers === true ) {

            //this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

            return this.createBuffers( prim.geometry );

        } else {

            return this.addBufferData( prim.geometry, vertices, indices, texCoords, normals, tangents, colors );

        }

    }

    /** 
     * Generate terrain, using a heightMap, from a PLANE object.
     */
    geometryTerrain ( prim ) {

        if ( ! prim.heightMap ) {

            console.log( 'adding heightmap for:' + prim.name );

            prim.heightMap = new Map2d( this.util );

            // roughness 0.2 of 0-1, flatten = 1 of 0-1;

            prim.heightMap[ prim.heightMap.type.DIAMOND ]( prim.divisions[0], prim.divisions[2], 0.6, 1 );

            //prim.heightMap.scale( 165, 165 );

            //prim.heightMap.scale( 25, 25 );

        }

        let geometry = this.geometryPlane( prim );

        window.heightMap = prim.heightMap;

        return geometry;

    };

    /** 
     * Generate a heightmap on a spherical or spheroid surface
     * Also some smoothing out.
     * THIS ONE CONVERTS FROM TRIANGLES TO HEXAGONS.
     * @link https://experilous.com/1/blog/post/procedural-planet-generation
     * @link https://experilous.com/1/planet-generator/2014-09-28/planet-generator.js
     */
    geometryPlanet() {
        // TODO: use heightmap to displace points on a cubesphere
        // https://acko.net/blog/making-worlds-1-of-spheres-and-cubes/
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
     * @param {GLMatrix.vec4} color the default color of the object.
     */
    createPrim ( type, name = 'unknown', scale = 1.0, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

        let glMatrix = this.glMatrix;

        let vec3 = this.glMatrix.vec3;

        let mat4 = this.glMatrix.mat4;

        let prim = {};

        prim.id = this.setId();

        prim.name = name;

        prim.scale = scale;

        prim.dimensions = dimensions || vec3.fromValues( 1, 1, 1 );

        prim.divisions = divisions || vec3.fromValues( 1, 1, 1 );

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

        // Set the geometry, based on defined type.

        prim.type = type;

        prim.geometry = this.createBufferObj();

        // Set start and end radius. For spheres, it is zero. For tubes, nonzero values.

        prim.radius = prim.startRadius = prim.endRadius = 0;

        // NOTE: mis-spelling type leads to error here...

        prim.geometry = this[ type ]( prim );

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
     * NOTE: normally, you will want to use a matrix transform.
     */
    move ( vertices, pos ) {

        let center = this.getCenter( vertices );

        let delta = [

            center[0] - pos[0],

            center[1] - pos[1],

            center[2] = pos[2]

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

        let biggest = [0, 0, 0];

        let smallest = [0, 0, 0];

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
     * TODO: not complete.
     */
    getCenter ( vertices ) {

        let box = this.boundingBox( vertices );

        // find the centroid point (not necessarily part of the shape).

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

            diffuse:               [ 1, 1, 1 ], // TODO: should be textures[0]

            specular:              [ 1, 1, 1, 1 ],

            shininess:             this.util.getRand( 500 ),

            specularFactor:        this.util.getRand( 1 ) // TODO: MAY NOT BE RIGHT

        }

    }

}
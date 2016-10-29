export default class prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
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

        this.type = {

            POINT: 'POINT',

            LINE: 'LINE',

            PLANE: 'PLANE',

            POLY: 'POLY',

            CUBE: 'CUBE',

            SPHERE: 'SPHERE',

            ICOSPHERE: 'ICOSPHERE',

            DOME: 'DOME',

            CONE: 'CONE',

            CYLINDER: 'CYLINDER',

            SHAPE: 'SHAPE',

            TERRAIN: 'TERRAIN'

        };

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
     * Get the big array with all vertex data
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
     * get the big array with all index data
     */
    setIndexData ( indices ) {

        indices = [];

        let len = this.objs.length;

        for ( let i in this.objs ) {

            indices = indices.concat( this.objs[i].indices );

        }

        return indices;

    }

    createBuffers ( vertices, indices, texCoords, normals, colors ) {

        let gl = this.webgl.getContext();

        // Vertex Buffer Object.

        if ( ! vertices ) {

            console.log( 'no vertices present, creating default' );

            vertices = new Float32Array( [ 0, 0, 0 ] );
        }

        let vBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

        if ( ! indices ) {

            console.log( 'no indices present, creating default' );

            indices = new Uint16Array( [ 1 ] );
        }

        // Index buffer.

        let iBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer );

        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );

        if ( ! normals ) {

            console.log( 'no normals, present, creating default' );

            normals = new Float32Array( [ 0, 1, 0 ] );

        }

        // Normals buffer.

        let nBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );

        if ( ! texCoords ) {

            console.warn( 'no texture present, creating default' );

            texCoords = new Float32Array( [ 0, 0 ] );

        }

        // Texture Buffer.

        let tBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );


        if ( ! colors ) {

            console.warn( 'no colors present, creating default' );

            colors = new Float32Array( [ 0.2, 0.5, 0.2, 1.0 ] );

        }

        let cBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

        // Return a complete object. TODO: don't really need vertices except for debugging.

        return {

            vertices: {

                data: vertices,

                buffer: vBuffer,

                itemSize: 3,

                numItems: vertices.length / 3
            },

            texCoords: {

                data: texCoords,

                buffer: tBuffer,

                itemSize: 2,

                numItems: texCoords.length / 2

            },

            colors: {

                data: colors,

                buffer: cBuffer,

                itemSize: 4,

                numItems: colors.length / 4

            },

            normals: {

                data: normals,

                buffer: nBuffer,

                itemSize: 3,

                numItems: normals.length / 3

            },

            indices: {

                data: indices,

                buffer: iBuffer,

                itemSize: 1,

                numItems: indices.length

            }

        };

    }

    /** 
     * GEOMETRIES
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
     * Move vertices directly in geometry.
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
     */
    getCenter ( vertices ) {

        let box = this.boundingBox( vertices );

        // find the centroid point (not necessarily part of the shape).

    }

    /** 
     * Compute normals for a 3d object.
     * Adapted from BabylonJS
     * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
     */
    computeNormals (vertices, indices, normals) {

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

            // indice triplet = 1 face

            let nbFaces = indices.length / 3;

            for (index = 0; index < nbFaces; index++) {
                i1 = indices[index * 3]; // get the indexes of each vertex of the face
                i2 = indices[index * 3 + 1];
                i3 = indices[index * 3 + 2];
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

                //////////////console.log( 'faceNormalx:' + faceNormalx + ' faceNormalx:' + faceNormaly + ' faceNormalz:' + faceNormalz);
                normals[i1 * 3] += faceNormalx; // accumulate all the normals per face
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
                faceNormaly = normals[index * 3 + 1];
                faceNormalz = normals[index * 3 + 2];
                length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
                length = (length === 0) ? 1.0 : length;
                faceNormalx /= length;
                faceNormaly /= length;
                faceNormalz /= length;
                normals[index * 3] = faceNormalx;
                normals[index * 3 + 1] = faceNormaly;
                normals[index * 3 + 2] = faceNormalz;
            }

        }

    /** 
     * WebGL point.
     */
    geometryPoint ( prim ) {

    }

    /** 
     * WebGL line.
     */
    geometryLine ( prim ) {

    }

    /** 
     * Plane (non-infinite)
     */
    geometryPlane ( prim ) {

    }

    /** 
     * Polygon (flat)
     */
    geometryPoly ( prim ) {

    }

    /** 
     * Create a cube geometry of a given size (units) centered 
     * on a point.
     * @param {GLMatrix.Vec3} center a 3d vector defining the center.
     * @param {Size} width, height, depth, with 1.0 (unit) max size
     * @param {Number} scale relative to unit size (1, 1, 1).
      name = 'unknown', scale = 1.0, dimensions, position, acceleration, rotation, textureImage, color
     */
    geometryCube ( prim ) {

        let x = prim.dimensions[ 0 ] / 2;

        let y = prim.dimensions[ 1 ] / 2;

        let z = prim.dimensions[ 2 ] / 2 ;

        // Create cube geometry.

        let vertices = [
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

        let indices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face //can't go to 30
            20, 21, 22,   20, 22, 23  // Left face
        ];

        let texCoords = [
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

        let normals = [
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

        let colors = [
            // Front face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue
            // Back face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue
            // Top face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue
            // Bottom face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue
            // Right face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue
            // Left face
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0     // blue
        ];

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Sphere with polar points.
     * http://learningwebgl.com/blog/?p=1253
     */
    geometrySphere ( prim ) {

       // TODO: ACTIVATE RADIUS X, Y, Z for distorted spheres.

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let colors = [];

        let latitudeBands = prim.divisions[1]; // y axis

        let longitudeBands = prim.divisions[0] // x axis (really xz)

        let radius = prim.dimensions[0] * 0.5;

        for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {

            let theta = latNumber * Math.PI / latitudeBands;

            let sinTheta = Math.sin(theta);

            let cosTheta = Math.cos(theta);

            for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        
                let phi = longNumber * 2 * Math.PI / longitudeBands;

                let sinPhi = Math.sin(phi);

                let cosPhi = Math.cos(phi);

                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                let u = 1 - (longNumber / longitudeBands);
                let v = 1 - (latNumber / latitudeBands);

                normals.push(x);
                normals.push(y);
                normals.push(z);

                texCoords.push(u);
                texCoords.push(v);
                vertices.push(radius * x);
                vertices.push(radius * y);
                vertices.push(radius * z);

            }

        }

        // Sphere indices.

        for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {

            for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {

                let first = (latNumber * (longitudeBands + 1)) + longNumber;

                let second = first + longitudeBands + 1;

                indices.push(first);

                indices.push(second);

                indices.push(first + 1);

                indices.push(second);

                indices.push(second + 1);

                indices.push(first + 1);

            }
        }

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Icosphere, iterated from icosohedron.
     */
    geometryIcoSphere ( prim ) {
        /*

            var sideOrientation = options.sideOrientation || BABYLON.Mesh.DEFAULTSIDE;
            var radius = options.radius || 1;
            var flat = (options.flat === undefined) ? true : options.flat;
            var subdivisions = options.subdivisions || 4;
            var radiusX = options.radiusX || radius;
            var radiusY = options.radiusY || radius;
            var radiusZ = options.radiusZ || radius;
            var t = (1 + Math.sqrt(5)) / 2;
            // 12 vertex x,y,z
            var ico_vertices = [
                -1, t, -0, 1, t, 0, -1, -t, 0, 1, -t, 0,
                0, -1, -t, 0, 1, -t, 0, -1, t, 0, 1, t,
                t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, -1 // v8-11
            ];
            // index of 3 vertex makes a face of icopshere
            var ico_indices = [
                0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 12, 22, 23,
                1, 5, 20, 5, 11, 4, 23, 22, 13, 22, 18, 6, 7, 1, 8,
                14, 21, 4, 14, 4, 2, 16, 13, 6, 15, 6, 19, 3, 8, 9,
                4, 21, 5, 13, 17, 23, 6, 13, 22, 19, 6, 18, 9, 8, 1
            ];
            // vertex for uv have aliased position, not for UV
            var vertices_unalias_id = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
                // vertex alias
                0,
                2,
                3,
                3,
                3,
                4,
                7,
                8,
                9,
                9,
                10,
                11 // 23: B + 12
            ];
            // uv as integer step (not pixels !)
            var ico_vertexuv = [
                5, 1, 3, 1, 6, 4, 0, 0,
                5, 3, 4, 2, 2, 2, 4, 0,
                2, 0, 1, 1, 6, 0, 6, 2,
                // vertex alias (for same vertex on different faces)
                0, 4,
                3, 3,
                4, 4,
                3, 1,
                4, 2,
                4, 4,
                0, 2,
                1, 1,
                2, 2,
                3, 3,
                1, 3,
                2, 4 // 23: B + 12
            ];
            // Vertices[0, 1, ...9, A, B] : position on UV plane
            // '+' indicate duplicate position to be fixed (3,9:0,2,3,4,7,8,A,B)
            // First island of uv mapping
            // v = 4h          3+  2
            // v = 3h        9+  4
            // v = 2h      9+  5   B
            // v = 1h    9   1   0
            // v = 0h  3   8   7   A
            //     u = 0 1 2 3 4 5 6  *a
            // Second island of uv mapping
            // v = 4h  0+  B+  4+
            // v = 3h    A+  2+
            // v = 2h  7+  6   3+
            // v = 1h    8+  3+
            // v = 0h
            //     u = 0 1 2 3 4 5 6  *a
            // Face layout on texture UV mapping
            // ============
            // \ 4  /\ 16 /   ======
            //  \  /  \  /   /\ 11 /
            //   \/ 7  \/   /  \  /
            //    =======  / 10 \/
            //   /\ 17 /\  =======
            //  /  \  /  \ \ 15 /\
            // / 8  \/ 12 \ \  /  \
            // ============  \/ 6  \
            // \ 18 /\  ============
            //  \  /  \ \ 5  /\ 0  /
            //   \/ 13 \ \  /  \  /
            //   =======  \/ 1  \/
            //       =============
            //      /\ 19 /\  2 /\
            //     /  \  /  \  /  \
            //    / 14 \/ 9  \/  3 \
            //   ===================
            // uv step is u:1 or 0.5, v:cos(30)=sqrt(3)/2, ratio approx is 84/97
            var ustep = 138 / 1024;
            var vstep = 239 / 1024;
            var uoffset = 60 / 1024;
            var voffset = 26 / 1024;
            // Second island should have margin, not to touch the first island
            // avoid any borderline artefact in pixel rounding
            var island_u_offset = -40 / 1024;
            var island_v_offset = +20 / 1024;
            // face is either island 0 or 1 :
            // second island is for faces : [4, 7, 8, 12, 13, 16, 17, 18]
            var island = [
                0, 0, 0, 0, 1,
                0, 0, 1, 1, 0,
                0, 0, 1, 1, 0,
                0, 1, 1, 1, 0 //  15 - 19
            ];
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var current_indice = 0;
            // prepare array of 3 vector (empty) (to be worked in place, shared for each face)
            var face_vertex_pos = new Array(3);
            var face_vertex_uv = new Array(3);
            var v012;
            for (v012 = 0; v012 < 3; v012++) {
                face_vertex_pos[v012] = BABYLON.Vector3.Zero();
                face_vertex_uv[v012] = BABYLON.Vector2.Zero();
            }
            // create all with normals
            for (var face = 0; face < 20; face++) {
                // 3 vertex per face
                for (v012 = 0; v012 < 3; v012++) {
                    // look up vertex 0,1,2 to its index in 0 to 11 (or 23 including alias)
                    var v_id = ico_indices[3 * face + v012];
                    // vertex have 3D position (x,y,z)
                    face_vertex_pos[v012].copyFromFloats(ico_vertices[3 * vertices_unalias_id[v_id]], ico_vertices[3 * vertices_unalias_id[v_id] + 1], ico_vertices[3 * vertices_unalias_id[v_id] + 2]);
                    // Normalize to get normal, then scale to radius
                    face_vertex_pos[v012].normalize().scaleInPlace(radius);
                    // uv Coordinates from vertex ID
                    face_vertex_uv[v012].copyFromFloats(ico_vertexuv[2 * v_id] * ustep + uoffset + island[face] * island_u_offset, ico_vertexuv[2 * v_id + 1] * vstep + voffset + island[face] * island_v_offset);
                }
                // Subdivide the face (interpolate pos, norm, uv)
                // - pos is linear interpolation, then projected to sphere (converge polyhedron to sphere)
                // - norm is linear interpolation of vertex corner normal
                //   (to be checked if better to re-calc from face vertex, or if approximation is OK ??? )
                // - uv is linear interpolation
                //
                // Topology is as below for sub-divide by 2
                // vertex shown as v0,v1,v2
                // interp index is i1 to progress in range [v0,v1[
                // interp index is i2 to progress in range [v0,v2[
                // face index as  (i1,i2)  for /\  : (i1,i2),(i1+1,i2),(i1,i2+1)
                //            and (i1,i2)' for \/  : (i1+1,i2),(i1+1,i2+1),(i1,i2+1)
                //
                //
                //                    i2    v2
                //                    ^    ^
                //                   /    / \
                //                  /    /   \
                //                 /    /     \
                //                /    / (0,1) \
                //               /    #---------\
                //              /    / \ (0,0)'/ \
                //             /    /   \     /   \
                //            /    /     \   /     \
                //           /    / (0,0) \ / (1,0) \
                //          /    #---------#---------\
                //              v0                    v1
                //
                //              --------------------> i1
                //
                // interp of (i1,i2):
                //  along i2 :  x0=lerp(v0,v2, i2/S) <---> x1=lerp(v1,v2, i2/S)
                //  along i1 :  lerp(x0,x1, i1/(S-i2))
                //
                // centroid of triangle is needed to get help normal computation
                //  (c1,c2) are used for centroid location
                var interp_vertex = function (i1, i2, c1, c2) {
                    // vertex is interpolated from
                    //   - face_vertex_pos[0..2]
                    //   - face_vertex_uv[0..2]
                    var pos_x0 = BABYLON.Vector3.Lerp(face_vertex_pos[0], face_vertex_pos[2], i2 / subdivisions);
                    var pos_x1 = BABYLON.Vector3.Lerp(face_vertex_pos[1], face_vertex_pos[2], i2 / subdivisions);
                    var pos_interp = (subdivisions === i2) ? face_vertex_pos[2] : BABYLON.Vector3.Lerp(pos_x0, pos_x1, i1 / (subdivisions - i2));
                    pos_interp.normalize();
                    var vertex_normal;
                    if (flat) {
                        // in flat mode, recalculate normal as face centroid normal
                        var centroid_x0 = BABYLON.Vector3.Lerp(face_vertex_pos[0], face_vertex_pos[2], c2 / subdivisions);
                        var centroid_x1 = BABYLON.Vector3.Lerp(face_vertex_pos[1], face_vertex_pos[2], c2 / subdivisions);
                        vertex_normal = BABYLON.Vector3.Lerp(centroid_x0, centroid_x1, c1 / (subdivisions - c2));
                    }
                    else {
                        // in smooth mode, recalculate normal from each single vertex position
                        vertex_normal = new BABYLON.Vector3(pos_interp.x, pos_interp.y, pos_interp.z);
                    }
                    // Vertex normal need correction due to X,Y,Z radius scaling
                    vertex_normal.x /= radiusX;
                    vertex_normal.y /= radiusY;
                    vertex_normal.z /= radiusZ;
                    vertex_normal.normalize();
                    var uv_x0 = BABYLON.Vector2.Lerp(face_vertex_uv[0], face_vertex_uv[2], i2 / subdivisions);
                    var uv_x1 = BABYLON.Vector2.Lerp(face_vertex_uv[1], face_vertex_uv[2], i2 / subdivisions);
                    var uv_interp = (subdivisions === i2) ? face_vertex_uv[2] : BABYLON.Vector2.Lerp(uv_x0, uv_x1, i1 / (subdivisions - i2));
                    positions.push(pos_interp.x * radiusX, pos_interp.y * radiusY, pos_interp.z * radiusZ);
                    normals.push(vertex_normal.x, vertex_normal.y, vertex_normal.z);
                    uvs.push(uv_interp.x, uv_interp.y);
                    // push each vertex has member of a face
                    // Same vertex can bleong to multiple face, it is pushed multiple time (duplicate vertex are present)
                    indices.push(current_indice);
                    current_indice++;
                };
                for (var i2 = 0; i2 < subdivisions; i2++) {
                    for (var i1 = 0; i1 + i2 < subdivisions; i1++) {
                        // face : (i1,i2)  for /\  :
                        // interp for : (i1,i2),(i1+1,i2),(i1,i2+1)
                        interp_vertex(i1, i2, i1 + 1.0 / 3, i2 + 1.0 / 3);
                        interp_vertex(i1 + 1, i2, i1 + 1.0 / 3, i2 + 1.0 / 3);
                        interp_vertex(i1, i2 + 1, i1 + 1.0 / 3, i2 + 1.0 / 3);
                        if (i1 + i2 + 1 < subdivisions) {
                            // face : (i1,i2)' for \/  :
                            // interp for (i1+1,i2),(i1+1,i2+1),(i1,i2+1)
                            interp_vertex(i1 + 1, i2, i1 + 2.0 / 3, i2 + 2.0 / 3);
                            interp_vertex(i1 + 1, i2 + 1, i1 + 2.0 / 3, i2 + 2.0 / 3);
                            interp_vertex(i1, i2 + 1, i1 + 2.0 / 3, i2 + 2.0 / 3);
                        }
                    }
                }
            }
            // Sides
            VertexData._ComputeSides(sideOrientation, positions, indices, normals, uvs);
            // Result
            var vertexData = new VertexData();
            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;
            return vertexData;
        };
        */

    }


    /** 
     * Half-sphere, refined icosohedron
     */
    geometryDome ( prim ) {

    }

    /** 
     * Cone
     */
    geometryCone ( prim ) {

    }

    /** 
     * Cylinder
     */
    geometryCylinder ( prim ) {

    }

    /** 
     * Generic 3d shape (e.g. collada model).
     * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
     * https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
     */
    geometryMesh ( prim ) {

    }

    /** 
     * Create a heightMap
     */
    initHeightMap ( dimensions, divisions ) {

        let vec3 = this.glMatrix.vec3;
 
        let hm = [];

        for ( let i = 0; i < divisions[0]; i++ ) { // x

            for ( let j = 0; j < divisions[2]; j++ ) { // z

                hm.push( 0.0 );

            }
        }

        return hm;

    }

    /** 
     * Generate an elevation map of a given width and height.
     */
    elevationMap ( width, height ) {

       let m = [];

        for ( let i = 0; i < width; i++ ) { // x

            for ( let j = 0; j < height; j++ ) { // z

                m.push( 0.0 );

            }
        }

        return m;

    }


    /** 
     * Indices calculations:
     * http://www.3dgep.com/multi-textured-terrain-in-opengl/
     */
    geometryTerrain ( prim ) {

        let vec4 = this.glMatrix.vec4;

        let vec3 = this.glMatrix.vec3;

        let vec2 = this.glMatrix.vec2;

        let vertices = [];
        let indices = [];
        let texCoords = [];
        let normals = [];
        let colors = [];

        let i, j, len, index;

        let dimensions = prim.dimensions;

        let divisions = prim.divisions;

        let width = dimensions[0];

        let height = dimensions[2];

        let terrainWidth = ( width - 1 );
        let terrainHeight = ( height - 1 );
 
        let halfTerrainWidth = terrainWidth * 0.5;
        let halfTerrainHeight = terrainHeight * 0.5;

        let S, T, X, Y, Z;

        let r, g, b;

        if ( ! prim.heightMap ) {

            prim.heightMap = this.elevationMap( dimensions[0], dimensions[2] ); // x, z

        }

        let ct = 0;

        for ( j = 0; j < height; ++j ) { // row, j

            for ( i = 0; i < width; ++i ) {  // col, i

                index = ( j * width ) + i;

                S = ( i / (width - 1) );
                T = ( j / (height - 1) );

                X = ( S * terrainWidth ) - halfTerrainWidth;

                Y = prim.heightMap [ ct++ ] / 255;

                Z = ( T * terrainHeight ) - halfTerrainHeight;

                vertices.push( X, Y, Z );

                normals.push( 0, 0, 0 );

                texCoords.push( S, T );

                r = Y;

                b = ( 1 - Y );

                g = ( 1.0 - Math.abs( r - b ) );

                colors.push ( r, g, b, 1.0 );

            }

        }

        // Indices.
        index = 0;

        for (j = 0; j < (terrainHeight - 1); j++ ) {

        for (i = 0; i < (terrainWidth - 1); i++ ) {

            let vertexIndex = ( row * terrainWidth ) + i;

            indices.push (
                // Top triangle (T0)
                vertexIndex,                          // V0
                vertexIndex + terrainWidth + 1,       // V3
                vertexIndex + 1,                      // V1
                // Bottom triangle (T1)
                vertexIndex,                          // V0
                vertexIndex + terrainWidth,           // V2
                vertexIndex + terrainWidth + 1        // V3
            );

            }
        }

        // Normals.

        for ( i = 0, len = indices.length; i < len; i += 3 ) {

            let v1, v2, v3, v4, cross;

            v0 = vertices[ indices[i + 0] ];
            v1 = vertices[ indices[i + 1] ];
            v2 = vertices[ indices[i + 2] ];
            v3 = vec3.subtract( v3.create(), v2, v0 );
            v4 = vec3.subtract( v3.create(), v3, v1, v0 );

            let normal = vec3.normalize( vec3.cross( v4, v3 ) );

            normals[ indices[i + 0] ] += normal;
            normals[ indices[i + 1] ] += normal;
            normals[ indices[i + 2] ] += normal;
        }

        for ( i = 0, len = normals.length; i < len; ++i ) {

            normals[i] = vec3.normalize( normals[i], normals[i] );

            normals[i] = 1.0; ///////////////////////////////////////////NOTE CHANGE

        }

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Terrain generated via a heightmap. HeightMap MUST match 
     * divisions in X and Z coordinates.
     * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
     * TODO: assumes a square Prim!!!!!!!!!!!!!
     */
    geometryTerr ( prim ) {

        /*
        // # P.xy store the position for which we want to calculate the normals
  // # height() here is a function that return the height at a point in the terrain

  // read neightbor heights using an arbitrary small offset
  vec3 off = vec3(1.0, 1.0, 0.0);
  float hL = height(P.xy - off.xz);
  float hR = height(P.xy + off.xz);
  float hD = height(P.xy - off.zy);
  float hU = height(P.xy + off.zy);

  // deduce terrain normal
  N.x = hL - hR;
  N.y = hD - hU;
  N.z = 2.0;
  N = normalize(N);
  http://stackoverflow.com/questions/13983189/opengl-how-to-calculate-normals-in-a-terrain-height-grid
  */

        let vec4 = this.glMatrix.vec4;

        let vec3 = this.glMatrix.vec3;

        let vec2 = this.glMatrix.vec2;

        let vertices = [];
        let indices = [];
        let texCoords = [];
        let normals = [];
        let colors = [];

        let row, col;

        let width = prim.dimensions[0];

        let height = prim.dimensions[2];

        let divisions = prim.divisions;

        let subdivisionsX = prim.divisions[0] || 1;

        let subdivisionsZ = prim.divisions[2] || prim.divisions[0] || 1;

        if ( ! prim.heightMap ) {

            console.warn( 'terrain:' + prim.name + ' no heightmap, creating default' );

            prim.heightMap = this.initHeightMap( prim.dimensions, prim.divisions );

        }

        // Create vector heightmap and default colors.

        let ct = 0;

        for (row = 0; row <= subdivisionsZ; row++) {

            for (col = 0; col <= subdivisionsX; col++) {

                // TODO: COMPUTE Y RELATIVE TO SAMPLE FROM HEIGHTMAP

                let y = prim.heightMap[ct++] / 256; /////// MAX HEIGHT = HEIGHT OF SIM

                if ( isNaN( y ) ) { y = 0; }

                //console.log('row:' + row  + ' col:' + col + ' width:' + width + ' height:' + height + ' subdivisionsX:' + subdivisionsZ + ' subdivisionsZ:' + subdivisionsZ)

                vertices.push( 

                    (col * width) / subdivisionsX - (width / 2.0), 
                    y, 
                    ((subdivisionsZ - row) * height) / subdivisionsZ - (height / 2.0)

                );

                //console.warn("row:" + row + " col:" + col + " VERTICES.length:" + vertices.length)

                // Default normals.

                normals.push( 0, 1.0, 0 );

                // Texture coordinates.

                texCoords.push(col / subdivisionsX, 1.0 - row / subdivisionsX);

                // Default colors.

                let r = y;

                let b = ( 1 - y );

                let g = ( 1.0 - Math.abs(r - b) );

                colors.push ( r, g, b, 1.0 );


            }

        }

        // Indices.

        for (row = 0; row < subdivisionsZ; row++) {

            for (col = 0; col < subdivisionsX; col++) {

                indices.push(col + 1 + (row + 1) * (subdivisionsX + 1));
                indices.push(col + 1 + row * (subdivisionsX + 1));
                indices.push(col + row * (subdivisionsX + 1));
                indices.push(col + (row + 1) * (subdivisionsX + 1));
                indices.push(col + 1 + (row + 1) * (subdivisionsX + 1));
                indices.push(col + row * (subdivisionsX + 1));

            }

        }

        // Normals.

        this.computeNormals( vertices, indices, normals );

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Set a material for a prim.
     * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
     * didn't use chroma (but could)
     * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
     */
    setMaterial ( prim ) {

       return {

            u_colorMult:             0,

            u_diffuse:               [ 1, 1, 1 ], //TODO: should be textures[0]

            u_specular:              [ 1, 1, 1, 1 ],

            u_shininess:             this.util.getRand( 500 ),

            u_specularFactor:        this.util.getRand( 1 ) // TODO: MAY NOT BE RIGHT

        }

    }


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
    createPrim ( name = 'unknown', scale = 1.0, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

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

            vec3.add( p.rotation, p.rotation, p.angular );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 0 ], [ 1, 0, 0 ] );
            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 1 ], [ 0, 1, 0 ] );
            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 2 ], [ 0, 0, 1 ] );

            return mvMatrix;

        }

        prim.renderId = -1; // NOT ASSIGNED. TODO: Assign a renderer to each Prim.

        // Prim transforms.

        return prim;

    }

    /** 
     * create a Cube object.
     * @param {String} name of object
     * @param {Number} scale
     */
    createCube ( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

        let cube = this.createPrim( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color );

        cube.geometry = this.geometryCube( cube );

        cube.type = this.type.CUBE;

        this.util.primReadout( cube );

        this.objs.push( cube );

        return cube;

    }

    createIcoSphere ( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

        let icoSphere = this.createPrim( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color );

        icoSphere.geometry = this.geometryIcoSphere( icoSphere );

        icoSphere.type = this.type.ICOSPHERE;

        this.util.primReadout( icoSphere );

        this.objs.push( icoSphere );

        return icoSphere;

    }

    createSphere ( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

        let sphere = this.createPrim( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color );

        sphere.geometry = this.geometrySphere( sphere );

        sphere.type = this.type.SPHERE;

        this.util.primReadout( sphere );

        this.objs.push( sphere );

        return sphere;

    }

    createDome ( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color ) {

        let dome = this.createPrim( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color );

        dome.geometry = this.geometryDome( dome );

        dome.type = this.type.DOME;

        this.util.primReadout( dome );

        this.objs.push( dome );

        return dome;

    }

    createTerrain ( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color, heightMap ) {

        let terrain = this.createPrim( name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color );

        if ( heightMap ) {

            terrain.heightMap = heightMap;

        } else {

            terrain.heightMap = null;
        }

        terrain.geometry = this.geometryTerrain( terrain );

        terrain.type = this.type.TERRAIN;

        this.util.primReadout( terrain );

        this.objs.push( terrain );

        return terrain;

    }

}
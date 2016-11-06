import Map2d from './map2d';


export default class Prim {

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

        this.typeList = {

            POINT: 'geometryPoint',

            POINTCLOUD: 'geometryPointCloud',

            LINE: 'geometryLine',

            PLANE: 'geometryPlane',

            POLY: 'geometryPoly',

            CUBE: 'geometryCube',

            SPHERE: 'geometrySphere',

            CUBESPHERE: 'geometryCubeSphere',

            ICOSPHERE: 'geometryIcoSphere',

            DOME: 'geometryDome',

            ICODOME: 'geometryIcoDome',

            CONE: 'geometryCone',

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
     * Create WebGL buffers using geometry data
     * @param {Array} vertices an array of vertices, in glMatrix.vec3 objects.
     * @param {Array} indices an array of indices for the vertices.
     * @param {Array} textCoords an array of texture coordinates, in glMatrix.vec2 format.
     * @param {Array} normals an array of normals, in glMatrix.vec3 format.
     * @param {Array} colors an array of colors, in glMatrix.vec4 format.
     */
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

                numItems: vertices.length / 3,

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

            },

            edges: {

            }

        };

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

        dot00 = vec3.dot(v0, v0)
        dot01 = vec3.dot(v0, v1)
        dot02 = vec3.dot(v0, v2)
        dot11 = vec3.dot(v1, v1)
        dot12 = vec3.dot(v1, v2)

        // Compute barycentric coordinates.

        let invDenom = 1 / (dot00 * dot11 - dot01 * dot01)
        let u = (dot11 * dot02 - dot01 * dot12) * invDenom
        let v = (dot00 * dot12 - dot01 * dot02) * invDenom

        // Check if point is in triangle.

        return (u >= 0) && (v >= 0) && (u + v < 1)

    }

    /** 
     * Compute normals for a 3d object.
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

    computeSides ( sideOrientation, positions, indices, normals, uvs ) {

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


    /* 
     * ---------------------------------------
     * GEOMETRY
     * ---------------------------------------
     */

    /** 
     * WebGL point.
     */
    geometryPoint ( prim ) {

    }

    /** 
     * WebGL point cloud (particle system).
     */
    geometryPointCloud ( prim ) {

    }

    /** 
     * WebGL line.
     */
    geometryLine ( prim ) {

    }

    /** 
     * Plane (non-infinite, multiple vertices, can be turned into TERRAIN)
     */
    geometryPlane ( prim ) {

        let vec3 = this.glMatrix.vec3;

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let colors = [];

        let cols = prim.divisions[0] // x axis (really xz)
        let rows = prim.divisions[2]; // y axis

        let halfX = prim.dimensions[0] / 2;
        let halfZ = prim.dimensions[2] / 2;

        let incX = prim.dimensions[0] / prim.divisions[0];
        let incY = 1.0;
        let incZ = prim.dimensions[2] / prim.divisions[2];

        for (let colNumber = 0; colNumber <= cols; colNumber++) {

            for (let rowNumber = 0; rowNumber <= rows; rowNumber++) {

                // Vertex values.

                let x = colNumber;

                let y = 0;

                if ( prim.heightMap ) {

                    y = prim.heightMap.getPixel( colNumber, rowNumber );

                }

                let z = rowNumber;

                // Texture coords.

                let u = (colNumber / cols);

                let v = 1 - (rowNumber / rows);

                normals.push( 0, 1.0, 0 );

                texCoords.push( u, v );

                vertices.push( ( incX * x ) - halfX );
                vertices.push( ( incY * y) );
                vertices.push( ( incZ * z ) - halfZ );

            }

        }

        // Indices.

        for (let rowNumber = 0; rowNumber < rows; rowNumber++) {

            for (let colNumber = 0; colNumber < cols; colNumber++) {

                let first = (rowNumber * (cols + 1)) + colNumber;

                let second = first + cols + 1;

                // Note: we're running culling in reverse from some tutorials here.

                indices.push(first + 1);

                indices.push(second + 1);

                indices.push(second);

                indices.push(first + 1);

                indices.push(second);

                indices.push(first);

            }

        }

        this.computeNormals( vertices, indices, normals );

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Polygon (flat)
     */
    geometryPoly ( prim ) {

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

                // Compute vertex positions.

                let x = cosPhi * sinTheta;

                let y = cosTheta;

                let z = sinPhi * sinTheta;

                // Texture coords.

                let u = 1 - (longNumber / longitudeBands);

                let v = 1 - (latNumber / latitudeBands);

                // Push values.

                vertices.push(radius * x);

                vertices.push(radius * y);

                vertices.push(radius * z);

                texCoords.push(u);

                texCoords.push(v);

                // Normals = normalized vertices for a Sphere.

                normals.push(x);

                normals.push(y);

                normals.push(z);

            }

        }

        // Sphere indices.

        for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {

            for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {

                let first = (latNumber * (longitudeBands + 1)) + longNumber;

                let second = first + longitudeBands + 1;

                // Note: we're running culling in reverse from some tutorials here.

                indices.push(first + 1);

                indices.push(second + 1);

                indices.push(second);

                indices.push(first + 1);

                indices.push(second);

                indices.push(first);

            }

        }

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Create a spherical object from a cube mesh. Useful for cubemaps.
     */
    geometryCubeSphere ( prim ) {

        let vec3 = this.glMatrix.vec3;

        let flatten = this.util.flatten;

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let colors = [];

        let sx = prim.dimensions[0];
        let sy = prim.dimensions[1];
        let sz = prim.dimensions[2];

        let nx = prim.divisions[0]; //1.0; // ???????/
        let ny = prim.divisions[1];
        let nz = prim.divisions[2];

        var numVertices = (nx + 1) * (ny + 1) * 2 + (nx + 1) * (nz + 1) * 2 + (nz + 1) * (ny + 1) * 2;

        var positions = [];
        var norms = [];

        let vertexIndex = 0;

        function makeSide(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {

            var vertShift = vertexIndex;

            for(var j=0; j<=nv; j++) {

                for(var i=0; i<=nu; i++) {

                    // Vertices require addressing by vertexIndex.

                    var vert = positions[vertexIndex] = [0,0,0];
                    vert[u] = (-su/2 + i*su/nu) * flipu;
                    vert[v] = (-sv/2 + j*sv/nv) * flipv;
                    vert[w] = pw

                    // Normals.

                    var normal = norms[vertexIndex] = [0,0,0];
                    normal[u] = 0
                    normal[v] = 0
                    normal[w] = pw/Math.abs(pw);

                    // Texture coords.

                    texCoords.push(
                        i/nu,
                        1.0 - j/nv
                    );

                    ++vertexIndex;

                }

            }

            // Compute indices.

            console.log( 'VERTEXINDEX:' + vertexIndex + ' VERTSHIFT:' + vertShift)

            for(var j=0; j<nv; j++) {

                for(var i=0; i<nu; i++) {

                    var n = vertShift + j * (nu + 1) + i
                    indices.push(n, n + nu  + 1, n + nu + 2);
                    indices.push(n, n + nu + 2, n + 1);

                }

            }


        }

        makeSide(0, 1, 2, sx, sy, nx, ny,  sz/2,  1, -1); //front
        makeSide(0, 1, 2, sx, sy, nx, ny, -sz/2, -1, -1); //back
        makeSide(2, 1, 0, sz, sy, nz, ny, -sx/2,  1, -1); //left
        makeSide(2, 1, 0, sz, sy, nz, ny,  sx/2, -1, -1); //right
        makeSide(0, 2, 1, sx, sz, nx, nz,  sy/2,  1,  1); //top
        makeSide(0, 2, 1, sx, sz, nx, nz, -sy/2,  1, -1); //bottom

        // Round the edges of the cube.

///////////////////////////////////////////////////
    var tmp = [0,0,0];
    var radius = 1.5;

    var rx = sx / 2.0;
    var ry = sy / 2.0;
    var rz = sz / 2.0;

    for(var i=0; i<positions.length; i++) {

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

        //Vec3.set(normal, pos);
        normal = [pos[0], pos[1], pos[2]]
        vec3.sub(normal, normal, inner);
        vec3.normalize(normal, normal);

        normals[i] = normal;

        pos = [ inner[0], inner[1], inner[2] ]; //Vec3.set(pos, inner);
        tmp = [ normal[0], normal[1], normal[2] ]; //Vec3.set(tmp, normal);
        vec3.scale(tmp, tmp, radius);
        vec3.add(pos, pos, tmp);

        positions[i] = pos;

    }


///////////////////////////////////////////////////


        // Flatten arrays we used multidimensonal access to compute.

        vertices = flatten(positions, false);
        normals = flatten(norms, false);

        window.vertices = vertices;
        window.indices = indices;
        window.normals = normals;

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }


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

generateIcosahedron()
{
    var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    var du = 1.0 / Math.sqrt(phi * phi + 1.0);
    var dv = phi * du;
    
    nodes =
    [
        { p: new Vector3(0, +dv, +du), e: [], f: [] },
        { p: new Vector3(0, +dv, -du), e: [], f: [] },
        { p: new Vector3(0, -dv, +du), e: [], f: [] },
        { p: new Vector3(0, -dv, -du), e: [], f: [] },
        { p: new Vector3(+du, 0, +dv), e: [], f: [] },
        { p: new Vector3(-du, 0, +dv), e: [], f: [] },
        { p: new Vector3(+du, 0, -dv), e: [], f: [] },
        { p: new Vector3(-du, 0, -dv), e: [], f: [] },
        { p: new Vector3(+dv, +du, 0), e: [], f: [] },
        { p: new Vector3(+dv, -du, 0), e: [], f: [] },
        { p: new Vector3(-dv, +du, 0), e: [], f: [] },
        { p: new Vector3(-dv, -du, 0), e: [], f: [] },
    ];
    
    edges =
    [
        { n: [  0,  1, ], f: [], },
        { n: [  0,  4, ], f: [], },
        { n: [  0,  5, ], f: [], },
        { n: [  0,  8, ], f: [], },
        { n: [  0, 10, ], f: [], },
        { n: [  1,  6, ], f: [], },
        { n: [  1,  7, ], f: [], },
        { n: [  1,  8, ], f: [], },
        { n: [  1, 10, ], f: [], },
        { n: [  2,  3, ], f: [], },
        { n: [  2,  4, ], f: [], },
        { n: [  2,  5, ], f: [], },
        { n: [  2,  9, ], f: [], },
        { n: [  2, 11, ], f: [], },
        { n: [  3,  6, ], f: [], },
        { n: [  3,  7, ], f: [], },
        { n: [  3,  9, ], f: [], },
        { n: [  3, 11, ], f: [], },
        { n: [  4,  5, ], f: [], },
        { n: [  4,  8, ], f: [], },
        { n: [  4,  9, ], f: [], },
        { n: [  5, 10, ], f: [], },
        { n: [  5, 11, ], f: [], },
        { n: [  6,  7, ], f: [], },
        { n: [  6,  8, ], f: [], },
        { n: [  6,  9, ], f: [], },
        { n: [  7, 10, ], f: [], },
        { n: [  7, 11, ], f: [], },
        { n: [  8,  9, ], f: [], },
        { n: [ 10, 11, ], f: [], },
    ];
    
    faces =
    [
        { n: [  0,  1,  8 ], e: [  0,  7,  3 ], },
        { n: [  0,  4,  5 ], e: [  1, 18,  2 ], },
        { n: [  0,  5, 10 ], e: [  2, 21,  4 ], },
        { n: [  0,  8,  4 ], e: [  3, 19,  1 ], },
        { n: [  0, 10,  1 ], e: [  4,  8,  0 ], },
        { n: [  1,  6,  8 ], e: [  5, 24,  7 ], },
        { n: [  1,  7,  6 ], e: [  6, 23,  5 ], },
        { n: [  1, 10,  7 ], e: [  8, 26,  6 ], },
        { n: [  2,  3, 11 ], e: [  9, 17, 13 ], },
        { n: [  2,  4,  9 ], e: [ 10, 20, 12 ], },
        { n: [  2,  5,  4 ], e: [ 11, 18, 10 ], },
        { n: [  2,  9,  3 ], e: [ 12, 16,  9 ], },
        { n: [  2, 11,  5 ], e: [ 13, 22, 11 ], },
        { n: [  3,  6,  7 ], e: [ 14, 23, 15 ], },
        { n: [  3,  7, 11 ], e: [ 15, 27, 17 ], },
        { n: [  3,  9,  6 ], e: [ 16, 25, 14 ], },
        { n: [  4,  8,  9 ], e: [ 19, 28, 20 ], },
        { n: [  5, 11, 10 ], e: [ 22, 29, 21 ], },
        { n: [  6,  9,  8 ], e: [ 25, 28, 24 ], },
        { n: [  7, 10, 11 ], e: [ 26, 29, 27 ], },
    ];
    
    for (var i = 0; i < edges.length; ++i)
        for (var j = 0; j < edges[i].n.length; ++j)
            nodes[j].e.push(i);
    
    for (var i = 0; i < faces.length; ++i)
        for (var j = 0; j < faces[i].n.length; ++j)
            nodes[j].f.push(i);
    
    for (var i = 0; i < faces.length; ++i)
        for (var j = 0; j < faces[i].e.length; ++j)
            edges[j].f.push(i);
    
    return { nodes: nodes, edges: edges, faces: faces };
}

generateSubdividedIcosahedron(degree)
{
    var icosahedron = generateIcosahedron();
    
    var nodes = [];
    for (var i = 0; i < icosahedron.nodes.length; ++i)
    {
        nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
    }
    
    var edges = [];
    for (var i = 0; i < icosahedron.edges.length; ++i)
    {
        var edge = icosahedron.edges[i];
        edge.subdivided_n = [];
        edge.subdivided_e = [];
        var n0 = icosahedron.nodes[edge.n[0]];
        var n1 = icosahedron.nodes[edge.n[1]];
        var p0 = n0.p;
        var p1 = n1.p;
        var delta = p1.clone().sub(p0);
        nodes[edge.n[0]].e.push(edges.length);
        var priorNodeIndex = edge.n[0];
        for (var s = 1; s < degree; ++s)
        {
            var edgeIndex = edges.length;
            var nodeIndex = nodes.length;
            edge.subdivided_e.push(edgeIndex);
            edge.subdivided_n.push(nodeIndex);
            edges.push({ n: [ priorNodeIndex, nodeIndex ], f: [] });
            priorNodeIndex = nodeIndex;
            nodes.push({ p: slerp(p0, p1, s / degree), e: [ edgeIndex, edgeIndex + 1 ], f: [] });
        }
        edge.subdivided_e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push({ n: [ priorNodeIndex, edge.n[1] ], f: [] });
    }

    var faces = [];
    for (var i = 0; i < icosahedron.faces.length; ++i)
    {
        var face = icosahedron.faces[i];
        var edge0 = icosahedron.edges[face.e[0]];
        var edge1 = icosahedron.edges[face.e[1]];
        var edge2 = icosahedron.edges[face.e[2]];
        var point0 = icosahedron.nodes[face.n[0]].p;
        var point1 = icosahedron.nodes[face.n[1]].p;
        var point2 = icosahedron.nodes[face.n[2]].p;
        var delta = point1.clone().sub(point0);
        
        var getEdgeNode0 = (face.n[0] === edge0.n[0])
            ? function(k) { return edge0.subdivided_n[k]; }
            : function(k) { return edge0.subdivided_n[degree - 2 - k]; };
        var getEdgeNode1 = (face.n[1] === edge1.n[0])
            ? function(k) { return edge1.subdivided_n[k]; }
            : function(k) { return edge1.subdivided_n[degree - 2 - k]; };
        var getEdgeNode2 = (face.n[0] === edge2.n[0])
            ? function(k) { return edge2.subdivided_n[k]; }
            : function(k) { return edge2.subdivided_n[degree - 2 - k]; };

        var faceNodes = [];
        faceNodes.push(face.n[0]);
        for (var j = 0; j < edge0.subdivided_n.length; ++j)
            faceNodes.push(getEdgeNode0(j));
        faceNodes.push(face.n[1]);
        for (var s = 1; s < degree; ++s)
        {
            faceNodes.push(getEdgeNode2(s - 1));
            var p0 = nodes[getEdgeNode2(s - 1)].p;
            var p1 = nodes[getEdgeNode1(s - 1)].p;
            for (var t = 1; t < degree - s; ++t)
            {
                faceNodes.push(nodes.length);
                nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [], });
            }
            faceNodes.push(getEdgeNode1(s - 1));
        }
        faceNodes.push(face.n[2]);
        
        var getEdgeEdge0 = (face.n[0] === edge0.n[0])
            ? function(k) { return edge0.subdivided_e[k]; }
            : function(k) { return edge0.subdivided_e[degree - 1 - k]; };
        var getEdgeEdge1 = (face.n[1] === edge1.n[0])
            ? function(k) { return edge1.subdivided_e[k]; }
            : function(k) { return edge1.subdivided_e[degree - 1 - k]; };
        var getEdgeEdge2 = (face.n[0] === edge2.n[0])
            ? function(k) { return edge2.subdivided_e[k]; }
            : function(k) { return edge2.subdivided_e[degree - 1 - k]; };

        var faceEdges0 = [];
        for (var j = 0; j < degree; ++j)
            faceEdges0.push(getEdgeEdge0(j));
        var nodeIndex = degree + 1;
        for (var s = 1; s < degree; ++s)
        {
            for (var t = 0; t < degree - s; ++t)
            {
                faceEdges0.push(edges.length);
                var edge = { n: [ faceNodes[nodeIndex], faceNodes[nodeIndex + 1], ], f: [], };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            ++nodeIndex;
        }

        var faceEdges1 = [];
        nodeIndex = 1;
        for (var s = 0; s < degree; ++s)
        {
            for (var t = 1; t < degree - s; ++t)
            {
                faceEdges1.push(edges.length);
                var edge = { n: [ faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s], ], f: [], };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            faceEdges1.push(getEdgeEdge1(s));
            nodeIndex += 2;
        }

        var faceEdges2 = [];
        nodeIndex = 1;
        for (var s = 0; s < degree; ++s)
        {
            faceEdges2.push(getEdgeEdge2(s));
            for (var t = 1; t < degree - s; ++t)
            {
                faceEdges2.push(edges.length);
                var edge = { n: [ faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1], ], f: [], };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            nodeIndex += 2;
        }
        
        nodeIndex = 0;
        edgeIndex = 0;
        for (var s = 0; s < degree; ++s)
        {
            for (t = 1; t < degree - s + 1; ++t)
            {
                var subFace = {
                    n: [ faceNodes[nodeIndex], faceNodes[nodeIndex + 1], faceNodes[nodeIndex + degree - s + 1], ],
                    e: [ faceEdges0[edgeIndex], faceEdges1[edgeIndex], faceEdges2[edgeIndex], ], };
                nodes[subFace.n[0]].f.push(faces.length);
                nodes[subFace.n[1]].f.push(faces.length);
                nodes[subFace.n[2]].f.push(faces.length);
                edges[subFace.e[0]].f.push(faces.length);
                edges[subFace.e[1]].f.push(faces.length);
                edges[subFace.e[2]].f.push(faces.length);
                faces.push(subFace);
                ++nodeIndex;
                ++edgeIndex;
            }
            ++nodeIndex;
        }
        
        nodeIndex = 1;
        edgeIndex = 0;
        for (var s = 1; s < degree; ++s)
        {
            for (t = 1; t < degree - s + 1; ++t)
            {
                var subFace = {
                    n: [ faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 2], faceNodes[nodeIndex + degree - s + 1], ],
                    e: [ faceEdges2[edgeIndex + 1], faceEdges0[edgeIndex + degree - s + 1], faceEdges1[edgeIndex], ], };
                nodes[subFace.n[0]].f.push(faces.length);
                nodes[subFace.n[1]].f.push(faces.length);
                nodes[subFace.n[2]].f.push(faces.length);
                edges[subFace.e[0]].f.push(faces.length);
                edges[subFace.e[1]].f.push(faces.length);
                edges[subFace.e[2]].f.push(faces.length);
                faces.push(subFace);
                ++nodeIndex;
                ++edgeIndex;
            }
            nodeIndex += 2;
            edgeIndex += 1;
        }
    }

    return { nodes: nodes, edges: edges, faces: faces };
}


    //////////////////////////////////////////////////////////////

    isUVBroken ( uvs, ua, ub, uc ) {

        let vec2 = this.glMatrix.vec2;

        var tmpX = [0, 0, 0];
        var tmpY = [0, 0, 0];

        var uvA = [ uvs[ua], uvs[ ua+1] ];
        var uvB = [ uvs[ub], uvs[ ub+1] ];
        var uvC = [ uvs[uc], uvs[ uc+1] ];

        tmpX = vec2.sub( tmpX, uvB, uvA );
        tmpY = vec2.sub( tmpY, uvC, uvA );

        // note: produces 3d vector

        tmpX = vec2.cross(tmpX, tmpX, tmpY);

        return tmpX[2] < 0;

    }

    fixUVEdges ( cells, uvs, MIN, MAX ) {

        for (var i = 0; i < cells.length; i+=3 ) {

            //var cell = cells[i]

            var ui = i * 2 / 3;

            var uv0 = uvs[ cells[ ui   ] ]
            var uv1 = uvs[ cells[ ui+1 ] ]
            var uv2 = uvs[ cells[ ui+2 ] ]

            var max = Math.max( uv0[0], uv1[0], uv2[0] )
            var min = Math.min( uv0[0], uv1[0], uv2[0] )

            if (max > MAX && min < MIN) {
                if ( uv0[0] < MIN ) uv0[0] += 1
                if ( uv1[0] < MIN ) uv1[0] += 1
                if ( uv2[0] < MIN ) uv2[0] += 1

            }
        }
    }


    revisit ( cache, face, uv, position, newVertices, newUvs ) {

        if ( ! ( face in cache ) ) {

            newVertices.push( position.slice() )

            newUvs.push( uv.slice() )

            var verticeIndex = newVertices.length - 1

            cache[face] = verticeIndex

            return verticeIndex

        } else {

            return cache[face]

        }

    }

    fixWrappedUVs ( vertices, indices, texCoords ) {

        var MIN = 0.25
        var MAX = 0.75

        // make a copy.

        var newVertices = vertices.slice()

        var newtexCoords = texCoords.slice()

        var visited = {}

        for ( var i = 0; i < indices.length; i+= 3 ) {

            var cell = indices[i]

            //var a = cell[0]
            //var b = cell[1]
            //var c = cell[2]

            // get the point position in the indices

            var a = indices[ i ];
            var b = indices[ i + 1];
            var c = indices[ i + 2];

            // get the equivalent uv indices

            var ua = a * 3 / 2;
            var ub = b * 3 / 2;
            var uc = c * 3 / 2;

            if ( ! this.isUVBroken( texCoords, ua, ub, uc ) ) {

                continue;

            }

            // converted!!!!!!!s
            var p0 = [ vertices[a], vertices[a+1], vertices[a+2] ]
            var p1 = [ vertices[b], vertices[b+1], vertices[b+2] ]
            var p2 = [ vertices[c], vertices[c+1], vertices[c+2] ]

            var udx1 = uvIndex * i;

            // pull out the equivalen texture coordinate value

            var uv0 = [ texCoords[ ua ], texCoords[ ua+1 ] ]
            var uv1 = [ texCoords[ ub ], texCoords[ ub+1 ] ]
            var uv2 = [ texCoords[ uc ], texCoords[ uc+1 ] ]

            if (uv0[0] < MIN) {
                a = this.revisit( visited, a, uv0, p0, newVertices, newUvs )
            }

            if (uv1[0] < MIN) {
                b = this.revisit( visited, b, uv1, p1, newVertices, newUvs )
            }

            if (uv2[0] < MIN) {
                c = this.revisit( visited, c, uv2, p2, newVertices, newUvs )
            }

            //cell[0] = a
            //cell[1] = b
            //cell[2] = c

            indices[i]   = a;
            indices[i+1] = b;
            indices[i+2] = c;


        }


        this.fixUVEdges( indices, newtexCoords, MIN, MAX)

        // modify mesh in place with new lists

        vertices = newVertices
        texCoords = newtexCoords

    }

    /** 
     * Pole visit
     */
    poleVisit (cell, poleIndex, b, c, uvs) {
        var uv1 = uvs[b]
        var uv2 = uvs[c]
        uvs[poleIndex][0] = (uv1[0] + uv2[0]) / 2
        verticeIndex++
        newVertices.push(positions[poleIndex].slice())
        newUvs.push(uvs[poleIndex].slice())
        cell[0] = verticeIndex
    }


    firstYIndex (list, value) {

        for (var i = 0; i < list.length; i += 3) {
            var vec = list[i]
            if (Math.abs(vec[ i + 1 ] - value) <= 1e-4) {
                return i
            }
        }
    return -1
    }

    /** 
     * fix poleuvs
     */
    fixPoleUVs (positions, cells, uvs) {

        var northIndex = this.firstYIndex(positions, 1)
        var southIndex = this.firstYIndex(positions, -1)
        if (northIndex === -1 || southIndex === -1) {
            // could not find any poles, bail early
            return
        }

        // fast array copy.

        var newVertices = positions.slice();

        var newUvs = uvs.slice()

        var verticeIndex = newVertices.length - 1

        for (var i = 0; i < cells.length; i += 3) {
            var a = cells[ i + 0]
            var b = cells[ i + 1]
            var c = cells[ i + 2]

            var cell = [ a, b, c ];

            if (a === northIndex) {
            this.poleVisit(cell, northIndex, b, c, uvs )
            } else if (a === southIndex) {
            this.poleVisit(cell, southIndex, b, c, uvs )
            }
        }

        return {
            vertices: newVertices,
            uvs: newUvs
        }

    }

    /** 
     * Get a midpoint along a face side in icosphere
     */
    getMidPoint ( a, b, midPoints ) {

        var point = [
            ( a[0] + b[0] ) / 2, 
            ( a[1] + b[1] ) / 2, 
            ( a[2] + b[2] ) / 2
        ];

        var pointKey = point[ 0 ].toPrecision( 6 ) + ','
                     + point[ 1 ].toPrecision( 6 ) + ','
                     + point[ 2 ].toPrecision( 6 );

        var cachedPoint = midPoints[ pointKey ];

        if ( cachedPoint ) {

            return cachedPoint;

        } else {

            return ( midPoints[ pointKey ] = point );

        }

    }

    /** 
     * Given an icosphere, subdivide
     */
    subDivideIco( vertices, indices ) {

        var newCells = [];
        var newPositions = [];
        var midpoints = {};
        let i, l = 0;

        for (i = 0; i < indices.length; i+=3 ) {

            var c0 = indices[i];
            var c1 = indices[i + 1];
            var c2 = indices[i + 2];

            //console.log('c0:' + c0 + ' c1:' + c1 + ' c2:' + c2)

            var v0 = [ vertices[ c0 ], vertices[ c0 + 1 ], vertices[ c0 + 2 ] ];
            var v1 = [ vertices[ c1 ], vertices[ c1 + 1 ], vertices[ c1 + 2 ] ];
            var v2 = [ vertices[ c2 ], vertices[ c2 + 1 ], vertices[ c2 + 2 ] ];

            var a = this.getMidPoint( v0, v1, midpoints );
            var b = this.getMidPoint( v1, v2, midpoints );
            var c = this.getMidPoint( v2, v0, midpoints );

            var ai = newPositions.indexOf(a) 
            if (ai === -1) ai = l++, newPositions.push(a)
            var bi = newPositions.indexOf(b)
            if (bi === -1) bi = l++, newPositions.push(b)
            var ci = newPositions.indexOf(c)
            if (ci === -1) ci = l++, newPositions.push(c)

            var v0i = newPositions.indexOf(v0)
            if (v0i === -1) v0i = l++, newPositions.push(v0)
            var v1i = newPositions.indexOf(v1)
            if (v1i === -1) v1i = l++, newPositions.push(v1)
            var v2i = newPositions.indexOf(v2)
            if (v2i === -1) v2i = l++, newPositions.push(v2)

            newCells.push(v0i, ai, ci)
            newCells.push(v1i, bi, ai)
            newCells.push(v2i, ci, bi)
            newCells.push(ai, bi, ci)

    }

        vertices = [];

        for( i = 0; i < newPositions.length; i++ ) {

            vertices.push(newPositions[i][0], newPositions[i][1], newPositions[i][2]);

        }

        indices = [];

        for ( i = 0; i < newCells.length; i++ ) {
            indices.push(newCells[i])
        }

        console.log('new vertices:' + vertices.length + ' indices:' + indices.length)

        // flatten vertices

        return {
            indices: indices,
            vertices: vertices
        }

    }

    /** 
     * https://gamedevdaily.io/four-ways-to-create-a-mesh-for-a-sphere-d7956b825db4#.lkbq2omq5
     * https://www.geometrictools.com/Samples/Geometrics.html
     *
     * https://github.com/glo-js/primitive-icosphere
     * https://github.com/hughsk/icosphere
     * http://mft-dev.dk/uv-mapping-sphere/
     * http://donhavey.com/blog/tutorials/tutorial-3-the-icosahedron-sphere/
     * http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
     */
    geometryIcoSphere ( prim ) {

        let vec3 = this.glMatrix.vec3;

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let colors = [];

        var t = 0.5 + Math.sqrt(5) / 2;

        vertices.push( -1, +t,  0 );
        vertices.push( +1, +t,  0 );
        vertices.push( -1, -t,  0 );
        vertices.push( +1, -t,  0 );

        vertices.push( 0, -1, +t );
        vertices.push( 0, +1, +t );
        vertices.push( 0, -1, -t );
        vertices.push( 0, +1, -t );

        vertices.push( +t,  0, -1 );
        vertices.push( +t,  0, +1 );
        vertices.push( -t,  0, -1 );
        vertices.push( -t,  0, +1 );

        indices.push( 0, 11, 5 )
        indices.push( 0, 5, 1 )
        indices.push( 0, 1, 7 )
        indices.push( 0, 7, 10 )
        indices.push( 0, 10, 11 )

        indices.push( 1, 5, 9 )
        indices.push( 5, 11, 4 )
        indices.push( 11, 10, 2 )
        indices.push( 10, 7, 6 )
        indices.push( 7, 1, 8 )

        indices.push( 3, 9, 4 )
        indices.push( 3, 4, 2 )
        indices.push( 3, 2, 6 )
        indices.push( 3, 6, 8 )
        indices.push( 3, 8, 9 )

        indices.push( 4, 9, 5 )
        indices.push( 2, 4, 11 )
        indices.push( 6, 2, 10 )
        indices.push( 8, 6, 7 )
        indices.push( 9, 8, 1 )

        let i, u, v, x, y, z, ico, normal;

        // Subdivide.

        console.log('original vertices:' + vertices.length + ' indices:' + indices.length);

        //while (subdivisions-- > 0) {
        //    ico = this.subDivideIco( vertices, indices );
        //    vertices = ico.vertices;
        //    indices = ico.indices;
        //    ico = this.subDivideIco( vertices, indices );
        //    vertices = ico.vertices;
        //    indices = ico.indices;
        //    ico = this.subDivideIco( vertices, indices );
       //     vertices = ico.vertices;
        //    indices = ico.indices;

        //}

        ////////////////////////window.vertices = vertices;
        ///////////////////////window.indices = indices;

        //this.fixPoleUVs( vertices, indices, texCoords );

        //this.fixWrappedUVs( vertices, indices, texCoords );

        //vertices = ico.vertices;
        //indices = ico.indices;

        // Normalize.

        for ( i = 0; i < vertices.length; i += 3 ) {

            x = vertices[i];
            y = vertices[i + 1];
            z = vertices[i + 2];

            var len = x*x + y*y + z*z;

            if (len > 0) {
                len = 1 / Math.sqrt(len);
                vertices[i] *= len;
                vertices[i + 1] *= len;
                vertices[i + 2] *= len;
            }

        }

        // Normals

        for ( i = 0; i < vertices.length; i+=3 ) {

            //var n = vec3.normalize( vec3.create(), [ vertices[i], vertices[i+1], vertices[i+2]])

            // get UV from unit icosphere
            u = 0.5 * ( -( Math.atan2( vertices[ i + 2], -vertices[ i ] ) / Math.PI) + 1.0);
            v = 0.5 + Math.asin(vertices[ i + 1]) / Math.PI;
            texCoords.push( 1- u, v );

            // normals
            normals.push( vertices[i], vertices[i+1], vertices[i+2])

            colors.push( 1, 1, 1, 1 );

        }

        window.vertices = vertices;
        window.indices = indices;
        window.texCoords = texCoords;
        window.normals = normals;
        window.colors = colors;


        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

    }

    /** 
     * Icosphere, BabylonJS
     */
    geometryIco ( prim ) {

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let colors = [];

        let vec3 = this.glMatrix.vec3;

        let vec2 = this.glMatrix.vec2;



    }


    /** 
     * Half-sphere, polar coordinates.
     */
    geometryDome ( prim ) {

    }

    /** 
     * Half-sphere, icosohedron based.
     */
    geometryIcoDome( prim ) {

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
     * Generic 3d shape (e.g. Collada model).
     * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
     * https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
     */
    geometryMesh ( prim ) {

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




    ggggeometryIcoSphere ( prim ) {

/*
            function lerp (out, a, b, t) {
                var ax = a[0],
                    ay = a[1],
                    az = a[2];
                    out[0] = ax + t * (b[0] - ax);
                    out[1] = ay + t * (b[1] - ay);
                    out[2] = az + t * (b[2] - az);
                    return out;
            };
*/

            var sideOrientation = 0; // options.sideOrientation || 0 ; //     BABYLON.Mesh.DEFAULTSIDE;
            var radius = 1; //options.radius || 1;
            var flat = true; // (options.flat === undefined) ? true : options.flat;
            var subdivisions = 4; // options.subdivisions || 4;
            var radiusX = radius; // options.radiusX || radius;
            var radiusY = radius; // options.radiusY || radius;
            var radiusZ = radius; // options.radiusZ || radius;

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
            var vertices = [];
            var indices = [];
            var normals = [];
            var texCoords = [];

            var current_indice = 0;
            // prepare array of 3 vector (empty) (to be worked in place, shared for each face)
            var face_vertex_pos = new Array(3);
            var face_vertex_uv = new Array(3);
            var v012;
            for (v012 = 0; v012 < 3; v012++) {
                face_vertex_pos[v012] = vec3.create();
                face_vertex_uv[v012] = vec3.create();
            }
            // create all with normals
            for (var face = 0; face < 20; face++) {
                // 3 vertex per face
                for (v012 = 0; v012 < 3; v012++) {
                    // look up vertex 0,1,2 to its index in 0 to 11 (or 23 including alias)
                    var v_id = ico_indices[3 * face + v012];
                    // vertex have 3D position (x,y,z)
                    face_vertex_pos[v012].fromValues(ico_vertices[3 * vertices_unalias_id[v_id]], ico_vertices[3 * vertices_unalias_id[v_id] + 1], ico_vertices[3 * vertices_unalias_id[v_id] + 2]);
                    // Normalize to get normal, then scale to radius
                    //////////////face_vertex_pos[v012].normalize().scaleInPlace(radius);
                    face_vertex_pos[v012] = vec3.normalize( face_vertex_pos[v012], face_vertex_pos[v012])
                    face_vertex_pos[v012] = vec3.scale(face_vertex_pos[v012], radius)
                    // uv Coordinates from vertex ID
                    face_vertex_uv[v012].fromValues(ico_vertexuv[2 * v_id] * ustep + uoffset + island[face] * island_u_offset, ico_vertexuv[2 * v_id + 1] * vstep + voffset + island[face] * island_v_offset);
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
                    var pos_x0 = vec3.lerp(vec3.create(), face_vertex_pos[0], face_vertex_pos[2], i2 / subdivisions);
                    var pos_x1 = vec3.lerp(vec3.create(), face_vertex_pos[1], face_vertex_pos[2], i2 / subdivisions);
                    var pos_interp = (subdivisions === i2) ? face_vertex_pos[2] : BABYLON.Vector3.Lerp(pos_x0, pos_x1, i1 / (subdivisions - i2));
                    pos_interp.normalize();
                    var vertex_normal;
                    if (flat) {
                        // in flat mode, recalculate normal as face centroid normal
                        var centroid_x0 = vec3.lerp(vec3.create(), face_vertex_pos[0], face_vertex_pos[2], c2 / subdivisions);
                        var centroid_x1 = vec3.lerp(vec3.create(), face_vertex_pos[1], face_vertex_pos[2], c2 / subdivisions);
                        vertex_normal = vec3.lerp(vec3.create(), centroid_x0, centroid_x1, c1 / (subdivisions - c2));
                    }
                    else {
                        // in smooth mode, recalculate normal from each single vertex position
                        vertex_normal = vec3.create(pos_interp.x, pos_interp.y, pos_interp.z);
                    }
                    // Vertex normal need correction due to X,Y,Z radius scaling
                    vertex_normal.x /= radiusX;
                    vertex_normal.y /= radiusY;
                    vertex_normal.z /= radiusZ;
                    vertex_normal.normalize();
                    var uv_x0 = vec2.lerp(vec2.create(), face_vertex_uv[0], face_vertex_uv[2], i2 / subdivisions);
                    var uv_x1 = vec2.lerp(vec2.create(), face_vertex_uv[1], face_vertex_uv[2], i2 / subdivisions);
                    var uv_interp = (subdivisions === i2) ? face_vertex_uv[2] : vec2.lerp(vec2.create(), uv_x0, uv_x1, i1 / (subdivisions - i2));
                    vertices.push(pos_interp.x * radiusX, pos_interp.y * radiusY, pos_interp.z * radiusZ);
                    normals.push(vertex_normal.x, vertex_normal.y, vertex_normal.z);
                    texCoords.push(uv_interp.x, uv_interp.y);
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
            this.computeSides(sideOrientation, vertices, indices, normals, texCoords);
            // Result

            return this.createBuffers ( vertices, indices, texCoords, normals, colors );

/*
            var vertexData = new VertexData();
            vertexData.indices = indices;
            vertexData.vertices = vertices;
            vertexData.normals = normals;
            vertexData.texCoords = texCoords;
            return vertexData;
*/

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

        this.util.primReadout( prim );

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
     * Set a material for a prim.
     * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
     * didn't use chroma (but could)
     * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
     */
    setMaterial ( prim ) {

       return {

            u_colorMult:             0,

            u_diffuse:               [ 1, 1, 1 ], // TODO: should be textures[0]

            u_specular:              [ 1, 1, 1, 1 ],

            u_shininess:             this.util.getRand( 500 ),

            u_specularFactor:        this.util.getRand( 1 ) // TODO: MAY NOT BE RIGHT

        }

    }

}
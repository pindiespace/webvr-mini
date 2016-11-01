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

            POINT: 'geometryPoint',

            POINTCLOUD: 'geometryPointCloud',

            LINE: 'geometryLine',

            PLANE: 'geometryPlane',

            POLY: 'geometryPoly',

            CUBE: 'geometryCube',

            SPHERE: 'geometrySphere',

            ICOSPHERE: 'geometryIcoSphere',

            DOME: 'geometryDome',

            ICODOME: 'geometryIcoDome',

            CONE: 'geometryCone',

            CYLINDER: 'geometryCylinder',

            MESH: 'geometryMesh',

            TERRAIN: 'geometryTerrain'

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
     * UTILITIES
     */

    /**
     * Compute whether point is in a triangle, wrapped 
     * clockwise (begin with a, end with c)
     * @link http://blackpawn.com/texts/pointinpoly/
     * @param {vec3} p the point to test.
     * @param {vec3} a first clockwise vertex of triangle.
     * @param {vec3} b second clockwise vertex of triangle.
     * @param {vec3} c third clockwise vertex of triangle.
     * @returns {Boolean} if point in triangle, return true, else false.
     */
    pointInTriangle ( p, a, b, c ) {

        let vec3 = this.glMatrix.vec3;
        let v0, v1, v2, dot00, dot01, dot02, dot11, dot12;

        // Compute vectors.

        v0 = vec3.sub( v0, c, a );
        v1 = vec3.sub( v1, b, a );
        v2 = vec3.sub( v2, p, a );

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
     * given a discrete heightmap, using bilinear interpolation
     * @param {Array} heightmap 
     * @param {Number} w = width of heightmap (cols, x)
     * @param {Number} h = depth of heightmap (rows, z)
     * @param {Number} x = desired x position (between 0.0 and 1.0)
     * @param {Number} z = desired z position (between 0.0 and 1.0)
     */
    biLinear ( heightMap, w, h, x, z ) {

        if ( x < 0 || x > 1.0 || z < 0 || z > 1.0 ) {

            console.error( 'heightmap x index out of range, x:' + x + ' z:' + z );

            return null;
        }

        // Our x and z, scaled to heightmap divisions.

        x *= w;
        z *= h;

        // Points above and below our position.

        let x1 = Math.min( x );
        let x2 = Math.max( x );
        let z1 = Math.min( z );
        let z2 = Math.max( z );

        // Interpolate along x axis, get interpolations above and below point.

        let a = this.getHeightMap( heightMap, x1, z1 ) * (x - x1) + 
            this.getHeightMap( heightMap, x1, z2 ) * (1 - x - x1);

        let b = this.getHeightMap( heightMap, z1, z2 ) * (x - x1) +
            this.getHeightMap( heightMap, x2, z2 ) * (1 - x - x1);

        // Interpolate these results along z axis.

        let v = a * (z - z1) + b * (1 - z - z1);

        return v;

    }


    /** 
     * given a discrete heightmap, using bilinear interpolation
     * @param {Array} heightmap 
     * @param {Number} w = width of heightmap (cols, x)
     * @param {Number} h = depth of heightmap (rows, z)
     * @param {Number} x = desired x position (between 0.0 and 1.0)
     * @param {Number} z = desired z position (between 0.0 and 1.0)
     */
    biCubic ( xf, yf, 
        p00, p01, p02, p03, 
        p10, p11, p12, p13, 
        p20, p21, p22, p23, 
        p30, p31, p32, p33
    ) {

        // https://github.com/hughsk/bicubic-sample/blob/master/index.js
        // https://github.com/hughsk/bicubic/blob/master/index.js

        /* 
        var x1 = floor(x)
    var y1 = floor(y)
    var x2 = x1 + 1
    var y2 = y1 + 1

    var p00 = getter(x1 - 1, y1 - 1)
    var p01 = getter(x1 - 1, y1)
    var p02 = getter(x1 - 1, y2)
    var p03 = getter(x1 - 1, y2 + 1)

    var p10 = getter(x1, y1 - 1)
    var p11 = getter(x1, y1)
    var p12 = getter(x1, y2)
    var p13 = getter(x1, y2 + 1)

    var p20 = getter(x2, y1 - 1)
    var p21 = getter(x2, y1)
    var p22 = getter(x2, y2)
    var p23 = getter(x2, y2 + 1)

    var p30 = getter(x2 + 1, y1 - 1)
    var p31 = getter(x2 + 1, y1)
    var p32 = getter(x2 + 1, y2)
    var p33 = getter(x2 + 1, y2 + 1)

    return bicubic(
        x - x1
      , y - y1
      , p00, p10, p20, p30
      , p01, p11, p21, p31
      , p02, p12, p22, p32
      , p03, p13, p23, p33
    )
    */

        var yf2 = yf * yf
        var xf2 = xf * xf
        var xf3 = xf * xf2

        var x00 = p03 - p02 - p00 + p01
        var x01 = p00 - p01 - x00
        var x02 = p02 - p00
        var x0 = x00*xf3 + x01*xf2 + x02*xf + p01

        var x10 = p13 - p12 - p10 + p11
        var x11 = p10 - p11 - x10
        var x12 = p12 - p10
        var x1 = x10*xf3 + x11*xf2 + x12*xf + p11

        var x20 = p23 - p22 - p20 + p21
        var x21 = p20 - p21 - x20
        var x22 = p22 - p20
        var x2 = x20*xf3 + x21*xf2 + x22*xf + p21

        var x30 = p33 - p32 - p30 + p31
        var x31 = p30 - p31 - x30
        var x32 = p32 - p30
        var x3 = x30*xf3 + x31*xf2 + x32*xf + p31

        var y0 = x3 - x2 - x0 + x1
        var y1 = x0 - x1 - y0
        var y2 = x2 - x0

        return y0*yf*yf2 + y1*yf2 + y2*yf + x1

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
     * Create a random heightMap (just a lot of bumps).
     * @param {Array} divisions 3d divisions width (x), height(y), depth(z) within the dimensions.
     * @returns {Array} an array for a heightmap of defined dimensions and divisions.
     */
    createHeightMap ( divisions ) {

        let vec3 = this.glMatrix.vec3;
 
        let hm = [];

        let randMax = 0.5;

        for ( let i = 0; i < divisions[0]; i++ ) { // x

            for ( let j = 0; j < divisions[2]; j++ ) { // z

                hm.push( this.util.getRand( 0, randMax ) );

            }
        }

        return hm;

    }

    /** 
     * get heightmap value for a 1D JavaScript Array, using 
     * assigned width (x) and height (z)
     * @param {Array} heightmap 
     * @param {Number} w = width of heightmap (cols, x)
     * @param {Number} h = depth of heightmap (rows, z)
     * @param {Number} x = desired x position (between 0.0 and 1.0)
     * @param {Number} z = desired z position (between 0.0 and 1.0)
     */
    getHeightMapVal ( heightMap, w, h, x, z ) {

        if ( x < 0 || z < 0 || ( x > ( w - 1 ) ) || ( y > ( h - 1 ) ) ) {

            console.error( 'heightmap positions out of range: x:' + x + ' z:' + z );

            return null;
        }

        return heightMap[ ( w * z ) + x ];

    }

    /** 
     * Get the center of a shape.
     */
    getCenter ( vertices ) {

        let box = this.boundingBox( vertices );

        // find the centroid point (not necessarily part of the shape).

    }

    /** 
     * compute surface normals
     * @link http://gamedev.stackexchange.com/questions/8191/any-reliable-polygon-normal-calculation-code
     * @link https://www.opengl.org/wiki/Calculating_a_Surface_Normal
     */
    surfaceNormals ( vertices, indices, normals ) {

        let vec3 = this.glMatrix.vec3;

        // Initialize.

        for ( i = 0; i < normals.length; i++) {
            normals[i] = 0;
        }

        // Compute normals.

        let i, v1, v2, s1 = [0,0,0], s2 = [0,0,0], c = [0, 0, 0], normal = [0,0,0];

        for( i = 0; i < indices.Length; i += 3 ) {
            v0 = [vertices[indicies[i  ]], vertices[indicies[i] + 1 ], vertices[indicies[i] + 2 ]];
            v1 = [vertices[indicies[i+1]], vertices[indicies[i] + 1 ], vertices[indicies[i] + 2 ]];
            v2 = [vertices[indicies[i+2]], vertices[indicies[i] + 1 ], vertices[indicies[i] + 2 ]];

            s1 = vec3.sub( s1, v2, v0 );
            s2 = vec3.sub( s2, v1, v0 );

            c = vec3.cross( c, s1, s2 );

            normals[indices[i]]     += normal[0]; normal[indices[i] + 1 ]     += normal[1]; normal[indices[i] + 2]     += normal[2];
            normals[indices[i+1]]   += normal[0]; normal[indices[i+1] + 1 ]   += normal[1]; normal[indices[i+1] + 2 ]  += normal[2];
            normals[indices[i + 2]] += normal[0]; normal[indices[i + 2] + 1 ] += normal[1]; normal[indices[i + 2] + 2] += normal[2];

        }

        for(i = 0; i < normals.length; i += 3) {

            normal = vec3.normalize( normal, [normals[i], normals[i+1], normals[i+2]] );

            normals[i]   = normal[0];
            normals[i+1] = normal[1];
            normals[i+2] = normal[2];

        }


    }

    /** 
     * Compute normals for a 3d object.
     * Adapted from BabylonJS
     * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
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
            faceNormaly = -normals[index * 3 + 1];
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

        let rows = prim.divisions[1]; // y axis

        let cols = prim.divisions[0] // x axis (really xz)

        let halfX = prim.dimensions[0] / 2;
        let halfZ = prim.dimensions[2] / 2;

        let incX = prim.dimensions[0] / prim.divisions[0];
        let incY = 1.0;
        let incZ = prim.dimensions[2] / prim.divisions[2];

        for (let colNumber = 0; colNumber <= cols; colNumber++) {

            for (let rowNumber = 0; rowNumber <= rows; rowNumber++) {

                let phi = colNumber * 2 * Math.PI / cols;

                let x = colNumber;
                let y = this.util.getRand(0, 2);  /////TODO: RANDOM FOR NOW
                let z = rowNumber;

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

        window.vertices = vertices;

        window.normals = normals;

        return this.createBuffers ( vertices, indices, texCoords, normals, colors );

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
     * Icosphere, iterated from icosohedron.
     */
    geometryIcoSphere ( prim ) {

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
/*
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
     * Generic 3d shape (e.g. collada model).
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

            prim.heightMap = this.createHeightMap( prim.divisions );

        }

        let geometry = this.geometryPlane( prim );

        return geometry;

    };

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

}
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

            CUBE: 'CUBE',

            SPHERE: 'SPHERE',

            DOME: 'DOME',

            CONE: 'CONE',

            CYLINDER: 'CYLINDER',

            POLY: 'POLY'

        };

    }

    /** 
     * Unique object id
     * @link https://jsfiddle.net/briguy37/2MVFd/
     */
    setId () {

        let d = new Date().getTime();

        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

            var r = (d + Math.random()*16)%16 | 0;

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

    /** 
     * GEOMETRIES
     */

    geometryPoint () {

    }

    geometryLine () {

    }

    geometryPlane () {

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

        let gl = this.webgl.getContext();

        let x = prim.dimensions[0] / 2;

        let y = prim.dimensions[1] / 2;

        let z = prim.dimensions[2] / 2 ;

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

        // Apply default transforms, centering on a Point and scaling.

        let vBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

        //////////////////////////////////////
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

        let tBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );

        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

        ///  /////////////////////////////////////////////
        let normals = [];

        ////////////////////////////////////////////////
        let colors = [
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue

            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,    // blue

            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue

            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue

            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0,     // blue

            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0     // blue
        ];

        let cBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        /////////////////////////////////////////////////
        let indices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face //can't go to 30
            20, 21, 22,   20, 22, 23  // Left face
        ];

        let iBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);

        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW);

        // Return standard geo object.

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

            indices: {

                data: indices,

                buffer: iBuffer,

                itemSize: 1,

                numItems: indices.length

            }

        }

    }

    /** 
     * Sphere with polar points.
     */
    geometrySphere () {

    }

    /** 
     * Subdivide a triangle into sub-triangles.
     */
    subdivide ( complex ) {
        var positions = complex.positions
        var cells = complex.cells

        var newCells = []
        var newPositions = []
        var midpoints = {}
        var f = [0, 1, 2]
        var l = 0

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i]
            var c0 = cell[0]
            var c1 = cell[1]
            var c2 = cell[2]
            var v0 = positions[c0]
            var v1 = positions[c1]
            var v2 = positions[c2]

            var a = getMidpoint(v0, v1)
            var b = getMidpoint(v1, v2)
            var c = getMidpoint(v2, v0)

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

            newCells.push([v0i, ai, ci])
            newCells.push([v1i, bi, ai])
            newCells.push([v2i, ci, bi])
            newCells.push([ai, bi, ci])
        }

        return {
            cells: newCells,
            positions: newPositions
        }

        // reuse midpoint vertices between iterations.
        // Otherwise, there'll be duplicate vertices in the final
        // mesh, resulting in sharp edges.
        function getMidpoint(a, b) {
            var point = midpoint(a, b)
            var pointKey = pointToKey(point)
            var cachedPoint = midpoints[pointKey]
            if (cachedPoint) {
              return cachedPoint
            } else {
              return midpoints[pointKey] = point
            }
        }

        function pointToKey(point) {
            return point[0].toPrecision(6) + ','
                 + point[1].toPrecision(6) + ','
                 + point[2].toPrecision(6)
        }

        function midpoint(a, b) {
            return [
                (a[0] + b[0]) / 2
              , (a[1] + b[1]) / 2
              , (a[2] + b[2]) / 2
            ]
        }

    }

    /** 
     * Refined icosohedron.
     * https://github.com/hughsk/icosphere/blob/master/index.js
     * https://github.com/hughsk/vectors
     */
    geometryIcoSphere ( subdivisions ) {

        subdivisions = +subdivisions | 0;

        let t = 0.5 + Math.sqrt(5) / 2;

        let positions = [

            [-1, +t,  0],
            [+1, +t,  0],
            [-1, -t,  0],
            [+1, -t,  0],

            [ 0, -1, +t],
            [ 0, +1, +t],
            [ 0, -1, -t],
            [ 0, +1, -t],

            [+t,  0, -1],
            [+t,  0, +1],
            [-t,  0, -1],
            [-t,  0, +1],

            [0, 11, 5],
            [0, 5, 1],
            [0, 1, 7],
            [0, 7, 10],
            [0, 10, 11]

        ];

        let faces = [
            [1, 5, 9],
            [5, 11, 4],
            [11, 10, 2],
            [10, 7, 6],
            [7, 1, 8],

            [3, 9, 4],
            [3, 4, 2],
            [3, 2, 6],
            [3, 6, 8],
            [3, 8, 9],

            [4, 9, 5],
            [2, 4, 11],
            [6, 2, 10],
            [8, 6, 7],
            [9, 8, 1]

        ];

        let complex = {
            cells: faces, 
            positions: positions
        }

        while (subdivisions-- > 0) {
            complex = this.subdivide(complex)
        }

        positions = complex.positions
  
        for (let i = 0; i < positions.length; i++) {
            normalize(positions[i])
        }

        return complex;


        function normalize(vec) {
            var mag = 0
            for (var n = 0; n < vec.length; n++) {
                mag += vec[n] * vec[n]
            }
            mag = Math.sqrt(mag)

            // avoid dividing by zero
            if (mag === 0) {
                return Array.apply(null, new Array(vec.length)).map(Number.prototype.valueOf, 0)
            }

            for (var n = 0; n < vec.length; n++) {
                vec[n] /= mag
            }

            return vec
        }
        
    }


    /** 
     * Half-sphere, refined icosohedron
     */
    geometryDome () {

    }

    geometryCone () {

    }

    geometryCylinder () {

    }

    geometryPoly () {

    }


    /** 
     * Set a material for a prim.
     * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
     * didn't use chroma (but could)
     * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
     */
    setMaterial ( prim ) {

        prim.material =  {

            u_colorMult:             0,

            u_diffuse:               prim.textures[0],

            u_specular:              [ 1, 1, 1, 1 ],

            u_shininess:             this.util.rand( 500 ),

            u_specularFactor:        this.util.randrand( 1 )

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
    createPrim ( name = 'unknown', scale = 1.0, dimensions, position, acceleration, rotation, angular, textureImage, color, shaderId ) {

        let gl = this.webgl.getContext();

        let glMatrix = this.glMatrix;

        let prim = {};

        prim.id = this.setId();

        prim.name = name;

        prim.scale = scale;

        prim.dimensions = dimensions || glMatrix.vec3.create( 1, 1, 1 );

        prim.position = position || glMatrix.vec3.create( 0, 0, 0 );

        prim.acceleration = acceleration || glMatrix.vec3.create( 0, 0, 0 );

        // The absolute .rotation object includes rotation on x, y, z axis

        prim.rotation = rotation || glMatrix.vec3.create( 0, 0, 0 );

        // The acceleration object indicates velocity on angular motion in x, y, z

        prim.angular = angular || glMatrix.vec3.create( 0, 0, 0 );

        // The orbit defines a center that the object orbits around, and orbital velocity.

        prim.textures = [];

        // Multiple textures per Prim. Rendering defines how textures for each Prim type are used.

        for ( let i = 0; i < textureImage.length; i++ ) {

            this.loadTexture.load( textureImage[ i ], prim );

        }

        // Define Prim material (only one material type at a time per Prim ).

        prim.material = {};

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

        // Assign object to correct buffer, based on rendering.

        prim.renderId = shaderId; // used in Renderer class

        // Prim transforms.

        return prim;

    }

    /** 
     * create a Cube object.
     * @param {String} name of object
     * @param {Number} scale
     */
    createCube ( name, scale, dimensions, position, acceleration, rotation, angular, textureImage, color, shaderId ) {

        let cube = this.createPrim( name, scale, dimensions, position, acceleration, rotation, angular, textureImage, color );

        cube.geometry = this.geometryCube( cube );

        cube.type = this.type.CUBE;

        console.log('vertex itemSize:' + cube.geometry.vertices.itemSize)
        console.log('vertex numItems:' + cube.geometry.vertices.numItems )
        console.log('texture itemSize:' + cube.geometry.texCoords.itemSize)
        console.log('texture numItems:' + cube.geometry.texCoords.numItems)
        console.log('index itemSize' + cube.geometry.indices.itemSize)
        console.log('index numItems:' + cube.geometry.indices.numItems)

        this.objs.push( cube );

        return cube;

    }

    createIcoSphere() {

        //let ico = this.createPrim( name, scale, dimensions, position, acceleration, rotation, angular, textureImage, color, shaderId );

        //let ico = this.geometryIcoSphere( 1 )


    }

}
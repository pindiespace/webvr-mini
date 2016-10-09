export default class prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     */

    constructor ( config ) {

        this.util = config.util;

        this.webgl = config.webgl;

        this.glMatrix = this.webgl.glMatrix;

        this.objs = [];

        this.type = [];

        this.type[ 'PLANE' ] = 'PLANE',

        this.type[ 'CUBE' ] = 'CUBE',

        this.type[ 'SPHERE' ] = 'SPHERE',

        this.type[ 'CONE' ] = 'CONE',

        this.type[ 'CYLINDER' ] = 'CYLINDER';

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
     * Create a cube geometry of a given size (units) centered 
     * on a point.
     */
    createCubeGeometry ( center, size ) {

        let r = size * 0.5;

        let x = center[0];

        let y = center[1];

        let z = center[2];

        let cubeVerts = [];

        let cubeIndices = [];

        // Bottom

        let idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 1, idx + 2 );

        cubeIndices.push( idx, idx + 2, idx + 3 );

        cubeVerts.push( x - r, y - r, z - r, 0.0, 1.0 );

        cubeVerts.push( x + r, y - r, z - r, 1.0, 1.0 );

        cubeVerts.push( x + r, y - r, z + r, 1.0, 0.0 );

        cubeVerts.push( x - r, y - r, z + r, 0.0, 0.0 );

        // Top

        idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 2, idx + 1 );

        cubeIndices.push( idx, idx + 3, idx + 2 );

        cubeVerts.push( x - r, y + r, z - r, 0.0, 0.0 );

        cubeVerts.push( x + r, y + r, z - r, 1.0, 0.0 );

        cubeVerts.push( x + r, y + r, z + r, 1.0, 1.0 );

        cubeVerts.push( x - r, y + r, z + r, 0.0, 1.0 );

        // Left

        idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 2, idx + 1 );

        cubeIndices.push( idx, idx + 3, idx + 2 );

        cubeVerts.push( x - r, y - r, z - r, 0.0, 1.0 );

        cubeVerts.push( x - r, y + r, z - r, 0.0, 0.0 );

        cubeVerts.push( x - r, y + r, z + r, 1.0, 0.0 );

        cubeVerts.push( x - r, y - r, z + r, 1.0, 1.0 );

        // Right

        idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 1, idx + 2 );

        cubeIndices.push( idx, idx + 2, idx + 3 );

        cubeVerts.push( x + r, y - r, z - r, 1.0, 1.0 );

        cubeVerts.push( x + r, y + r, z - r, 1.0, 0.0 );

        cubeVerts.push( x + r, y + r, z + r, 0.0, 0.0 );

        cubeVerts.push( x + r, y - r, z + r, 0.0, 1.0 );

        // Back

        idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 2, idx + 1 );

        cubeIndices.push( idx, idx + 3, idx + 2 );

        cubeVerts.push( x - r, y - r, z - r, 1.0, 1.0 );

        cubeVerts.push( x + r, y - r, z - r, 0.0, 1.0 );

        cubeVerts.push( x + r, y + r, z - r, 0.0, 0.0 );

        cubeVerts.push( x - r, y + r, z - r, 1.0, 0.0 );

        // Front

        idx = cubeVerts.length / 5.0;

        cubeIndices.push( idx, idx + 1, idx + 2 );

        cubeIndices.push( idx, idx + 2, idx + 3 );

        cubeVerts.push( x - r, y - r, z + r, 0.0, 1.0 );

        cubeVerts.push( x + r, y - r, z + r, 1.0, 1.0 );

        cubeVerts.push( x + r, y + r, z + r, 1.0, 0.0 );

        cubeVerts.push( x - r, y + r, z + r, 0.0, 0.0 );

        // Set item size and numItems.

        cubeVerts.itemSize = 3;
        cubeVerts.numItems = cubeVerts.length / 4;

        cubeIndices.itemSize = 1;
        cubeIndices.numItems = cubeIndices.length;

        return {

            size: size,

            position: center,

            vertices: cubeVerts,

            indices: cubeIndices

        }

    }

    /** 
     * create a Cube object.
     */
    createCube ( name = 'unknown', size = 1.0, position, translation, rotation ) {

        this.gl = this.webgl.getContext();

        let cube = this.createCubeGeometry( position, size );

        cube.id = this.setId();

        cube.name = name;

        cube.translation = translation || this.glMatrix.vec3( 0, 0, 0 );

        cube.rotation = rotation || this.glMatrix.vec3( 0, 0, 0 );

        cube.offset = 20;

        cube.type = this.type[ 'CUBE' ];

        this.texture = null;

        this.color = null;

        this.objs.push( cube );

        return cube;

    }

}
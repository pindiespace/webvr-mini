export default class prim {

    /** 
     * Create object primitives.
     */

    constructor ( webgl ) {

        this.webgl = webgl;

        this.glMatrix = webgl.glMatrix;

    }

    /** 
     * set vertex buffer, index buffer.
     */
    setBuffers ( vb, ib ) {

        this.vertices = vb;

        this.indices = ib;

    }

    /** 
     * Create a cube geometry of a given size (units) centered 
     * on a point.
     */
    createCubeGeometry ( center, size ) {

        let cV = this.vertices;

        let cI = this.indices;

        let r = size * 0.5;

        let x = center.x;

        let y = center.y;

        let z = center.z;

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

    }

    /** 
     * create a Cube object.
     */
    createCube ( center, size, name ) {

        let cube = {};

        cube.geometry = createCubeGeometry( center, size );

        return cube;

    }


}
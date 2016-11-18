/* old code we're not using anymore */

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





/*
                if( prim.type === list.CYLINDER ) {

                    x = cosPhi;

                    z = sinPhi;

                    y = cosTheta;

                    //  y = latNumber / latitudeBands; THIS IS THE PROBLEM

                    u = 1 - (longNumber / longitudeBands);

                    v = 1 - (latNumber / latitudeBands);

                } else if ( prim.type === list.SPHERE || prim.type === list.TOPDOME || 

                    prim.type === list.DOME || prim.type === list.SKYDOME ) {

                    x = cosPhi * sinTheta;

                    z = sinPhi * sinTheta;

                    y = cosTheta; // 1.2 *  TODO: TODO: WHY IS THIS CORRECTION NEEDED?????????????????

                    // Texture coords.

                    u = 1 - ( longNumber / longitudeBands );

                    v = 1 - ( latNumber / latitudeBands );

                } else if ( prim.type === list.BOTTOMDOME ) {

                    x = cosPhi * sinTheta;

                    z = sinPhi * sinTheta;

                    y = 1 - cosTheta;

                    // Texture coords.

                    u = longNumber / longitudeBands;

                    v = latNumber / latitudeBands;

                } else if ( prim.type === list.SPINDLE || prim.type === list.CONE || prim.type == list.TOPCONE ) {

                    x = cosPhi * sinTheta;

                    z = sinPhi * sinTheta;

                    y = 1 - ( latNumber / latitudeBands ); //cosTheta;

                    // Texture coords.

                    u = 1 - ( longNumber / longitudeBands );

                    v = 1 - ( latNumber / latitudeBands );

                } else if ( prim.type === list.BOTTOMCONE ) {

                    x = cosPhi * sinTheta;

                    z = sinPhi * sinTheta;

                    y = latNumber / latitudeBands;

                    // Texture coords.

                    u = 1 - ( longNumber / longitudeBands );

                    v = 1 - ( latNumber / latitudeBands );

                }
    */


geometryIcosohedron( prim ) {

        let vec3 = this.glMatrix.vec3;

        let vertices = [];

        let indices = [];

        let normals = [];

        let texCoords = [];

        let tangents = [];

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

        // Normals.

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

        // Tangents.

        this.computeTangents( vertices, indices, normals, tangents, texCoords );

        // Colors.

        //window.vertices = vertices;
        //window.indices = indices;
        ///window.texCoords = texCoords;
        //window.normals = normals;
        //window.colors = colors;

        return this.createBuffers ( vertices, indices, texCoords, normals, tangents, colors );

}


            VertexData.computeSides = function (sideOrientation, positions, indices, normals, uvs) {

            let DEFAULTSIDE = 0;
            let FRONTSIDE = 1;
            let BACKSIDE = 1;
            let DOUBLESIDE = 2;



            var li = indices.length;
            var ln = normals.length;
            var i;
            var n;
            sideOrientation = sideOrientation || DEFAULTSIDE;

            switch (sideOrientation) {
                case FRONTSIDE:
                    // nothing changed
                    break;
                case BACKSIDE:
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
                case DOUBLESIDE:
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
        };





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

    

    geometryIcoSphere ( prim ) {

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






///////////////////////////////////////////////////

        let nbSides = 18;
        let nbHeightSeg = 10; // Not implemented yet

        let nbheightInc = nbHeightSeg; ///////////////////////////////////s
 
        let nbVerticesCap = nbSides + 1;
        let nbTriangles = nbSides + nbSides + nbSides*2;

        let vertices = [];
        let indices = [];
        let normals = [];
        let texCoords = [];
        let tangents = [];
        let colors = [];
        
        let vert = 0, t = 0;
        let _2pi = Math.PI * 2;

        let cos, sin, rad = 0, tri = 0;

        // vertices.

        // Bottom cap

        let d = getVecs('down');

        vertices.push( 0, 0, 0 ); //1st point in cap

        texCoords.push( 0.5, 0.5 ); // 1st point in cap

        for ( vert = 0; vert <= nbSides; vert++ ) {

            rad = vert / nbSides * _2pi;

            vertices.push( Math.cos( rad ) * bottomRadius, 0, Math.sin( rad ) * bottomRadius );

            normals.push( d[0], d[1], d[2] );

            texCoords.push( Math.cos( rad ) * .5 + .5, Math.sin( rad ) * .5 + .5 );

        }


        // Sides

        for ( vert = 0; vert <= nbSides; vert++ ) {

            rad = vert / nbSides * _2pi;
            // TODO: internal cylinder here.

            vertices.push( Math.cos( rad ) * topRadius, height, Math.sin( rad ) * topRadius );

            vertices.push( Math.cos(rad) * bottomRadius, 0, Math.sin( rad ) * bottomRadius );

            cos = Math.cos( rad );

            normals.push( cos, 0, sin );

            sin = Math.sin( rad );

            normals.push( cos, 0, sin );

            t = vert / nbSides;

            texCoords.push( t, 1 );

            texCoords.push( t, 0 )

        }

/*
        let s = nbSides * 2 + 2;

        vertices.push( vertices[s], vertices[s+1], vertices[s+2] );

        normals.push( normals[s], normals[ s+1 ], normals[ s+2 ] );

        s = nbSides * 2 + 3

        vertices.push( vertices[s], vertices[s+1], vertices[s+2] );

        normals.push( normals[s], normals[ s+1 ], normals[ s+2 ] );

        texCoords.push( 1, 1 );

        texCoords.push( 1, 0 );


        // Top cap

        d = getVecs('up');

        vertices.push( 0, height, 0 ); // 1st point in cap.

        texCoords.push( 0.5, 0.5 ); // 1st point in cap.

        for ( vert = 0; vert <= nbSides; vert++ ) {

            rad = vert / nbSides * _2pi;

            vertices.push( Math.cos( rad ) * topRadius, height, Math.sin( rad ) * topRadius );

            normals.push( d[0], d[1], d[2] );

            texCoords.push( Math.cos(rad) * .5 + .5, Math.sin(rad) * .5 + .5 )

        }

*/


/*

        // Indices.
        // Bottom cap

        let tri = 0;

        for ( tri = 0; tri < nbSides; tri++ ) {

            indices.push( 0, tri + 1, tri + 2);

        }


        indices.push( 0, nbSides, 1 );


        // Top cap
        for ( tri = nbSides; tri < nbSides * 2; tri++ ) {

            indices.push( tri + 2, tri + 1, nbVerticesCap );

        }

        indices.push( nbVerticesCap + 1, tri + 1, nbVerticesCap );

        // Sides

        for ( tri = nbSides * 2; tri <= nbTriangles; tri++ ) {

            indices.push( tri + 2, tri + 1, tri + 0 );

            indices.push( tri + 1, tri + 2, tri + 0 );

        }
*/
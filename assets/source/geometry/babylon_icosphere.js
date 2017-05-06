    /** 
     * after BabylonJS
     */
    geometryIcoSphere ( prim ) {

            var sideOrientation = this.DEFAULT_SIDE;
            var radius = 1; /////options.radius || 1;
            var flat = false; ///(options.flat === undefined) ? true : options.flat;
            var subdivisions = 4; ///options.subdivisions || 4;
            var radiusX = radius; //options.radiusX || radius;
            var radiusY = radius; //options.radiusY || radius;
            var radiusZ = radius; //options.radiusZ || radius;

            var vec2 = this.glMatrix.vec2;
            var vec3 = this.glMatrix.vec3;

            // PUT BABYLON FNS HERE FOR START

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
            var positions = [];
            var normals = [];
            let tangents = [];
            var texCoords = [];
            var colors = [];
            var uvs = [];
            var current_indice = 0;
            // prepare array of 3 vector (empty) (to be worked in place, shared for each face)
            var face_vertex_pos = new Array(3);
            var face_vertex_uv = new Array(3);
            var v012;
            for (v012 = 0; v012 < 3; v012++) {
                face_vertex_pos[v012] = [0,0,0];
                face_vertex_uv[v012] = [0,0,0];
            }
            // create all with normals
            for (var face = 0; face < 20; face++) {
                // 3 vertex per face
                for (v012 = 0; v012 < 3; v012++) {
                    // look up vertex 0,1,2 to its index in 0 to 11 (or 23 including alias)
                    var v_id = ico_indices[3 * face + v012];
                    // vertex have 3D position (x,y,z)
                    face_vertex_pos[v012] = vec3.fromValues(ico_vertices[3 * vertices_unalias_id[v_id]], ico_vertices[3 * vertices_unalias_id[v_id] + 1], ico_vertices[3 * vertices_unalias_id[v_id] + 2]);
                    // Normalize to get normal, then scale to radius
                    //////////////////////face_vertex_pos[v012].normalize().scaleInPlace(radius);
                    face_vertex_pos[v012] = vec3.normalize( face_vertex_pos[v012], face_vertex_pos[v012] );
                    face_vertex_pos[v012] = vec3.scale( face_vertex_pos[v012], face_vertex_pos[v012], radius )
                    // uv Coordinates from vertex ID
                    face_vertex_uv[v012] = vec3.fromValues(ico_vertexuv[2 * v_id] * ustep + uoffset + island[face] * island_u_offset, ico_vertexuv[2 * v_id + 1] * vstep + voffset + island[face] * island_v_offset);
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
                    var pos_x0 = [], pos_x1 = [];
                    pos_x0 = vec3.lerp(pos_x0, face_vertex_pos[0], face_vertex_pos[2], i2 / subdivisions);
                    pos_x1 = vec3.lerp(pos_x1, face_vertex_pos[1], face_vertex_pos[2], i2 / subdivisions);
                    var pos_interp = [];
                    pos_interp = (subdivisions === i2) ? 
                        face_vertex_pos[2] : 
                        vec3.lerp(pos_interp, pos_x0, pos_x1, i1 / (subdivisions - i2));


                    //////pos_interp.normalize();
                    pos_interp = vec3.normalize(pos_interp, pos_interp)

                    var vertex_normal;
                    if (flat) {
                        // in flat mode, recalculate normal as face centroid normal
                        var centroid_x0 = [], centroid_x1 = [];
                        centroid_x0 = vec3.lerp(centroid_x0, face_vertex_pos[0], face_vertex_pos[2], c2 / subdivisions);
                        centroid_x1 = vec3.lerp(centroid_x1, face_vertex_pos[1], face_vertex_pos[2], c2 / subdivisions);
                        vertex_normal = vec3.lerp(vertex_normal, centroid_x0, centroid_x1, c1 / (subdivisions - c2));
                    }
                    else {
                        // in smooth mode, recalculate normal from each single vertex position
                        vertex_normal = vec3.create(pos_interp[0], pos_interp[1], pos_interp[2]);
                    }
                    // Vertex normal need correction due to X,Y,Z radius scaling
                    vertex_normal[0] /= radiusX;
                    vertex_normal[1] /= radiusY;
                    vertex_normal[2] /= radiusZ;
                    var uv_x0 = [], uv_x1 = [];
                    vertex_normal = vec3.normalize( vertex_normal, vertex_normal );
                    uv_x0 = vec2.lerp(uv_x0, face_vertex_uv[0], face_vertex_uv[2], i2 / subdivisions);
                    uv_x1 = vec2.lerp(uv_x1, face_vertex_uv[1], face_vertex_uv[2], i2 / subdivisions);
                    ////stopped here
                    var uv_interp = [];
                    uv_interp = (subdivisions === i2) ? face_vertex_uv[2] : vec2.lerp(uv_interp, uv_x0, uv_x1, i1 / (subdivisions - i2));
                    positions.push(pos_interp[0] * radiusX, pos_interp[1] * radiusY, pos_interp[2] * radiusZ);
                    normals.push(vertex_normal[0], vertex_normal[1], vertex_normal[2]);
                    uvs.push(uv_interp[0], uv_interp[1]);
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


            this.computeSides(sideOrientation, positions, indices, normals, uvs);

            vertices = positions;

            texCoords = uvs;

            // Result

            return this.createBuffers ( vertices, indices, texCoords, normals, colors );



    }
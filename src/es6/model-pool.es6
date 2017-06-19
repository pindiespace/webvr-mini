import AssetPool from './asset-pool';

'use strict'

class ModelPool extends AssetPool {

    /** 
     * @class
     * Load model files for custom geometry.
     * Geometry prebuilt
     * http://paulbourke.net/geometry/roundcube/
     * NOTE: GeometryPool adds its geometry objects to this pool, doesn't have its own!
     *
     * @constructor
     * @param {Boolean} init if true, initialize immediately.
     * @param {Util} util reference to utility methods.
     * @param {WebGL} webgl reference to WebGL object.
     * @param {TexturePool} texture loader and asset pool.
     * @param {MaterialPool} material loader and asset pool.
     * @param {PrimFactory} the Prim creation and ''
     */
    constructor ( init, util, webgl, texturePool, materialPool ) {

        console.log( 'in ModelPool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.texturePool = texturePool,

        this.materialPool = materialPool,

        this.modelMimeTypes = {

            'obj': 'text/plain',

            'mtl': 'text/plain',

            'html': 'text/html',      // A-Frame?

            'x3d': 'model/x3d+xml',   // X3DOM

            'x3dv': 'model/x3d-vrml'  // VRML

        };

        if ( init ) {

            // Create and store a default Model.

           this.defaultKey = this.addAsset( this.default() ).key;

        }

    }

    /** 
     * Create the default ModelPool object.
     * @param {glMatrix.vec3[]} vertices flattened vertex array.
     * @param {Array} indices index array.
     * @param {glMatrix.vec2[]} texCoords texture coordinates (2D).
     * @param {glMatrix.vec3[]} normals normals array.
     * @param {Array[Number]} objects a list of starts in the index array for new sub-objects.
     * @param {Array[Number]} groups a list of starts in the index array for new groups.
     * @param {Array[Number]} smoothingGroups a list of starts in the index array for smoothing groups.
     * @param {Array[Number]} materials a list of starts for materials in the index array.
     */
    default ( vertices = [], indices = [], texCoords = [], normals = [], objects = [], 

        groups = [], smoothingGroups = [], materials = [], matStarts = [] ) {

        return {

            vertices: vertices,

            indices: indices,

            texCoords: texCoords,

            normals: normals,

            tangents: [],  // not supplied by OBJ file format

            // References to sub-regions in the obj file, number = position in vertices.

            options : {

                objects: objects, 

                groups: groups, 

                smoothingGroups: smoothingGroups, 

                materials: materials,

                matStarts: matStarts

            }

        }

    }

    /** 
     * Extract 3d vertex data (vertices, normals) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     * @param {Number} numReturned number of values to returned. In some 
     * OBJ files, 3 numbers are written for 2d texture.
     */
    computeObj3d ( data, arr ) {

        // TODO: replace with .split() and .parseFloat()????

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        if ( vs ) {

                arr.push( parseFloat( vs[ 1 ] ), parseFloat( vs[ 3 ] ), parseFloat( vs[ 5 ] ) );

                //////////////////////console.log("PUSHED:" + vs[ 1 ] + ',' + vs[ 3 ] + ',' + vs[ 5 ] )

            return true;

        }

        return false;

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string. For some routines, 
     * use the 'return' while others do not.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     */
    computeObj2d ( data, arr ) {

        let uvs = data.match( /^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/ );

        if ( uvs ) {

            arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 3 ] ) );

            return true;

        } else { // check if 2d texture written in 3d(!)

            let uv2 = [];

            if ( this.computeObj3d( data, uv2 ) ) {

                arr.push( uv2[ 0 ], uv2[ 1 ] );  // only copy the first 2 coordinates          

                return true;

            }

        }

        return false;

    }

    /** 
     * Compute index, with fallback for missing index.
     * @param {Number} num the number to test.
     * @returns {Number} the number, or an error number (-1).
     */
    computeFaceIndex ( num ) {

        if ( ! Number.isFinite( num ) ) {

            console.warn("WEIRD NUM:" + num)

            return this.NOT_IN_STRING;

        }

        return num;

    }

    /** 
     * Compute triangles for Quads wrapped in Blender quad format (actually 
     * a triangle strip).
     * @link https://stackoverflow.com/questions/23723993/converting-quadriladerals-in-an-obj-file-into-triangles
     */
    computeBlenderTris ( idxs ) {



/*
n = 0;
triangles[n++] = [values[0], values[1], values[2]];
for(i = 3; i < count(values); ++i)
  triangles[n++] = [
    values[i - 3],
    values[i - 1],
    values[i]
  ];

f A B C D E F

Becomes the following triangles

A B C
A C D
B D E
C E F

            */
    }

    /** 
     * Compute triangles for Quads and higher polygons (all triangles share the 1st position).
     * Use when the number of faces on a line is > 3 (usually a quad).
     * @param {Array} idxs an array of single numbers, representing start positions in another Array.
     * @returns {Array} an Array, augmented with additional positions converting polygons to a set of triangles.
     */
    computeFaceFan ( idxs ) {

        if ( idxs.length ) {

            let nIdxs = [];

            // For quad, this gives 0, 1, 2, 0, 2, 3.
            for ( let i = 1; i < idxs.length - 1; i++ ) {

                nIdxs.push( idxs[ 0 ], idxs[ i ], idxs[ i + 1 ] );

            }

            return nIdxs;

        }

        return idxs;

    }

    /** 
     * Convert the faces xx/xx/xx listing in OBJ files to vertex, texCoord, normal positions in 
     * the other arrays loaded by the OBJ file.
     * f 20/30/22 --> faces[ i ] = [ 20, 30, 22 ]
     * If the face is NOT a triangle, convert higher-order polygon to a set of triangles.
     *
     * @param {String} data the data for an individual face.
     * @param {Array} the face array to append the data to.
     */
    computeObjFaces ( data, faces, lineNum ) {

        let parts = data.match( /[^\s]+/g );

        let NOT_IN_STRING = this.NOT_IN_LIST;

        let idxs, iVert, iTexCoord, iNormal, iVerts = [], iTexCoords = [], iNormals = [];

        // Each map should refer to one point.

        parts.map( ( fs ) => {

            //console.log("fs:" + fs)

            // Split indices, normals and texture coordinates if they are present.

            if ( fs.indexOf( '//' ) !== NOT_IN_STRING ) { // normals, no texture coordinates

                idxs = fs.split( '//' );

                iVerts.push( parseFloat( idxs[ 0 ] ) - 1 );

                iTexCoords.push( null );

                iNormals.push( parseFloat( idxs[ 1 ] ) - 1 );

            } else if ( fs.indexOf ( '/' ) !== NOT_IN_STRING ) { // texCoords present

                idxs = fs.split( '/' );

                iVerts.push( parseFloat( idxs[ 0 ] ) - 1 );

                if ( idxs.length == 2 ) { // texCoords present

                    iTexCoords.push( parseFloat( idxs[ 1 ] ) - 1 );

                    iNormals.push( null );

                } else if ( idxs.length === 3 ) { // both texCoords and normals present

                    iTexCoords.push( parseFloat( idxs[ 1 ] ) - 1 );

                    iNormals.push( parseFloat( idxs[ 2 ] ) - 1 );

                } 

            } else { // Has indices only

                iVerts.push( parseFloat( fs ) - 1 ); 

            }

        } );

        // Now, convert quads and higher polygons to a set of triangles.

        iVerts = this.computeFaceFan( iVerts );

        iTexCoords = this.computeFaceFan( iTexCoords );

        iNormals = this.computeFaceFan( iNormals );

        // Append to faces array.

        for ( let i = 0; i < iVerts.length; i++ ) {

             faces.push( [ iVerts[ i ], iTexCoords[ i ], iNormals[ i ] ] );

        }

    }


    doObjFaces ( data, faces, lineNum ) {

        let parts = data.match( /[^\s]+/g );

        let NOT_IN_STRING = this.NOT_IN_LIST;

        let idxs, iVert, iTexCoord, iNormal, iVerts = [], iTexCoords = [], iNormals = [];

        // Each map should refer to one point.

        parts.map( ( fs ) => {

            ///////////////////console.log("fs:" + fs)

            // Split indices, normals and texture coordinates if they are present.

            if ( fs.indexOf( '//' ) !== NOT_IN_STRING ) { // normals, no texture coordinates

                idxs = fs.split( '//' );

                iVerts.push( parseFloat( idxs[ 0 ] ) - 1 );

                iTexCoords.push( null );

                iNormals.push( parseFloat( idxs[ 1 ] ) - 1 );

            } else if ( fs.indexOf ( '/' ) !== NOT_IN_STRING ) { // texCoords present

                idxs = fs.split( '/' );

                iVerts.push( parseFloat( idxs[ 0 ] ) - 1 );

                if ( idxs.length == 2 ) { // texCoords present

                    iTexCoords.push( parseFloat( idxs[ 1 ] ) - 1 );

                    iNormals.push( null );

                } else if ( idxs.length === 3 ) { // both texCoords and normals present

                    iTexCoords.push( parseFloat( idxs[ 1 ] ) - 1 );

                    iNormals.push( parseFloat( idxs[ 2 ] ) - 1 );

                } 

            } else { // Has indices only

                iVerts.push( parseFloat( fs ) - 1 ); 

            }

        } );

        // Now, convert quads and higher polygons to a set of triangles.

        iVerts = this.computeFaceFan( iVerts );

        iTexCoords = this.computeFaceFan( iTexCoords );

        iNormals = this.computeFaceFan( iNormals );

        ////////////////console.log("iVerts:" + iVerts + " iTexCoords:" + iTexCoords + " iNormals:" + iNormals)

        // Append to faces array.

        let f = { data: data, indices: [] };

        for ( let i = 0; i < iVerts.length; i++ ) {

            f.indices.push( [ iVerts[ i ], iTexCoords[ i ], iNormals[ i ] ] );

        }

        //console.log("F.indices is:" + f.indices[ f.indices.length - 1])

        faces.push( f );

    }

    /** 
     * Parse the obj file into flattened object data, with starts defined 
     * for materials.
     */
    doObjMesh ( data, prim, path ) {

        let m = this.default();

        let lineNum = 0,

        lines = data.split( '\n' ),

        matStarts = [];

        let dir = this.util.getFilePath( path );

        let matName = this.materialPool.createDefaultName( prim.name );

        let currGeo = { material: matName, faces: [] };

        let iHash = []; // associative lookup table for faces (vertices, indices, texCoords);

        let lastType = '#';

        //matStarts.push( currGeo );

        let faces = [], vertices = [], indices = [], texCoords = [], normals = [];

        lines.forEach( ( line ) => {

            // First value in string.

            let type = line.split( ' ' )[ 0 ].trim();

            // All other values as a string.

            let data = line.substr( type.length ).trim();

            if ( data !== '' ) {

                switch ( type ) {

                    // put in default material

                    case 'f': // line of faces, indices, convert polygons to triangles

                        /* 
                         * If we encounter a new block of faces, add a matStart.
                         * Whitespace and un-processed types don't change the lastType
                         */

                        if ( lastType !== type ) {

                            matStarts.push( currGeo );

                        }

                        // Get the faces

                        this.doObjFaces ( data, currGeo.faces, lineNum );

                        lastType = type; // store previous type.

                        break;

                    case 'v': // vertices

                        this.computeObj3d( data, vertices, lineNum );

                        lastType = type; // store previous type.

                        break;

                    case 'vn': // normals

                        this.computeObj3d( data, normals, lineNum );

                        lastType = type; // store previous type.

                        break;

                    case 'vt': // texture uvs

                        if ( ! this.computeObj2d( data, texCoords ) ) {

                            //console.warn( '3D texture encountered:'+ data );

                            this.computeObj3d( data, texCoords );

                        }

                        lastType = type; // store previous type.

                        break;

                        case 'mtllib': // materials library data

                        // Multiple files may be specified here, and each file may have multiple materials.

                        let mtls = data.split( ' ' );

                        for ( let i = 0; i < mtls.length; i++ ) {

                            let path = dir + this.util.getFileName( mtls[ i ] );

                            console.log( 'ADDING LIBRARY:' + mtls[ i ])

                            this.materialPool.getMaterial( prim, path, true, { pos: i } );

                        }

                        lastType = type; // store previous type.

                        break;

                    case 'usemtl': // use material (by name, loaded as .mtl file elsewhere)

                        // material name === filename without extension.

                        matName = this.util.getFileName ( data );

                        currGeo = { material: matName, faces: [] };

                        matStarts.push( currGeo );

                        lastType = type; // store previous type.

                        break;

                    case 'o': // object names

                        break;

                    case 's': // smoothing groups

                        break;

                    case 'g': // group name

                        break;

                    case '#': // comments are ignored

                        break;

                    case 'maplib': // poorly documented
                    case 'usemap': // ditto
                    case 'vp': // parameter vertices
                    case 'p': // point
                    case 'l': // line
                    case 'curv': // 2d curve
                    case 'surf': //surface
                    case 'parm': // parameter values
                    case 'trim': // outer trimming loop
                    case 'hole': // inner trimming loop
                    case 'scrv': //special curve
                    case 'sp': // special point
                    case 'end': // end statment
                    case 'con': // connectivity between free-form surfaces
                    case 'mg': // merging group
                    case 'bevel': // bevel interpolation
                    case 'c_interp': // color interpolation
                    case 'd_interp': // dissolve interpolation
                    case 'lod': // level of detail
                    case 'shadow_obj': // shadow casting
                    case 'trace_obj': // ray tracing
                    case 'ctech': // curve approximation
                    case 'stech': // surface approximation
                    case '': // no parameter

                        console.warn( 'ModelPool::computeObjMesh(): OBJ data type: ' + type + ' in .obj file not supported' );

                        break;

                    default:

                        // If it's not a pure whitespace line, report.

                        if( ! this.util.isWhitespace( data ) ) {

                            console.error( 'ModelPool::computeObjMesh(): unknown line data: ' + line + ' in .obj file at line:' + lineNum );

                        }

                        break;

                }

            }

        } ); // end of foreach

        // Second pass.

        // Brute force load

        let tVertices = [], tIndices = [], tTexCoords = [], tNormals = [];

        let startArr = [];

        let idx = 0;

        let hashCount = 0; /////////////////////////////

        for ( let i = 0; i < matStarts.length; i++ ) {

            let mat = matStarts[ i ];

            let tIndicesPos;

            if ( tIndices.length === 0 ) {

                tIndicesPos = 0;

            } else {

                tIndicesPos = ( ( tIndices[ idx - 1 ] * 4) + 4 );

            }

            //////////////////startArr.push( [ mat.material, 4 * tVertices.length / 3, 0 ] ); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TIMES 4/ 3
            //console.log('vertices calc:' + 4 * tVertices.length / 3 );
            //console.log('tIndices[' + idx + '] = ' + tIndicesPos );
            startArr.push( [ mat.material, tIndicesPos, 0 ] ); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TIMES 4/ 3

            ////console.log('DOOOBJ:material:' + mat.material ); // one material block

            let matFaces = mat.faces;

            for ( let j = 0; j < matFaces.length; j++ ) {

                let mf = matFaces[ j ];

                let faceIndices = mf.indices;

                // Save in a hash table.

                let fIdx = mf.indices;

                for ( let k = 0; k < fIdx.length; k++ ) {

                    let fi = fIdx[ k ]; // indices for that face

                    let key = fi[ 0 ] + '_' + fi[ 1 ] + '_' + fi[ 2 ];

                    //if ( iHash[ key ] === undefined ) {

                        let flat = 0;

                        if ( Number.isFinite( fi[ 0 ] ) ) {

                            tIndices.push( idx ); // current position in index array

                            iHash[ key ] = idx;

                            idx++;

                            flat = fi[ 0 ] * 3;

                            tVertices.push( vertices[ flat ], vertices[ flat + 1 ], vertices[ flat + 2 ] );

                        }

                        if ( Number.isFinite( fi[ 1 ] ) ) {

                            flat = fi[ 1 ] * 2;

                            tTexCoords.push( texCoords[ flat ], texCoords[ flat + 1 ] );

                        }

                        if ( Number.isFinite( fi[ 2 ] ) ) {

                            flat = fi[ 2 ] * 3;

                            tNormals.push( normals[ flat ], normals[ flat + 1 ], normals[ flat + 2 ] );

                        }

                    //} else {

                        // Use the hash index.

                    //    tIndices.push( iHash[ key ] );

                    //}

                } // faceIndices loop

                ////////////////////console.log("HASHCOUNT WAS: " + hashCount)

                // set Indices

            } // matFaces loop

        } // matStarts loop

        // Third pass.

        for ( let i = 1; i < startArr.length; i++ ) {

            startArr[ i - 1 ][ 2 ] = ( startArr[ i ][ 1 ] - startArr[ i - 1 ][ 1 ] ) / 4; // !!!!!!!!!!!!!!!!!!!!!!!!!!DIVIDED BY 4
            ////////////////////////////////startArr[ i - 1 ][ 2 ] = ( startArr[ i ][ 1 ] - startArr[ i - 1 ][ 1 ] );

        }

        startArr[ startArr.length - 1 ][ 2 ] = ( ( 4 * tVertices.length / 3 ) - startArr[ startArr.length - 1 ][ 1 ] ) / 4; // !!!!!!!!!!!!!!!!!!!!!!!! 4/3, divided by 4
        //////////////////////////////startArr[ startArr.length - 1 ][ 2 ] = ( ( tVertices.length ) - startArr[ startArr.length - 1 ][ 1 ] );

        m.options.matStarts = startArr;

        m.vertices = tVertices,

        m.indices = tIndices,

        m.texCoords = tTexCoords,

        m.normals = tNormals;

        ////////////////////////////////////

        window.vs = vertices;

        window.ts = texCoords;

        window.ns = normals;

        window.ms = matStarts;

        window.mm = m; ////////////////////////////////////////////////////

        window.iHash = iHash;


        return m;

    }

    /** 
     * Parse the .obj file into flattened object data
     * @link http://paulbourke.net/dataformats/obj/
     * 
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file. MTL files may reference other files in their directory.
     */
    computeObjMesh ( data, prim, path ) {

        //////console.log( 'ModelPool::computeObjMesh(): loading a new file:' + path + ' for ' + prim.name );

        let m = this.default();

        let isWhitespace = this.util.isWhitespace,

        vertices = m.vertices,

        indices = m.indices,

        texCoords = m.texCoords,

        normals = m.normals,

        objMtl = this.util.DEFAULT_KEY,

        objects = m.options.objects, 

        groups = m.options.groups, 

        smoothingGroups = m.options.smoothingGroups, 

        materials = m.options.materials,

        matStarts = m.options.matStarts,

        // temp arrays needed to flatten OBJ multi-index format to WebGL format.

        tIndices = [],

        tVertices = [],

        tNormals = [],

        tTexCoords = [],

        iIndices = [],

        iTexCoords = [],

        iNormals = [],

        iHash = [], // associative lookup table for faces (vertices, indices, texCoords);

        faces = [];

        let dir = this.util.getFilePath( path );

        let matName = this.materialPool.createDefaultName( prim.name );

        // Get the lines of the file.

        let lineNum = 0,

        lines = data.split( '\n' ),

        lastType = this.NOT_IN_STRING;

        // Start the loop through the OBJ file.

        lines.forEach( ( line ) => {

            // First value in string.

            let type = line.split( ' ' )[ 0 ].trim();

            // All other values as a string.

            let data = line.substr( type.length ).trim();

            // If there's no data, don't process.

            if ( data !== '' ) {

                switch ( type ) {

                    case 'o': // object name (could be several in file)

                        if ( ! prim.name ) {

                            prim.name = data;

                        }

                        objects.push( [ data, faces.length ] ); // start position in final flattened array

                        ///////////////////console.log('>objects[' + data + '] = ' + faces.length)
                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'g': // group name, store hierarchy

                        groups.push ( [ data, faces.length ] ); // starting position in final flattened array

                        ///////////////////////console.log('>groups[' + data + '] = ' + faces.length );
                        lastType = type; // use to catch smoothing groups

                        break;

                    case 's': // smoothing group (related to 'g') applies to next line.

                        /* 
                         * TODO: we would need to process lines[ lineNum ] into just the vertices positions here.
                         * TODO: need to store the smoothing groups, then...
                         * Scan completed files for vertex groups.
                         * NOTE: since we are already taking a group of faces, we're just tagging these sets of 
                         * vertices as being smoothed in a specific way. So. smoothing group starts and finishes 
                         * for the final array should be sufficient.
                         *
                         * Our format for a group is: smoothingGroups[ i ][ name, start, length ]
                         */

                        smoothingGroups.push( [ data + 's' ] );

                        //////////////////////////////console.log('>smoothingGroup:' + gKey + ' at:' + lineNum + 1 );
                        lastType = type; // use to catch smoothing groups
                        break;

                    case 'v': // vertices

                        this.computeObj3d( data, tVertices );

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'f': // line of faces, indices, convert polygons to triangles

                        // If our previous line was a smoothing group, add the start.

                        let sg, oldLen;

                        if ( lastType === 's' ) {

                            sg = smoothingGroups[ smoothingGroups.length - 1 ];

                            oldLen = faces.length;

                            sg.push( oldLen );

                        }

                        // Get the faces

                        this.computeObjFaces( data, faces, lineNum );

                        // If our previous line was a smoothing group, add the length.

                        if ( lastType === 's' ) {

                            sg.push( faces.length - oldLen );

                        }

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'vn': // normals

                        this.computeObj3d( data, tNormals );

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'vt': // texture uvs

                        if ( ! this.computeObj2d( data, tTexCoords ) ) {

                            //console.warn( '3D texture encountered:'+ data );

                            this.computeObj3d( data, tTexCoords );

                        }

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'mtllib': // materials library data

                        // Multiple files may be specified here, and each file may have multiple materials.

                        let mtls = data.split( ' ' );

                        for ( let i = 0; i < mtls.length; i++ ) {

                            let path = dir + this.util.getFileName( mtls[ i ] );

                            this.materialPool.getMaterial( prim, path, true, { pos: i } );

                        }

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'usemtl': // use material (by name, loaded as .mtl file elsewhere)

                        // matStarts records where to start in the index (faces) array.

                        matName = this.util.getFileName ( data );

                        matStarts.push( [ matName, faces.length * 4, 0 ] ); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TIMES 4/ 3

                        // TODO: GREAT BINARY FORMAT MODEL
                        // TODO: https://n-e-r-v-o-u-s.com/blog/?p=2738

                        lastType = type; // use to catch smoothing groups

                        break;

                    case '#': // comments are ignored

                        break;

                    case 'maplib': // poorly documented
                    case 'usemap': // ditto
                    case 'vp': // parameter vertices
                    case 'p': // point
                    case 'l': // line
                    case 'curv': // 2d curve
                    case 'surf': //surface
                    case 'parm': // parameter values
                    case 'trim': // outer trimming loop
                    case 'hole': // inner trimming loop
                    case 'scrv': //special curve
                    case 'sp': // special point
                    case 'end': // end statment
                    case 'con': // connectivity between free-form surfaces
                    case 'mg': // merging group
                    case 'bevel': // bevel interpolation
                    case 'c_interp': // color interpolation
                    case 'd_interp': // dissolve interpolation
                    case 'lod': // level of detail
                    case 'shadow_obj': // shadow casting
                    case 'trace_obj': // ray tracing
                    case 'ctech': // curve approximation
                    case 'stech': // surface approximation
                    case '': // no parameter

                        console.warn( 'ModelPool::computeObjMesh(): OBJ data type: ' + type + ' in .obj file not supported' );

                        break;

                    default:

                        // If it's not a pure whitespace line, report.

                        if( ! isWhitespace( data ) ) {

                            console.error( 'ModelPool::computeObjMesh(): unknown line data: ' + line + ' in .obj file at line:' + lineNum );

                        }

                        break;

                } // end of switch

            } // end of data !== ''

            lineNum++;

        } );

        // Rewrite indices to fold texCoords and normals under the same index as the vertices (needed for WebGL).

        if ( faces.length ) {

            let nIndices = [], nVertices = [], nTexCoords = [], nNormals = [], nMatStarts = [], nSmoothingGroups = [];

            for ( let i = 0; i < faces.length; i++ ) {

                // i is the index in the faces array.

                let f = faces[ i ];

                // Construct a hash key for this face.

                let key = f[ 0 ] + '_' + f[ 1 ] + '_' + f[ 2 ]; // point key (vertex, index, normals)

                let vIdx, iIdx;

                // Hash lookup.

                if ( iHash[ key ] !== undefined ) {

                    // Push the existing, revised value for the face key.

                    vIdx = f[ 0 ] // old face index within OBJ file.

                    iIdx = iHash[ key ] //REDUNDANT

                     nIndices.push( iHash[ key ] );

                } else {

                    vIdx = f[ 0 ]; // old face index within OBJ file

                    iIdx = parseInt( nVertices.length / 3 ); // new face index in the new arrays

                    let tIdx, nIdx;

                    // Push the new Index.

                    nIndices.push( iIdx );

                    // Save the new index under the hash key

                    iHash[ key ] = iIdx;

                    // Push the flattened vertex, texCoord, normal values.

                    vIdx *= 3;

                    // Push vertices.

                    nVertices.push( tVertices[ vIdx ], tVertices[ vIdx + 1 ], tVertices[ vIdx + 2 ] );

                    // Push texture coords.

                    if ( f[ 1 ] !== null && f[ 1 ] !== undefined ) { 

                        tIdx = f[ 1 ] * 2;

                        if ( isFinite( tTexCoords[ tIdx ] ) && isFinite( tTexCoords[ tIdx + 1 ] ) ) {

                           nTexCoords.push( tTexCoords[ tIdx ], tTexCoords[ tIdx + 1 ] );

                           // consle.log("HAS A VALID TEXTURE")

                        } else {

                            console.error( 'ModelPool::computeObjMesh(): bad texCoords in file: at' + tIdx + '  face (' + f + ')' );

                        }

                    } else {

                        //console.error( 'ModelPool::computeObjMesh(): undefined texture coord, face:' + f );
                        // TODO: for toilet, we need to do this.
                        // TODO: for other files, this zaps the coordinate file.
                        // TODO: need to handle the case where the texCoords are only defined for PART of the overall object!!!!!!!
                        // TODO: geometry could scan for invalid coords, and fill in
                        nTexCoords.push( 0, 0 );  // uncomment to get toilet.obj to work
                    }

                    // Push normals.

                    if ( f[ 2 ] !== null && f[ 2 ] !== undefined ) { 

                        nIdx = f[ 2 ] * 3;

                        if ( isFinite( tNormals[ nIdx ] ) && isFinite( tNormals[ nIdx + 1 ] && isFinite( tNormals[ nIdx + 2 ] ) ) ) {

                            nNormals.push( tNormals[ nIdx ], tNormals[ nIdx + 1 ], tNormals[ nIdx + 2 ] );

                        } else {

                            console.error( 'ModelPool::computeObjMesh(): bad normals in file at' + nIdx + ' face (' + f + ')' );

                        }

                    } // else, don't write anything, GeometryPool will compute

                    // TODO: need to handle case where normals are only defined for PART of the overall object!!!!
                    // Geometry could scan for invalid numbers, and fill in.

                } // end of re-index a new face

            } // end of for loop

            // Should be the same.

            if ( nVertices.length > this.webgl.MAX_DRAWELEMENTS) {

                console.error( 'ModelPool::computeObjMesh(): size of prim ' + prim.name + ' (' + nVertices.length + ') exceeds max buffer:' + this.webgl.MAX_DRAWELEMENTS );

            }

            // Replace raw vertex, index, texCoord, normal data with face-adjusted data.

            tVertices = nVertices,

            tIndices = nIndices,

            tTexCoords = nTexCoords,

            tNormals = nNormals;

        } else {

            console.error( 'ModelPool::computeObjMesh(): no faces data in file!' );

            return m; // return an empty object

        }

        // If there were no materials, create a default one. This can happen for an .OBJ file without any .mtl files associated.

        if ( matStarts.length === 0 ) {

            m.options.matStarts.push( [ this.materialPool.createDefaultName( prim.name ), 0, tIndices.length ] );

        }

        // Compute matStarts length

        for ( let i = 1; i < m.options.matStarts.length; i++ ) {

            //if ( m.options.matStarts[ i - 1][ 1 ] < 0 ) m.options.matStarts[ i - 1 ][ 1 ] = 0; /////////////////////////////

            m.options.matStarts[ i - 1 ][ 2 ] = ( m.options.matStarts[ i ][ 1 ] - m.options.matStarts[ i - 1 ][ 1 ] ) / 4;

        }

        m.options.matStarts[ m.options.matStarts.length - 1 ][ 2 ] = ( tIndices.length - ( m.options.matStarts[ m.options.matStarts.length - 1 ][ 1 ] / 4 ) );

        // TODO: do this for objects, groups, smoothinggroups.

        // If there was no faces in the OBJ file, use the raw data.

        m.options.matStarts = matStarts;

        m.vertices = tVertices,

        m.indices = tIndices,

        m.texCoords = tTexCoords,

        m.normals = tNormals;

        window.m = m;

        // NOTE: Color arrays and tangents are not part of the Wavefront .obj format (in .mtl data).

        return m;

    }

    /** 
     * Add a model
     * @param {Prim} prim the requesting Prim object.
     * @param {Object} data data to construct the Prim GeometryBuffer.
     * @param {String} path the file path to the object.
     * @param {Number} pos the index of the object in the calling Prim's array.
     * @param {String} mimeType the MIME type of the file.
     * @param {String} type the GeometryPool.typeList type of the object, e.g. MESH, SPHERE...
     */
    addModel ( prim, data, path, pos, mimeType, type ) {

        //let d;

        if ( pos === undefined ) {

            console.error( 'ModelPool::addModel(): undefined pos' );

            return null;

        }

        let fType = this.util.getFileExtension( path );

        let d = null,

        emitEvent = '';

        switch ( fType ) {

            case 'obj':

                // Return a Model object.

                d = this.computeObjMesh( data, prim, path ); // ADDS LOTS OF STUFF TO 'd'

                //d = this.doObjMesh( data, prim, path );

                // Not supplied by OBJ format.

                d.tangents = [];

                d.colors = [];

                emitEvent = this.util.emitter.events.OBJ_GEOMETRY_READY;

                break;

            case 'html': // A-Frame?

                break;

            case 'x3d': // X3DOM

                break;

            case 'x3dv': // VRML

                break;

            default:

                console.warn( 'ModelPool::addModel(): unknown model file:' + path + ' MIME type:' + mimeType );

                break;

        }


        /* 
         * We save references to the model object in ModelPool.
         * NOTE: .addAsset() puts the assigned key by ModelPool into our object.
         */

        if ( d ) {

            d.type = type,

            d.path = path,

            d.emits = emitEvent;

            /*
             * Model format which must be returned by Mesh or procedural geometry creation.
             * {
             *   vertices: vertices,
             *   indices: indices,
             *   texCoords: texCoords,
             *   normals: normals,
             *   options: options (start points for objects, groups, smoothingGroups, etc),
             *   type: type,
             *   path: file path
             * }
            */

        } else {

             console.warn( 'ModelPool::addModel(): no model returned by addModel() + ' + mimeType + ' function' );

        }

        return this.addAsset( d );

    }

    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {String} path the URL to load.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getModel ( prim, path, cacheBust = true, options = { pos: 0 } ) {

        // Check if model is already in asset pool, use it if it is. Define by PATH.

        let modelObj = this.pathInList( path );

        if ( modelObj !== null ) {

            // Use a pool texture if available. Generally won't be ready within a Prim, but useful for Prims sharing textures.

            console.log( 'TexturePool::getTexture(): found texture ' + path + ' in pool, using it...' );

            this.util.emitter.emit( modelObj.emits, prim, modelObj.key, options ); 

            return;

        }

        // Could have an empty path.

        if ( ! this.util.isWhitespace( path ) ) {

            // Get the file mimeType.

            let mimeType = this.modelMimeTypes[ this.util.getFileExtension( path ) ];

            /////console.log("--------OBJ file doRequest model for:" + prim.name + ' path:' + path)

            // check if mimeType is OK.

            if( mimeType ) {

                this.doRequest( path, options.pos, 

                    ( updateObj ) => {

                        /* 
                         * updateObj returned from GetAssets has the following structure:
                         * { 
                         *   pos: pos, 
                         *   path: requestURL, 
                         *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                         *   error: false|response 
                         * } 
                         */

                        ////////console.log( 'ModelPool::getModel(): OBJ file:' + path + ' returned model for:' + prim.name );

                        // load a Model file.

                        if ( updateObj.data ) {

                            let modelObj = this.addModel( prim, updateObj.data, updateObj.path, mimeType, prim.type );

                            if ( modelObj ) {

                                /* 
                                 * XX_GEOMETRY_READY event, with additional data referencing sub-groups of the model.
                                 * NOTE: options (e.g. starts of groups, materials, smoothing groups) are attached to modelObj.
                                 * NOTE: we recover the modelObj by its key in PrimFactory.
                                 * See this.addModel() above for more information.
                                 */

                                this.util.emitter.emit( modelObj.emits, prim, modelObj.key, options ); ///////////TODO: COMPARE TO PROCEDUAR GEO EMIT

                            } else {

                                console.error( 'ModelPool::getModel(): OBJ file:' + path + ' could not be parsed' );

                            }

                        } else {

                            console.error( 'ModelPool::getModel(): OBJ file, no data found for:' + updateObj.path );

                        }

                    }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

            } else {

                console.error( 'ModelPool::getModel(): file type "' + this.util.getFileExtension( path ) + '" in:' + path + ' not supported, not loading' );

            }

        } else {

                console.warn( 'ModelPool::getModel(): no path supplied for prim:' + prim.name );

        } // end of valid path

    }

}

export default ModelPool;
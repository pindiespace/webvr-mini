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

            'gltf': 'text/tgltf',

            'gltfBinary': 'bin/gltf',

            'hyg': 'text/plain',

            'png': 'image/png' // heightmap

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

        // temp arrays needed to flatten OBJ multi-index format to WebGL format, so don't append directly to default() Model.

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

                        lastType = type; // use to catch smoothing groups

                        break;

                    case 'g': // group name, store hierarchy

                        groups.push ( [ data, faces.length ] ); // starting position in final flattened array

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

                        matStarts.push( [ matName, faces.length * 4, 0 ] ); // multiply times 4/3

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

        /* 
         * Second phase.
         *
         *  Rewrite indices to fold texCoords and normals under a single index, which is 
         * the same as the vertices (needed for WebGL).
         */

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

                        } else {

                            console.error( 'ModelPool::computeObjMesh(): bad texCoords in file: at' + tIdx + '  face (' + f + ')' );

                        }

                    } else {

                        /* 
                         * In a complex OBJ file, groups or objects may have 
                         * normals or texture coordinates, while others may lack them.
                         * Uncomment below while debugging automated texture coordinate assignment.
                         */

                        //nTexCoords.push( 0, 0 );

                        //console.log("INVALID teXCOorD at position:" + i + " 0:" + tTexCoords[ tIdx] + " 1:" + tTexCoords[ tIdx + 1])

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

                } // end of re-index a new face

            } // end of for loop

            // Should be the same.

            if ( nVertices.length > this.webgl.MAX_DRAWELEMENTS) {

                console.error( 'ModelPool::computeObjMesh(): size of prim ' + prim.name + ' (' + nVertices.length + ') exceeds max buffer:' + this.webgl.MAX_DRAWELEMENTS );

            }

            // Make sure we returned enough normals, if they were defined.

            if ( nNormals.length > 0 &&

                nNormals.length !== nVertices.length ) {

                console.warn( 'ModelPool::computeObjMesh(): not enough normals returned, zeroing out!' );

                nNormals = [];

            }

            /*
             * Make sure we returned enough texCoords, if they were defined.
             * If not, compute manually in GeometryPool.
             * TODO: useing spherical texCoord calc, get alternate working!
             */

            if ( nTexCoords.length > 0 &&

                nTexCoords.length !== ( 2 * nVertices.length / 3 ) ) {

                console.warn( 'ModelPool::computeObjMesh(): not enough texCoords returned, zeroing out!' );

                nTexCoords = [];

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

            m.options.matStarts[ i - 1 ][ 2 ] = ( m.options.matStarts[ i ][ 1 ] - m.options.matStarts[ i - 1 ][ 1 ] ) / 4;

        }

        m.options.matStarts[ m.options.matStarts.length - 1 ][ 2 ] = ( tIndices.length - ( m.options.matStarts[ m.options.matStarts.length - 1 ][ 1 ] / 4 ) );

        // If there was no faces in the OBJ file, use the raw data.

        m.options.matStarts = matStarts;

        m.vertices = tVertices,

        m.indices = tIndices,

        m.texCoords = tTexCoords,

        m.normals = tNormals;

        // NOTE: Color arrays and tangents are not part of the Wavefront .obj format.

        return m;

    }

    /** 
     * Decode a simple GlTF file. We only support one scene, with multiple objects. Objects only suppot features 
     * implemented in this program (e.g. no rigging). 
     * Reference: THREE glTF shader, starting about line 850.
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file.
     */
    computeGlTFMesh ( data, prim, path ) {

        let m = this.default();

        m.data = JSON.parse( data );

        // TODO: study the recursion. See how often you can have scene in scene, etc.

        for ( let i in m.data ) {

            switch ( i ) {

                case 'scene':

                    break;

                case 'scenes':

                    break;

                case 'nodes':

                    break;

            }

        }

        return m;

    }


    /** 
     * Compute a mesh encoded in GlTF format.
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file. MTL files may reference other files in their directory.
     */
    computeGlTFBinaryMesh ( data, prim, path ) {

        let m = this.default();

        return m;

    }

    /**
     * Compute a starmap based on the Hyg database, encoded as a JSON file. From the HYG database, with 
     * some fields removed.
     * Database
     * @link https://github.com/astronexus/HYG-Database
     *
     * Lookup for some missing star names (get their hipparcos ID)
     * @link http://simbad.u-strasbg.fr/simbad/sim-fid
     *
     * CSV to JSON converter:
     * @link http://www.convertcsv.com/csv-to-json.htm
     *
     * Nebulae and galaxies
     * @link https://github.com/astronexus/HYG-Database/blob/master/dso.csv
     *
     * Building a Planetarium
     * @link https://medium.com/@LeapMotion/planetarium-3675b0eedbc2
     * 
     * Check our map against projection of night sky
     * @link https://in-the-sky.org/skymap.php
     * 
     * Find our Hyg stars by their HIP number
     * @link http://www.magnitudo.org/stars/#
     * 
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file. MTL files may reference other files in their directory.
     * @param {Object} options additional data for using specific fields in the HYG data.
     */
    computeHyg ( data, prim, path, options ) {

        let m = this.default();

        let dimensions = prim.dimensions;

        let stars = JSON.parse( data );

        let tVertices = [], tIndices = [], tNormals = [], tTexCoords = [], tColors = [];

        let objects = m.options.objects; // data for each Star (original JSON array)

        let iIdx = 0;

        /* 
         * ADDITIONAL PARAMETERS
         * Use the colorIndex instead of spectral type colors. Otherwise, 
         * use preceived colors accd. to spectral type.
         */

        let useColorIndex = false; /////////////////////////////////////////////////////////////////////////////
        let properNamesOnly = true; ///////////////////////////////////////////////////////////////////////////

        for ( let i = 0; i < stars.length; i++ ) {

            let star = stars[ i ];

            // NOTE: xyz option (3d starfield instead of stardome) doesn't plot Stars beyond webgl clipping.

            if ( options.useXYZ === true ) {

                if ( star.dist < this.webgl.far ) {

                    tVertices.push( 

                        parseFloat( star.x ),

                        parseFloat( star.y ),

                        parseFloat( star.z )

                    );

                    // Normals, indices, texture coordinates.

                    tNormals.push( 0, 0, 0 );

                    tIndices.push( iIdx++ );

                    tTexCoords.push( 0, 1 );

                }

            } else {

                // Not a straight UVToCartesian, ra = 0-24 hours, dec = 0-360 degrees.

                let A = this.util.degToRad( parseFloat( star.ra ) * 15 );

                let B = this.util.degToRad( parseFloat( star.dec ) );

                /*
                 * The map is reversed, relative to our coordinate system.
                 *
                 * 1. Rotate z to 90 degrees to put the Polaris overhead, with y axis rotating around North pole at zeinth.
                 * 2. Rotate -x to  change latitude, i.e., push down from pole to equator. User initially faces Polaris.
                 * 3. Rotate -y to move the skydome with respect to hours of day ( y === 0 is midnight ).
                 *
                 */

                tVertices.push( 

                    Math.sin( B ), // z

                    Math.cos( B ) * Math.cos( A ), // x

                    Math.cos( B ) * Math.sin( A ), // y

                );

                tNormals.push( 0, 0, 0 ); // no normals

                tIndices.push( iIdx++ );

                tTexCoords.push( 0, 1 ); // no texture

            }

            /* 
             * We compute magnitude by scaling Sirius (brightest star) from -1.44 to 1.0
             * and assume a cutoff magnitude of +8.5
             * @link https://lco.global/spacebook/what-apparent-magnitude/
             */

            let mag = 1.0 - ( ( parseFloat( star.mag ) + 1.44 ) / 8.5 );

            //////////////console.log( 'RAWMAG:' + ( parseFloat( star.mag ) + 1.44 ) +  ' MAG:' + mag)

            /* 
             * rather than using the color index, we use the start spectral type, 
             * which is closer to the real visual display. The first leter of the 
             * spectral type is the class, which we use to set the color.
             */

            let rgb, clr;

            let spect = star.spect[ 0 ]; // first letter of spectral type

            if ( spect && ! useColorIndex ) {

                spect = spect.toLowerCase();

                switch( spect ) {

                    case 'o':

                        clr = '9bb0ff';

                        break;

                    case 'b':

                        clr = 'aabfff';

                        break;

                    case 'a':

                        clr = 'aabfff';

                        break;

                    case 'f':

                        clr = 'fbf8ff';

                        break;

                    case 'g':

                        clr = 'fff4e8';

                        break;

                    case 'k':

                        clr = 'ffddb4';

                        break;

                    case 'm':

                        clr = 'ff806f'; // made slightly redder

                        break;

                    default: 

                        clr = '#FFFFFF';

                        break;

                }

                    // Brightness

                    rgb = this.util.hexToRGB( clr, 255 );

                    rgb.r *= mag, rgb.g *= mag, rgb.b *= mag;

            } else {

                // No stellar type, use colorIndex instead.

                clr = parseFloat( star.ci ) || 0;

                clr *= mag;

                rgb = { r: mag + clr, g: mag, b: mag - clr }

            }

            // Colorize certain stars forming useful constellations

//////////////////////////////////////////////

            if ( 

                star.proper === 'Betelgeuse' || star.proper === 'Rigel' || 
                star.proper === 'Bellatrix' || star.proper === 'Saiph' || 
                star.proper === 'Alnitak' || star.proper === 'Alnilam' || star.proper === 'Mintaka' 

                ||

                star.proper === 'Alkaid' || star.proper === 'Mizar' || star.proper === 'Alioth' || 
                star.proper === 'Mergrez' || star.proper === 'Phad' || star.proper === 'Merak' || star.proper === 'Dubhe'

                ||

                star.proper === 'Polaris' || star.proper === 'kochab' || star.hip === '75097' || star.hip === '79822' || 
                star.hip === '77055' || star.hip === '82080' || star.hip === '85822'

                ||

                star.proper === 'Caph' || star.proper === 'Shedir' || star.proper === 'Cih' || star.proper === 'Ruchbah' || star.id === '8867'


                ) tColors.push( 0, 1, 0, 1 )

            else tColors.push( rgb.r, rgb.b, rgb.b, 1 );

////////////////////////////////////////////////

            // Save the Star data in the Objects array, conditionally only named Stars.

            if ( properNamesOnly ) {

                if ( star.proper.length > 0 ) {

                    objects.push( [ star, tVertices.length ] );

                }

            } else {

                objects.push( [ star, tVertices.length ] ); // start position for each Star final flattened array

            }




        } // end of loop through Stars

        // Set the geolocation flag so we can rotate just before the Prim is added to the Shader.

        prim.geolocate = true;

        // Push the (single) Material start and length for this kind of Prim.

        m.options.matStarts.push( [ this.materialPool.createDefaultName( prim.name ), 0, tIndices.length ] );

        m.vertices = tVertices,

        m.indices = tIndices,

        m.texCoords = tTexCoords,

        m.normals = tNormals,
 
        m.colors = tColors;      // use the color array

        return m;

    }

    /** 
     * TODO: get to pixels of image BLOB data.
     */
    computeHeightMap ( data, prim, path, options ) {

        // Heightmaps don't provide vertices, indices, since they may need to be fitted to a Prim surface by interpolation.

        let m = this.default();

        m.options = options;

        let w = data.width; // becomes x axis

        let d = data.height; // becomes z axis

        let c = document.createElement( 'canvas' );

        let ctx = c.getContext( '2d' );

        /* 
         * Canvas can do bilinear scaling, so rescale the heightMap data to the size of the Prim x and z divisions.
         */

        let xScale = prim.divisions[ 0 ] / w;

        let zScale = prim.divisions[ 2 ] / d;

        ctx.scale( xScale, zScale );

        // Load the image and get the heightmap data.

        ctx.drawImage( data, 0, 0 );

        let imgData = ctx.getImageData( 0, 0, w, d );

        let dta = imgData.data;

        let j = 0;

        let pixels = new Float32Array( w * d );

        let maxHeight = 0;

        let minHeight = 0;

        let avHeight = 0;

        // Compress rgba to one byte, and store Map statistics.

        for ( let i = 0; i < dta.length; i += 4 ) {

            pixels[ j ] = ( dta[ i ] + dta[ i + 1 ] + dta[ i + 2 ] ) / 3;

            maxHeight = Math.max( maxHeight, pixels[ j ] );

            minHeight = Math.min( minHeight, pixels[ j ] );

            avHeight += pixels[ j ];

            j++;

        }

        // Force clearing.

        c = ctx = null;

        // Adjust object. No attempt to compute vertices, indices, etc.

        let squareSize = Math.max( w, d );

        m.options.map = {

            pixels: pixels,

            w: w, // x axis

            d: d, // z axis

            squareSize: squareSize,

            max: squareSize - 1,

            maxHeight: maxHeight,

            minHeight: minHeight,

            avHeight: avHeight / pixels.length

        };

        return m;

    }

    /** 
     * Add model, handling cases where results come back slowly or async.
     * @param {Prim} prim the requesting Prim object.
     * @param {Object} data data to construct the Prim GeometryBuffer.
     * @param {String} path the file path to the object.
     * @param {Number} pos the index of the object in the calling Prim's array.
     * @param {String} mimeType the MIME type of the file.
     * @param {String} type the GeometryPool.typeList type of the object, e.g. MESH, SPHERE...
     */
    addModel ( prim, data, path, mimeType, options ) {

        let fType = this.util.getFileExtension( path );

        let that = this; // save for promise

        let d = null;

        return new Promise( ( resolve, reject ) => {

            /*
             * Model format which must be returned by Mesh or procedural geometry creation.
             * {
             *   vertices: vertices,
             *   indices: indices,
             *   texCoords: texCoords,
             *   normals: normals,
             *   options: options (start points for objects within Model, groups, smoothingGroups, etc),
             *   type: type,
             *   path: file path
             * }
             */

            switch ( fType ) {

                case 'obj':

                    // Return a Model object.

                    d = this.computeObjMesh( data, prim, path ); // ADDS LOTS OF STUFF TO 'd'

                    if ( d ) {

                        // Add stuff Not supplied by OBJ format to complete Geometry.

                        d.tangents = [];

                        d.colors = [];

                        d.type = prim.type,

                        d.path = path,

                        d.emits = this.util.emitter.events.OBJ_GEOMETRY_READY;



                        resolve( this.addAsset( d ) );

                    } else {

                        reject( Error( 'ModelPool::addModel(): Failed to load OBJ format file at path:' + path ) );

                    }

                    break;

                case 'gltf':

                    d = this.computeGlTFMesh( data, prim, path );

                    if ( d ) {

                        d.type = prim.type,

                        d.path = path,

                        d.emits = this.util.emitter.events.GLTF_GEOMETRY_READY;

                        resolve( this.addAsset( d ) );

                    }

                    reject( Error( 'ModelPool::addModel(): GLTF parser not ready yet' ) );

                    break;

                case 'gltfbinary':

                    d = this.computeGlTFBinaryMesh( data, prim, path );

                    if ( d ) {

                        d.type = prim.type,

                        d.path = path,

                        d.emits = this.util.emitter.events.GLTF_GEOMETRY_READY;

                        resolve( this.addAsset( d ) );

                    }

                    reject( Error( 'ModelPool::addModel(): GLTF Binary parser not ready yet') );

                    break;

                case 'hyg':

                    prim.drawTris = false,

                    prim.drawLines = false,

                    prim.drawPoints = true;

                    /* 
                     * OPTIONS.xyz is assigned by GeometryPool as true for 
                     * typeList.STAR3D, false for typeList.STARDOME. HYG data contains 
                     * both spherical (RA and Dec) coordinates, as well as Cartesian coords.
                     */

                    d = this.computeHyg( data, prim, path, options );

                    if ( d ) {

                        d.type = prim.type,

                        d.path = path,

                        d.emits = this.util.emitter.events.OBJ_GEOMETRY_READY;

                        resolve( this.addAsset( d ) );

                    } else {

                        reject( Error( 'ModelPool::addModel(): Failed to load HYG format file at path:' + path ) );

                    }

                    break;

                case 'png':

                    // Extract image data async.

                    let img = new Image();

                    img.src = URL.createObjectURL( data );

                    img.onload = () => { // NOTE: we send resolved image rather than Image BLOB data

                        d = this.computeHeightMap( img, prim, path, options );

                        if ( d ) {

                            d.type = prim.type,

                            d.path = path,

                            d.emits = this.util.emitter.events.HEIGHTMAP_GEOMETRY_READY;

                            // TODO: 

                            resolve( this.addAsset( d ) );

                        } else {

                            reject( Error( 'ModelPool::addModel(): invalid image size for path:' + path ) );

                        }

                    }

                    img.onerror = () => {

                        reject( Error( 'ModelPool::addModel(): Bad Heightmap image file at path:' + path ) );

                    }

                    break;

                default:

                    reject( 'ModelPool::addModel(): File format not found for path:' + path );

                    break;

            } // end of switch

        } ); // end of Promise

    } // end of function


    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {String} path the URL to load.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getModel ( prim, path, cacheBust = true, options = { pos: 0 } ) {

        // Check if model is already in asset pool, use it if it is. Define unique models by their PATH.

        let modelObj = this.pathInList( path );

        if ( modelObj !== null ) {

            this.util.emitter.emit( modelObj.emits, prim, modelObj.key, options ); 

            return;

        }

        // Could have an empty path.

        if ( ! this.util.isWhitespace( path ) ) {

            // Get the file mimeType.

            let mimeType = this.modelMimeTypes[ this.util.getFileExtension( path ) ];

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

                        // load a Model file. the 'options' may contain special instructions for computing model data differently (e.g. stardome vs 3d stars).

                        if ( updateObj.data ) {

                            ///////////////let modelObj = this.addModel( prim, updateObj.data, updateObj.path, mimeType, options );

                            /////////////////////////

                            ///////////////////////console.log("?????update object for:" + prim.name )

                            this.addModel( prim, updateObj.data, updateObj.path, mimeType, options ).then( ( modelObj ) => {

                                /////////////////////////console.log("????????????modelObj " + modelObj + " for PRIM:" + prim.name )

                                if ( modelObj !== typeof Error ) {

                                    this.util.emitter.emit( modelObj.emits, prim, modelObj.key, options ); ///////////TODO: COMPARE TO PROCEDUAR GEO EMIT

                                } else {

                                    console.error( 'ModelPool::addModel(): Promise returned ' + modelObj + ' for Prim:' + prim.name );

                                }

                            } ).catch( ( err ) => {

                                window.err = err;

                                ////////////////////////console.log("???????????????????NO DICE:" + err + " for prim:" + prim.name )

                            } ); // end of Promise;

                            ////////////////////////

/////////                            if ( modelObj ) {

                                /* 
                                 * XX_GEOMETRY_READY event, with additional data referencing sub-groups of the model.
                                 * NOTE: options (e.g. starts of groups, materials, smoothing groups) are attached to modelObj.
                                 * NOTE: we recover the modelObj by its key in PrimFactory.
                                 * See this.addModel() above for more information.
                                 */

///////////                                this.util.emitter.emit( modelObj.emits, prim, modelObj.key, options ); ///////////TODO: COMPARE TO PROCEDUAR GEO EMIT


//////////                            } else {

/////////////                                console.error( 'ModelPool::getModel():' + + this.util.getFileExtension( path ) + ' file path:' + path + ' could not be parsed' );

////////////                            }

                        } else {

                            console.error( 'ModelPool::getModel(): ' + this.util.getFileExtension( path ) + ' file, no data found for:' + updateObj.path );

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
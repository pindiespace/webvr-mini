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
    default ( vertices = [], indices = [], texCoords = [], normals = [], objects = [ 0 ], 

        groups = [ 0 ], smoothingGroups = [ 0 ], materials = [] ) {

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

                materials: materials

            }

        }

    }

    /** 
     * Extract 3d vertex data (vertices, normals) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     * @param {Number} lineNum the current line in the file.
     * @param {Number} numReturned number of values to returned. In some 
     *                 OBJ files, 3 numbers are written for 2d texture.
     */
    computeObj3d ( data, arr, lineNum, numReturned = 3 ) {

        // TODO: replace with .split() and .parseFloat()????

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        if ( vs ) {

            if ( numReturned === 3 ) {

                arr.push( parseFloat( vs[ 1 ] ), parseFloat( vs[ 3 ] ), parseFloat( vs[ 5 ] ) );

            } else if ( numReturned === 2 ) {

                arr.push( parseFloat( vs[ 1 ] ), parseFloat( vs[ 3 ] ) );

            }

            return true;

        }

        return false;

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string. For some routines, 
     * use the 'return' while others do not.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     * @param {Number} lineNum the current line in the file.
     */
    computeObj2d ( data, arr, lineNum ) {

        let uvs = data.match( /^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/ );

        if ( uvs ) {

            arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 2 ] ) );

            return true;

        }

        return false;

    }

    /** 
     * Convert indices > 3 indices for a face to a triangle fan ( all triangles share the first vertex). 
     * Use when the number of indices on a line evaluates to > 3. In-place conversion. 
     * @param {Array} indices the string of indices to be evaluated. Just the 'fan' region.
     * @param {Array} texCoords array for vertex texture coordinates.
     * @param {Array} normals array for vertex normals.
     * @returns {Array} Array with extra indices.
     */
    computeFan ( arr ) {

        if ( arr.length ) {

            let nArr = [];

            for ( let i = 1; i < arr.length - 1; i++ ) {

                nArr.push( arr[ 0 ], arr[ i ], arr[ i + 1 ] );

            }

            return nArr;

        }

        return arr;

    }

    /** 
     * Extract index data from a string. At present, indexing of vertices, 
     * texture coordinates, normals is assumed to be the same, so only one 
     * index array is constructed.
     * @param {String} data string to be parsed for indices (integer).
     * @param {Array} indices array for indices into vertex array.
     * @param {Array} lineNum array for vertices (optional).
     * @param {Array} texCoords array for texture coordinates (optional).
     * @param {Array} normals array for normals coordinates (optional).
     */
    computeObjIndices ( data, indices, lineNum, texCoords = [], normals = [] ) {

        let parts = data.match( /[^\s]+/g );

        let idxs, idx, texCoord, normal;

        let NOT_IN_STRING = this.NOT_IN_LIST;

        let iHashIndices = [],

        iIndices = [],

        iTexCoords = [],

        iNormals = [];

        // Each map should refer to one point.

        parts.map( ( fs ) => {

            //console.log("fs:" + fs)

            // Split indices with and without normals and texture coordinates.
            // NOTE: need to RE-MAP TEXCOORDS AND NORMALS!!!!!

            if ( fs.indexOf( '//' ) !== NOT_IN_STRING ) { // No texture coordinates

                idxs = fs.split( '//' );

                idx = parseInt( idxs[ 0 ] ) - 1; // NOTE: OBJ first index = 1, our arrays index = 0

                normal = parseInt( idxs[ 1 ] ) - 1;

            } else if ( fs.indexOf ( '/' ) !== NOT_IN_STRING ) {

                idxs = fs.split( '/' );

                idx = parseInt( idxs[ 0 ] ) - 1;

                texCoord = parseFloat( idxs[ 1 ] ) - 1;

                normal = parseFloat( idxs[ 2 ] ) - 1;

                ////console.log(idx, texCoord, normal)

            } else { // Has indices only

                idx = parseInt( fs ) - 1; 

            }


            //console.log(' iIndices:' + idx + ' texCoord:' + texCoord + ' normal:' + normal)

            // push indices, conditionally push texture coordinates and normals.

            if ( Number.isFinite( idx ) ) iIndices.push( idx );

            if ( Number.isFinite( texCoord ) ) texCoords.push( texCoord );

            if ( Number.isFinite( texCoord ) ) iTexCoords.push( texCoord ); /// NEW!!!!!!!!!!!!!!!!!!  

            if ( Number.isFinite( normal ) ) normals.push( normal );

            if ( Number.isFinite( normal ) ) iNormals.push( normal ); ///// NEW!!!!!!!!!!!!!!!!!

        } );

        /* 
         * If we have more than 3 indices (face is NOT a triangle), 
         * manually create triangle fan, since we only use GL_TRIANGLES in Shader rendering.
         */

        if ( iIndices.length > 3 ) {

            iIndices = this.computeFan( iIndices );

            iTexCoords = this.computeFan( iTexCoords );

            iNormals = this.computeFan( iNormals );

        }

        // TODO: have to do the same for the normals and texCoords

        /* 
         * Re-work texture and normal coordinates
         * https://github.com/frenchtoast747/webgl-obj-loader/blob/master/webgl-obj-loader.js
         * https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/OBJLoader.js
         * http://k3d.ivank.net/?p=download
         * http://stackoverflow.com/questions/27231685/obj-file-loader-with-different-indices
         * Before you can process it in OpenGL you must expand the data in the .obj file. For each unique tuple of 
         * attributes introduce a new vertex with a new index and replace indexed attributes from the .obj with the indexed vertex OpenGL requires.
         * http://programminglinuxgames.blogspot.com/2010/03/wavefront-obj-file-format-opengl-vertex.html
         * If there are two vertices with the same position, but different normal, then they are different vertices! 
         * Wavefront OBJ files are a misnormer because they call positions "vertices" (they are not, they are just positions) 
         * and the face records index into "vertex" and "vertex normal" records (the proper names for the records would be 
         * "position record" and "normal record"). – datenwolf Sep 22 '16 at 6:54
         * verts = [vec3f, vec3f, ...]
         * norms = [vec3f, vec3f, ...]
         * uvs = [vec2f, vec2f, ...]
         * verts = [(vec3f, vec3f, vec2f), (vec3f, vec3f, vec2f), ...]
         */



        /* 
         * Concat without disturbing our array references (unlike Array.concat).
         * @link https://davidwalsh.name/merge-arrays-javascript
         */

        Array.prototype.push.apply( indices, iIndices );

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

        console.log( 'ModelPool::computeObjMesh(): loading a new file:' + path + ' for ' + prim.name );

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

        materials = m.options.materials;

        let dir = this.util.getFilePath( path );

        // Get the lines of the file.

        let lineNum = 0;

        let lines = data.split( '\n' );

        let iTexCoords = [];

        let iNormals = [];

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

                        objects[ data ] = indices.length; // start position in final flattened array

                        break;

                    case 'v': // vertices

                        this.computeObj3d( data, vertices, lineNum );

                        break;

                    case 'f': // face, indices, convert polygons to triangles

                        this.computeObjIndices( data, indices, lineNum, iTexCoords, iNormals );

                        break;

                    case 'vn': // normals

                        this.computeObj3d( data, normals, lineNum );

                        break;

                    case 'vt': // texture uvs

                        if ( ! this.computeObj2d( data, texCoords, lineNum ) ) {

                            console.warn( '3D texture encountered:'+ data );

                            this.computeObj3d( data, texCoords, lineNum, 2 );

                        }

                        break;

                    case 'mtllib': // materials library data

                        // Multiple files may be specified here, and each file may have multiple materials.

                        let mtls = data.split( ' ' );

                        for ( let i = 0; i < mtls.length; i++ ) {

                            this.materialPool.getMaterials( prim, [ dir + data ], true );

                        }

                        break;

                    case 'usemtl': // use material (by name, loaded as .mtl file elsewhere)

                        //////////////console.log("::::::::::::GOTTA USEMTL in OBJ file: " + data + ' at:' + indices.length );

                        if ( ! materials[ data ] ) {

                            materials[ data ] = [];

                        }

                        materials[ data ].push( indices.length );

                        break;


                    case 'g': // group name, store hierarchy

                        groups[ data ] = indices.length; // starting position in final flattened array

                        break;

                    case 's': // smoothing group (related to 'g')

                        smoothingGroups[ data ] = indices.length; // starting position in final flattened array

                        // @link https://people.cs.clemson.edu/~dhouse/courses/405/docs/brief-obj-file-format.html

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


        // NOTE: Colors and tangents are not part of the Wavefront .obj format

        //////////console.log("ModelPool::computeObjMesh(): v:" + (vertices.length /3) + " i:" + (indices.length /3 )+ " t:" + (texCoords.length /2) + " n:" + (normals.length /3))

        // Model object format.

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

                d = this.computeObjMesh( data, prim, path );

                // Not supplied by OBJ format.

                d.tangents = [];

                d.colors = [];

                emitEvent = this.util.emitter.events.GEOMETRY_READY;

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

             console.warn( 'TexturePool::addTexture(): no texture returned by createTexture() + ' + mimeType + ' function' );

        }

        return this.addAsset( d );

    }

    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {Array[String]} pathList a list of URL paths to load, or keys referencing our pool.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getModels ( prim, pathList, cacheBust = true ) {

        // Wrap single strings in an Array.

        if ( this.util.isString( pathList ) ) {

            pathList = [ pathList ];

        }

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            // Could have an empty path.

            if ( ! this.util.isWhitespace( path ) ) {

                // See if the 'path' is actually a key for our ModelPool.

                let poolModel = this.pathInList( path );

                if ( poolModel ) {

                    prim.models.push( poolModel ); // just reference an existing texture in this pool.

                } else {

                    // Get the image mimeType.

                    let mimeType = this.modelMimeTypes[ this.util.getFileExtension( path ) ];

                    // check if mimeType is OK.

                    if( mimeType ) {

                        this.doRequest( path, i, 

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

                                // load a Model file. Only the first object in the file will be read.

                                if ( updateObj.data ) {

                                    let modelObj = this.addModel( prim, updateObj.data, updateObj.path, updateObj.pos, mimeType, prim.type );

                                    if ( modelObj ) {

                                        /* 
                                         * GEOMETRY_READY event, with additional data referencing sub-groups of the model.
                                         * NOTE: options (e.g. starts of groups, materials, smoothing groups) are attached to modelObj.
                                         * NOTE: we recover the modelObj by its key in PrimFactory.
                                         * See this.addModel() above for more information.
                                         */

                                        this.util.emitter.emit( modelObj.emits, prim, modelObj.key, modelObj.pos );

                                    } else {

                                        console.error( 'TexturePool::getModels(): file:' + path + ' could not be parsed' );

                                    }

                                } else {

                                    console.error( 'ModelPool::getModels(): no data found for:' + updateObj.path );

                                }

                            }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                    } else {

                        console.error( 'ModelPool::getModels(): file type "' + this.util.getFileExtension( path ) + '" in:' + path + ' not supported, not loading' );

                    }

                }

            } else {

                console.warn( 'ModelPool::getModels(): no path supplied for position ' + i );

            } // end of valid path

        } // end of for loop

    }

}

export default ModelPool;
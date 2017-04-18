import AssetPool from './asset-pool';

'use strict'

class ModelPool extends AssetPool {
	

	constructor ( init, util, webgl ) {

		console.log( 'in ModelPool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.NOT_IN_LIST = this.util.NOT_IN_LIST;

        this.modelMimeTypes = {

            'obj': 'text/plain',

            'mtl': 'text/plain',

            'html': 'text/html',      // A-Frame?

            'x3d': 'model/x3d+xml',   // X3DOM

            'x3dv': 'model/x3d-vrml'  // VRML

        };

        // If we encounter a texture file in the model file, load it, and emit.    

        this.util.emitter.on( this.util.emitter.events.TEXTURE_READY, 

        	( prim ) => {

            	// TODO: call update function when texture is ready.

        } );

        // Model data ready.
/*
        this.util.emitter.on( this.util.emitter.events.GEOMETRY_READY, 

            ( prim ) => {

                // TODO: call update function when a geometry is ready.

        } );
*/
        this.util.emitter.on( this.util.emitter.events.MATERIAL_READY, 

            ( prim ) => {

                // TODO: call update function when a material file is ready.

                // TODO: probably need a material pool file loader

        } );

        if ( init ) {

            // do something

        }

	}

    /** 
     * Extract 3d vertex data (vertices, normals) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     * @param {Number} lineNum the current line in the file.
     */
    computeObj3d ( data, arr, lineNum ) {

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        arr.push( parseFloat( vs[ 1 ] ), parseFloat( vs[ 3 ] ), parseFloat( vs[ 5 ] ) );

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     * @param {Number} lineNum the current line in the file.
     */
    computeObj2d ( data, arr, lineNum ) {

        let uvs = data.match( /^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/ );
        
        arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 3 ] ) );

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

        let face = parts.map( ( fs ) => {

            ///console.log("fs:" + fs)

            // Split indices with and without normals and texture coordinates.

            if ( fs.indexOf( '//' ) !== NOT_IN_STRING ) {

                idxs = fs.split( '//' );

                idx = parseInt( idxs[ 0 ] ) - 1; // NOTE: OBJ first index = 1, our arrays index = 0

                texCoord = 0.0; // NO TEXTURE COORDINATES PROVIDED

                normal = parseInt( idxs[ 1 ] ) - 1;

                ///console.log( '//:' + idx, texCoord, normal );

            } else if ( fs.indexOf ( '/' ) !== NOT_IN_STRING ) {

                idxs = fs.split( '/')

                idx = parseInt( idxs[ 0 ] ) - 1;

                texCoord = parseFloat( idx[ 1 ] ) - 1;

                normal = parseFloat( idx[ 2 ] ) - 1;

                ////console.log( '/:', idx, texCoord, normal );

            } else {

                console.error( 'ModelPool()::computeObjIndices(): illegal index object index statement at line:' + lineNum );

                return false;

            }

            indices.push( idx );

            texCoords.push ( texCoord );

            normals.push( normal );

        } );

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

        let isWhitespace = this.util.isWhitespace;

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        // Get the lines of the file.

        let lineNum = 0;

        let lines = data.split( '\n' );

        let iTexCords = [];

        let iNormals = [];

        lines.forEach( ( line ) => {

            //line = line.trim();

            let type = line.split( ' ' )[ 0 ].trim();

            let data = line.substr( type.length ).trim();

            switch ( type ) {

                case 'o': // object name

                    if ( ! prim.name ) {

                        prim.name = data;

                    }

                    break;

                case 'g': // group name, store hierarchy

                    if ( ! prim.group ) {

                        prim.group = [];

                    }

                    prim.group[ data ] = lineNum;

                    break;

                case 'v': // vertices

                    this.computeObj3d( data, vertices, lineNum );

                    break;

                case 'f': // face, indices

                    this.computeObjIndices( data, indices, lineNum, iTexCords, iNormals );

                    break;

                case 'vn': // normals

                    this.computeObj3d( data, normals, lineNum );

                    break;

                case 'vt': // texture uvs

                    this.computeObj2d( data, texCoords, lineNum );

                    break;

                case 's': // smoothing group (related to 'g')

                    if ( ! prim.smoothingGroup ) {

                        prim.smoothingGroup = [];

                    }

                    if ( data )

                    break;

                case '#': // comment

                    break;

                case 'mtllib': // materials library data

                    // TODO: Load material file data.

                    break;

                case 'usemtl': // use material

                     console.log("::::::::::::GOTTA USEMTL in OBJ file: " + data[ 1 ] )

                    break;

                case 'g': // group name (collection of vertices forming face)

                    // TODO: assign faces (sides in our internal language).

                    // @link https://people.cs.clemson.edu/~dhouse/courses/405/docs/brief-obj-file-format.html

                    break;               

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

                case 's': // smoothing group
                case 'mg': // merging group
                case 'bevel': // bevel interpolation
                case 'c_interp': // color interpolation
                case 'd_interp': // dissolve interpolation
                case 'lod': // level of detail
                case 'shadow_obj': // shadow casting
                case 'trace_obj': // ray tracing
                case 'ctech': // curve approximation
                case 'stech': // surface approximation
                case 'mtllib': // materials library data

                    console.warn( 'ModelPool::computeObjMesh(): OBJ data type: ' + type + ' in .obj file not supported' );

                    break;

                default:

                    // If it's not a pure whitespace line, report.

                    if( ! isWhitespace( data ) ) {

                        console.error( 'ModelPool::computeObjMesh(): unknown line data: ' + line + ' in .obj file at line:' + lineNum );

                    }

                    break;

            }

            lineNum++;

        } );


        // NOTE: Colors and tangents are not part of the Wavefront .obj format

        console.log("ModelPool::computeObjMesh(): v:" + (vertices.length /3) + " i:" + (indices.length /3 )+ " t:" + (texCoords.length /2) + " n:" + (normals.length /3))

        return {

            vertices: vertices,

            indices: indices,

            texCoords: texCoords,

            normals: normals

        }

    }

    /** 
     * Compute material properties for a model.
     * Similar to:
     * @link https://github.com/tiansijie/ObjLoader/blob/master/src/objLoader.js
     * 
     * Reference:
     * @link http://paulbourke.net/dataformats/mtl/
     * 
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file. MTL files may reference other files in their directory.
     */
    computeObjMaterials ( data, prim, path ) {

        console.log( 'ModelPool::computeObjMaterials(): loading model:' + path + ' for:' + prim.name );

        let lineNum = 0;

        let material = {};

        let lines = data.split( '\n' );

        lines.forEach( ( line ) => {

            line = line.trim();

            let data = line.split( ' ' );

            let type = data[ 0 ];

             switch ( type ) {

                case 'newmtl': // name of material.

                    material.name = data[ 1 ];

                    break;

                case 'Ka': // ambient

                    if ( data.length < 3 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in ambient material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.ambient = [ data[ 1 ], data[ 2 ], data[ 3 ] ];  

                        } else {

                            console.error( 'ModelPool::computerObjMaterials(): invalid ambient data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Kd': // diffuse

                    if ( data.length < 3 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in diffuse material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.diffuse = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'ModelPool::computeObjMaterials(): invalid diffuse array at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ks': // specular

                    if ( data.length < 3 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in specular array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.specular = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'ModelPool::computeObjMaterials(): invalid specular array at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ns': // specular exponent

                    if ( data.length < 1 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in specular exponent array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.specularFactor = data[ 1 ];    

                        } else {

                            console.error( 'ModelPool::computeObjMaterials(): invalid specular exponent array at line:' + lineNum );

                        }

                    }

                    break;

                case 'd':
                case 'Tr': // transparent

                    if ( data.length <  1 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in transparency value at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.transparency = parseFloat( data[ 1 ] ); // single value, 0.0 - 1.0

                        } else {

                            console.error( 'ModelPool::computeObjMaterials(): invalid transparency value at line:' + lineNum );

                        }

                    }

                    break;

                case 'illum':    // illumination mode

                    if ( data.length < 1 ) {

                        console.error( 'ModelPool::computeObjMaterials(): error in illumination value at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseInt( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) && data[ 1 ] > 0 && data[ 1 ] < 11 ) {

                            material.illum = data[ 1 ];

                        }

                    }

                    break;

                case 'map_Kd':   // diffuse map, an image file (e.g. file.jpg)

                    /* 
                     * This loads the file, and appends to Prim texture list using the LoadTexture object.
                     * @link  "filename" is the name of a color texture file (.mpc), a color 
                     * procedural texture file (.cxc), or an image file.
                     * @link http://paulbourke.net/dataformats/mtl/
                     * 
                     * TODO: support options
                     * -blenu on | off    texture blending in horizontal direction
                     * -blenv on | off    texture blending in vertical direction
                     * -bm    mult        bump multiplier, only with 'bump'.
                     * -boost value       sharpens mipmaps (may cause texture crawling)
                     * -cc on | off       color correction, can only be used for colormaps map_Ka, map_Kd, and map_Ks
                     * -clamp on | off    texture clamped 0-1
                     * -imfchan r | g | b | m | l | z channel used to create bump texture
                     * -mm base gain      range of variation for color, base adds base value (brightens), gain increases contrast
                     * -o u v w           shifts map origin from 0, 0
                     * -t u v w           adds turbulence, so tiling is less repetitive
                     * -texres resolution scale up non-power of 2
                     */

                     console.log("ModelPool::computeObjMaterials():::::::::::::GOTTA DIFFUSE MAP in OBJ MTL file: " + data[ 1 ] )

                    // TODO: maket this attach to prim.textures

                    break;

                case 'map_Ks':   // specular map
                case 'map_Ka':   // ambient map
                case 'map_d':    // alpha map
                case 'bump':     // bumpmap
                case 'map_bump': // bumpmap
                case 'disp':     // displacement map

                    break;

                default:

                    break;

            }

            lineNum++;

        } );

        return material;

    }

    /** 
     * Add a model
     */
    addModel ( prim, data, path, key, mimeType ) {

        if ( key === undefined ) {

            console.error( 'TextureObj::addTexture(): undefined key' );

            return null;

        }

        let fType = this.util.getFileExtension( path );

        let model = {};

        switch ( fType ) {

            case 'obj':

                let d = this.computeObjMesh( data, prim, path );

                // Emit the GEOMETRY_READY event with arguments.

                this.util.emitter.emit( this.util.emitter.events.GEOMETRY_READY, prim, key, d.vertices, d.indices, d.normals, d.texCoords, [] );

                break;

            case 'mtl':

                console.log("MTL file for prim:" + prim.name + " loaded, parsing....")

                let material = this.computeObjMaterials( data, prim, path );

                if ( ! material.name ) {

                    material.name = this.util.getBaseName( path );

                }

                console.log("ADDING MATERIAL ARRAY:" + material.name + " to Prim:" + prim.name )

                prim.material.push( material );

                // Emit a materials complete event (callback is Prim.initPrimMaterials()).

                this.util.emitter.emit( this.util.emitter.events.MATERIAL_READY, prim, key );

                break;

            case 'html': // A-Frame?

                break;

            case 'x3d': // X3DOM

                break;

            case 'x3dv': // VRML

                break;

            default:

                break;
        }




    }

    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {Array[String]} pathList a list of URL paths to load.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getModels ( prim, pathList, cacheBust = true ) {

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

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
                             *   key: key, 
                             *   path: requestURL, 
                             *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                             *   error: false|response 
                             * } 
                             */

                             let modelData = this.addModel( prim, updateObj.data, updateObj.path, updateObj.key, mimeType );


                        }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                } else {

                    console.error( 'ModelPool::getModels(): file type "' + this.util.getFileExtension( path ) + ' not supported, not loading' );

                }

            }

        } // end of loop

    }

    /** 
     * Parse the downloaded model file contents.
     */
    createModel () {


    }


}

export default ModelPool;
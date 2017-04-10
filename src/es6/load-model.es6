import LoadPool from  './load-pool';

'use strict'

class LoadModel extends LoadPool {

    /**
     * Model .obj file format loader.
     * @param {Boolean} init if true, run immediately.
     * @param {Util} util local reference to utility functions object.
     * @param {glMatrix} glMatrix reference to glMatrix library.
     * @param {WebGL} webgl reference to webgl object.
     */

    constructor ( init, util, glMatrix, webgl, loadTexture ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

        // Reference the loadTexture object.

        this.loadTexture = loadTexture;

        /* 
         * Bind loadTexture to a 'newtexture' pseudo-event via our 
         * Emitter utility object. This allows us to add textures that 
         * weren't defined in Prim creation but reside internally in the 
         * OBJ and MTL files.
         */

        this.util.emitter.on( 'newtexture', ( path, prim ) => {

            this.loadTexture.load( path, prim );

        } );

    }

    /** 
     * Extract 3d vertex data (vertices, normals) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     */
    computeObj3d ( data, arr, lineNum ) {

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        arr.push( parseFloat( vs[ 1 ] ), parseFloat( vs[ 3 ] ), parseFloat( vs[ 5 ] ) );

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
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

                console.error( 'illegal index object index statement at line:' + lineNum );

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

        console.log("LOADING MODEL COMPUTEVERTICES")

        let isWhitespace = this.util.isWhitespace;

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        console.log("--------------------------PRIM:" + prim.name)

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

                    console.warn( 'loadModel::computeObjMesh(): OBJ data type: ' + type + ' in .obj file not supported' );

                    break;

                default:

                    // If it's not a pure whitespace line, report.

                    if( ! isWhitespace( data ) ) {

                        console.error( 'loadModel::computeObjMesh(): unknown line data: ' + line + ' in .obj file at line:' + lineNum );

                    }

                    break;

            }

            lineNum++;

        } );


        // NOTE: Colors and tangents are not part of the Wavefront .obj format

        console.log("load-model::computeObjMesh(): v:" + (vertices.length /3) + " i:" + (indices.length /3 )+ " t:" + (texCoords.length /2) + " n:" + (normals.length /3))

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

        console.log("LOADING MODEL MATERIALS")

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

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.ambient = [ data[ 1 ], data[ 2 ], data[ 3 ] ];  

                        } else {

                            console.error( 'loadModel::computerObjMaterials(): invalid ambient data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Kd': // diffuse

                    if ( data.length < 3 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.diffuse = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid diffuse data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ks': // specular

                    if ( data.length < 3 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.specular = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid specular data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ns': // specular exponent

                    if ( data.length < 1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.specularFactor = data[ 1 ];    

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid Specular Factor at line:' + lineNum );

                        }

                    }

                    break;

                case 'd':
                case 'Tr': // transparent

                    if ( data.length <  1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.transparency = parseFloat( data[ 1 ] ); // single value, 0.0 - 1.0

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid transparency value at line:' + lineNum );

                        }

                    }

                    break;

                case 'illum':    // illumination mode

                    if ( data.length < 1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in illumination mode at line:' + lineNum );

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

                     console.log("::::::::::::GOTTA DIFFUSE MAP in OBJ MTL file: " + data[ 1 ] )

                    // TODO: maket this attach to prim.textures

                    this.util.emitter.emit( 'newtexture', path + data[ data.length - 1 ], prim );



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
     * Obj Wavefront file parse.
     * adapted from:
     * @link https://github.com/m0ppers/babylon-objloader/blob/master/src/babylon.objloader.js
     * @param {Object} loadObject custom loader object defined in load-pool.es6
     * @param {Function} callback the *INTERMEDIATE* callback function, called for each model file loaded.
     */
    uploadModel ( loadObj, callback ) {

        let data = loadObj.data;

        let models = loadObj.prim.models;

        console.log("::::::::UPLOADMODEL for Prim:" + loadObj.prim.name + " CALLBACK:" + callback)

        // Since we may have different file types for object loads, switch on the file extension

        switch ( loadObj.fType ) {

            case 'obj':

                console.log("OBJ file for prim:" + loadObj.prim.name + " loaded, now parse it....")

                let d = this.computeObjMesh( data, loadObj.prim, loadObj.path );

                loadObj.prim.geometry.addBufferData( d.vertices, d.indices, d.normals, d.texCoords, [] );

                // Re-compute if some arrays are missing.

                if( d.texCoords.length / loadObj.prim.geometry.texCoords.itemSize  !== d.vertices.length / loadObj.prim.geometry.vertices.itemSize ) {

                    console.log("Creating TEXCOORDS:" + (d.texCoords.length / loadObj.prim.geometry.texCoords.itemSize) + " VERTICES:" + ( d.vertices.length / loadObj.prim.geometry.vertices.itemSize ) );

                    loadObj.prim.updateTexCoords();

                }

                if( d.normals.length / loadObj.prim.geometry.normals.itemSize  !== d.vertices.length / loadObj.prim.geometry.vertices.itemSize ) {

                    loadObj.prim.updateNormals();

                }

                // Update arrays not specified in the OBJ format.

                loadObj.prim.updateTangents();

                loadObj.prim.updateColors();

                // Add buffer data (and create WebGL buffers).


                console.log("IN UPLOAD MODEL, VERTICES DATA:" + ( loadObj.prim.geometry.vertices.data.length / 3 ) )

                break;

            case 'mtl':

                console.log("MTL file for prim:" + loadObj.prim.name + " loaded, parsing....")

                let material = this.computeObjMaterials( data, loadObj.prim, loadObj.path );

                if ( ! material.name ) {

                    material.name = this.util.getBaseName( loadObj.path );

                }

                console.log("ADDING MATERIAL ARRAY:" + material.name + " to Prim:" + loadObj.prim.name )

                loadObj.prim.material.push( material );

                break;

            default:

                console.warn( 'uploadModel() unknown file type:' + loadObj.fType );

                break;

        }

        // Clear the object for re-use.

        loadObj.busy = false;

        // Send this loadObj to update for re-use in the queue object.

        this.update( loadObj );

        // NOTE: this goes to the final callback in Prim, which doesn't have to 
        // apply addBufferData.

    }

    /**
     * Create a loader object for model files.
     * @param {Object} waitObj custom object created for load-pool.es6 queue.
     */
    createLoadObj ( waitObj ) {

        console.log(">>>>>>>>>>>>>>>>MODEL createLoadObj Loading " + waitObj.source )

        let loadObj = {};

        loadObj.model = {},

        loadObj.model.crossOrigin = 'anonymous',

        loadObj.path = waitObj.path,

        loadObj.callback = waitObj.callback,

        loadObj.prim = waitObj.attach,

        loadObj.busy = true;

        // Callback from load-pool.es6 for next object to load.

        loadObj.next = ( source ) => {

            console.log(">>>>>>>>>>>>>MODEL NEXT SOURCE:" + source)

            loadObj.fType = this.util.getFileExtension( source );
            
            fetch( source )

                .then( response => { return response.text() } )

                .then( xmlString => { loadObj.data = xmlString; this.uploadModel( loadObj, loadObj.callback ) } )

        };

        // Equivalent of a 'next' method for load-pool queue.

        loadObj.next( waitObj.source );

        // Start the loading.

        this.cacheCt++;

        return loadObj;

    }


}

export default LoadModel;